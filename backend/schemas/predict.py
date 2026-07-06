from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, field_serializer


class LiveNewsArticleResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    image: Optional[str] = None
    url: str
    source: Optional[str] = None
    published_at: Optional[datetime] = None
    label: str
    confidence: float
    prob_fake: float
    prob_real: float
    credibility_score: float
    credibility_level: Optional[str] = None
    explanation: Optional[str] = None
    indicators: List[str] = Field(default_factory=list)
    positive_indicators: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None

    @field_serializer("published_at", "created_at")
    def serialize_datetime(self, value: Optional[datetime]) -> Optional[str]:
        if value is None:
            return None
        return value.isoformat()

    model_config = {"from_attributes": True}

class PredictRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=10_000)
    title: Optional[str] = Field(None, max_length=500)

    @field_validator("text")
    @classmethod
    def strip_text(cls, v: str) -> str:
        return v.strip()

class PredictResult(BaseModel):
    label: str           # "FAKE" or "REAL"
    confidence: float    # 0.0 – 1.0
    prob_fake: float
    prob_real: float
    model_used: str
    latency_ms: float
    explanation: Optional[str] = None
    indicators: Optional[List[str]] = None
    positive_indicators: Optional[List[str]] = None

class BatchRequest(BaseModel):
    items: List[PredictRequest] = Field(..., min_length=1, max_length=10)

class BatchResult(BaseModel):
    results: List[PredictResult]
    total_latency_ms: float

class PredictionHistoryResponse(BaseModel):
    id: int
    title: Optional[str] = None
    text_snippet: str
    label: str
    confidence: float
    prob_fake: float
    prob_real: float
    model_used: str
    latency_ms: float
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        return value.isoformat()

    model_config = {"from_attributes": True}
