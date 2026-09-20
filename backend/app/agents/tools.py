"""
Student OS — Agent Tool Registry & Executable Tools
"""
from typing import Dict, Any, List, Optional
from app.services.supabase_service import supabase_service
from app.agents.context import build_student_context
from app.agents.memory import memory_manager

# =============================================================================
# 1. Profile Tools
# =============================================================================
async def get_student_profile(user_id: str) -> Dict[str, Any]:
    """Fetches full student profile details including goal, level, and study hours."""
    return await supabase_service.get_profile(user_id) or {}

async def get_student_skills(user_id: str) -> List[Dict[str, Any]]:
    """Retrieves verified skills with proficiency levels."""
    return await supabase_service.get_skills(user_id)

async def get_student_projects(user_id: str) -> List[Dict[str, Any]]:
    """Retrieves completed and in-progress portfolio projects as evidence of skills."""
    return await supabase_service.get_projects(user_id)

# =============================================================================
# 2. Learning Tools
# =============================================================================
async def get_current_roadmap(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves the student's active personalized roadmap and stages."""
    return await supabase_service.get_current_roadmap(user_id)

async def get_progress(user_id: str) -> Dict[str, bool]:
    """Retrieves map of completed task IDs."""
    return await supabase_service.get_progress(user_id)

async def search_resources(user_id: str, topic: Optional[str] = None) -> List[Dict[str, Any]]:
    """Searches curated learning resources, optionally filtered by topic/tag."""
    tags = [topic] if topic else None
    return await supabase_service.get_resources(tags=tags)

async def get_followed_creators(user_id: str) -> List[Dict[str, Any]]:
    """Retrieves creators the student follows and trusts for educational advice."""
    return await supabase_service.get_followed_creators(user_id)

# =============================================================================
# 3. Action & Reasoning Tools
# =============================================================================
async def update_roadmap_progress(user_id: str, task_id: str, completed: bool = True) -> Dict[str, Any]:
    """Updates a task status, recalculating milestone and overall roadmap percentages."""
    res = await supabase_service.save_progress(user_id, task_id, completed)
    await memory_manager.save_interaction(
        user_id=user_id,
        role="system",
        content=f"Task {task_id} marked as {'completed' if completed else 'pending'}.",
        metadata={"task_id": task_id, "completed": completed}
    )
    return res

async def save_agent_memory(user_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
    """Stores key behavioral insights, completed projects, or interaction turns."""
    await memory_manager.save_interaction(user_id, role, content, metadata)

# =============================================================================
# 4. Career Tools
# =============================================================================
async def search_jobs(query: Optional[str] = None) -> List[Dict[str, Any]]:
    """Searches available tech jobs and internships."""
    return await supabase_service.get_jobs(query=query)

async def analyze_job_fit(user_id: str, job_id: str) -> Dict[str, Any]:
    """
    Computes deterministic skill overlap between student skills and job requirements.
    """
    jobs = await supabase_service.get_jobs()
    job = next((j for j in jobs if j.get("id") == job_id), None)
    if not job:
        return {"error": "Job not found", "readinessScore": 0}

    skills_raw = await supabase_service.get_skills(user_id)
    student_skills = set(s.get("name", "").lower() for s in skills_raw)
    
    # Also check profile skills
    profile = await supabase_service.get_profile(user_id) or {}
    for s in profile.get("skills", []):
        student_skills.add(s.lower())

    required = job.get("skills_required", [])
    matched = [s for s in required if s.lower() in student_skills]
    missing = [s for s in required if s.lower() not in student_skills]

    readiness = int((len(matched) / max(1, len(required))) * 100)

    return {
        "jobId": job_id,
        "jobTitle": job.get("title"),
        "company": job.get("company"),
        "readinessScore": readiness,
        "matchedSkills": matched,
        "missingSkills": missing,
        "skillsRequired": required
    }

# =============================================================================
# 5. Knowledge RAG & Adaptive Tools
# =============================================================================
async def search_knowledge(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """Retrieves verified technical explanations, creator advice, and architecture notes."""
    from app.agents.rag_service import rag_service
    return rag_service.search_knowledge(query=query, top_k=top_k)

async def generate_project_plan(user_id: str, topic: Optional[str] = None) -> Dict[str, Any]:
    """Generates a structured portfolio project blueprint grounded in student skill gaps."""
    from app.agents.project_agent import project_agent
    return await project_agent.generate_project_blueprint(user_id=user_id, topic_or_gap=topic)

async def generate_diagnostic_assessment(user_id: str, topic: Optional[str] = None) -> Dict[str, Any]:
    """Generates a diagnostic quiz targeting current milestone or topic."""
    from app.agents.assessment_agent import assessment_agent
    return await assessment_agent.generate_assessment(user_id=user_id, topic=topic)

# =============================================================================
# Tool Registry Map for the Agent
# =============================================================================
TOOL_REGISTRY = {
    "get_student_profile": get_student_profile,
    "get_student_skills": get_student_skills,
    "get_student_projects": get_student_projects,
    "get_current_roadmap": get_current_roadmap,
    "get_progress": get_progress,
    "search_resources": search_resources,
    "get_followed_creators": get_followed_creators,
    "update_roadmap_progress": update_roadmap_progress,
    "save_agent_memory": save_agent_memory,
    "search_jobs": search_jobs,
    "analyze_job_fit": analyze_job_fit,
    "search_knowledge": search_knowledge,
    "generate_project_plan": generate_project_plan,
    "generate_diagnostic_assessment": generate_diagnostic_assessment
}
