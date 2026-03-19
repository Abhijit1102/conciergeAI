"""User model for MongoDB."""
from beanie import Document, Indexed
from pydantic import EmailStr, Field


class User(Document):
    """User document with username, email, and hashed password."""

    username: Indexed(str, unique=True)
    email: Indexed(EmailStr, unique=True)
    hashed_password: str

    class Settings:
        name = "users"
        indexes = []
