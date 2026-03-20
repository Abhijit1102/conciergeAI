"""Query endpoint: POST /query for AI venue proposal."""
import asyncio
from datetime import datetime, timezone
from typing import Annotated

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.jwt import get_current_user
from app.dependencies import require_db
from app.models.query import Query
from app.models.user import User
from app.schemas.query import QueryRequest, QueryResponse, VenueProposal
from app.services.pipeline import run_venue_pipeline

router = APIRouter(prefix="/query", tags=["query"])


@router.post("", response_model=QueryResponse, dependencies=[Depends(require_db)])
async def submit_query(
    data: QueryRequest,
    current_user: Annotated[User, Depends(get_current_user)],
) -> QueryResponse:
    try:
        proposal = await asyncio.wait_for(
            run_venue_pipeline(data.query),
            timeout=10.0,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="AI service timed out. Please try again in a moment.",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        )

    venue = VenueProposal(**proposal)
    now = datetime.now(timezone.utc)

    query_id: str | None = None
    try:
        assert current_user.id is not None, "Authenticated user must have an id"
        q = Query(
            user_id=PydanticObjectId(current_user.id),
            query=data.query,
            ai_response=proposal,
            timestamp=now,
        )
        await q.insert()
        query_id = str(q.id)  # ← capture id after insert
    except Exception:
        pass

    return QueryResponse(
        id=query_id,          # ← this is what the frontend needs for history keys
        venue_proposal=venue,
        query=data.query,
        timestamp=now,
    )
