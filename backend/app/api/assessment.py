"""
Student OS — Assessment API Endpoints (Blueprint §8 & §9)
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any, Optional
from app.core.security import get_current_user
from app.agents.assessment_agent import assessment_agent

router = APIRouter(prefix="/assessment", tags=["assessment"])

@router.post("/generate")
async def generate_assessment_endpoint(
    payload: Dict[str, Any] = Body(...),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Generates a diagnostic quiz targeting a specific topic or the student's active roadmap stage.
    """
    user_id = user["id"]
    topic = payload.get("topic")
    difficulty = payload.get("difficulty", "Intermediate")
    quiz = await assessment_agent.generate_assessment(user_id=user_id, topic=topic, difficulty=difficulty)
    return quiz

@router.post("/submit")
async def submit_assessment_endpoint(
    payload: Dict[str, Any] = Body(...),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Evaluates quiz submission, detects skill gaps, and triggers adaptive roadmap re-planning.
    """
    user_id = user["id"]
    topic = payload.get("topic")
    answers = payload.get("answers", {})
    if not topic:
        raise HTTPException(status_code=400, detail="Missing topic field in payload")
    
    result = await assessment_agent.evaluate_submission_and_adapt(
        user_id=user_id,
        topic=topic,
        answers=answers
    )
    return result
