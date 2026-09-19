import os
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.agents.prompts import (
    AGENT_SYSTEM_PROMPT,
    GAP_ANALYSIS_PROMPT,
    ROADMAP_PROMPT,
    CONFLICT_RESOLUTION_PROMPT,
    NEXT_ACTION_PROMPT,
    JOB_FIT_PROMPT,
    CHAT_PROMPT
)

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
            print(f"[GeminiService] SDK import/init error: {e}")
            return None

    # =========================================================================
    # 1. Gap Analysis & Dynamic Roadmap Generation
    # =========================================================================
    async def analyze_gap_and_generate_roadmap(
        self, 
        student_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Runs deep Gap Analysis & 7-Stage Personalized Roadmap generation.
        """
        profile = student_context.get("profile", {})
        goal = profile.get("goal", "AI Engineer")
        experience = profile.get("experience", "Intermediate")
        time_per_day = profile.get("time_per_day", 2)
        skills = [s.get("name") if isinstance(s, dict) else s for s in student_context.get("skills", [])]
        projects = [p.get("title") for p in student_context.get("projects", [])]
        creators = [c.get("name") for c in student_context.get("creators", [])]
        recent_memory = [m.get("content") for m in student_context.get("recent_memory", [])]

        client = self._get_client()
        if client:
            try:
                prompt = f"""
                {AGENT_SYSTEM_PROMPT}

                {GAP_ANALYSIS_PROMPT.format(
                    goal=goal,
                    experience=experience,
                    time_per_day=time_per_day,
                    skills=", ".join(skills) if skills else "Basic Python",
                    projects=", ".join(projects) if projects else "None recorded yet",
                    recent_memory="; ".join(recent_memory) if recent_memory else "Standard onboarding"
                )}

                Also generate the 7-stage roadmap:
                {ROADMAP_PROMPT.format(
                    goal=goal,
                    time_per_day=time_per_day,
                    strengths=", ".join(skills),
                    gaps="Vector DBs, RAG, Agentic tool use",
                    creators=", ".join(creators) if creators else "Karpathy, Kunal, Fireship",
                    overall_percentage=28
                )}

                Combine both in a single valid JSON response matching:
                {{
                  "summary": "...",
                  "readinessScore": 40,
                  "estimatedWeeks": 8,
                  "strengths": [
                    {{"skill": "Python", "reason": "Solid foundations in scripting and data structures"}}
                  ],
                  "criticalGaps": [
                    {{"gap": "Vector Databases", "reason": "Required for production semantic search and RAG", "priority": "high"}},
                    {{"gap": "RAG Chunking & Evaluation", "reason": "Standard architecture for grounding LLMs on enterprise data", "priority": "high"}}
                  ],
                  "stages": [
                    {{
                      "stageNumber": 1,
                      "title": "Foundations",
                      "status": "Completed",
                      "description": "...",
                      "whyThisStep": "...",
                      "percentage": 100,
                      "tasks": [
                        {{"id": "t1", "title": "Task title", "type": "Theory", "estimatedHours": 2, "completed": true}}
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
                print(f"[GeminiService] Live analysis error: {e}. Falling back to deterministic engine.")

        # High-Fidelity Deterministic Fallback based on Student Background
        is_beginner = "beginner" in experience.lower() or len(skills) <= 1
        readiness = 20 if is_beginner else 42
        weeks = 12 if is_beginner else 8

        critical_gaps = [
            {
                "gap": "Vector Databases (ChromaDB / Pinecone)",
                "reason": "Target roles require building retrieval-augmented applications with cosine search",
                "priority": "high"
            },
            {
                "gap": "RAG Evaluation & Chunking",
                "reason": "Companies need LLMs grounded in verified proprietary knowledge without hallucinations",
                "priority": "high"
            },
            {
                "gap": "AI Agents & Function Calling",
                "reason": "Modern AI engineering has moved from single prompts to autonomous tool execution loops",
                "priority": "medium"
            }
        ]

        stages = [
            {
                "stageNumber": 1,
                "title": "Foundations",
                "status": "Completed" if not is_beginner else "In Progress",
                "description": "Core programming, async patterns, version control, and modular architecture.",
                "whyThisStep": "You need clean software engineering hygiene before packaging and deploying AI pipelines.",
                "percentage": 100 if not is_beginner else 40,
                "tasks": [
                    {"id": "t1-1", "title": "Python OOP & Async/Await", "type": "Theory", "estimatedHours": 3, "completed": not is_beginner},
                    {"id": "t1-2", "title": "Git Workflow & Branching", "type": "Hands-on", "estimatedHours": 2, "completed": not is_beginner},
                    {"id": "t1-3", "title": "Build a Modular CLI Tool", "type": "Project", "estimatedHours": 4, "completed": not is_beginner}
                ]
            },
            {
                "stageNumber": 2,
                "title": "Backend & APIs",
                "status": "In Progress" if not is_beginner else "Next",
                "description": "High-throughput REST APIs, database schemas, and microservices.",
                "whyThisStep": "AI models cannot be deployed in production without robust backend endpoints serving inference.",
                "percentage": 60 if not is_beginner else 0,
                "tasks": [
                    {"id": "t2-1", "title": "FastAPI Dependency Injection & Routing", "type": "Theory", "estimatedHours": 2, "completed": not is_beginner},
                    {"id": "t2-2", "title": "PostgreSQL & Supabase CRUD Operations", "type": "Hands-on", "estimatedHours": 3, "completed": not is_beginner},
                    {"id": "t2-3", "title": "Dockerize API & Multi-stage Build", "type": "Hands-on", "estimatedHours": 3, "completed": False}
                ]
            },
            {
                "stageNumber": 3,
                "title": "AI & LLMs",
                "status": "Next" if not is_beginner else "Upcoming",
                "description": "Master transformer mechanics, tokenization, prompt design, and embeddings.",
                "whyThisStep": "Bridges traditional backend programming into modern generative AI systems.",
                "percentage": 0,
                "tasks": [
                    {"id": "t3-1", "title": "LLM Tokens & Context Window Mechanics", "type": "Theory", "estimatedHours": 2, "completed": False},
                    {"id": "t3-2", "title": "Structured Output & JSON Schema with Gemini", "type": "Hands-on", "estimatedHours": 3, "completed": False},
                    {"id": "t3-3", "title": "Generate Text Embeddings with Vector Math", "type": "Hands-on", "estimatedHours": 2, "completed": False}
                ]
            },
            {
                "stageNumber": 4,
                "title": "RAG",
                "status": "Upcoming",
                "description": "Build retrieval-augmented generation pipelines using vector search and rerankers.",
                "whyThisStep": "Companies need LLMs grounded in proprietary knowledge rather than generic hallucinations.",
                "percentage": 0,
                "tasks": [
                    {"id": "t4-1", "title": "Chunking Strategies (Fixed, Recursive, Semantic)", "type": "Theory", "estimatedHours": 2, "completed": False},
                    {"id": "t4-2", "title": "Vector Search with ChromaDB & Cosine Distance", "type": "Hands-on", "estimatedHours": 3, "completed": False},
                    {"id": "t4-3", "title": "Build a Document Q&A Retrieval Engine", "type": "Project", "estimatedHours": 6, "completed": False}
                ]
            },
            {
                "stageNumber": 5,
                "title": "AI Agents",
                "status": "Upcoming",
                "description": "Implement autonomous tool-using agents with planning, execution, and verification.",
                "whyThisStep": "The industry is shifting from static chatbots to autonomous action-oriented agent loops.",
                "percentage": 0,
                "tasks": [
                    {"id": "t5-1", "title": "ReAct Agent Pattern & Function Calling", "type": "Theory", "estimatedHours": 3, "completed": False},
                    {"id": "t5-2", "title": "Multi-Tool Execution & Error Recovery", "type": "Hands-on", "estimatedHours": 4, "completed": False},
                    {"id": "t5-3", "title": "Build an Autonomous Web Research Agent", "type": "Project", "estimatedHours": 8, "completed": False}
                ]
            },
            {
                "stageNumber": 6,
                "title": "Production & DevOps",
                "status": "Upcoming",
                "description": "Rate limiting, evaluation harnesses, CI/CD, telemetry, and cloud deployment.",
                "whyThisStep": "Proves you can operate resilient, low-latency AI services at scale.",
                "percentage": 0,
                "tasks": [
                    {"id": "t6-1", "title": "LLM Observability & Latency Tracing", "type": "Theory", "estimatedHours": 2, "completed": False},
                    {"id": "t6-2", "title": "CI/CD Pipeline with Automated Lint & Test", "type": "Hands-on", "estimatedHours": 3, "completed": False}
                ]
            },
            {
                "stageNumber": 7,
                "title": "Career & Jobs",
                "status": "Upcoming",
                "description": "Portfolio polish, live demos, resume tailoring, and behavioral/technical interviews.",
                "whyThisStep": "Translates technical capability into verified hiring offers.",
                "percentage": 0,
                "tasks": [
                    {"id": "t7-1", "title": "System Design Portfolio Case Study", "type": "Project", "estimatedHours": 4, "completed": False},
                    {"id": "t7-2", "title": "Technical Mock Interview on RAG & Agents", "type": "Hands-on", "estimatedHours": 2, "completed": False}
                ]
            }
        ]

        return {
            "status": "success",
            "source": "deterministic-engine",
            "data": {
                "summary": f"Targeting {goal}: You have foundational strengths in {', '.join(skills[:3]) if skills else 'programming'}. Immediate priority is mastering Vector Databases and RAG to bridge backend services with LLM reasoning.",
                "readinessScore": readiness,
                "estimatedWeeks": weeks,
                "strengths": [{"skill": s, "reason": "Solid baseline programming ability"} for s in skills],
                "criticalGaps": critical_gaps,
                "immediateFocus": "Vector Databases and RAG Implementation",
                "stages": stages
            }
        }

    # =========================================================================
    # 2. Creator Conflict Resolver
    # =========================================================================
    async def resolve_learning_conflicts(
        self,
        student_context: Dict[str, Any],
        creator_debates: str
    ) -> Dict[str, Any]:
        """
        Resolves conflicting educational advice between tech creators.
        """
        client = self._get_client()
        profile = student_context.get("profile", {})
        goal = profile.get("goal", "AI Engineer")
        experience = profile.get("experience", "Intermediate")
        time_per_day = profile.get("time_per_day", 2)
        skills = [s.get("name") if isinstance(s, dict) else s for s in student_context.get("skills", [])]

        if client:
            try:
                prompt = f"""
                {AGENT_SYSTEM_PROMPT}

                {CONFLICT_RESOLUTION_PROMPT.format(
                    goal=goal,
                    experience=experience,
                    skills=", ".join(skills),
                    time_per_day=time_per_day,
                    creator_debates=creator_debates
                )}
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
                print(f"[GeminiService] Conflict resolution live error: {e}")

        # Deterministic Grounded Decision
        return {
            "status": "success",
            "source": "deterministic-engine",
            "data": {
                "commonRecommendations": [
                    "All agree that understanding fundamentals (Python, data structures, Git) is required before deploying production models.",
                    "Both sides emphasize that code you cannot explain or debug yourself is a liability in technical interviews."
                ],
                "differences": [
                    {
                        "creator": "Kunal Kushwaha / Academic Path",
                        "stance": "Master Data Structures, Algorithms & Systems first before high-level AI.",
                        "critique": "Can delay building practical applications by 6+ months for students with immediate job targets."
                    },
                    {
                        "creator": "Fireship / Builder Path",
                        "stance": "Build MVPs immediately with LangChain/Supabase and learn concepts on the fly.",
                        "critique": "Can lead to surface-level understanding without the ability to optimize latency or debug hallucinations."
                    },
                    {
                        "creator": "Andrej Karpathy",
                        "stance": "Code the core algorithms (micrograd/backpropagation) from scratch, then build.",
                        "critique": "Demands strong math focus, but yields deep conceptual mastery."
                    }
                ],
                "personalizedDecision": f"For your goal of {goal} with {time_per_day}h/day: Follow Karpathy's 'build from scratch' for core embeddings & RAG retrieval, but adopt Fireship's fast iteration for deploying your FastAPI microservice demo.",
                "reasoning": f"Because you already have {', '.join(skills[:2]) if skills else 'coding experience'}, spending months on abstract LeetCode would stall your momentum. Implementing a 100-line vector search engine gives you both Karpathy-level depth and a deployable portfolio piece."
            }
        }

    # =========================================================================
    # 3. Next Action Recommender ("What should I learn today?")
    # =========================================================================
    async def recommend_next_action(
        self,
        student_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Synthesizes student's current milestone, missing gap, and time budget
        into a single concrete recommendation for today.
        """
        client = self._get_client()
        profile = student_context.get("profile", {})
        goal = profile.get("goal", "AI Engineer")
        time_per_day = profile.get("time_per_day", 2)
        active_stage = student_context.get("active_stage") or {"title": "RAG"}
        remaining_tasks = student_context.get("next_tasks", [])
        completed_progress = student_context.get("progress", {}).get("completed_tasks", [])
        preferences = student_context.get("learning_preferences", {})

        if client:
            try:
                prompt = f"""
                {AGENT_SYSTEM_PROMPT}

                {NEXT_ACTION_PROMPT.format(
                    goal=goal,
                    time_per_day=time_per_day,
                    active_stage=active_stage.get("title", "RAG"),
                    remaining_tasks=json.dumps(remaining_tasks),
                    completed_progress=json.dumps(completed_progress),
                    gaps="Vector search and RAG retrieval pipelines",
                    preferences=json.dumps(preferences)
                )}
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
                print(f"[GeminiService] Next action error: {e}")

        # Deterministic Next Action
        stage_title = active_stage.get("title", "Backend & APIs")
        if "rag" in stage_title.lower():
            action_desc = "Implement a basic vector search pipeline using ChromaDB and Python."
            why = "You've completed LLM fundamentals and embeddings. Vector search is the exact missing technical component to complete your RAG milestone."
            milestone = "Stage 4: RAG"
        elif "backend" in stage_title.lower():
            action_desc = "Dockerize your FastAPI backend with a multi-stage Dockerfile and test locally."
            why = "You've built the REST routes and DB CRUD. Containerization is the final task in this stage before proceeding to LLMs."
            milestone = "Stage 2: Backend & APIs"
        else:
            action_desc = "Build a minimal text embedding comparison script using cosine similarity."
            why = "Bridges your backend programming directly into vector space semantics."
            milestone = "Stage 3: AI & LLMs"

        return {
            "status": "success",
            "source": "deterministic-engine",
            "data": {
                "headline": f"Today's Focus: {action_desc.split('.')[0]}",
                "action": action_desc,
                "estimatedMinutes": 90,
                "milestone": milestone,
                "why": why,
                "whatToSkip": "Do not watch another 2-hour introductory syntax video — you have already verified the fundamentals.",
                "recommendedResource": {
                    "title": "Build a Complete RAG App with LangChain & ChromaDB",
                    "url": "https://youtube.com/watch?v=sample1"
                }
            }
        }

    # =========================================================================
    # 4. Job Fit Analysis (Deterministic Math + AI Reasoning)
    # =========================================================================
    async def analyze_job_fit_with_reasoning(
        self,
        job_fit_data: Dict[str, Any],
        student_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Explains deterministic skill match with actionable AI career guidance.
        """
        client = self._get_client()
        profile = student_context.get("profile", {})
        goal = profile.get("goal", "AI Engineer")
        projects = [p.get("title") for p in student_context.get("projects", [])]
        skills = [s.get("name") if isinstance(s, dict) else s for s in student_context.get("skills", [])]
        percentage = student_context.get("progress", {}).get("overall_percentage", 28)

        if client:
            try:
                prompt = f"""
                {AGENT_SYSTEM_PROMPT}

                {JOB_FIT_PROMPT.format(
                    job_title=job_fit_data.get("jobTitle", "Junior AI Engineer"),
                    company=job_fit_data.get("company", "Tech Company"),
                    skills_required=", ".join(job_fit_data.get("skillsRequired", [])),
                    description="AI Engineering role focused on RAG, APIs, and microservices.",
                    goal=goal,
                    student_skills=", ".join(skills),
                    projects=", ".join(projects) if projects else "FastAPI auth service",
                    percentage=percentage,
                    matched_skills=json.dumps(job_fit_data.get("matchedSkills", [])),
                    missing_skills=json.dumps(job_fit_data.get("missingSkills", [])),
                    readiness_score=job_fit_data.get("readinessScore", 60)
                )}
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
                print(f"[GeminiService] Job fit live error: {e}")

        # Grounded Deterministic Guidance
        matched = job_fit_data.get("matchedSkills", [])
        missing = job_fit_data.get("missingSkills", [])
        readiness = job_fit_data.get("readinessScore", 60)

        return {
            "status": "success",
            "source": "deterministic-engine",
            "data": {
                "jobTitle": job_fit_data.get("jobTitle"),
                "company": job_fit_data.get("company"),
                "readinessScore": readiness,
                "matchedSkills": matched,
                "missingSkills": missing,
                "assessment": f"You match {len(matched)} of {len(matched) + len(missing)} core technical requirements ({readiness}%). Your strengths in {', '.join(matched[:2]) if matched else 'core languages'} are respected, but the employer explicitly requires {', '.join(missing[:2]) if missing else 'specialized tools'}.",
                "recommendations": [
                    f"Build and deploy a working application featuring {missing[0]}." if missing else "Polish your project documentation.",
                    "Include GitHub repository link and architecture diagram in your application."
                ],
                "recommendedProject": f"Build an end-to-end service combining {matched[0] if matched else 'Python'} with {missing[0] if missing else 'ChromaDB'} to demonstrate readiness."
            }
        }

    # =========================================================================
    # 5. Tool-Aware Conversational Chat
    # =========================================================================
    async def chat_with_tools_and_context(
        self,
        message: str,
        student_context: Dict[str, Any],
        tool_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Handles student questions by grounding them in student context and executed tool data.
        """
        client = self._get_client()
        profile = student_context.get("profile", {})
        name = profile.get("name", "Student")
        goal = profile.get("goal", "AI Engineer")
        active_stage = student_context.get("active_stage") or {}
        skills = [s.get("name") if isinstance(s, dict) else s for s in student_context.get("skills", [])]
        percentage = student_context.get("progress", {}).get("overall_percentage", 28)
        creators = [c.get("name") for c in student_context.get("creators", [])]
        history = student_context.get("recent_memory", [])

        if client:
            try:
                history_formatted = "\n".join([f"{h.get('role', 'user')}: {h.get('content', '')}" for h in history[-4:]])
                prompt = f"""
                {AGENT_SYSTEM_PROMPT}

                {CHAT_PROMPT.format(
                    name=name,
                    goal=goal,
                    active_stage=active_stage.get("title", "Backend & APIs"),
                    skills=", ".join(skills),
                    percentage=percentage,
                    creators=", ".join(creators) if creators else "Karpathy, Kunal",
                    history=history_formatted if history_formatted else "No prior history.",
                    message=message,
                    tool_data=json.dumps(tool_data) if tool_data else "No specific tool execution data."
                )}
                """
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                if response.text:
                    return {"text": response.text, "source": "gemini-live"}
            except Exception as e:
                print(f"[GeminiService] Chat call error: {e}")

        # Grounded conversational engine based on message intent & tool data
        lower = message.lower()
        if "what should i learn" in lower or "today" in lower:
            if tool_data and "action" in tool_data:
                action = tool_data.get("action", "")
                why = tool_data.get("why", "")
                minutes = tool_data.get("estimatedMinutes", 90)
                text = f"Here is your personalized focus for today:\n\n**{action}**\n\n- **Estimated Time:** {minutes} minutes\n- **Why:** {why}\n\nAvoid re-watching generic beginner videos; jump straight into hands-on implementation!"
            else:
                text = f"You are currently at the **RAG** milestone of your {goal} roadmap. Focus on building a basic vector search pipeline with ChromaDB. Estimated time: 90 minutes. It directly satisfies the next practical requirement in your path."
        elif "creator" in lower or "kunal" in lower or "karpathy" in lower or "conflict" in lower or "dsa" in lower:
            text = f"Regarding the debate between creator approaches: Karpathy recommends understanding neural nets and embeddings from scratch, while Kunal emphasizes strong data structures and systems fundamentals. For your {goal} target, combine both: master the core vector search mechanics from scratch, then package it in a clean Dockerized FastAPI service."
        elif "project" in lower:
            text = f"For your {goal} portfolio, I recommend building a **Document Q&A Retrieval Engine with FastAPI and ChromaDB**. This gives employers proof that you can handle document chunking, embeddings, and low-latency vector search."
        else:
            text = f"As your personal agent for {goal}, I am tracking your roadmap progress ({percentage}% complete). Your active stage is **{active_stage.get('title', 'Backend & APIs')}**. Let me know if you want to inspect skill gaps, check job fit, or decide your next coding task."

        return {"text": text, "source": "deterministic-engine"}

gemini_service = GeminiService()
