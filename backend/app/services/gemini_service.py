import os
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    def _get_client(self):
        if not self.api_key:
            return None
        try:
            from google import genai
            return genai.Client(api_key=self.api_key)
        except Exception as e:
            print(f"[GeminiService] SDK import/init warning: {e}")
            return None

    async def analyze_gap_and_generate_roadmap(self, goal: str, skills: List[str], time_commitment: int) -> Dict[str, Any]:
        """
        Calls Gemini with structured JSON output to analyze gaps and produce
        an adaptive 7-stage roadmap customized to student's background.
        """
        client = self._get_client()
        if client:
            try:
                prompt = f"""
                You are Student OS's Chief AI Academic & Career Architect.
                Analyze the following student:
                - Target Career Goal: {goal}
                - Existing Skills: {', '.join(skills)}
                - Available Study Time: {time_commitment} hours per day

                Output a strictly valid JSON response with the following structure:
                {{
                  "summary": "2 sentence executive gap analysis",
                  "readinessScore": 35,
                  "estimatedWeeks": 8,
                  "strengths": ["list of skills they have"],
                  "criticalGaps": ["list of top 3 missing skills"],
                  "stages": [
                    {{
                      "stageNumber": 1,
                      "title": "Stage Title",
                      "status": "Completed" | "In Progress" | "Upcoming",
                      "description": "Short stage description",
                      "whyThisStep": "Rationale",
                      "tasks": [
                        {{
                          "id": "t1",
                          "title": "Task title",
                          "type": "Theory" | "Hands-on" | "Project" | "Security",
                          "estimatedHours": 3,
                          "completed": false
                        }}
                      ]
                    }}
                  ]
                }}
                """
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                if response.text:
                    parsed = json.loads(response.text)
                    return {"status": "success", "source": "gemini-live", "data": parsed}
            except Exception as e:
                print(f"[GeminiService] Structured analysis error: {e}. Using deterministic fallback.")

        # High-yield deterministic fallback matching exact 7-stage student architecture
        return {
            "status": "success",
            "source": "deterministic-engine",
            "data": {
                "summary": f"Targeting {goal}: You have solid foundations in {', '.join(skills[:3])}. Immediate priority is mastering Vector Databases and RAG to bridge backend APIs with LLM inference.",
                "readinessScore": 38,
                "estimatedWeeks": 6,
                "strengths": skills,
                "criticalGaps": ["Vector Databases (Chroma/Pinecone)", "RAG Chunking Strategies", "LLM Evaluation & Benchmarking"],
                "stages": [
                    {"stageNumber": 1, "title": "Foundations", "status": "Completed", "description": "Core programming, tools and CS basics"},
                    {"stageNumber": 2, "title": "Backend & APIs", "status": "In Progress", "description": "Build real backend applications and APIs"},
                    {"stageNumber": 3, "title": "AI & LLMs", "status": "Next", "description": "Learn LLMs, prompt engineering, and embeddings"},
                    {"stageNumber": 4, "title": "RAG", "status": "Upcoming", "description": "Build knowledge-based retrieval augmented generation"},
                    {"stageNumber": 5, "title": "AI Agents", "status": "Upcoming", "description": "Multi-step agents, function calling, and tool use"},
                    {"stageNumber": 6, "title": "Production & DevOps", "status": "Upcoming", "description": "Deploy and scale your AI projects reliably"},
                    {"stageNumber": 7, "title": "Career & Jobs", "status": "Upcoming", "description": "Resume, interviews, portfolio, and real applications"},
                ]
            }
        }

    async def chat_with_context(
        self, 
        message: str, 
        profile: Dict[str, Any], 
        roadmap_stage: str, 
        history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Context-grounded AI Study Agent conversation with student memory.
        """
        client = self._get_client()
        goal = profile.get("goal", "AI Engineer")
        name = profile.get("name", "Student")
        skills = profile.get("skills", ["Python", "FastAPI"])

        if client:
            try:
                system_context = f"""
                You are Student OS Personal AI Study Agent.
                Student Name: {name}
                Target Career Goal: {goal}
                Current Roadmap Milestone: {roadmap_stage}
                Verified Skills: {', '.join(skills)}
                
                Provide direct, actionable, encouraging responses tailored to their specific goal.
                If they ask for recommendations or what to learn, suggest concrete next steps with hours.
                """
                history_formatted = "\n".join([f"{h.get('role', 'user')}: {h.get('content', '')}" for h in history[-4:]])
                prompt = f"{system_context}\n\nRecent Conversation:\n{history_formatted}\n\nUser: {message}"

                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                return {
                    "text": response.text,
                    "source": "gemini-live"
                }
            except Exception as e:
                print(f"[GeminiService] Chat call error: {e}")

        # Deterministic grounded response
        lower = message.lower()
        if "what should i learn" in lower or "today" in lower:
            text = f"Based on your profile, current progress, and goal of becoming an {goal}, here is what I recommend for today:\n\nFocus on: **Vector Databases for RAG**. Since you already have {skills[0] if skills else 'programming'} knowledge, learning vector embeddings connects your backend code directly to LLM apps."
        elif "project" in lower:
            text = f"For an {goal}, build a **FastAPI + ChromaDB Knowledge Engine**. It proves to hiring managers that you can deploy real vector search with production API endpoints."
        else:
            text = f"As your personal AI agent for {goal}, I recommend balancing hands-on coding with theory. For your current milestone ({roadmap_stage}), review the recommended resources and complete the active task checklist."

        return {
            "text": text,
            "source": "deterministic-engine"
        }

gemini_service = GeminiService()
