from fastapi import APIRouter
from app.schemas.profile import ProfileBase, ProfileUpdate, ProfileResponse
from app.db.database import db

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.get("", response_model=ProfileResponse)
async def get_profile():
    return db.profiles.get("user-1")

@router.post("", response_model=ProfileResponse)
async def save_profile(req: ProfileUpdate):
    current = db.profiles.get("user-1", {})
    updated = {**current, **req.model_dump(exclude_unset=True)}
    db.profiles["user-1"] = updated
    return updated
