# app/api/auth.py
"""Auth endpoints: register, login, refresh."""
from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt

from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.config import get_settings
from app.dependencies import require_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])


# =======================
# Register
# =======================

@router.post("/register", dependencies=[Depends(require_db)])
async def register(data: RegisterRequest):
    email = data.email.lower().strip()
    username = data.username.strip()

    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long",
        )

    existing = await User.find_one(
        {"$or": [{"email": email}, {"username": username}]}
    )

    if existing:
        if existing.email == email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken.",
        )

    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(data.password),
    )

    await user.insert()

    return {
        "message": "Registration successful",
        "user_id": str(user.id),
    }


# =======================
# Login
# =======================

@router.post("/login", dependencies=[Depends(require_db)])
async def login(data: LoginRequest):
    email = data.email.lower().strip()

    user = await User.find_one({"email": email})

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    access_token = create_access_token(str(user.id), user.username)
    refresh_token = create_refresh_token(str(user.id))

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
        },
    }


# =======================
# Refresh Token
# =======================

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    settings = get_settings()

    try:
        payload = jwt.decode(
            refresh_token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        user_id = payload.get("sub")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    from beanie import PydanticObjectId
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_access_token = create_access_token(str(user.id), user.username)

    return {"access_token": new_access_token}
