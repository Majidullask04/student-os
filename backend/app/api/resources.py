from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from app.core.security import get_current_user
from app.agents.learning_agent import learning_agent
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/resources", tags=["resources"])

@router.get("/recommended")
async def get_recommended_resources(user: dict = Depends(get_current_user)):
    """
    Ranks learning resources dynamically according to the student's active roadmap milestone,
    identified skill gaps, followed creators, and difficulty level.
    """
    user_id = user["id"]
    return await learning_agent.get_recommended_resources(user_id)

@router.get("")
async def get_all_resources(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = Query(default=20, le=50)
):
    """
    Retrieves the catalog of learning resources with optional filtering.
    """
    return await supabase_service.get_resources(category=category, difficulty=difficulty, limit=limit)
