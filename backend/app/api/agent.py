from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.schemas.agent import AnalyzeRequest, ChatRequest
from app.core.security import get_current_user
from app.agents.learning_agent import learning_agent
from app.agents.context import build_student_context

router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/analyze")
async def analyze_student_profile(req: AnalyzeRequest, user: dict = Depends(get_current_user)):
    """
    Analyzes student skill gaps and generates an adaptive 7-stage learning roadmap.
    Persists the roadmap to the database and records analysis into agent memory.
    """
    return await learning_agent.analyze_student_profile(
        user_id=user["id"],
        goal=req.goal,
        skills=req.skills,
        time_commitment=req.timeCommitmentHours
    )

@router.post("/chat")
async def chat_with_agent(req: ChatRequest, user: dict = Depends(get_current_user)):
    """
    Tool-aware AI conversation grounded in student roadmap, progress, and memory.
    Inspects user intent, selects and executes agent tools, reasons, and returns structured advice.
    """
    return await learning_agent.handle_student_chat(
        user_id=user["id"],
        message=req.message
    )

@router.post("/resolve-conflicts")
async def resolve_creator_conflicts(
    debates: Optional[str] = None, 
    user: dict = Depends(get_current_user)
):
    """
    Resolves educational disputes between tech creators tailored to this student's context.
    """
    return await learning_agent.resolve_creator_conflicts(
        user_id=user["id"],
        creator_viewpoints=debates
    )

@router.get("/context")
async def get_agent_context(user: dict = Depends(get_current_user)):
    """
    Retrieves the complete, unified Student Context (single source of truth for agent).
    """
    return await build_student_context(user["id"])
