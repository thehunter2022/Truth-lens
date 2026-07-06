from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from database import Base


class LiveNewsArticle(Base):
    __tablename__ = "live_news_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    image_url = Column(String(1000), nullable=True)
    url = Column(String(1000), unique=True, index=True, nullable=False)
    source = Column(String(255), nullable=True)
    published_at = Column(DateTime, nullable=True)
    label = Column(String(10), nullable=False)
    confidence = Column(Float, nullable=False, default=0.0)
    prob_fake = Column(Float, nullable=False, default=0.0)
    prob_real = Column(Float, nullable=False, default=0.0)
    credibility_score = Column(Float, nullable=False, default=0.0)
    credibility_level = Column(String(50), nullable=True)
    explanation = Column(Text, nullable=True)
    indicators = Column(Text, nullable=True)
    positive_indicators = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
