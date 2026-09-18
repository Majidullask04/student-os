import os
from typing import Dict, Any

# In-memory store with Supabase sync capabilities
class Database:
    def __init__(self):
        self.profiles: Dict[str, Any] = {
            "user-1": {
                "id": "user-1",
                "name": "Majidulla",
                "email": "majidulla@studentos.dev",
                "goal": "AI Engineer",
                "targetRole": "AI Engineer",
                "level": "Intermediate",
                "interests": ["AI", "DevOps", "Full Stack"],
                "timeCommitmentHours": 2,
                "skills": ["Python", "FastAPI", "Git", "Docker"],
                "followedCreatorIds": ["karpathy", "kunalkushwaha", "fireship", "hiteshchoudhary"],
            }
        }
        self.progress: Dict[str, bool] = {}

db = Database()
