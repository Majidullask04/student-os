from typing import Dict, Any, List, Optional
from app.services.supabase_service import supabase_service

async def build_student_context(user_id: str) -> Dict[str, Any]:
    """
    Builds the unified Student Context object for the AI Agent.
    This is the SINGLE SOURCE OF TRUTH for all reasoning, gap analysis,
    roadmap generation, tool calling, and mentoring chat.
    
    Definition of Knowledge:
    Knowledge = Verified Skill + Concrete Evidence (Projects, Completed Tasks, Assessed Practice)
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
    career_goal = profile.get("goal") or profile.get("targetRole", "AI Engineer")

    # 2. Fetch Verified Skills
    skills_raw = await supabase_service.get_skills(user_id)
    if not skills_raw and "skills" in profile:
        skills = [{"name": s, "level": 3, "proficiency": 70, "category": "General"} for s in profile.get("skills", [])]
    else:
        def _parse_skill(s):
            prof = s.get("proficiency", 50)
            if isinstance(prof, (int, float)):
                lvl = s.get("level", max(1, int(prof) // 25))
                p_num = int(prof)
            else:
                lvl = s.get("level", 4 if str(prof).lower() in ["verified", "expert", "advanced"] else 2)
                p_num = 85 if lvl >= 4 else 60
            return {
                "name": s.get("name"),
                "level": lvl,
                "proficiency": p_num,
                "category": s.get("category", "General")
            }

        skills = [_parse_skill(s) for s in skills_raw]

    # 3. Fetch Projects (Hands-on evidence)
    projects = await supabase_service.get_projects(user_id)

    # 4. Fetch Current Roadmap & Active Milestone
    roadmap = await supabase_service.get_current_roadmap(user_id)
    active_stage = None
    next_tasks = []
    completed_task_titles = []
    if roadmap and "stages" in roadmap:
        for stage in roadmap["stages"]:
            for t in stage.get("tasks", []):
                if t.get("completed", False):
                    completed_task_titles.append(t.get("title", ""))
            if stage.get("status") in ["In Progress", "Next"] and not active_stage:
                active_stage = stage
                next_tasks = [t for t in stage.get("tasks", []) if not t.get("completed", False)]

    # 5. Fetch Completed Progress
    progress_map = await supabase_service.get_progress(user_id)
    completed_task_ids = [tid for tid, done in progress_map.items() if done]

    # 6. Compute Skill Evidence (Grounding claim in evidence)
    skill_evidence = []
    for skill in skills:
        s_name = skill.get("name", "")
        s_lower = s_name.lower()
        ev_items = []

        # Check projects for tech stack match
        for proj in projects:
            p_stack = [t.lower() for t in proj.get("tech_stack", [])]
            if s_lower in p_stack or any(s_lower in t for t in p_stack):
                ev_items.append({
                    "type": "Project",
                    "title": proj.get("title"),
                    "status": proj.get("status", "Completed"),
                    "url": proj.get("repo_url") or proj.get("live_url")
                })

        # Check completed tasks
        for t_title in completed_task_titles:
            if s_lower in t_title.lower():
                ev_items.append({
                    "type": "Completed Roadmap Task",
                    "title": t_title
                })

        # Self-assessment fallback if no projects yet
        if not ev_items:
            ev_items.append({
                "type": "Self Assessment",
                "title": f"Initial declaration ({skill.get('proficiency', 50)}% proficiency)"
            })

        skill_evidence.append({
            "skill": s_name,
            "level": skill.get("level", 2),
            "proficiency": skill.get("proficiency", 50),
            "verified": len(ev_items) > 1 or any(e["type"] == "Project" for e in ev_items),
            "evidence": ev_items
        })

    # 7. Fetch Followed Creators
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

    # 8. Fetch Curated Learning Resources for active stage
    stage_title = active_stage.get("title", "") if active_stage else ""
    candidate_resources = await supabase_service.get_resources(limit=6)

    # 9. Fetch Recent Conversational / Agent Memory
    memories = await supabase_service.get_recent_agent_memory(user_id, limit=8)

    # Compile unified context
    return {
        "user_id": user_id,
        "career_goal": career_goal,
        "profile": {
            "name": profile.get("name", "Student"),
            "goal": career_goal,
            "target_role": profile.get("targetRole") or career_goal,
            "experience": profile.get("level", "Intermediate"),
            "time_per_day": profile.get("timeCommitmentHours", 2),
            "interests": profile.get("interests", [])
        },
        "skills": skills,
        "skill_evidence": skill_evidence,
        "creators": creators,
        "resources": candidate_resources,
        "projects": projects,
        "roadmap": roadmap,
        "current_roadmap": roadmap,
        "active_stage": active_stage,
        "next_tasks": next_tasks,
        "progress": {
            "completed_tasks": completed_task_ids,
            "total_completed": len(completed_task_ids),
            "overall_percentage": roadmap.get("overallPercentage", 0) if roadmap else 0
        },
        "memory": memories,
        "recent_memory": memories,
        "learning_preferences": {
            "project_based": any("project" in m.get("content", "").lower() for m in memories),
            "dislikes_theory": any("theory" in m.get("content", "").lower() or "playlist" in m.get("content", "").lower() for m in memories),
            "struggles": [m.get("content") for m in memories if "struggle" in m.get("content", "").lower()]
        }
    }
