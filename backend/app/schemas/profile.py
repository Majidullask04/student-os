from pydantic import BaseModel, Field
from typing import List, Optional

class ProfileBase(BaseModel):
    name: str = "Majidulla"
    email: str = "majidulla@studentos.dev"
    goal: str = "AI Engineer"
    targetRole: str = "AI Engineer"
    level: str = "Intermediate"
    interests: List[str] = ["AI", "DevOps", "Full Stack"]
    timeCommitmentHours: int = 2
    skills: List[str] = ["Python", "FastAPI", "Git", "Docker"]
    followedCreatorIds: List[str] = ["karpathy", "kunalkushwaha", "fireship", "hiteshchoudhary"]

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    goal: Optional[str] = None
    targetRole: Optional[str] = None
    level: Optional[str] = None
    interests: Optional[List[str]] = None
    timeCommitmentHours: Optional[int] = None
    skills: Optional[List[str]] = None
    followedCreatorIds: Optional[List[str]] = None

class ProfileResponse(ProfileBase):
    id: str = "user-1"
