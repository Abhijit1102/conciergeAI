"""History endpoint: GET /history for user query history."""
from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth.jwt import get_current_user
from app.models.query import Query
from app.models.user import User
from app.schemas.query import HistoryItem, HistoryResponse

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=HistoryResponse)
async def get_history(
    current_user: Annotated[User, Depends(get_current_user)],
) -> HistoryResponse:
    """Return all queries for the authenticated user, sorted by timestamp DESC."""
    queries = (
        await Query.find(Query.user_id == current_user.id)
        .sort([("timestamp", -1)])
        .to_list()
    )
    items = [
        HistoryItem(
            id=str(q.id),
            query=q.query[:80] + ("..." if len(q.query) > 80 else ""),
            venue_name=q.ai_response.get("venue_name", "Unknown"),
            timestamp=q.timestamp,
        )
        for q in queries
    ]
    return HistoryResponse(history=items)
