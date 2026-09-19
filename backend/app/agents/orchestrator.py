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
                # Provide interview prep response
                prep = await job_search_agent.generate_interview_prep(user_id, job_id="job-1")
                reply_text = (
                    f"🎯 **Interview Preparation Strategy for {prep['jobTitle']} @ {prep['company']}**\n\n"
                    f"**Key Technical Challenge:**\n"
                    f"• {prep['technicalDeepDives'][0]['question']}\n"
                    f"  ↳ *Strategy:* {prep['technicalDeepDives'][0]['sampleAnswerStrategy']}\n\n"
                    f"**Recommended STAR Project Story:**\n"
                    f"• {prep['behavioralStarQuestions'][0]['recommendedStory']}\n\n"
                    f"**Strategic Question to Ask Them:**\n"
                    f"• \"{prep['smartQuestionsToAsk'][0]}\""
                )
                agent_type = "JobSearchAgent:InterviewPrep"
            elif any(w in msg for w in ["apply", "cv", "cover letter", "tailor"]):
                # Provide tailored application kit
                kit = await job_search_agent.generate_application_kit(user_id, job_id="job-1")
                reply_text = (
                    f"📄 **Tailored Application Kit for {kit['jobTitle']} @ {kit['company']}**\n\n"
                    f"**ATS Readiness:** {kit['atsAnalysis']['atsReadinessScore']}%\n\n"
                    f"**Tailored CV Bullet:**\n{kit['tailoredCvBullets'][0]}\n\n"
                    f"**Pitch Excerpt:**\n\"{kit['tailoredCoverLetter'][:220]}...\""
                )
                agent_type = "JobSearchAgent:ApplicationKit"
            else:
                # General ranked job discovery
                jobs = await job_search_agent.search_and_rank_jobs(user_id=user_id, limit=3)
                top = jobs[0] if jobs else None
                reply_text = (
                    f"💼 I evaluated your verified skills against active tech postings.\n\n"
                    f"**Top Match:** {top['title']} @ {top['company']} ({top['matchScore']}% {top['verdictBadge']})\n"
                    f"• Location: {top['location']} ({top['locationGate']})\n"
                    f"• Matched Skills: {', '.join(top['matchedSkills'])}\n"
                    f"• Growth Areas: {', '.join(top['missingSkills'])}\n\n"
                    f"Would you like me to tailor your application or generate interview prep for this role?"
                ) if top else "No active jobs found matching your criteria."
                agent_type = "JobSearchAgent:Discovery"

            return {
                "sender": "assistant",
                "text": reply_text,
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
                f"📝 **Diagnostic Skill Check: {quiz['topic']}** ({quiz['difficulty']})\n\n"
                f"**Question 1 of {quiz['totalQuestions']}:**\n"
                f"{first_q['question']}\n\n"
                f"{options_text}\n\n"
                f"*Reply with your choice (A, B, C, or D). If any gaps are detected, I will automatically adapt your roadmap to reinforce them!*"
            )
            return {
                "sender": "assistant",
                "text": reply_text,
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
                f"🛠️ **AI Portfolio Project Blueprint: {blueprint['title']}**\n\n"
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
