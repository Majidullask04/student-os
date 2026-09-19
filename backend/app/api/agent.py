from fastapi import APIRouter, Depends
from app.schemas.agent import AnalyzeRequest, ChatRequest
from app.core.security import get_current_user
from app.services.gemini_service import gemini_service
from app.services.supabase_service import supabase_service
from app.db.database import db

router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/analyze")
async def analyze_gap(req: AnalyzeRequest, user: dict = Depends(get_current_user)):
    """
    Analyzes student skill gaps and generates an adaptive learning roadmap using Gemini API.
    """
    result = await gemini_service.analyze_gap_and_generate_roadmap(
        goal=req.goal,
        skills=req.skills,
        time_commitment=req.timeCommitmentHours
    )

    # Save to agent memory
    await supabase_service.save_agent_memory(
        user_id=user["id"],
        role="system",
        content=f"Generated roadmap for {req.goal} with {len(req.skills)} verified baseline skills.",
        metadata={"goal": req.goal, "skills": req.skills}
    )

    return result

@router.post("/chat")
async def chat(req: ChatRequest, user: dict = Depends(get_current_user)):
    """
    Context-aware AI conversation with student memory and Gemini grounding.
    """
    user_id = user["id"]
    profile = db.profiles.get(user_id, {
        "name": user.get("name", "Student"),
        "goal": "AI Engineer",
        "skills": ["Python", "FastAPI"]
    })

    # Retrieve recent conversational memory from Supabase
    recent_memory = await supabase_service.get_recent_agent_memory(user_id)

    # Call Gemini with student context
    response = await gemini_service.chat_with_context(
        message=req.message,
        profile=profile,
        roadmap_stage="Backend & APIs (In Progress)",
        history=recent_memory
    )

    # Persist user message and AI response into agent_memory
    await supabase_service.save_agent_memory(user_id, "user", req.message)
    await supabase_service.save_agent_memory(user_id, "assistant", response["text"])

    return {
        "sender": "assistant",
        "text": response["text"],
        "source": response.get("source", "gemini")
    }
