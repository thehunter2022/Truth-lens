import logging
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from models.prediction import PredictionHistory
from schemas.predict import (
    PredictRequest,
    PredictResult,
    BatchRequest,
    BatchResult,
    PredictionHistoryResponse,
    LiveNewsArticleResponse,
)
from services.predict_service import PredictService
from services.live_news_service import LiveNewsService
from services.news_service import NewsService
from middleware.auth_middleware import get_optional_user, get_current_user
from middleware.rate_limiter import predict_limiter

log = logging.getLogger("predict")
from middleware.security import sanitize_input

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("", response_model=PredictResult, dependencies=[Depends(predict_limiter)])
async def predict_single(
    req: PredictRequest,
    user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    if not PredictService.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning model is still loading..."
        )
        
    # Sanitize inputs
    sanitized_text = sanitize_input(req.text)
    sanitized_title = sanitize_input(req.title) if req.title else None
    
    # Run prediction
    clean_req = PredictRequest(text=sanitized_text, title=sanitized_title)
    result = PredictService.predict(clean_req)
    
    # Save to history if user is logged in
    if user:
        # Save first 2000 chars of text snippet to avoid huge database records
        text_snippet = sanitized_text[:2000]
        history_item = PredictionHistory(
            user_id=user.id,
            title=sanitized_title,
            text_snippet=text_snippet,
            label=result.label,
            confidence=result.confidence,
            prob_fake=result.prob_fake,
            prob_real=result.prob_real,
            model_used=result.model_used,
            latency_ms=result.latency_ms
        )
        db.add(history_item)
        await db.commit()
        
    return result

@router.post("/batch", response_model=BatchResult, dependencies=[Depends(predict_limiter)])
async def predict_batch(
    req: BatchRequest,
    user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    if not PredictService.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning model is still loading..."
        )
        
    t0 = time.time()
    results = []
    
    for item in req.items:
        t_item = time.time()
        # Sanitize item
        sanitized_text = sanitize_input(item.text)
        sanitized_title = sanitize_input(item.title) if item.title else None
        
        clean_item = PredictRequest(text=sanitized_text, title=sanitized_title)
        res = PredictService.predict(clean_item)
        res.latency_ms = round((time.time() - t_item) * 1000, 2)
        results.append(res)
        
        # Save each to history if user is logged in
        if user:
            text_snippet = sanitized_text[:2000]
            history_item = PredictionHistory(
                user_id=user.id,
                title=sanitized_title,
                text_snippet=text_snippet,
                label=res.label,
                confidence=res.confidence,
                prob_fake=res.prob_fake,
                prob_real=res.prob_real,
                model_used=res.model_used,
                latency_ms=res.latency_ms
            )
            db.add(history_item)
            
    if user:
        await db.commit()
        
    total_latency = round((time.time() - t0) * 1000, 2)
    return BatchResult(results=results, total_latency_ms=total_latency)

@router.get("/history", response_model=List[PredictionHistoryResponse])
async def get_history(
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PredictionHistory)
        .where(PredictionHistory.user_id == user.id)
        .order_by(PredictionHistory.created_at.desc())
        .limit(limit)
    )
    history = result.scalars().all()
    return history
@router.get("/live-news", response_model=dict)
async def get_live_news(
    category: str = Query("general"),
    country: str = Query("us"),
    language: str = Query("en"),
    limit: int = Query(5),
    user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """Analyze and persist the latest live news using the VerifyAI model."""

    if not PredictService.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction model is still loading.",
        )

    articles = []
    fallback = False
    try:
        articles = await LiveNewsService.fetch_and_persist(
            category=category,
            country=country,
            language=language,
            limit=limit,
            db=db,
        )
    except RuntimeError as exc:
        log.warning("Live news fetch failed, falling back to cached persisted articles: %s", exc)

    if not articles:
        articles = await LiveNewsService.get_cached_articles(db=db, limit=limit)
        fallback = True

    return {
        "count": len(articles),
        "articles": [LiveNewsArticleResponse(**article).model_dump() for article in articles],
        "fallback": fallback,
    }

@router.get("/search-news")
async def search_news(
    q:str,
    limit:int=5
):

    articles = NewsService.search_news(

        query=q,

        max_results=limit

    )

    response=[]

    for article in articles:

        prediction = PredictService.predict(

            PredictRequest(

                title=article.get("title",""),

                text=f"{article.get('title','')} {article.get('description','')}"

            )

        )

        response.append({

            "title":article["title"],

            "url":article["url"],

            "prediction":prediction.label,

            "confidence":prediction.confidence

        })

    return response

@router.get("/trending")
async def trending():

    return NewsService.trending_news()

@router.get("/news/{article_id}")
async def article(article_id:int):

    article = NewsService.get_article(article_id)

    if article is None:

        raise HTTPException(

            status_code=404,

            detail="Article not found"

        )

    return article

