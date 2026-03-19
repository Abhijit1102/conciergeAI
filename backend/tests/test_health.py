"""Tests for GET /api/v1/health."""


def test_health_returns_ok(client):
    """Health endpoint returns 200 with status ok."""
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_root_returns_message(client):
    """Root endpoint returns API info."""
    resp = client.get("/")
    assert resp.status_code == 200
    assert "message" in resp.json()
