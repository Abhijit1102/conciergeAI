"""Query and history Pydantic schemas."""
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class QueryRequest(BaseModel):
    """POST /query request body."""

    query: str = Field(..., min_length=10, max_length=500)

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        if len(v) < 10:
            raise ValueError(
                "Please describe your event in more detail (min 10 characters)."
            )
        if len(v) > 500:
            raise ValueError(
                "Your description is too long. Please keep it under 500 characters."
            )
        return v


class VenueProposal(BaseModel):
    """AI venue proposal output."""

    venue_name: str
    location: str
    estimated_cost: str
    why_it_fits: str


class QueryResponse(BaseModel):
    """POST /query response."""

    venue_proposal: VenueProposal
    query: str
    timestamp: datetime


class HistoryItem(BaseModel):
    """Single history entry for GET /history."""

    id: str
    query: str
    venue_name: str
    timestamp: datetime


class HistoryResponse(BaseModel):
    """GET /history response."""

    history: list[HistoryItem]
