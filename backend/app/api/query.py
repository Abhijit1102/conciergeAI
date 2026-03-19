"""Query endpoint: POST /query for AI venue proposal."""
import asyncio
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.jwt import get_current_user
from app.models.query import Query
from app.models.user import User
from app.schemas.query import QueryRequest, QueryResponse, VenueProposal
from app.services.pipeline import run_venue_pipeline

router = APIRouter(prefix="/query", tags=["query"])


@router.post("", response_model=QueryResponse)
async def submit_query(
    data: QueryRequest,
    current_user: Annotated[User, Depends(get_current_user)],
) -> QueryResponse:
    """
    Submit natural language event description and receive AI venue proposal.
    Min 10 chars, max 500 chars. AI response and query saved to MongoDB.
    """
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
    now = datetime.utcnow()

    # Save to MongoDB (best effort; on failure still return result per PRD)
    try:
        q = Query(
            user_id=current_user.id,
            query=data.query,
            ai_response=proposal,
            timestamp=now,
        )
        await q.insert()
    except Exception:
        # Log but don't fail - PRD: "Result shown; history entry silently missing"
        pass

    return QueryResponse(
        venue_proposal=venue,
        query=data.query,
        timestamp=now,
    )
