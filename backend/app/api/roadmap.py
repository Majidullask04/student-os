from fastapi import APIRouter
from app.schemas.roadmap import ProgressUpdate

router = APIRouter(tags=["roadmap"])

@router.get("/roadmap")
async def get_roadmap():
    return {
        "id": "roadmap-ai-engineer",
        "goal": "AI Engineer",
        "overallPercentage": 28,
        "stages": [
            {"id": "s1", "stageNumber": 1, "title": "Foundations", "status": "Completed"},
            {"id": "s2", "stageNumber": 2, "title": "Backend & APIs", "status": "In Progress"},
            {"id": "s3", "stageNumber": 3, "title": "AI & LLMs", "status": "Next"},
            {"id": "s4", "stageNumber": 4, "title": "RAG", "status": "Upcoming"},
            {"id": "s5", "stageNumber": 5, "title": "AI Agents", "status": "Upcoming"},
            {"id": "s6", "stageNumber": 6, "title": "Production & DevOps", "status": "Upcoming"},
            {"id": "s7", "stageNumber": 7, "title": "Career & Jobs", "status": "Upcoming"},
        ]
    }

@router.post("/progress")
async def update_progress(req: ProgressUpdate):
    return {
        "success": True,
        "taskId": req.taskId,
        "completed": req.completed
    }
