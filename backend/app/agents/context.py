from typing import Dict, Any, List, Optional
from app.services.supabase_service import supabase_service

async def build_student_context(user_id: str) -> Dict[str, Any]:
    """
    Builds the unified Student Context object for the AI Agent.
    This is the SINGLE SOURCE OF TRUTH for all reasoning, gap analysis,
    roadmap generation, tool calling, and mentoring chat.
    """
    # 1. Fetch Profile
    profile = await supabase_service.get_profile(user_id) or {
        "id": user_id,
        "name": "Student",
        "goal": "AI Engineer",
        "targetRole": "AI Engineer",
        "level": "Intermediate",
        "timeCommitmentHours": 2,
        "interests": ["AI", "DevOps", "Full Stack"]
    }

    # 2. Fetch Verified Skills
    skills_raw = await supabase_service.get_skills(user_id)
    if not skills_raw and "skills" in profile:
        skills = [{"name": s, "level": 3, "proficiency": 70, "category": "General"} for s in profile.get("skills", [])]
    else:
        skills = [
            {
                "name": s.get("name"),
                "level": s.get("level", max(1, s.get("proficiency", 50) // 25)),
                "proficiency": s.get("proficiency", 50),
                "category": s.get("category", "General")
            }
            for s in skills_raw
        ]

    # 3. Fetch Followed Creators
    creators_raw = await supabase_service.get_followed_creators(user_id)
    creators = [
        {
            "id": c.get("id"),
            "name": c.get("name"),
            "handle": c.get("handle"),
            "tags": c.get("tags", []),
            "viewpoint": c.get("viewpoint", "")
        }
        for c in creators_raw
    ]

    # 4. Fetch Current Roadmap & Active Milestone
    roadmap = await supabase_service.get_current_roadmap(user_id)
    active_stage = None
    next_tasks = []
    if roadmap and "stages" in roadmap:
        for stage in roadmap["stages"]:
            if stage.get("status") in ["In Progress", "Next"]:
                active_stage = stage
                next_tasks = [t for t in stage.get("tasks", []) if not t.get("completed", False)]
                break

    # 5. Fetch Completed Progress
    progress_map = await supabase_service.get_progress(user_id)
    completed_task_ids = [tid for tid, done in progress_map.items() if done]

    # 6. Fetch Projects (Hands-on evidence)
    projects = await supabase_service.get_projects(user_id)

    # 7. Fetch Recent Conversational / Agent Memory
    memories = await supabase_service.get_recent_agent_memory(user_id, limit=6)

    # Compile unified context
    return {
        "user_id": user_id,
        "profile": {
            "name": profile.get("name", "Student"),
            "goal": profile.get("goal") or profile.get("targetRole", "AI Engineer"),
            "target_role": profile.get("targetRole") or profile.get("goal", "AI Engineer"),
            "experience": profile.get("level", "Intermediate"),
            "time_per_day": profile.get("timeCommitmentHours", 2),
            "interests": profile.get("interests", [])
        },
        "skills": skills,
        "creators": creators,
        "current_roadmap": roadmap,
        "active_stage": active_stage,
        "next_tasks": next_tasks,
        "progress": {
            "completed_tasks": completed_task_ids,
            "total_completed": len(completed_task_ids),
            "overall_percentage": roadmap.get("overallPercentage", 0) if roadmap else 0
        },
        "projects": projects,
        "recent_memory": memories,
        "learning_preferences": {
            "project_based": any("project" in m.get("content", "").lower() for m in memories),
            "struggles": [m.get("content") for m in memories if "struggle" in m.get("content", "").lower()]
        }
    }
