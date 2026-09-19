from typing import Dict, Any, List, Optional
from app.services.supabase_service import supabase_service

class AgentMemoryManager:
    """
    Manages conversational and long-term behavioral memory for the AI Agent.
    Stores user preferences, completed learning evidence, pain points, and milestones.
    """
    def __init__(self):
        self.supabase = supabase_service

    async def save_interaction(self, user_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        """
        Saves a conversational turn or system observation into memory.
        """
        await self.supabase.save_agent_memory(
            user_id=user_id,
            role=role,
            content=content,
            metadata=metadata or {}
        )

    async def get_recent_history(self, user_id: str, limit: int = 6) -> List[Dict[str, Any]]:
        """
        Retrieves recent turns for context grounding.
        """
        return await self.supabase.get_recent_agent_memory(user_id=user_id, limit=limit)

    async def extract_student_insights(self, user_id: str) -> Dict[str, Any]:
        """
        Scans memory entries to extract preferences, strengths, and struggle points.
        """
        history = await self.get_recent_history(user_id=user_id, limit=15)
        
        prefers_projects = False
        dislikes_theory = False
        struggles = []
        preferences = []

        for turn in history:
            text = turn.get("content", "").lower()
            meta = turn.get("metadata", {})

            if "project" in text or meta.get("preference") == "project_based":
                prefers_projects = True
                preferences.append("Prefers project-based learning")
            if "theory" in text or "playlist" in text:
                dislikes_theory = True
                preferences.append("Prefers concise hands-on guides over long lectures")
            if "struggle" in text or "hard" in text or "confused" in text:
                struggles.append(turn.get("content"))

        return {
            "prefers_project_based": prefers_projects,
            "dislikes_long_theory": dislikes_theory,
            "preferences": list(set(preferences)),
            "struggles": struggles
        }

memory_manager = AgentMemoryManager()
