from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.schemas.agent import JobAnalyzeRequest
from app.core.security import get_current_user
from app.services.supabase_service import supabase_service
from app.services.gemini_service import gemini_service
from app.agents.context import build_student_context
from app.agents.tools import analyze_job_fit

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("")
async def get_jobs(
    query: Optional[str] = None,
    limit: int = Query(default=10, le=30),
    user: dict = Depends(get_current_user)
):
    """
    Returns jobs list with dynamically calculated match scores based on student's verified skills.
    """
    jobs = await supabase_service.get_jobs(query=query, limit=limit)
    skills_raw = await supabase_service.get_skills(user["id"])
    student_skills = set(s.get("name", "").lower() for s in skills_raw)

    profile = await supabase_service.get_profile(user["id"]) or {}
    for s in profile.get("skills", []):
        student_skills.add(s.lower())

    # Dynamically annotate each job with true match score
    enriched = []
    for j in jobs:
        req_skills = j.get("skills_required", [])
        matched = [s for s in req_skills if s.lower() in student_skills]
        missing = [s for s in req_skills if s.lower() not in student_skills]
        score = int((len(matched) / max(1, len(req_skills))) * 100) if req_skills else 50
        enriched.append({
            **j,
            "matchScore": score,
            "skillsMatched": matched,
            "skillsToImprove": missing
        })

    enriched.sort(key=lambda x: x["matchScore"], reverse=True)
    return enriched

@router.post("/analyze")
async def analyze_job(req: JobAnalyzeRequest, user: dict = Depends(get_current_user)):
    """
    Performs deterministic skill intersection and enriches with Gemini AI Career Coach recommendations.
    """
    user_id = user["id"]
    fit_data = await analyze_job_fit(user_id, req.jobId)
    context = await build_student_context(user_id)

    # Gemini explains the deterministic score and provides portfolio recommendations
    reasoning_res = await gemini_service.analyze_job_fit_with_reasoning(fit_data, context)
    return reasoning_res.get("data", fit_data)
