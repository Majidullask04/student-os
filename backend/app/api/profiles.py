from fastapi import APIRouter, Depends
from app.schemas.profile import ProfileBase, ProfileUpdate, ProfileResponse
from app.core.security import get_current_user
from app.services.supabase_service import supabase_service
from app.db.database import db

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.get("", response_model=ProfileResponse)
async def get_profile(user: dict = Depends(get_current_user)):
    user_id = user["id"]

    # 1. Try Supabase database
    profile = await supabase_service.get_profile(user_id)
    if profile:
        return profile

    # 2. In-memory local fallback per user_id
    if user_id in db.profiles:
        return db.profiles[user_id]

    default_profile = {
        "id": user_id,
        "name": user.get("name") or "Student",
        "email": user.get("email") or "student@studentos.dev",
        "goal": "AI Engineer",
        "targetRole": "AI Engineer",
        "level": "Intermediate",
        "interests": ["AI", "DevOps", "Full Stack"],
        "timeCommitmentHours": 2,
        "skills": ["Python", "FastAPI", "Git", "Docker"],
        "followedCreatorIds": ["karpathy", "kunalkushwaha", "fireship", "hiteshchoudhary"]
    }
    db.profiles[user_id] = default_profile
    return default_profile

@router.post("", response_model=ProfileResponse)
async def save_profile(req: ProfileUpdate, user: dict = Depends(get_current_user)):
    user_id = user["id"]
    current = db.profiles.get(user_id) or {
        "id": user_id,
        "name": user.get("name") or "Student",
        "email": user.get("email") or "student@studentos.dev",
        "goal": "AI Engineer",
        "targetRole": "AI Engineer",
        "level": "Intermediate",
        "interests": ["AI", "DevOps", "Full Stack"],
        "timeCommitmentHours": 2,
        "skills": ["Python", "FastAPI", "Git", "Docker"],
        "followedCreatorIds": ["karpathy", "kunalkushwaha", "fireship", "hiteshchoudhary"]
    }

    updated = {**current, **req.model_dump(exclude_unset=True), "id": user_id}
    db.profiles[user_id] = updated

    # Sync to Supabase if connected
    await supabase_service.upsert_profile(updated)
    return updated
