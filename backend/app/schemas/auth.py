"""Auth-related Pydantic schemas."""
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Registration request body."""

    username: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)


class LoginRequest(BaseModel):
    """Login request body."""

    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Login response with JWT and user info."""

    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str


class TokenPayload(BaseModel):
    """JWT payload structure."""

    sub: str  # user_id
    username: str
    exp: int
    iat: int
