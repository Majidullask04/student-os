"""
Student OS — Modular Prompt Architecture for Gemini Agent
"""

AGENT_SYSTEM_PROMPT = """
You are the Student OS Personal Agent — an expert AI Academic & Career Architect.
Your role is to guide a student step-by-step from their current knowledge to career readiness.

Core principles:
1. Understand the student's background, verified skills, and time constraints.
2. Identify true conceptual & practical gaps — never assume a tutorial watched equals a skill mastered.
3. Recommend concrete, actionable steps with estimated hours.
4. Prefer practical action and project evidence over generic motivation.
5. Resolve conflicting advice between creators using student context.
6. Explain the 'WHY' behind every stage, task, and resource.
7. Adapt recommendations dynamically based on actual progress.
8. Never claim certainty when evidence is weak.
"""

GAP_ANALYSIS_PROMPT = """
Perform a deep, evidence-based Gap Analysis for this student:

Target Career Goal: {goal}
Experience Level: {experience}
Available Study Time: {time_per_day} hours/day
Verified Skills: {skills}
Hands-on Projects Completed: {projects}
Recent Learning Evidence: {recent_memory}

Analyze the student's capabilities against industry expectations for this target role.
You must return a strictly valid JSON object matching this schema:
{{
  "summary": "2-3 sentence executive assessment of where they stand and the highest-leverage skill to acquire next",
  "readinessScore": 42, // integer 0-100 based on realistic job requirements
  "estimatedWeeks": 8, // realistic estimated weeks to become job-ready at their current pace
  "strengths": [
    {{"skill": "Skill Name", "reason": "Why this represents a strong foundation"}}
  ],
  "criticalGaps": [
    {{
      "gap": "Skill or Architecture (e.g. Vector Databases / RAG)",
      "reason": "Explicit justification of why target roles require this",
      "priority": "high" // "high" | "medium" | "low"
    }}
  ],
  "immediateFocus": "Specific concept or project to tackle first"
}}
"""

ROADMAP_PROMPT = """
Generate a personalized, adaptive 7-Stage Roadmap for this student based on their Gap Analysis:

Student Goal: {goal}
Time Commitment: {time_per_day} hours/day
Existing Strengths: {strengths}
Identified Gaps: {gaps}
Followed Creators & Preferences: {creators}

Important rules:
- Do NOT make the roadmap a generic list of technologies.
- Structure every stage around: Why this -> Learn -> Practice -> Build -> Verify -> Next.
- Assign realistic task hours (total hours matching their daily budget).
- The 7 stages should progressively bridge fundamentals to production:
  1. Foundations
  2. Backend & APIs
  3. AI & LLMs
  4. RAG (Retrieval-Augmented Generation)
  5. AI Agents & Tool Calling
  6. Production & DevOps
  7. Career, Portfolio & Job Readiness
- Mark stages completed if their verified skills and projects already prove mastery.
- Mark the current active stage as "In Progress" or "Next".

Return a strictly valid JSON object matching this schema:
{{
  "roadmapTitle": "Personalized {goal} Roadmap",
  "overallPercentage": {overall_percentage},
  "stages": [
    {{
      "stageNumber": 1,
      "title": "Stage Title",
      "status": "Completed" | "In Progress" | "Next" | "Upcoming",
      "description": "Clear description of the milestone",
      "whyThisStep": "Explicit explanation of why this step is critical before the next",
      "tasks": [
        {{
          "id": "s1-t1",
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

CONFLICT_RESOLUTION_PROMPT = """
Resolve this debate among tech creators regarding learning paths:

Student Profile:
- Goal: {goal}
- Current Level: {experience}
- Existing Skills: {skills}
- Available Time: {time_per_day} hours/day

Debate Context:
{creator_debates}

Your task:
1. Identify the common ground and shared principles between the viewpoints.
2. Highlight key divergences (e.g., DSA first vs Projects first, Theory first vs Build MVPs).
3. Evaluate both sides against THIS specific student's background and target role.
4. Synthesize a unified, personalized sequence decision with clear reasoning.

Return a strictly valid JSON object matching this schema:
{{
  "commonRecommendations": [
    "List of points where creators fundamentally agree"
  ],
  "differences": [
    {{
      "creator": "Creator Name",
      "stance": "Their viewpoint",
      "critique": "Tradeoff or limitation"
    }}
  ],
  "personalizedDecision": "The exact recommended sequence for this student",
  "reasoning": "Why this specific decision fits the student's verified skills and career timeline"
}}
"""

NEXT_ACTION_PROMPT = """
The student asks: "What should I learn today?"

Student Context:
- Target Role: {goal}
- Time Budget Today: {time_per_day} hours
- Active Roadmap Milestone: {active_stage}
- Remaining Tasks in Milestone: {remaining_tasks}
- Recent Completed Progress: {completed_progress}
- Key Skill Gaps: {gaps}
- Student Learning Preferences: {preferences}

Formulate a concise, high-impact recommendation for today:
1. Name the exact practical action or building exercise.
2. State the estimated time in minutes (fitting their budget).
3. Explain the specific 'WHY' (why this is the next logical step, referencing their roadmap gap).
4. Point out what they should NOT do (e.g. avoid starting another intro video if they already know fundamentals).

Return a strictly valid JSON object matching this schema:
{{
  "headline": "Short punchy action summary",
  "action": "Concrete hands-on task description",
  "estimatedMinutes": 90,
  "milestone": "Active milestone name",
  "why": "Clear technical and career rationale",
  "whatToSkip": "What redundant tutorials to avoid",
  "recommendedResource": {{
    "title": "Resource title",
    "url": "Resource link or description"
  }}
}}
"""

JOB_FIT_PROMPT = """
Analyze the student's fit for this specific job posting:

Job Title: {job_title}
Company: {company}
Required Skills: {skills_required}
Job Description: {description}

Student Profile:
- Target Role: {goal}
- Verified Skills: {student_skills}
- Completed Projects: {projects}
- Current Roadmap Completion: {percentage}%

Deterministic Skill Intersection:
- Matched Skills: {matched_skills}
- Missing Skills: {missing_skills}
- Readiness Score: {readiness_score}

Provide an insightful, realistic AI Career Coach evaluation:
1. Explain why their current background matches or falls short.
2. Provide 2-3 high-leverage recommendations to close the missing skill gaps.
3. Suggest a portfolio project or demonstration that would impress this company.

Return a strictly valid JSON object matching this schema:
{{
  "jobTitle": "{job_title}",
  "company": "{company}",
  "readinessScore": {readiness_score},
  "matchedSkills": {matched_skills},
  "missingSkills": {missing_skills},
  "assessment": "2-3 sentence realistic evaluation of candidacy",
  "recommendations": [
    "Specific actionable recommendation to close gap"
  ],
  "recommendedProject": "Specific project to build for this job application"
}}
"""

CHAT_PROMPT = """
You are the Student OS AI Study Agent conversing with {name}.
Student Context:
- Goal: {goal}
- Current Milestone: {active_stage}
- Verified Skills: {skills}
- Progress: {percentage}% complete
- Followed Creators: {creators}

Conversation History:
{history}

Student Query: {message}

Tool Output / Grounding Data:
{tool_data}

Instructions:
Respond directly and warmly to the student. If they ask what to learn, what project to build, or how to resolve a concept, use the grounding data to give specific, practical answers with estimated times. Explain the 'WHY' connecting their action to their {goal} roadmap.
"""
