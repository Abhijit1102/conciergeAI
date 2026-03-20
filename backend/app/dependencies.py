"""Shared dependencies."""
from fastapi import Request, HTTPException, status


async def require_db(request: Request) -> None:
    """Raise 503 if MongoDB is not available (e.g. SKIP_MONGODB mode)."""
    if not getattr(request.app.state, "db_ready", False):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Start MongoDB or unset SKIP_MONGODB.",
        )
