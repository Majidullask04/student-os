"""
Verification suite for Student OS Adaptive Loop, Orchestrator, Paste-JD, and Project Agent.
"""
import asyncio
from app.agents.assessment_agent import assessment_agent
from app.agents.job_search_agent import job_search_agent
from app.agents.project_agent import project_agent
from app.agents.orchestrator import orchestrator
from app.agents.rag_service import rag_service
from app.services.supabase_service import supabase_service

async def run_tests():
    print("=" * 75)
    print("🚀 TESTING STUDENT OS ADAPTIVE LEARNING & MULTI-AGENT LOOP")
    print("=" * 75)
    user_id = "user-1"

    # -------------------------------------------------------------------------
    # Test 1: Assessment Generation
    # -------------------------------------------------------------------------
    print("\n[TEST 1] Testing Diagnostic Assessment Generation...")
    quiz = await assessment_agent.generate_assessment(user_id, topic="RAG & Vector Search")
    assert "questions" in quiz, "Quiz must contain questions"
    assert len(quiz["questions"]) >= 2, "Quiz must contain at least 2 questions"
    print(f"✓ Generated assessment for topic '{quiz['topic']}' with {len(quiz['questions'])} questions.")

    # -------------------------------------------------------------------------
    # Test 2: Quiz Evaluation - Mastery Flow
    # -------------------------------------------------------------------------
    print("\n[TEST 2] Testing Assessment Evaluation - Mastery Path...")
    all_correct_answers = {
        "rag-q1": 0,
        "rag-q2": 1,
        "rag-q3": 1
    }
    eval_mastery = await assessment_agent.evaluate_submission_and_adapt(
        user_id=user_id,
        topic="RAG & Vector Search",
        answers=all_correct_answers
    )
    assert eval_mastery["passed"] is True, "Expected quiz to pass with correct answers"
    assert eval_mastery["score"] == 100, f"Expected 100%, got {eval_mastery['score']}%"
    print(f"✓ Mastery Result: {eval_mastery['score']}% ({eval_mastery['verdict']})")

    # -------------------------------------------------------------------------
    # Test 3: Quiz Evaluation - Adaptive Gap Detection & Roadmap Injection
    # -------------------------------------------------------------------------
    print("\n[TEST 3] Testing Assessment Evaluation - Adaptive Gap & Roadmap Injection...")
    failed_answers = {
        "rag-q1": 3, # incorrect
        "rag-q2": 3, # incorrect
        "rag-q3": 1  # correct
    }
    eval_gap = await assessment_agent.evaluate_submission_and_adapt(
        user_id=user_id,
        topic="RAG & Vector Search",
        answers=failed_answers
    )
    assert eval_gap["passed"] is False, "Expected quiz to fail with incorrect answers"
    assert eval_gap["roadmapAdapted"] is True, "Must trigger adaptive roadmap injection"
    assert eval_gap["remediationStage"] is not None, "Remediation stage must be returned"
    print(f"✓ Skill Gap Detected: {eval_gap['identifiedGaps']}")
    print(f"✓ Dynamically Injected Adaptive Stage: '{eval_gap['remediationStage']['title']}' with {len(eval_gap['remediationStage']['tasks'])} tasks!")

    # -------------------------------------------------------------------------
    # Test 4: Paste-JD -> Skill Gap -> Adaptive Sprint Injection
    # -------------------------------------------------------------------------
    print("\n[TEST 4] Testing Paste-JD Parsing & Adaptive Sprint Injection...")
    sample_jd = """
    We are looking for an AI Infrastructure Engineer at Scale AI.
    Requirements:
    - 2+ years experience with Python and FastAPI
    - Experience deploying Kubernetes and Docker microservices
    - Hands-on knowledge of Vector Databases (ChromaDB, Pinecone) and RAG pipelines
    - Deep understanding of PyTorch and LLM fine-tuning
    """
    jd_res = await job_search_agent.parse_jd_and_adapt(
        user_id=user_id,
        raw_jd=sample_jd,
        job_title="AI Infrastructure Engineer",
        company="Scale AI",
        auto_inject_roadmap=True
    )
    assert "fitEvaluation" in jd_res, "Expected 5D fit evaluation"
    assert "Kubernetes" in jd_res["extractedSkills"] or "Python" in jd_res["extractedSkills"], "Expected extracted skills"
    assert jd_res["roadmapAdapted"] is True, "Expected roadmap adaptation for missing skills"
    print(f"✓ Parsed JD: {jd_res['inferredTitle']} @ {jd_res['inferredCompany']}")
    print(f"  • Extracted Skills: {jd_res['extractedSkills']}")
    print(f"  • 5D Match Score:   {jd_res['matchScore']}%")
    print(f"  • Injected Sprint:  '{jd_res['adaptedMilestone']['title']}'")

    # -------------------------------------------------------------------------
    # Test 5: Project Agent - Portfolio Blueprint Generation
    # -------------------------------------------------------------------------
    print("\n[TEST 5] Testing Project Agent Blueprint Generation...")
    blueprint = await project_agent.generate_project_blueprint(user_id=user_id, topic_or_gap="Kubernetes & Vector Search")
    assert "milestones" in blueprint, "Expected milestones in project blueprint"
    assert len(blueprint["milestones"]) >= 3, "Expected at least 3 milestones"
    assert "starterBoilerplate" in blueprint, "Expected starter code boilerplate"
    print(f"✓ Project Blueprint: {blueprint['title']}")
    print(f"  • Stack: {blueprint['techStack']}")
    print(f"  • Total Milestones: {len(blueprint['milestones'])}")

    # -------------------------------------------------------------------------
    # Test 6: Semantic Knowledge Search (RAG Tool)
    # -------------------------------------------------------------------------
    print("\n[TEST 6] Testing Semantic Knowledge Search (RAG)...")
    rag_res = rag_service.search_knowledge("HNSW vector indexing tradeoff memory", top_k=2)
    assert len(rag_res) >= 1, "Expected at least 1 knowledge match"
    print(f"✓ Retrieved Top Knowledge Result: '{rag_res[0]['title']}' by {rag_res[0]['creator']} (Score: {rag_res[0]['relevanceScore']})")

    # -------------------------------------------------------------------------
    # Test 7: Multi-Agent Orchestrator Routing
    # -------------------------------------------------------------------------
    print("\n[TEST 7] Testing Multi-Agent Orchestrator Intent Routing...")
    assert orchestrator.classify_intent("How do I apply for the AI Engineer job?") == "CAREER_AGENT"
    assert orchestrator.classify_intent("Quiz me on RAG vector databases") == "ASSESSMENT_AGENT"
    assert orchestrator.classify_intent("Generate a project blueprint with starter code") == "PROJECT_AGENT"
    assert orchestrator.classify_intent("What is the next topic on my roadmap?") == "LEARNING_AGENT"
    
    orch_res = await orchestrator.route_and_execute(user_id, "Quiz me on RAG")
    assert orch_res["orchestratorMeta"]["intent"] == "ASSESSMENT_AGENT"
    print(f"✓ Orchestrator successfully classified and routed to: {orch_res['orchestratorMeta']['delegatedAgent']}")

    print("\n" + "=" * 75)
    print("🏆 ALL ADAPTIVE LEARNING & MULTI-AGENT LOOP TESTS PASSED (100% PASS)")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_tests())
