from pydantic import BaseModel, Field
from typing import List, Optional, Any

class ProfileBase(BaseModel):
    name: str = "Student"
    email: str = "student@studentos.dev"
    goal: str = "AI Engineer"
    targetRole: str = "AI Engineer"
    level: str = "Intermediate"
    interests: List[str] = ["AI", "DevOps", "Full Stack"]
    timeCommitmentHours: int = 2
    skills: List[Any] = ["Python", "FastAPI", "Git", "Docker"]
    followedCreatorIds: List[str] = ["karpathy", "kunalkushwaha", "fireship", "hiteshchoudhary"]
    onboardingCompleted: bool = False
    diagnosticBaseline: Optional[Any] = None

    class Config:
        extra = "allow"

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    goal: Optional[str] = None
    targetRole: Optional[str] = None
    level: Optional[str] = None
    interests: Optional[List[str]] = None
    timeCommitmentHours: Optional[int] = None
    skills: Optional[List[Any]] = None
    followedCreatorIds: Optional[List[str]] = None
    onboardingCompleted: Optional[bool] = None
    diagnosticBaseline: Optional[Any] = None

    class Config:
        extra = "allow"

class ProfileResponse(BaseModel):
    id: str = "user-1"
    name: str = "Student"
    email: str = "student@studentos.dev"
    goal: Optional[str] = "AI Engineer"
    targetRole: Optional[str] = "AI Engineer"
    level: Optional[str] = "Intermediate"
    interests: Optional[List[str]] = ["AI", "DevOps", "Full Stack"]
    timeCommitmentHours: Optional[int] = 2
    skills: Optional[List[Any]] = ["Python", "FastAPI", "Git", "Docker"]
    followedCreatorIds: Optional[List[str]] = ["karpathy", "kunalkushwaha", "fireship", "hiteshchoudhary"]
    onboardingCompleted: Optional[bool] = True
    diagnosticBaseline: Optional[Any] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        extra = "allow"
