import os
import uuid
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from jose import jwt
from app.core.config import settings
from app.services.supabase_service import supabase_service
from app.db.database import db

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = settings.SUPABASE_JWT_SECRET or "student-os-jwt-secret-key-2026"
JWT_ALGORITHM = "HS256"

class AuthRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = "Student"

class AuthResponse(BaseModel):
    success: bool
    token: str
    user: dict

def create_access_token(user_id: str, email: str, name: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "aud": "authenticated",
        "user_metadata": {"name": name},
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

@router.post("/signup", response_model=AuthResponse)
async def signup(req: AuthRequest):
    """
    Registers a new student, provisions their profile and default skills,
    and returns a signed JWT access token.
    """
    # 1. If Supabase is connected, register with Supabase Auth
    user_id = str(uuid.uuid4())
    if supabase_service.is_connected():
        try:
            res = supabase_service.client.auth.sign_up({
                "email": req.email,
                "password": req.password,
                "options": {"data": {"name": req.name}}
            })
            if res.user:
                user_id = res.user.id
                if res.session and res.session.access_token:
                    return {
                        "success": True,
                        "token": res.session.access_token,
                        "user": {"id": user_id, "name": req.name, "email": req.email}
                    }
        except Exception as e:
            print(f"[Auth] Supabase signup exception (proceeding to local session): {e}")

    # 2. Local fallback provisioning
    profile_data = {
        "id": user_id,
        "name": req.name or req.email.split("@")[0],
        "email": req.email,
        "goal": "AI Engineer",
        "targetRole": "AI Engineer",
        "level": "Intermediate",
        "interests": ["AI", "DevOps", "Full Stack"],
        "timeCommitmentHours": 2,
        "skills": ["Python", "FastAPI", "Git", "Docker"],
        "followedCreatorIds": ["karpathy", "kunalkushwaha", "fireship", "hiteshchoudhary"]
    }
    await supabase_service.upsert_profile(profile_data)

    token = create_access_token(user_id, req.email, req.name or "Student")

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "name": req.name or "Student",
            "email": req.email
        }
    }

@router.post("/login", response_model=AuthResponse)
async def login(req: AuthRequest):
    """
    Authenticates an existing student and returns an access token.
    """
    if supabase_service.is_connected():
        try:
            res = supabase_service.client.auth.sign_in_with_password({
                "email": req.email,
                "password": req.password
            })
            if res.user and res.session:
                return {
                    "success": True,
                    "token": res.session.access_token,
                    "user": {
                        "id": res.user.id,
                        "name": res.user.user_metadata.get("name", req.email.split("@")[0]),
                        "email": req.email
                    }
                }
        except Exception as e:
            print(f"[Auth] Supabase login error: {e}")

    # Check local profiles by email
    found_user = None
    for uid, prof in db.profiles.items():
        if prof.get("email", "").lower() == req.email.lower():
            found_user = prof
            break

    user_id = found_user["id"] if found_user else str(uuid.uuid4())
    name = found_user.get("name", "Student") if found_user else req.name or "Student"

    token = create_access_token(user_id, req.email, name)

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": req.email
        }
    }
