"""
Student OS — Core Learning Agent
One Strong Tool-Using Agent + Context + Reasoning Loop
Understand -> Analyze -> Recommend -> Act -> Measure -> Adapt
"""
from typing import Dict, Any, List, Optional
from app.agents.context import build_student_context
from app.agents.memory import memory_manager
from app.agents.tools import (
    TOOL_REGISTRY,
    get_student_profile,
    get_student_skills,
    get_current_roadmap,
    get_progress,
    search_resources,
    get_followed_creators,
    update_roadmap_progress,
    analyze_job_fit
)
from app.services.gemini_service import gemini_service
from app.services.supabase_service import supabase_service

class LearningAgent:
    def __init__(self):
        self.gemini = gemini_service
        self.supabase = supabase_service
        self.memory = memory_manager

    # =========================================================================
    # 1. Full Context-Aware Gap Analysis & Dynamic Roadmap Generation
    # =========================================================================
    async def analyze_student_profile(
        self,
        user_id: str,
        goal: Optional[str] = None,
        skills: Optional[List[str]] = None,
        time_commitment: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Flow:
        1. Load or initialize profile in DB
        2. Build complete student context
        3. Reason with Gemini (structured gap analysis + 7-stage roadmap)
        4. Persist roadmap in database
        5. Record event in agent memory
        6. Return complete structured JSON
        """
        # Update profile if params provided
        if goal or skills or time_commitment:
            profile_update = {}
            if goal:
                profile_update["goal"] = goal
                profile_update["targetRole"] = goal
            if skills:
                profile_update["skills"] = skills
            if time_commitment:
                profile_update["timeCommitmentHours"] = time_commitment
            await self.supabase.upsert_profile({"id": user_id, **profile_update})

        # Build unified single source of truth
        context = await build_student_context(user_id)

        # Call Gemini gap analysis & roadmap generation
        analysis_res = await self.gemini.analyze_gap_and_generate_roadmap(context)
        roadmap_data = analysis_res.get("data", {})
        stages = roadmap_data.get("stages", [])

        # Persist generated roadmap to Supabase / DB
        saved_roadmap = await self.supabase.save_roadmap(
            user_id=user_id,
            goal=context["profile"]["goal"],
            stages=stages,
            overall_percentage=roadmap_data.get("readinessScore", 28)
        )

        # Record to memory
        await self.memory.save_interaction(
            user_id=user_id,
            role="system",
            content=f"Generated personalized 7-stage roadmap for {context['profile']['goal']}. Initial readiness: {roadmap_data.get('readinessScore', 28)}%. Gaps identified: {len(roadmap_data.get('criticalGaps', []))}.",
            metadata={"gaps": roadmap_data.get("criticalGaps", []), "readinessScore": roadmap_data.get("readinessScore")}
        )

        return {
            "status": "success",
            "source": analysis_res.get("source", "gemini-live"),
            "summary": roadmap_data.get("summary", ""),
            "readinessScore": roadmap_data.get("readinessScore", 28),
            "estimatedWeeks": roadmap_data.get("estimatedWeeks", 8),
            "strengths": roadmap_data.get("strengths", []),
            "criticalGaps": roadmap_data.get("criticalGaps", []),
            "immediateFocus": roadmap_data.get("immediateFocus", "Vector Databases & RAG"),
            "roadmap": saved_roadmap
        }

    # =========================================================================
    # 2. Tool-Aware Conversational Chat ("What should I learn today?")
    # =========================================================================
    async def handle_student_chat(self, user_id: str, message: str) -> Dict[str, Any]:
        """
        Flow:
        1. Load unified student context
        2. Identify user intent
        3. Call relevant tools (roadmap, progress, memory, resources, job fit)
        4. Reason with Gemini using context + tool results
        5. Persist interaction in memory
        6. Return grounded response
        """
        context = await build_student_context(user_id)
        lower = message.lower()
        tool_data = None
        suggested_action = None

        # Tool selection logic
        if "what should i learn" in lower or "today" in lower or "next" in lower:
            # 1. Inspect roadmap & active stage
            # 2. Call next action recommendation tool
            rec = await self.gemini.recommend_next_action(context)
            tool_data = rec.get("data", {})
            suggested_action = tool_data.get("action")

        elif "creator" in lower or "kunal" in lower or "karpathy" in lower or "conflict" in lower or "debate" in lower:
            # Call conflict resolution tool
            debates = "Debate on whether to master pure data structures & algorithms first vs building project MVPs vs coding AI algorithms from scratch."
            conf = await self.gemini.resolve_learning_conflicts(context, debates)
            tool_data = conf.get("data", {})
            suggested_action = "Review personalized creator sequence recommendation"

        elif "interview" in lower:
            from app.agents.job_search_agent import job_search_agent
            prep = await job_search_agent.generate_interview_prep(user_id, "job-1")
            tool_data = prep
            suggested_action = "Review technical questions and STAR story outline for upcoming interviews"

        elif "tailor" in lower or "cover letter" in lower or "pitch" in lower:
            from app.agents.job_search_agent import job_search_agent
            kit = await job_search_agent.generate_application_kit(user_id, "job-1")
            tool_data = kit
            suggested_action = "Review tailored CV bullets and cover pitch"

        elif "job" in lower or "apply" in lower or "fit" in lower or "hiring" in lower:
            from app.agents.job_search_agent import job_search_agent
            jobs = await job_search_agent.search_and_rank_jobs(user_id, limit=3)
            top_job = jobs[0] if jobs else {}
            tool_data = {
                "topMatches": [
                    {"title": j.get("title"), "company": j.get("company"), "matchScore": j.get("matchScore"), "verdict": j.get("verdict")}
                    for j in jobs
                ],
                "recommendedJob": top_job
            }
            suggested_action = f"Apply to {top_job.get('title')} at {top_job.get('company')} ({top_job.get('matchScore')}% match)"

        elif "resource" in lower or "tutorial" in lower:
            resources = await search_resources(user_id, topic="RAG")
            tool_data = {"candidateResources": resources[:3]}
            suggested_action = "Check recommended RAG tutorial"

        # Generate response using context + tool data
        response = await self.gemini.chat_with_tools_and_context(
            message=message,
            student_context=context,
            tool_data=tool_data
        )

        # Persist conversation turns into agent memory
        await self.memory.save_interaction(user_id=user_id, role="user", content=message)
        await self.memory.save_interaction(user_id=user_id, role="assistant", content=response["text"], metadata={"tool_data": tool_data})

        return {
            "sender": "assistant",
            "text": response["text"],
            "source": response.get("source", "gemini"),
            "suggestedNextAction": suggested_action or "Continue to active roadmap milestone",
            "toolData": tool_data
        }

    # =========================================================================
    # 3. Creator Conflict Resolution
    # =========================================================================
    async def resolve_creator_conflicts(
        self,
        user_id: str,
        creator_viewpoints: Optional[str] = None
    ) -> Dict[str, Any]:
        context = await build_student_context(user_id)
        default_debates = """
        Andrej Karpathy: Code neural networks, backpropagation, and transformer architectures from scratch to gain fundamental intuition.
        Kunal Kushwaha: Focus on data structures, algorithms, and open source DevOps/Kubernetes contributions first.
        Fireship: Build fast with modern serverless tooling, Supabase, and vector databases — learn by shipping products.
        Hitesh Choudhary: Focus on building robust backend APIs, database schemas, and microservices architecture.
        """
        debates = creator_viewpoints or default_debates
        result = await self.gemini.resolve_learning_conflicts(context, debates)

        await self.memory.save_interaction(
            user_id=user_id,
            role="system",
            content=f"Resolved creator conflict for {context['profile']['goal']}.",
            metadata={"decision": result.get("data", {}).get("personalizedDecision")}
        )

        return result

    # =========================================================================
    # 4. Filtered & Ranked Resource Recommendations
    # =========================================================================
    async def get_recommended_resources(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Ranks learning resources by matching:
        - Active roadmap stage
        - Identified critical gaps
        - Followed creators
        """
        context = await build_student_context(user_id)
        active_stage = context.get("active_stage") or {}
        stage_title = active_stage.get("title", "Backend & APIs").lower()
        followed_creators = set(c.get("id", "").lower() for c in context.get("creators", []))

        all_resources = await self.supabase.get_resources(limit=50)

        # Scoring function
        def score_resource(res: Dict[str, Any]) -> float:
            score = 0.0
            tags = [t.lower() for t in res.get("tags", [])]
            creator = res.get("creator", "").lower()

            # Followed creator boost
            if creator in followed_creators or any(cid in creator for cid in followed_creators):
                score += 3.0

            # Active milestone match
            if "rag" in stage_title and any("rag" in t or "vector" in t for t in tags):
                score += 5.0
            elif "backend" in stage_title and any("backend" in t or "fastapi" in t or "api" in t for t in tags):
                score += 5.0
            elif "llm" in stage_title and any("llm" in t or "deep learning" in t for t in tags):
                score += 5.0

            score += float(res.get("rating", 4.5))
            return score

        sorted_resources = sorted(all_resources, key=score_resource, reverse=True)

        # Attach whyRecommended
        results = []
        for r in sorted_resources[:6]:
            r_copy = dict(r)
            if not r_copy.get("why_recommended"):
                r_copy["why_recommended"] = f"Matches your active milestone ({active_stage.get('title', 'Learning')}) and bridges your immediate skill gap."
            results.append(r_copy)

        return results

learning_agent = LearningAgent()
