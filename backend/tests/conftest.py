"""Pytest fixtures and configuration."""
import os
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

# Use test database before app imports
os.environ.setdefault("DB_NAME", "aieventconcierge_test")
os.environ.setdefault("MONGODB_URL", "mongodb://localhost:27017")
os.environ.setdefault("JWT_SECRET", "test-secret-minimum-32-characters-long")
os.environ.setdefault("GEMINI_API_KEY", "test-key")

from app.main import app


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def auth_headers(client):
    """Register a user (if needed), login, and return Bearer token headers."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "testuser@test.com", "password": "password123"},
    )
    if login_resp.status_code != 200:
        client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "testuser@test.com",
                "password": "password123",
            },
        )
        login_resp = client.post(
            "/api/v1/auth/login",
            json={"email": "testuser@test.com", "password": "password123"},
        )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def mock_pipeline():
    """Mock run_venue_pipeline to avoid calling Gemini API."""
    fake_proposal = {
        "venue_name": "Test Mountain Lodge",
        "location": "123 Test St, Asheville, NC 28805",
        "estimated_cost": "$3,750 for 3 nights",
        "why_it_fits": "Fits budget and headcount for retreat.",
    }
    with patch(
        "app.api.query.run_venue_pipeline",
        new_callable=AsyncMock,
        return_value=fake_proposal,
    ) as m:
        yield m
