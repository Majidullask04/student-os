from typing import Dict, Any, List
from app.services.gemini_service import gemini_service
from app.db.database import db

class LearningAgent:
    """
    Student OS Core Agent:
    Understand -> Analyze -> Recommend -> Act -> Measure -> Adapt
    """
    def __init__(self):
        self.gemini = gemini_service

    async def run_gap_analysis(self, goal: str, skills: List[str], time_commitment: int) -> Dict[str, Any]:
        analysis = await self.gemini.analyze_gap(goal, skills, time_commitment)
        return {
            "status": "success",
            "analysis": analysis,
            "roadmapMilestones": [
                {"stage": 1, "title": "Foundations", "status": "Completed"},
                {"stage": 2, "title": "Backend & APIs", "status": "In Progress"},
                {"stage": 3, "title": "AI & LLMs", "status": "Next"},
                {"stage": 4, "title": "RAG", "status": "Upcoming"},
                {"stage": 5, "title": "AI Agents", "status": "Upcoming"},
                {"stage": 6, "title": "Production & DevOps", "status": "Upcoming"},
                {"stage": 7, "title": "Career & Jobs", "status": "Upcoming"},
            ]
        }

    async def handle_student_chat(self, user_id: str, message: str) -> Dict[str, Any]:
        profile = db.profiles.get(user_id, {})
        response_text = await self.gemini.chat(message, profile)
        return {
            "sender": "assistant",
            "text": response_text,
            "suggestedNextAction": "Check recommended vector database tutorial"
        }

learning_agent = LearningAgent()
