import json
import logging
from datetime import datetime
from typing import Any, Dict, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.live_news_article import LiveNewsArticle
from schemas.predict import PredictRequest
from services.credibility_service import CredibilityService
from services.explain_service import ExplainService
from services.news_service import NewsService
from services.predict_service import PredictService

log = logging.getLogger("live-news-service")


class LiveNewsService:
    @staticmethod
    def _build_text(article: Dict[str, Any]) -> str:
        title = (article.get("title") or "").strip()
        description = (article.get("description") or "").strip()
        content = (article.get("content") or "").strip()
        parts = [part for part in [title, description, content] if part]
        return "\n".join(parts)

    @staticmethod
    def _parse_datetime(value: Any) -> datetime | None:
        if not value:
            return None
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            raw = value.replace("Z", "+00:00")
            try:
                return datetime.fromisoformat(raw)
            except ValueError:
                return None
        return None

    @staticmethod
    def _serialize_list(values: List[str] | None) -> str | None:
        if not values:
            return None
        return json.dumps(values)

    @staticmethod
    def _deserialize_list(value: str | None) -> List[str]:
        if not value:
            return []
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return [str(item) for item in parsed]
        except (TypeError, ValueError):
            pass
        return []

    @classmethod
    def _serialize_record(cls, record: LiveNewsArticle) -> Dict[str, Any]:
        return {
            "id": record.id,
            "title": record.title,
            "description": record.description,
            "content": record.content,
            "image": record.image_url,
            "url": record.url,
            "source": record.source,
            "published_at": record.published_at,
            "label": record.label,
            "confidence": record.confidence,
            "prob_fake": record.prob_fake,
            "prob_real": record.prob_real,
            "credibility_score": record.credibility_score,
            "credibility_level": record.credibility_level,
            "explanation": record.explanation,
            "indicators": cls._deserialize_list(record.indicators),
            "positive_indicators": cls._deserialize_list(record.positive_indicators),
            "created_at": record.created_at,
            "prediction": record.label,
        }

    @classmethod
    async def get_cached_articles(cls, db: AsyncSession, limit: int) -> List[Dict[str, Any]]:
        result = await db.execute(
            select(LiveNewsArticle)
            .order_by(LiveNewsArticle.published_at.desc().nullslast(), LiveNewsArticle.created_at.desc())
            .limit(limit)
        )
        articles = result.scalars().all()
        return [cls._serialize_record(article) for article in articles]

    @classmethod
    async def analyze_and_persist(cls, article: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
        title = (article.get("title") or "").strip()
        description = (article.get("description") or "").strip()
        content = (article.get("content") or "").strip()
        url = (article.get("url") or "").strip()

        if not title and not url:
            raise ValueError("Skipping empty live-news article")

        text = cls._build_text(article)
        prediction = PredictService.predict(PredictRequest(title=title, text=text))
        credibility = CredibilityService.calculate(url)
        explanation = ExplainService.generate(text, prediction.label)
        published_at = cls._parse_datetime(article.get("publishedAt"))

        existing = None
        if url:
            result = await db.execute(select(LiveNewsArticle).where(LiveNewsArticle.url == url))
            existing = result.scalar_one_or_none()

        if existing is None:
            record = LiveNewsArticle(
                title=title or "Untitled article",
                description=description or None,
                content=content or None,
                image_url=article.get("image") or None,
                url=url,
                source=(article.get("source") or {}).get("name") if isinstance(article.get("source"), dict) else article.get("source"),
                published_at=published_at,
                label=prediction.label,
                confidence=prediction.confidence,
                prob_fake=prediction.prob_fake,
                prob_real=prediction.prob_real,
                credibility_score=credibility.get("score", 0),
                credibility_level=credibility.get("level"),
                explanation=explanation.get("summary"),
                indicators=cls._serialize_list(prediction.indicators or []),
                positive_indicators=cls._serialize_list(prediction.positive_indicators or []),
            )
            db.add(record)
            article_record = record
        else:
            existing.title = title or existing.title
            existing.description = description or existing.description
            existing.content = content or existing.content
            existing.image_url = article.get("image") or existing.image_url
            existing.source = (article.get("source") or {}).get("name") if isinstance(article.get("source"), dict) else article.get("source") or existing.source
            existing.published_at = published_at or existing.published_at
            existing.label = prediction.label
            existing.confidence = prediction.confidence
            existing.prob_fake = prediction.prob_fake
            existing.prob_real = prediction.prob_real
            existing.credibility_score = credibility.get("score", existing.credibility_score)
            existing.credibility_level = credibility.get("level", existing.credibility_level)
            existing.explanation = explanation.get("summary") or existing.explanation
            existing.indicators = cls._serialize_list(prediction.indicators or []) or existing.indicators
            existing.positive_indicators = cls._serialize_list(prediction.positive_indicators or []) or existing.positive_indicators
            article_record = existing

        return cls._serialize_record(article_record)

    @classmethod
    async def fetch_and_persist(
        cls,
        *,
        category: str,
        country: str,
        language: str,
        limit: int,
        db: AsyncSession,
    ) -> List[Dict[str, Any]]:
        if not PredictService.is_loaded():
            raise RuntimeError("Prediction model is still loading.")

        articles = NewsService.get_latest_news(
            category=category,
            country=country,
            language=language,
            max_results=limit,
        )

        persisted: List[Dict[str, Any]] = []
        for article in articles:
            try:
                persisted.append(await cls.analyze_and_persist(article, db))
            except Exception as exc:  # pragma: no cover - defensive path
                log.warning("Skipping live-news article due to error: %s", exc)

        await db.commit()
        return sorted(persisted, key=lambda item: (item.get("published_at") or datetime.min), reverse=True)
