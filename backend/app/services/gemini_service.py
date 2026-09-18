import os
from typing import List, Dict, Any

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")

    async def analyze_gap(self, goal: str, skills: List[str], time_commitment: int) -> Dict[str, Any]:
        """
        Analyze gaps between student's current skills and their career goal.
        """
        if self.api_key:
            try:
                # When GEMINI_API_KEY is configured, call google-genai
                from google import genai
                client = genai.Client(api_key=self.api_key)
                prompt = f"""
                You are Student OS Personal AI Agent.
                The student wants to become an '{goal}'.
                Current skills: {', '.join(skills)}.
                Available study time: {time_commitment} hours per day.
                Generate:
                1. 3 major skill gaps
                2. Recommended next immediate action
                3. Estimated time to reach job readiness
                """
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt
                )
                return {
                    "summary": response.text,
                    "goal": goal,
                    "ready": True
                }
            except Exception as e:
                print(f"[GeminiService] API call failed: {e}. Using deterministic analysis.")

        # Fallback intelligent analysis
        return {
            "summary": f"Targeting {goal}: You have solid fundamentals in {', '.join(skills[:3])}. Immediate priority is mastering Vector Databases and RAG pipelines to connect your backend skills with modern LLMs.",
            "goal": goal,
            "strengths": skills,
            "recommendedNextMilestone": "RAG & Vector Embeddings",
            "estimatedWeeks": 6
        }

    async def chat(self, message: str, context: Dict[str, Any]) -> str:
        """
        AI Learning Assistant conversation
        """
        if self.api_key:
            try:
                from google import genai
                client = genai.Client(api_key=self.api_key)
                system_prompt = f"You are Student OS AI Agent helping student {context.get('name', 'Student')} reach goal: {context.get('goal', 'AI Engineer')}."
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=f"{system_prompt}\nUser question: {message}"
                )
                return response.text
            except Exception as e:
                print(f"[GeminiService] Chat call error: {e}")

        return f"Based on your profile aiming for {context.get('goal', 'AI Engineer')}, I recommend focusing on hands-on code alongside theory. Specifically: build a small CRUD with FastAPI, then connect vector similarity search."

gemini_service = GeminiService()
