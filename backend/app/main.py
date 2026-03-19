"""FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.models.query import Query
from app.models.user import User
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.api.auth import router as auth_router
from app.api.health import router as health_router
from app.api.query import router as query_router
from app.api.history import router as history_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize MongoDB connection and Beanie on startup."""
    settings = get_settings()
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DB_NAME],
        document_models=[User, Query],
    )
    yield
    client.close()


app = FastAPI(
    title="AI Event Concierge API",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1")
app.include_router(query_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "AI Event Concierge API", "docs": "/docs"}
