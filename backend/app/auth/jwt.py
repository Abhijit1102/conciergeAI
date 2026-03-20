
# app/auth/jwt.py
from datetime import datetime, timedelta
from typing import Annotated
import hashlib
import bcrypt

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import get_settings
from app.models.user import User

security = HTTPBearer()

# =======================
# Password Hashing
# =======================

def _prepare(password: str) -> bytes:
    """SHA-256 hash the password first to safely handle any length, then bcrypt it."""
    return hashlib.sha256(password.encode("utf-8")).digest()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(_prepare(password), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(_prepare(plain), hashed.encode("utf-8"))

# =======================
# JWT Creation
# =======================
def create_access_token(user_id: str, username: str) -> str:
    settings = get_settings()
    now = datetime.utcnow()
    expire = now + timedelta(minutes=15)
    payload = {
        "sub": user_id,
        "username": username,
        "type": "access",
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    settings = get_settings()
    now = datetime.utcnow()
    expire = now + timedelta(days=7)
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

# =======================
# Current User Dependency
# =======================
async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Please log in to continue.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        settings = get_settings()
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise credentials_exception

        user_id: str | None = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    from beanie import PydanticObjectId
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise credentials_exception
    return user
