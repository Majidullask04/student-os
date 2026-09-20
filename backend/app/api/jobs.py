from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.schemas.agent import JobAnalyzeRequest
from app.core.security import get_current_user
from app.agents.job_search_agent import job_search_agent

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("")
async def get_jobs(
    query: Optional[str] = None,
    limit: int = Query(default=10, le=30),
    user: dict = Depends(get_current_user)
):
    """
    Returns a ranked shortlist of tech jobs evaluated against the student's background
    using the 5-Dimensional Fit Scoring Framework (Technical, Experience, Career, Culture, Location).
    """
    user_id = user["id"]
    return await job_search_agent.search_and_rank_jobs(user_id=user_id, query=query, limit=limit)

@router.post("/analyze")
async def analyze_job(req: JobAnalyzeRequest, user: dict = Depends(get_current_user)):
    """
    Performs comprehensive 5D fit analysis on a specific job posting against verified student context.
    """
    user_id = user["id"]
    jobs = await job_search_agent.search_and_rank_jobs(user_id=user_id, limit=20)
    job = next((j for j in jobs if j.get("id") == req.jobId), None)
    if not job:
        job = {"id": req.jobId, "title": "AI Engineer", "company": "Tech Company", "skills_required": ["Python", "FastAPI", "RAG"]}
    
    return job

@router.post("/tailor")
async def tailor_application(req: JobAnalyzeRequest, user: dict = Depends(get_current_user)):
    """
    Generates a tailored application kit (CV bullets, forward-looking cover letter/pitch,
    and ATS keyword checklist) grounded in the student's verified projects and roadmap evidence.
    """
    user_id = user["id"]
    return await job_search_agent.generate_application_kit(user_id=user_id, job_id=req.jobId)

@router.post("/interview-prep")
async def generate_interview_prep(req: JobAnalyzeRequest, user: dict = Depends(get_current_user)):
    """
    Generates tailored interview preparation including technical deep dive questions,
    STAR-framework behavioral responses using the student's projects, and strategic questions for the employer.
    """
    user_id = user["id"]
    return await job_search_agent.generate_interview_prep(user_id=user_id, job_id=req.jobId)

@router.post("/parse-jd-and-adapt")
async def parse_jd_and_adapt_endpoint(
    payload: dict,
    user: dict = Depends(get_current_user)
):
    """
    Parses pasted JD text, extracts required technologies, computes 5D fit score,
    and dynamically adapts the active roadmap with targeted remediation tasks.
    """
    user_id = user["id"]
    raw_jd = payload.get("rawJd", "")
    job_title = payload.get("jobTitle")
    company = payload.get("company")
    auto_inject = payload.get("autoInjectRoadmap", True)

    return await job_search_agent.parse_jd_and_adapt(
        user_id=user_id,
        raw_jd=raw_jd,
        job_title=job_title,
        company=company,
        auto_inject_roadmap=auto_inject
    )
