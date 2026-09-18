from pydantic import BaseModel
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    goal: str
    skills: List[str]
    timeCommitmentHours: int = 2

class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "gemini-1.5-pro"

class FollowCreatorRequest(BaseModel):
    creatorId: str

class JobAnalyzeRequest(BaseModel):
    jobId: str
