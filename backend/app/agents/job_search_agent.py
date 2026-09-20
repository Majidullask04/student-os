"""
Student OS — AI Job Search & Career Agent
Inspired by and adapted from the MadsLorentzen/ai-job-search architecture:
- Canonical Job Key deduplication
- 5-Dimensional Fit Scoring (Technical 30%, Experience 25%, Career 30%, Behavioral 15%)
- Location and Language Gates (PASS, FLAG, FAIL)
- Verdict Bands (Strong Fit 75+, Good Fit 60-74, Moderate Fit 45-59, Weak Fit <45)
- Automated Application Tailoring (CV Bullets + Cover Letter + ATS Keywords)
- Interview Preparation Engine (Technical deep dives + STAR behavioral outlines)
"""
import re
import hashlib
import json
import uuid
from typing import Dict, Any, List, Optional
import httpx
from app.services.supabase_service import supabase_service
from app.services.gemini_service import gemini_service
from app.agents.context import build_student_context
from app.agents.memory import memory_manager
from app.db.database import db

# =============================================================================
# 1. Canonical Job Key Deduplication (from ai-job-search/tools/job_key.py)
# =============================================================================
_NON_SLUG = re.compile(r"[^a-z0-9]+")

def generate_job_key(company: str, title: str) -> str:
    """
    Generates a deterministic, canonical deduplication key for a job posting.
    Prevents duplicate entries caused by punctuation or title variations.
    """
    comp_clean = _NON_SLUG.sub("-", (company or "unknown").strip().lower()).strip("-")[:40]
    title_clean = _NON_SLUG.sub("-", (title or "role").strip().lower()).strip("-")[:60]
    full_slug = f"{comp_clean}_{title_clean}"
    hash_suffix = hashlib.sha256(full_slug.encode("utf-8")).hexdigest()[:6]
    return f"{comp_clean}_{title_clean}_{hash_suffix}"

# =============================================================================
# 2. Job Search Agent Class
# =============================================================================
class JobSearchAgent:
    def __init__(self):
        self.supabase = supabase_service
        self.gemini = gemini_service

    # -------------------------------------------------------------------------
    # 5-Dimensional Fit Evaluation Framework (from ai-job-search 04-job-evaluation.md)
    # -------------------------------------------------------------------------
    def evaluate_5d_fit(self, student_context: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a job posting across the 5 dimensions of the fit framework:
        1. Technical Skills Match (30% weight)
        2. Experience & Project Evidence Match (25% weight)
        3. Career Alignment & Roadmap Match (30% weight)
        4. Behavioral / Culture Fit (15% weight)
        5. Location / Work Rights Gate (PASS / FLAG / FAIL)
        """
        skills_raw = student_context.get("skills", [])
        student_skills = set(s.get("name", "").lower() for s in skills_raw)
        projects = student_context.get("projects", [])
        career_goal = student_context.get("career_goal", "AI Engineer").lower()
        roadmap = student_context.get("roadmap") or {}
        overall_progress = student_context.get("progress", {}).get("overall_percentage", 28)

        req_skills = job.get("skills_required", [])
        if not req_skills:
            req_skills = ["Python", "Problem Solving", "APIs"]

        # Dimension 1: Technical Skills Match (0-100)
        matched = [s for s in req_skills if s.lower() in student_skills]
        missing = [s for s in req_skills if s.lower() not in student_skills]
        tech_score = int((len(matched) / max(1, len(req_skills))) * 100)

        # Dimension 2: Experience & Project Evidence Match (0-100)
        # Checks if student has built projects matching the tech stack
        project_techs = set()
        for p in projects:
            for t in p.get("tech_stack", []):
                project_techs.add(t.lower())
        
        project_matched = [s for s in req_skills if s.lower() in project_techs]
        base_exp = 50
        if len(projects) >= 2:
            base_exp = 70
        if len(projects) >= 4:
            base_exp = 85
        evidence_score = min(100, base_exp + (len(project_matched) * 10))

        # Dimension 3: Career Alignment & Roadmap Match (0-100)
        job_title = job.get("title", "").lower()
        career_score = 65
        if any(term in job_title for term in career_goal.split()):
            career_score = 90
        elif "ai" in job_title or "machine learning" in job_title or "backend" in job_title or "software" in job_title:
            career_score = 80

        # Adjust for roadmap progress
        if overall_progress >= 50:
            career_score = min(100, career_score + 10)

        # Dimension 4: Behavioral / Culture Fit (0-100)
        behav_score = 85  # Default positive for high-growth tech / collaborative environments
        if "intern" in job_title or "junior" in job_title:
            behav_score = 90  # High growth potential for students

        # Dimension 5: Location & Work Gate
        loc = job.get("location", "Remote").lower()
        if "remote" in loc or "anywhere" in loc:
            location_gate = "PASS"
            location_note = "100% remote eligibility"
        elif "hybrid" in loc:
            location_gate = "FLAG"
            location_note = f"Hybrid role ({job.get('location')}) — verify commute feasibility"
        else:
            location_gate = "PASS"
            location_note = f"On-site role ({job.get('location')})"

        # Weighted Total (Technical 30%, Experience 25%, Career 30%, Behavioral 15%)
        overall_score = int(
            (tech_score * 0.30) +
            (evidence_score * 0.25) +
            (career_score * 0.30) +
            (behav_score * 0.15)
        )

        # Verdict Bands
        if overall_score >= 75:
            verdict = "Strong Fit"
            verdict_badge = "🔥 High Match"
            recommendation = "High priority application. Tailor your CV and apply immediately."
        elif overall_score >= 60:
            verdict = "Good Fit"
            verdict_badge = "✅ Good Fit"
            recommendation = "Solid contender. Emphasize your verified projects to address minor skill gaps."
        elif overall_score >= 45:
            verdict = "Moderate Fit"
            verdict_badge = "⚡ Moderate"
            recommendation = "Reach role. Complete active roadmap milestones before applying to maximize interview odds."
        else:
            verdict = "Weak Fit"
            verdict_badge = "⚠️ Significant Gap"
            recommendation = "Major prerequisite gaps. Focus on foundational curriculum first."

        return {
            "key": generate_job_key(job.get("company", "Company"), job.get("title", "Role")),
            "overallScore": overall_score,
            "verdict": verdict,
            "verdictBadge": verdict_badge,
            "recommendation": recommendation,
            "scores": {
                "technical": tech_score,
                "experience": evidence_score,
                "careerAlignment": career_score,
                "behavioral": behav_score
            },
            "locationGate": location_gate,
            "locationNote": location_note,
            "matchedSkills": matched,
            "missingSkills": missing,
            "skillsRequired": req_skills,
            "projectsAsEvidence": [p.get("title") for p in projects if any(t.lower() in [s.lower() for s in req_skills] for t in p.get("tech_stack", []))]
        }

    # -------------------------------------------------------------------------
    # Search, Live Ingestion, and Ranking Shortlist
    # -------------------------------------------------------------------------
    async def search_and_rank_jobs(
        self,
        user_id: str,
        query: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Discovers jobs from local catalog + live remote feeds (e.g. RemoteOK API),
        deduplicates, evaluates each against student context, and returns a ranked shortlist.
        """
        context = await build_student_context(user_id)
        career_goal = context.get("career_goal", "AI Engineer")
        search_term = query or career_goal

        # 1. Fetch base catalog from DB
        catalog_jobs = await self.supabase.get_jobs(query=query, limit=limit * 2)

        # 2. Try fetching live jobs from RemoteOK public API
        live_jobs = []
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(
                    "https://remoteok.com/api",
                    headers={"User-Agent": "StudentOS-Agent/1.0"}
                )
                if res.status_code == 200:
                    data = res.json()
                    # Filter relevant remote tech postings
                    term_lower = search_term.lower()
                    for item in data[1:30]:  # Skip legal header item
                        title = item.get("position", "")
                        comp = item.get("company", "")
                        tags = item.get("tags", [])
                        if any(t in title.lower() or t in [x.lower() for x in tags] for t in ["ai", "python", "backend", "developer", "engineer", "data", "full stack"]):
                            live_jobs.append({
                                "id": f"remoteok-{item.get('id', '')}",
                                "title": title,
                                "company": comp,
                                "company_logo": item.get("company_logo") or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
                                "location": "Remote (Worldwide)",
                                "job_type": "Full-time",
                                "experience": "0-3 years",
                                "salary": f"${item.get('salary_min', 85000):,} - ${item.get('salary_max', 130000):,}" if item.get('salary_min') else "$90,000 - $130,000",
                                "skills_required": [t.capitalize() for t in tags[:5]] if tags else ["Python", "APIs", "Git"],
                                "description": item.get("description", "")[:400] + "...",
                                "apply_url": item.get("url") or f"https://remoteok.com/l/{item.get('id')}"
                            })
        except Exception as e:
            # Fallback cleanly to catalog if external API is unreachable or rate limited
            pass

        # 3. Combine and Deduplicate by Canonical Key
        seen_keys = set()
        combined_candidates = []
        for j in catalog_jobs + live_jobs:
            key = generate_job_key(j.get("company", ""), j.get("title", ""))
            if key not in seen_keys:
                seen_keys.add(key)
                combined_candidates.append(j)

        # 4. Evaluate 5D fit for each candidate
        ranked_jobs = []
        for job in combined_candidates:
            fit = self.evaluate_5d_fit(context, job)
            ranked_jobs.append({
                **job,
                "key": fit["key"],
                "matchScore": fit["overallScore"],
                "verdict": fit["verdict"],
                "verdictBadge": fit["verdictBadge"],
                "recommendation": fit["recommendation"],
                "scores": fit["scores"],
                "locationGate": fit["locationGate"],
                "locationNote": fit["locationNote"],
                "skillsMatched": fit["matchedSkills"],
                "skillsToImprove": fit["missingSkills"],
                "matchedSkills": fit["matchedSkills"],
                "missingSkills": fit["missingSkills"],
                "projectsAsEvidence": fit["projectsAsEvidence"]
            })

        # Sort by overall score descending
        ranked_jobs.sort(key=lambda x: x["matchScore"], reverse=True)
        return ranked_jobs[:limit]

    # -------------------------------------------------------------------------
    # Application Kit Generator (/apply from ai-job-search)
    # -------------------------------------------------------------------------
    async def generate_application_kit(self, user_id: str, job_id: str) -> Dict[str, Any]:
        """
        Generates a tailored CV bullet section, forward-looking cover pitch,
        and ATS keyword checklist grounded in student's verified projects and roadmap evidence.
        """
        context = await build_student_context(user_id)
        jobs = await self.supabase.get_jobs()
        job = next((j for j in jobs if j.get("id") == job_id), None)
        if not job:
            job = {
                "id": job_id,
                "title": "Junior AI Engineer",
                "company": "Cognitive Scale AI",
                "skills_required": ["Python", "FastAPI", "RAG", "Vector Databases", "Docker"],
                "description": "Building RAG applications, vector search pipelines, and REST APIs."
            }

        fit = self.evaluate_5d_fit(context, job)
        name = context.get("profile", {}).get("name", "Student")
        career_goal = context.get("career_goal", "AI Engineer")
        projects = context.get("projects", [])
        matched = fit["matchedSkills"]
        missing = fit["missingSkills"]

        # Formulate tailored CV bullet points
        cv_bullets = []
        for p in projects[:3]:
            title = p.get("title", "")
            stack = ", ".join(p.get("tech_stack", []))
            cv_bullets.append(
                f"• Engineered {title} using {stack}; implemented structured API contracts and modular architecture aligned with {job.get('company')}'s stack."
            )
        if not cv_bullets:
            cv_bullets.append(
                f"• Built production microservices in Python and FastAPI with automated dependency injection and database CRUD operations."
            )

        # Formulate Forward-Looking Cover Letter / Pitch (MadsLorentzen forward-looking framework)
        cover_pitch = f"""Dear Hiring Team at {job.get('company')},

I am writing to express my strong interest in the {job.get('title')} role. As an aspiring {career_goal} with hands-on experience developing modular backend architectures and AI pipelines, I have closely tracked your work in this space.

In my recent projects, I developed {projects[0].get('title') if projects else 'production REST APIs'} utilizing {', '.join(matched) if matched else 'Python and FastAPI'}. Rather than only studying theoretical machine learning, I focus on shipping working software—ensuring fast endpoint latency, clean Docker containerization, and reliable schema validation.

I am particularly excited about {job.get('company')} because of your focus on practical engineering. While I am actively deepening my experience in {', '.join(missing[:2]) if missing else 'distributed systems'}, my verified foundation in {', '.join(matched[:3]) if matched else 'core backend programming'} allows me to contribute immediately to your team.

Thank you for your time and consideration. I welcome the opportunity to discuss how my hands-on project experience can support your roadmap.

Best regards,
{name}
"""

        # ATS Keywords breakdown
        ats_analysis = {
            "targetKeywords": job.get("skills_required", []),
            "matchedInStudentProfile": matched,
            "recommendedToHighlight": matched,
            "gapsToBridgeHonestly": missing,
            "atsReadinessScore": fit["scores"]["technical"]
        }

        return {
            "jobTitle": job.get("title"),
            "company": job.get("company"),
            "overallFit": fit["verdict"],
            "fitScore": fit["overallScore"],
            "tailoredCvBullets": cv_bullets,
            "tailoredCoverLetter": cover_pitch.strip(),
            "atsAnalysis": ats_analysis,
            "actionAdvice": fit["recommendation"]
        }

    # -------------------------------------------------------------------------
    # Interview Preparation Engine (/interview from ai-job-search)
    # -------------------------------------------------------------------------
    async def generate_interview_prep(self, user_id: str, job_id: str) -> Dict[str, Any]:
        """
        Generates role-specific technical deep dives, STAR behavioral question outlines,
        and smart questions to ask the interviewer.
        """
        context = await build_student_context(user_id)
        jobs = await self.supabase.get_jobs()
        job = next((j for j in jobs if j.get("id") == job_id), None)
        if not job:
            job = {
                "id": job_id,
                "title": "Junior AI Engineer",
                "company": "Cognitive Scale AI",
                "skills_required": ["Python", "FastAPI", "RAG", "Vector Databases", "Docker"]
            }

        fit = self.evaluate_5d_fit(context, job)
        skills = job.get("skills_required", ["Python", "APIs"])
        projects = context.get("projects", [])
        top_project = projects[0].get("title") if projects else "FastAPI Microservice"

        # Technical Questions targeting the job's core stack
        technical_questions = [
            {
                "question": f"How do you handle vector search latency and chunking strategies when building RAG pipelines?",
                "concept": "Vector Embeddings & Cosine Distance",
                "sampleAnswerStrategy": "Explain chunking tradeoffs (256 vs 512 tokens with 10% overlap), approximate nearest neighbors (HNSW index), and why semantic chunking prevents fragmentation."
            },
            {
                "question": f"How do you structure dependency injection and database session lifecycles in FastAPI?",
                "concept": "FastAPI & Async Database Operations",
                "sampleAnswerStrategy": f"Reference your experience building {top_project}: using `Depends()` with context managers to yield database sessions safely, ensuring zero leaked connection pool slots."
            },
            {
                "question": f"How would you diagnose an AI agent getting stuck in an infinite tool-calling loop?",
                "concept": "AI Agents & ReAct Error Handling",
                "sampleAnswerStrategy": "Mention setting max iteration guards (e.g. 5 steps), enforcing structured output schemas, and fallback retry prompts on empty tool responses."
            }
        ]

        # Behavioral Questions with STAR Framework outlines
        behavioral_questions = [
            {
                "question": "Tell me about a technical project where you faced an unexpected roadblock and how you resolved it.",
                "framework": "STAR (Situation, Task, Action, Result)",
                "recommendedStory": f"Discuss building {top_project}. Situation: async database queries were blocking the event loop. Action: profiled endpoints, replaced blocking synchronous calls with async drivers. Result: Reduced p95 response times by 65%."
            },
            {
                "question": "How do you prioritize learning new frameworks when technologies move as rapidly as AI?",
                "framework": "STAR",
                "recommendedStory": "Explain your Student OS learning philosophy: focus on foundational software engineering (OOP, Docker, REST APIs) first, then implement from scratch before adopting high-level libraries."
            }
        ]

        # Strategic Questions to ask the Interviewer
        smart_questions = [
            f"What does the current LLM evaluation and regression testing pipeline look like at {job.get('company')}?",
            "How does your team balance shipping fast prototypes against production latency and observability requirements?",
            "What is the most challenging technical roadblock the engineering team tackled this quarter?"
        ]

        return {
            "jobTitle": job.get("title"),
            "company": job.get("company"),
            "fitScore": fit["overallScore"],
            "technicalDeepDives": technical_questions,
            "behavioralStarQuestions": behavioral_questions,
            "smartQuestionsToAsk": smart_questions
        }

    async def parse_jd_and_adapt(
        self,
        user_id: str,
        raw_jd: str,
        job_title: Optional[str] = None,
        company: Optional[str] = None,
        auto_inject_roadmap: bool = True
    ) -> Dict[str, Any]:
        """
        Parses raw job description text, extracts stack requirements, evaluates 5D fit,
        and dynamically injects an adaptive Sprint milestone into the student's active roadmap.
        """
        import re
        context = await build_student_context(user_id)
        
        # 1. Extract title and company if not passed
        inferred_title = job_title
        inferred_company = company or "Target Company"

        if not inferred_title:
            title_match = re.search(r'(?:role|position|title|looking for an?)\s*[:\-]?\s*([A-Za-z\s]{3,35}(?:engineer|developer|scientist|architect|intern|specialist))', raw_jd, re.IGNORECASE)
            inferred_title = title_match.group(1).strip() if title_match else "AI / Software Engineer"

        # 2. Extract technical skills from raw JD text
        KNOWN_SKILLS = [
            "Python", "FastAPI", "Django", "Flask", "PyTorch", "TensorFlow", "LangChain", 
            "LlamaIndex", "RAG", "Vector Databases", "ChromaDB", "Pinecone", "Weaviate",
            "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
            "React", "Next.js", "TypeScript", "JavaScript", "GraphQL", "REST APIs", 
            "CI/CD", "Git", "SQL", "Tailwind CSS", "LLMs", "NLP", "Machine Learning"
        ]
        
        extracted_skills = []
        for s in KNOWN_SKILLS:
            pattern = r'\b' + re.escape(s) + r'\b'
            if re.search(pattern, raw_jd, re.IGNORECASE):
                extracted_skills.append(s)

        if not extracted_skills:
            extracted_skills = ["Python", "FastAPI", "RAG", "Docker"]

        # 3. Construct job representation & run 5D fit evaluation
        canonical_key = generate_job_key(inferred_company, inferred_title)
        temp_job = {
            "id": f"pasted-{canonical_key}",
            "title": inferred_title,
            "company": inferred_company,
            "location": "Remote" if "remote" in raw_jd.lower() else "Hybrid / Flexible",
            "skills_required": extracted_skills,
            "description": raw_jd[:300] + "..."
        }

        fit_eval = self.evaluate_5d_fit(context, temp_job)

        # 4. Adaptive Roadmap Injection
        adapted_milestone = None
        if auto_inject_roadmap and fit_eval["missingSkills"]:
            missing = fit_eval["missingSkills"]
            milestone_title = f"Sprint: {inferred_title} @ {inferred_company}"
            milestone_desc = f"Targeted preparation sprint addressing specific requirements: {', '.join(missing)}."
            milestone_tasks = [
                {
                    "id": f"task-jd-{uuid.uuid4().hex[:6]}",
                    "title": f"Master {skill} for {inferred_company} requirements",
                    "type": "Theory",
                    "estimatedHours": 2.0
                }
                for skill in missing
            ]
            milestone_tasks.append({
                "id": f"task-jd-proj-{uuid.uuid4().hex[:6]}",
                "title": f"Build portfolio proof-of-concept integrating {missing[0]}",
                "type": "Project",
                "estimatedHours": 4.0
            })

            adapted_milestone = await supabase_service.inject_adaptive_milestone(
                user_id=user_id,
                title=milestone_title,
                description=milestone_desc,
                tasks=milestone_tasks,
                why_this_step=f"Identified direct skill gaps for {inferred_title} at {inferred_company}. Closing these increases match to 90%+.",
                reason="Job Description Skill Gap"
            )

            # Store in agent memory
            await memory_manager.save_interaction(
                user_id=user_id,
                role="system",
                content=f"Parsed JD for '{inferred_title}' at '{inferred_company}'. Fit Score: {fit_eval['overallScore']}%. Injected adaptive sprint with tasks for {', '.join(missing)}.",
                metadata={"fitScore": fit_eval["overallScore"], "missing": missing, "adapted": True}
            )

        return {
            "canonicalKey": canonical_key,
            "inferredTitle": inferred_title,
            "inferredCompany": inferred_company,
            "extractedSkills": extracted_skills,
            "fitEvaluation": fit_eval,
            "matchScore": fit_eval["overallScore"],
            "matchedSkills": fit_eval["matchedSkills"],
            "missingSkills": fit_eval["missingSkills"],
            "roadmapAdapted": adapted_milestone is not None,
            "adaptedMilestone": adapted_milestone
        }

job_search_agent = JobSearchAgent()
