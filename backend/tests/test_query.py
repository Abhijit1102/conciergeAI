"""Tests for POST /api/v1/query."""
from unittest.mock import AsyncMock, patch


def test_query_success(client, auth_headers, mock_pipeline):
    """Query with valid JWT returns venue proposal."""
    resp = client.post(
        "/api/v1/query",
        json={"query": "10-person retreat in the mountains for 3 days with $4000 budget"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "venue_proposal" in data
    assert data["venue_proposal"]["venue_name"] == "Test Mountain Lodge"
    assert data["venue_proposal"]["location"] == "123 Test St, Asheville, NC 28805"
    assert data["venue_proposal"]["estimated_cost"] == "$3,750 for 3 nights"
    assert data["venue_proposal"]["why_it_fits"]
    assert data["query"] == "10-person retreat in the mountains for 3 days with $4000 budget"
    assert "timestamp" in data


def test_query_without_auth(client, mock_pipeline):
    """Query without JWT returns 401."""
    resp = client.post(
        "/api/v1/query",
        json={"query": "10-person retreat in the mountains for 3 days"},
    )
    assert resp.status_code == 403  # No Authorization header -> 403 from HTTPBearer


def test_query_invalid_token(client, mock_pipeline):
    """Query with invalid JWT returns 401."""
    resp = client.post(
        "/api/v1/query",
        json={"query": "10-person retreat in the mountains for 3 days"},
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert resp.status_code == 401


def test_query_too_short(client, auth_headers, mock_pipeline):
    """Query under 10 chars returns 422."""
    resp = client.post(
        "/api/v1/query",
        json={"query": "short"},
        headers=auth_headers,
    )
    assert resp.status_code == 422


def test_query_too_long(client, auth_headers, mock_pipeline):
    """Query over 500 chars returns 422."""
    resp = client.post(
        "/api/v1/query",
        json={"query": "x" * 501},
        headers=auth_headers,
    )
    assert resp.status_code == 422


def test_query_saves_to_history(client, auth_headers, mock_pipeline):
    """Successful query is saved and appears in history."""
    q = "10-person retreat in the mountains for 3 days with $4000 budget"
    client.post("/api/v1/query", json={"query": q}, headers=auth_headers)
    resp = client.get("/api/v1/history", headers=auth_headers)
    assert resp.status_code == 200
    history = resp.json()["history"]
    assert len(history) >= 1
    assert any("10-person" in item["query"] for item in history)


def test_query_pipeline_error_returns_502(client, auth_headers):
    """Query when AI pipeline fails returns 502."""
    with patch(
        "app.api.query.run_venue_pipeline",
        new_callable=AsyncMock,
        side_effect=ValueError("AI could not generate a valid response."),
    ):
        resp = client.post(
            "/api/v1/query",
            json={"query": "10-person retreat in the mountains for 3 days"},
            headers=auth_headers,
        )
    assert resp.status_code == 502
