"""
Student OS — Project Agent (Blueprint §18)
Generates structured portfolio project blueprints, milestones, tasks,
and starter code skeletons to bridge skill gaps into verified proof-of-work.
"""
from typing import Dict, Any, List, Optional
import uuid
from app.services.supabase_service import supabase_service
from app.agents.memory import memory_manager
from app.agents.context import build_student_context

class ProjectAgent:
    """Agent that creates production-grade portfolio projects grounded in skill gaps."""

    async def generate_project_blueprint(
        self,
        user_id: str,
        topic_or_gap: Optional[str] = None,
        difficulty: str = "Intermediate"
    ) -> Dict[str, Any]:
        """Generates a structured portfolio project blueprint with milestones and tasks."""
        context = await build_student_context(user_id)
        
        # Determine focus area from skill gaps or active roadmap
        focus = topic_or_gap
        if not focus:
            gaps = context.get("skillGaps", [])
            if gaps:
                focus = gaps[0]
            else:
                focus = "RAG & Vector Databases"

        project_id = f"proj-{uuid.uuid4().hex[:8]}"

        # Tailored blueprint catalogs
        if "rag" in focus.lower() or "vector" in focus.lower():
            title = "Autonomous RAG Knowledge Assistant with Hybrid Search"
            description = "Production-grade retrieval augmented generation microservice with semantic vector search, BM25 keyword re-ranking, and citation guardrails."
            tech_stack = ["Python", "FastAPI", "ChromaDB", "Gemini API", "Docker", "PyTest"]
            milestones = [
                {
                    "step": 1,
                    "title": "Document Pipeline & Chunking",
                    "tasks": ["Implement recursive token chunker (512 tokens, 10% overlap)", "Extract text and metadata from PDF and Markdown files"]
                },
                {
                    "step": 2,
                    "title": "Vector Embeddings & HNSW Indexing",
                    "tasks": ["Generate dense embeddings via Gemini or text-embedding-004", "Persist vectors into ChromaDB collection with cosine distance metric"]
                },
                {
                    "step": 3,
                    "title": "FastAPI Query & Grounding Route",
                    "tasks": ["Build /query endpoint with hybrid similarity filtering", "Inject strict prompt citation guardrails preventing hallucinations"]
                },
                {
                    "step": 4,
                    "title": "Evaluation & Containerization",
                    "tasks": ["Measure recall@5 latency (<150ms)", "Create multi-stage Dockerfile and write automated PyTest integration tests"]
                }
            ]
            starter_code = '''from fastapi import FastAPI, HTTPException
import chromadb

app = FastAPI(title="RAG Vector Service")
chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection(name="knowledge_store")

@app.post("/search")
async def semantic_search(query: str, top_k: int = 3):
    results = collection.query(query_texts=[query], n_results=top_k)
    return {"results": results}
'''
        elif "agent" in focus.lower():
            title = "Multi-Tool Autonomous ReAct Agent Framework"
            description = "A resilient autonomous agent framework featuring deterministic tool-calling, conversational short/long-term memory, and error reflection."
            tech_stack = ["Python", "FastAPI", "Gemini API", "SQLAlchemy", "Asyncio"]
            milestones = [
                {"step": 1, "title": "Tool Registry & JSON Schema Specs", "tasks": ["Define @tool decorator with auto-generated schemas", "Implement safe runtime argument validation"]},
                {"step": 2, "title": "ReAct Execution Loop", "tasks": ["Build iterative Thought-Action-Observation cycle", "Handle tool execution exceptions with graceful fallbacks"]},
                {"step": 3, "title": "Memory & Session Management", "tasks": ["Store rolling conversation buffer", "Persist state across sessions"]}
            ]
            starter_code = '''# Autonomous Agent ReAct Loop
class Agent:
    def __init__(self, tools):
        self.tools = tools
    async def step(self, prompt):
        # Thought -> Action -> Observation
        pass
'''
        else:
            title = f"High-Performance {focus} Microservice"
            description = f"End-to-end backend service demonstrating deep mastery of {focus} with clean architecture and automated tests."
            tech_stack = ["Python", "FastAPI", "PostgreSQL", "Docker", "PyTest"]
            milestones = [
                {"step": 1, "title": "Architecture & Schema Design", "tasks": [f"Design normalized relational schema for {focus}", "Configure async database connection pools"]},
                {"step": 2, "title": "RESTful API Implementation", "tasks": ["Create secure endpoints with JWT authentication", "Implement input sanitization and Pydantic validation"]},
                {"step": 3, "title": "Testing & Deployment", "tasks": ["Write comprehensive unit tests with >80% coverage", "Configure Docker deployment configuration"]}
            ]
            starter_code = '''# FastAPI Core Blueprint
from fastapi import FastAPI
app = FastAPI()
'''

        blueprint = {
            "id": project_id,
            "title": title,
            "focusSkill": focus,
            "description": description,
            "difficulty": difficulty,
            "techStack": tech_stack,
            "status": "In Progress",
            "progress": 0,
            "milestones": milestones,
            "starterBoilerplate": starter_code,
            "verificationCriteria": [
                "All unit and integration tests pass cleanly with pytest",
                "Service runs in containerized Docker environment without manual configuration",
                "Live demo endpoint responds with <200ms latency"
            ]
        }

        # Save to database / portfolio
        project_record = {
            "id": project_id,
            "title": title,
            "description": description,
            "tech_stack": tech_stack,
            "techStack": tech_stack,
            "status": "In Progress",
            "progress": 0,
            "difficulty": difficulty,
            "category": "AI / Backend"
        }
        await supabase_service.upsert_project(user_id, project_record)

        # Log into agent memory
        await memory_manager.save_interaction(
            user_id=user_id,
            role="system",
            content=f"Generated Project Blueprint '{title}' focusing on skill '{focus}'.",
            metadata={"projectId": project_id, "focus": focus}
        )

        return blueprint

project_agent = ProjectAgent()
