# app/models/user.py
"""User model for MongoDB."""
from typing import Optional
from beanie import Document
from pydantic import EmailStr, Field
from pymongo import IndexModel, ASCENDING


class User(Document):
    """User document with username, email, and hashed password."""

    username: str
    email: EmailStr
    hashed_password: str

    class Settings:
        name = "users"
        indexes = [
            IndexModel([("username", ASCENDING)], unique=True),
            IndexModel([("email", ASCENDING)], unique=True),
        ]
