from fastapi import APIRouter
from app.schemas.agent import JobAnalyzeRequest

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("")
async def get_jobs():
    return [
        {
            "id": "job-1",
            "title": "Junior AI Engineer",
            "company": "Anthropic Ecosystem Partner",
            "matchScore": 92,
            "skillsMatched": ["Python", "FastAPI", "Git"],
            "skillsToImprove": ["ChromaDB", "LangGraph"]
        }
    ]

@router.post("/analyze")
async def analyze_job_fit(req: JobAnalyzeRequest):
    return {
        "jobId": req.jobId,
        "matchScore": 92,
        "recommendation": "Complete Stage 4 (RAG) to boost match score to 98%."
    }
