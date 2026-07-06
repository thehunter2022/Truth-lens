from datetime import datetime

from schemas.predict import LiveNewsArticleResponse


def test_live_news_article_response_accepts_persisted_fields():
    item = LiveNewsArticleResponse(
        id=1,
        title="Breaking update",
        description="A recent report about the topic",
        content="Detailed article content",
        image="https://example.com/image.jpg",
        url="https://example.com/article",
        source="Example News",
        published_at=datetime(2026, 7, 1, 15, 30, 0),
        label="FAKE",
        confidence=0.87,
        prob_fake=0.87,
        prob_real=0.13,
        credibility_score=0.42,
        explanation="This article has several misinformation indicators.",
        indicators=["Urgency and manipulation"],
        positive_indicators=["Evidence-based wording"],
        created_at=datetime(2026, 7, 1, 15, 31, 0),
    )

    assert item.label == "FAKE"
    assert item.source == "Example News"
    assert item.created_at == datetime(2026, 7, 1, 15, 31, 0)
