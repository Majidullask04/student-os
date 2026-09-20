"""
Student OS — Assessment & Adaptive Learning Agent (Blueprint §8 & §9)
Generates topic diagnostic quizzes, evaluates answers, and triggers
automatic adaptive roadmap updates upon detecting skill gaps.
"""
from typing import Dict, Any, List, Optional
import uuid
from app.services.supabase_service import supabase_service
from app.agents.memory import memory_manager
from app.agents.context import build_student_context

# Knowledge bank of diagnostic assessment questions across common domains
ASSESSMENT_CATALOG = {
    "RAG & Vector Search": [
        {
            "id": "rag-q1",
            "question": "What is the primary tradeoff when using HNSW (Hierarchical Navigable Small World) indexing in vector databases?",
            "options": [
                "A) High search speed and recall at the cost of higher memory (RAM) consumption",
                "B) Zero RAM usage with very high query latency",
                "C) Guarantees exact linear brute-force nearest neighbor distance",
                "D) Only supports scalar integers, not floating-point embeddings"
            ],
            "correctIndex": 0,
            "concept": "HNSW Vector Indexing",
            "explanation": "HNSW builds multi-layer graphs in RAM, enabling logarithmic O(log N) search at the expense of higher memory usage during index build."
        },
        {
            "id": "rag-q2",
            "question": "Why is document chunking with a sliding window (e.g. 10-15% overlap) critical in RAG architectures?",
            "options": [
                "A) It prevents the embedding model from generating floating point numbers",
                "B) It preserves contextual continuity across chunk boundaries so semantic meaning is not split",
                "C) It encrypts the documents against unauthorized API extraction",
                "D) It eliminates the need for any embedding model"
            ],
            "correctIndex": 1,
            "concept": "Chunking & Context Preservation",
            "explanation": "Overlap prevents key semantic statements or relationships from being truncated at arbitrary token boundaries."
        },
        {
            "id": "rag-q3",
            "question": "When an LLM hallucinates facts despite RAG retrieval, what is the best immediate architectural fix?",
            "options": [
                "A) Increase model temperature to 1.0",
                "B) Re-rank retrieved chunks with a Cross-Encoder and enforce strict system prompt citations",
                "C) Delete the vector database entirely",
                "D) Double the embedding vector dimensions manually"
            ],
            "correctIndex": 1,
            "concept": "Re-ranking & Grounding Guardrails",
            "explanation": "Cross-encoder re-ranking filters out irrelevant noise, and citation prompt constraints prevent external hallucinations."
        }
    ],
    "FastAPI & Backend Concurrency": [
        {
            "id": "fastapi-q1",
            "question": "In FastAPI, what happens if you run a blocking synchronous call (like time.sleep or sync DB query) inside an 'async def' route?",
            "options": [
                "A) FastAPI automatically spawns a separate OS process",
                "B) It blocks the entire asyncio event loop, preventing other concurrent requests from being handled",
                "C) FastAPI raises a compile-time TypeError",
                "D) The request is executed asynchronously on GPU cores"
            ],
            "correctIndex": 1,
            "concept": "Event Loop Blocking",
            "explanation": "In an async def endpoint, blocking operations stop the single main thread event loop unless run in a threadpool or using async drivers."
        },
        {
            "id": "fastapi-q2",
            "question": "Which HTTP status code is most appropriate when a client sends a request missing a required JWT Bearer token?",
            "options": [
                "A) 200 OK",
                "B) 404 Not Found",
                "C) 401 Unauthorized",
                "D) 500 Internal Server Error"
            ],
            "correctIndex": 2,
            "concept": "HTTP Authentication Contracts",
            "explanation": "401 Unauthorized is designated for missing or invalid authentication credentials."
        }
    ],
    "AI Agents & Tool Calling": [
        {
            "id": "agents-q1",
            "question": "In an autonomous agent loop, what is the purpose of the 'ReAct' (Reasoning + Acting) pattern?",
            "options": [
                "A) Compiling Python code into WebAssembly",
                "B) Interleaving thought steps with tool execution to observe environment feedback before final answer",
                "C) Replacing the LLM with a simple deterministic if-else tree",
                "D) Only using React.js on the frontend"
            ],
            "correctIndex": 1,
            "concept": "ReAct Agent Pattern",
            "explanation": "ReAct allows the model to reason about what tool to call, execute the tool, inspect the result, and iteratively determine the next step."
        }
    ]
}

class AssessmentAgent:
    """Agent that drives diagnostic assessments and adaptive roadmap remediation."""

    async def generate_assessment(
        self, 
        user_id: str, 
        topic: Optional[str] = None,
        difficulty: str = "Intermediate"
    ) -> Dict[str, Any]:
        """Generates a diagnostic quiz targeting the student's active roadmap stage."""
        context = await build_student_context(user_id)
        current_roadmap = context.get("currentRoadmap") or {}
        
        # Pick topic from active milestone if not explicitly passed
        target_topic = topic
        if not target_topic:
            stages = current_roadmap.get("stages", [])
            for stg in stages:
                if stg.get("status") in ["In Progress", "Next"]:
                    target_topic = stg.get("title", "RAG & Vector Search")
                    break
        if not target_topic:
            target_topic = "RAG & Vector Search"

        # Match questions or construct dynamic questions
        matched_questions = None
        for k, qs in ASSESSMENT_CATALOG.items():
            if k.lower() in target_topic.lower() or target_topic.lower() in k.lower():
                matched_questions = qs
                break
        
        if not matched_questions:
            matched_questions = ASSESSMENT_CATALOG["RAG & Vector Search"]

        # Return sanitized quiz (hide correctIndex and explanations from client)
        client_questions = [
            {
                "id": q["id"],
                "question": q["question"],
                "options": q["options"],
                "concept": q["concept"]
            }
            for q in matched_questions
        ]

        return {
            "assessmentId": f"eval-{uuid.uuid4().hex[:8]}",
            "topic": target_topic,
            "difficulty": difficulty,
            "totalQuestions": len(client_questions),
            "questions": client_questions
        }

    async def evaluate_submission_and_adapt(
        self,
        user_id: str,
        topic: str,
        answers: Dict[str, int] # question_id -> chosen_index
    ) -> Dict[str, Any]:
        """
        Grades student answers, detects specific skill gaps,
        and dynamically adapts the student roadmap if remediation is needed.
        """
        # Find question bank
        questions = ASSESSMENT_CATALOG.get(topic)
        if not questions:
            for k, qs in ASSESSMENT_CATALOG.items():
                if k.lower() in topic.lower() or topic.lower() in k.lower():
                    questions = qs
                    break
        if not questions:
            questions = ASSESSMENT_CATALOG["RAG & Vector Search"]

        total = len(questions)
        correct_count = 0
        detailed_results = []
        identified_gaps = []
        mastered_concepts = []

        for q in questions:
            qid = q["id"]
            user_choice = answers.get(qid)
            is_correct = (user_choice == q["correctIndex"])
            if is_correct:
                correct_count += 1
                mastered_concepts.append(q["concept"])
            else:
                identified_gaps.append(q["concept"])

            detailed_results.append({
                "questionId": qid,
                "concept": q["concept"],
                "userChoice": user_choice,
                "correctIndex": q["correctIndex"],
                "isCorrect": is_correct,
                "explanation": q["explanation"]
            })

        score_pct = int((correct_count / max(1, total)) * 100)
        passed = score_pct >= 70

        roadmap_adapted = False
        remediation_stage = None

        if not passed and identified_gaps:
            # 🎯 ADAPTIVE AGENT LOOP: Inject targeted remediation module into active roadmap!
            remediation_title = f"Adaptive Deep-Dive: {topic} Remediation"
            remediation_desc = f"Targeted review generated by AI Agent to master detected gaps: {', '.join(identified_gaps)}."
            remediation_tasks = [
                {
                    "id": f"task-rem-{uuid.uuid4().hex[:6]}",
                    "title": f"Study Core Concepts: {gap}",
                    "type": "Theory",
                    "estimatedHours": 1.5
                }
                for gap in identified_gaps
            ]
            remediation_tasks.append({
                "id": f"task-rem-proj-{uuid.uuid4().hex[:6]}",
                "title": f"Build Mini Proof-of-Concept for {identified_gaps[0]}",
                "type": "Project",
                "estimatedHours": 3.0
            })

            remediation_stage = await supabase_service.inject_adaptive_milestone(
                user_id=user_id,
                title=remediation_title,
                description=remediation_desc,
                tasks=remediation_tasks,
                why_this_step=f"Assessment identified knowledge gaps in {', '.join(identified_gaps)}. Mastering these directly improves job readiness.",
                reason="Diagnostic Assessment Skill Gap"
            )
            roadmap_adapted = True

            # Save interaction in agent memory
            await memory_manager.save_interaction(
                user_id=user_id,
                role="system",
                content=f"Assessment in {topic} scored {score_pct}%. Injected adaptive remediation stage '{remediation_title}'.",
                metadata={"score": score_pct, "gaps": identified_gaps, "adapted": True}
            )
        else:
            # Student demonstrated mastery! Update verified skills
            await supabase_service.upsert_skills(user_id, [
                {"name": concept, "proficiency": "Verified", "category": "AI/ML"}
                for concept in mastered_concepts
            ])
            await memory_manager.save_interaction(
                user_id=user_id,
                role="system",
                content=f"Assessment passed for {topic} with {score_pct}%. Verified skills: {', '.join(mastered_concepts)}.",
                metadata={"score": score_pct, "mastered": mastered_concepts}
            )

        return {
            "topic": topic,
            "score": score_pct,
            "passed": passed,
            "verdict": "Mastery Demonstrated! 🎉" if passed else "Skill Gap Detected — Roadmap Adapted ⚡",
            "correctCount": correct_count,
            "totalQuestions": total,
            "masteredConcepts": mastered_concepts,
            "identifiedGaps": identified_gaps,
            "roadmapAdapted": roadmap_adapted,
            "remediationStage": remediation_stage,
            "detailedResults": detailed_results
        }

assessment_agent = AssessmentAgent()
