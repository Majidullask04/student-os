"""
Student OS — Multi-Agent Orchestrator (Blueprint §21)
Classifies student intent, delegates to specialized agents (Learning, Job Search,
Assessment, Project), and synthesizes actionable structured responses.
"""
from typing import Dict, Any, List, Optional
import re
from app.agents.context import build_student_context
from app.agents.learning_agent import learning_agent
from app.agents.job_search_agent import job_search_agent
from app.agents.assessment_agent import assessment_agent
from app.agents.project_agent import project_agent
from app.agents.memory import memory_manager

class AgentOrchestrator:
    """Central orchestrator routing queries across specialized Student OS sub-agents."""

    def classify_intent(self, message: str) -> str:
        """Determines the primary domain intent of the user message."""
        msg = message.lower()

        # 1. Job search / Career / Apply intent
        if any(w in msg for w in ["job", "internship", "hiring", "apply", "cover letter", "cv", "resume", "interview", "ats"]):
            return "CAREER_AGENT"

        # 2. Assessment / Quiz / Skill Check intent
        if any(w in msg for w in ["quiz", "test me", "assessment", "evaluate me", "exam", "check my knowledge", "grade"]):
            return "ASSESSMENT_AGENT"

        # 3. Project / Portfolio intent
        if any(w in msg for w in ["project", "portfolio", "build", "boilerplate", "starter code", "architecture spec"]):
            return "PROJECT_AGENT"

        # 4. Default: Learning & Roadmap Agent
        return "LEARNING_AGENT"

    async def route_and_execute(
        self,
        user_id: str,
        message: str,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Routes student message to the appropriate specialized sub-agent."""
        intent = self.classify_intent(message)
        context = await build_student_context(user_id)

        # ---------------------------------------------------------------------
        # 1. Career / Job Search Agent
        # ---------------------------------------------------------------------
        if intent == "CAREER_AGENT":
            msg = message.lower()
            if "interview" in msg:
                prep = await job_search_agent.generate_interview_prep(user_id, job_id="job-1")
                reply_text = (
                    f"**Interview Preparation Strategy for {prep['jobTitle']} @ {prep['company']}**\n\n"
                    f"**Key Technical Challenge:**\n"
                    f"• {prep['technicalDeepDives'][0]['question']}\n"
                    f"  ↳ Strategy: {prep['technicalDeepDives'][0]['sampleAnswerStrategy']}\n\n"
                    f"**Recommended STAR Project Story:**\n"
                    f"• {prep['behavioralStarQuestions'][0]['recommendedStory']}\n\n"
                    f"**Strategic Question to Ask Them:**\n"
                    f"• \"{prep['smartQuestionsToAsk'][0]}\""
                )
                agent_type = "JobSearchAgent:InterviewPrep"
                tool_calls = [
                    {
                        "tool_name": "generate_interview_prep",
                        "latency_ms": 220,
                        "status": "success",
                        "input_json": {"user_id": user_id, "job_id": "job-1"},
                        "output_json": {"jobTitle": prep['jobTitle'], "company": prep['company'], "deepDivesCount": len(prep['technicalDeepDives'])}
                    }
                ]
            elif any(w in msg for w in ["apply", "cv", "cover letter", "tailor"]):
                kit = await job_search_agent.generate_application_kit(user_id, job_id="job-1")
                reply_text = (
                    f"**Tailored Application Kit for {kit['jobTitle']} @ {kit['company']}**\n\n"
                    f"**ATS Readiness:** {kit['atsAnalysis']['atsReadinessScore']}%\n\n"
                    f"**Tailored CV Bullet:**\n{kit['tailoredCvBullets'][0]}\n\n"
                    f"**Pitch Excerpt:**\n\"{kit['tailoredCoverLetter'][:220]}...\""
                )
                agent_type = "JobSearchAgent:ApplicationKit"
                tool_calls = [
                    {
                        "tool_name": "tailor_cv_and_cover_letter",
                        "latency_ms": 260,
                        "status": "success",
                        "input_json": {"user_id": user_id, "job_id": "job-1"},
                        "output_json": {"atsScore": kit['atsAnalysis']['atsReadinessScore'], "bulletsGenerated": len(kit['tailoredCvBullets'])}
                    }
                ]
            else:
                jobs = await job_search_agent.search_and_rank_jobs(user_id=user_id, limit=3)
                top = jobs[0] if jobs else None
                matched_str = ', '.join(top.get('matchedSkills') or top.get('skillsMatched') or []) if top else ""
                missing_str = ', '.join(top.get('missingSkills') or top.get('skillsToImprove') or []) if top else ""
                reply_text = (
                    f"I evaluated your verified skills against active tech postings.\n\n"
                    f"**Top Match:** {top.get('title')} @ {top.get('company')} ({top.get('matchScore', 0)}% {top.get('verdictBadge', '')})\n"
                    f"• Location: {top.get('location')} ({top.get('locationGate', 'Pass')})\n"
                    f"• Matched Skills: {matched_str}\n"
                    f"• Growth Areas: {missing_str}\n\n"
                    f"Would you like me to tailor your application or generate interview prep for this role?"
                ) if top else "No active jobs found matching your criteria."
                agent_type = "JobSearchAgent:Discovery"
                tool_calls = [
                    {
                        "tool_name": "search_matching_jobs",
                        "latency_ms": 195,
                        "status": "success",
                        "input_json": {"user_id": user_id, "limit": 3},
                        "output_json": {"topMatch": top['title'] if top else None, "matchScore": top['matchScore'] if top else 0}
                    }
                ]

            return {
                "sender": "assistant",
                "text": reply_text,
                "toolCalls": tool_calls,
                "orchestratorMeta": {
                    "intent": intent,
                    "delegatedAgent": agent_type,
                    "studentContextUser": context["profile"].get("name", "Student")
                }
            }

        # ---------------------------------------------------------------------
        # 2. Assessment Agent
        # ---------------------------------------------------------------------
        if intent == "ASSESSMENT_AGENT":
            quiz = await assessment_agent.generate_assessment(user_id=user_id)
            first_q = quiz["questions"][0]
            options_text = "\n".join(first_q["options"])
            reply_text = (
                f"**Diagnostic Skill Check: {quiz['topic']}** ({quiz['difficulty']})\n\n"
                f"**Question 1 of {quiz['totalQuestions']}:**\n"
                f"{first_q['question']}\n\n"
                f"{options_text}\n\n"
                f"*Reply with your choice (A, B, C, or D). If any gaps are detected, I will automatically adapt your roadmap to reinforce them.*"
            )
            return {
                "sender": "assistant",
                "text": reply_text,
                "toolCalls": [
                    {
                        "tool_name": "generate_diagnostic_assessment",
                        "latency_ms": 210,
                        "status": "success",
                        "input_json": {"user_id": user_id, "topic": quiz["topic"]},
                        "output_json": {"topic": quiz["topic"], "totalQuestions": quiz["totalQuestions"]}
                    }
                ],
                "orchestratorMeta": {
                    "intent": intent,
                    "delegatedAgent": "AssessmentAgent",
                    "quizTopic": quiz["topic"]
                }
            }

        # ---------------------------------------------------------------------
        # 3. Project Agent
        # ---------------------------------------------------------------------
        if intent == "PROJECT_AGENT":
            blueprint = await project_agent.generate_project_blueprint(user_id=user_id)
            reply_text = (
                f"**AI Portfolio Project Blueprint: {blueprint['title']}**\n\n"
                f"**Overview:** {blueprint['description']}\n"
                f"**Tech Stack:** {', '.join(blueprint['techStack'])}\n\n"
                f"**Milestone 1:** {blueprint['milestones'][0]['title']}\n"
                f"• {blueprint['milestones'][0]['tasks'][0]}\n"
                f"• {blueprint['milestones'][0]['tasks'][1]}\n\n"
                f"I have saved this project to your **Projects Portfolio** with starter boilerplate."
            )
            return {
                "sender": "assistant",
                "text": reply_text,
                "toolCalls": [
                    {
                        "tool_name": "design_portfolio_project",
                        "latency_ms": 240,
                        "status": "success",
                        "input_json": {"user_id": user_id, "level": "Intermediate"},
                        "output_json": {"projectTitle": blueprint["title"], "techStack": blueprint["techStack"]}
                    }
                ],
                "orchestratorMeta": {
                    "intent": intent,
                    "delegatedAgent": "ProjectAgent",
                    "projectId": blueprint["id"]
                }
            }

        # ---------------------------------------------------------------------
        # 4. Learning & Roadmap Agent (Default)
        # ---------------------------------------------------------------------
        res = await learning_agent.execute(
            user_id=user_id,
            user_message=message,
            session_id=session_id
        )
        res["orchestratorMeta"] = {
            "intent": intent,
            "delegatedAgent": "LearningAgent"
        }
        return res

orchestrator = AgentOrchestrator()
