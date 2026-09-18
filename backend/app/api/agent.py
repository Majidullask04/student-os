from fastapi import APIRouter
from app.schemas.agent import AnalyzeRequest, ChatRequest
from app.agents.learning_agent import learning_agent

router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/analyze")
async def analyze_gap(req: AnalyzeRequest):
    return await learning_agent.run_gap_analysis(req.goal, req.skills, req.timeCommitmentHours)

@router.post("/chat")
async def chat(req: ChatRequest):
    return await learning_agent.handle_student_chat("user-1", req.message)
