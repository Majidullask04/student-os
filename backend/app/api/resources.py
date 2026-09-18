from fastapi import APIRouter
from typing import Optional

router = APIRouter(prefix="/resources", tags=["resources"])

@router.get("/recommended")
async def get_recommended_resources():
    return [
        {
            "id": "res-1",
            "title": "Build a Complete RAG App with LangChain (2024)",
            "platform": "YouTube Video",
            "creator": "codebasics",
            "category": "AI / ML",
            "tags": ["AI / LLMs", "RAG", "LangChain"],
            "difficulty": "Intermediate",
            "duration": "1h 12m",
            "rating": 4.9
        },
        {
            "id": "res-2",
            "title": "FastAPI Full Course for Beginners",
            "platform": "Course (free)",
            "creator": "freeCodeCamp",
            "category": "Backend",
            "tags": ["Backend", "FastAPI", "APIs"],
            "difficulty": "Beginner",
            "duration": "3h 12m",
            "rating": 4.9
        }
    ]

@router.get("")
async def get_resources(category: Optional[str] = None):
    return [
        {
            "id": "res-1",
            "title": "Build a Complete RAG App with LangChain (2024)",
            "platform": "YouTube Video",
            "creator": "codebasics",
            "category": "AI / ML",
            "tags": ["AI / LLMs", "RAG", "LangChain"],
            "difficulty": "Intermediate",
            "duration": "1h 12m"
        },
        {
            "id": "res-3",
            "title": "Docker & Kubernetes in 2 Hours",
            "platform": "YouTube Video",
            "creator": "TechWorld with Nana",
            "category": "DevOps",
            "tags": ["DevOps", "Docker", "Kubernetes"],
            "difficulty": "Beginner",
            "duration": "2h 8m"
        }
    ]
