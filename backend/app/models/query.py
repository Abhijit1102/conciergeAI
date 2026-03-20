"""Query model for storing user AI queries and responses."""
from datetime import datetime
from typing import Any

from beanie import Document, PydanticObjectId
from pydantic import Field
from pymongo import ASCENDING, DESCENDING, IndexModel


class Query(Document):
    """Query document linking user to AI response."""

    user_id:     PydanticObjectId
    query:       str
    ai_response: dict[str, Any]
    timestamp:   datetime = Field(default_factory=datetime.utcnow)

    class Settings:                    # ← indented inside Query, not outside
        name = "queries"
        indexes = [
            IndexModel([("user_id", ASCENDING), ("timestamp", DESCENDING)]),
        ]
