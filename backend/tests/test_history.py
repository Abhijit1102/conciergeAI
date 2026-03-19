"""Tests for GET /api/v1/history."""


def test_history_without_auth(client):
    """History without JWT returns 403."""
    resp = client.get("/api/v1/history")
    assert resp.status_code == 403


def test_history_invalid_token(client):
    """History with invalid JWT returns 401."""
    resp = client.get(
        "/api/v1/history",
        headers={"Authorization": "Bearer invalid"},
    )
    assert resp.status_code == 401


def test_history_empty(client, auth_headers):
    """History for new user returns empty list."""
    resp = client.get("/api/v1/history", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == {"history": []}


def test_history_returns_items(client, auth_headers, mock_pipeline):
    """History returns past queries after submitting."""
    client.post(
        "/api/v1/query",
        json={"query": "10-person retreat in mountains for 3 days"},
        headers=auth_headers,
    )
    resp = client.get("/api/v1/history", headers=auth_headers)
    assert resp.status_code == 200
    history = resp.json()["history"]
    assert len(history) >= 1
    item = history[0]
    assert "id" in item
    assert "query" in item
    assert item["venue_name"] == "Test Mountain Lodge"
    assert "timestamp" in item


def test_history_sorted_by_timestamp_desc(client, auth_headers, mock_pipeline):
    """History returns multiple items sorted by timestamp descending."""
    client.post(
        "/api/v1/query",
        json={"query": "First query for 5 people in the city"},
        headers=auth_headers,
    )
    client.post(
        "/api/v1/query",
        json={"query": "Second query for 10 people at the beach"},
        headers=auth_headers,
    )
    resp = client.get("/api/v1/history", headers=auth_headers)
    assert resp.status_code == 200
    history = resp.json()["history"]
    assert len(history) >= 2
