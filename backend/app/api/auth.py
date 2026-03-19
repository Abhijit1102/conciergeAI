"""Auth endpoints: register, login."""
from fastapi import APIRouter, HTTPException, status

from app.auth.jwt import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(data: RegisterRequest) -> dict:
    """Register a new user with username, email, password."""
    existing = await User.find_one(
        {"$or": [{"email": data.email}, {"username": data.username}]}
    )
    if existing:
        if existing.email == data.email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken.",
        )
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    await user.insert()
    return {"message": "Registration successful", "user_id": str(user.id)}


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest) -> LoginResponse:
    """Login with email + password, receive JWT."""
    user = await User.find_one({"email": data.email})
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    token = create_access_token(str(user.id), user.username)
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user_id=str(user.id),
        username=user.username,
    )
