"""Tests for auth endpoints: register, login."""


def test_register_success(client):
    """Register with valid data returns 200 and user_id."""
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "securepass123",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["message"] == "Registration successful"
    assert "user_id" in data


def test_register_duplicate_email(client):
    """Register with existing email returns 409."""
    payload = {
        "username": "user1",
        "email": "dup@example.com",
        "password": "password123",
    }
    client.post("/api/v1/auth/register", json=payload)
    resp = client.post(
        "/api/v1/auth/register",
        json={**payload, "username": "different"},
    )
    assert resp.status_code == 409
    assert "email" in resp.json()["detail"].lower()


def test_register_duplicate_username(client):
    """Register with existing username returns 409."""
    payload = {
        "username": "sameuser",
        "email": "first@example.com",
        "password": "password123",
    }
    client.post("/api/v1/auth/register", json=payload)
    resp = client.post(
        "/api/v1/auth/register",
        json={**payload, "email": "second@example.com"},
    )
    assert resp.status_code == 409
    assert "username" in resp.json()["detail"].lower()


def test_register_validation(client):
    """Register with invalid data returns 422."""
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "username": "",
            "email": "not-an-email",
            "password": "short",
        },
    )
    assert resp.status_code == 422


def test_login_success(client):
    """Login with valid credentials returns JWT."""
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "mypassword",
        },
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "mypassword"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["username"] == "loginuser"
    assert "user_id" in data


def test_login_wrong_password(client):
    """Login with wrong password returns 401."""
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "wrongpw",
            "email": "wrongpw@example.com",
            "password": "correct",
        },
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "wrongpw@example.com", "password": "wrong"},
    )
    assert resp.status_code == 401
    assert "incorrect" in resp.json()["detail"].lower()


def test_login_nonexistent_email(client):
    """Login with non-existent email returns 401."""
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "any"},
    )
    assert resp.status_code == 401


def test_login_validation(client):
    """Login with invalid email format returns 422."""
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "invalid", "password": "pass"},
    )
    assert resp.status_code == 422
