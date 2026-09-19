"""
Student OS — Projects API Endpoints (Blueprint §18)
"""
from fastapi import APIRouter, Depends, Body
from typing import Dict, Any, Optional, List
from app.core.security import get_current_user
from app.services.supabase_service import supabase_service
from app.agents.project_agent import project_agent

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("")
async def get_projects(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieves all student portfolio projects."""
    user_id = user["id"]
    return await supabase_service.get_projects(user_id)

@router.post("/generate")
async def generate_project_blueprint_endpoint(
    payload: Dict[str, Any] = Body(...),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Uses AI Project Agent to design a production-grade portfolio project blueprint
    grounded in the student's detected skill gaps or focus topic.
    """
    user_id = user["id"]
    topic = payload.get("topic")
    difficulty = payload.get("difficulty", "Intermediate")
    return await project_agent.generate_project_blueprint(
        user_id=user_id,
        topic_or_gap=topic,
        difficulty=difficulty
    )

@router.post("")
async def create_project(
    payload: Dict[str, Any] = Body(...),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Saves or updates a project in the student's portfolio."""
    user_id = user["id"]
    return await supabase_service.save_project(user_id, payload)
