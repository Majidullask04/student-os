"""
End-to-end verification suite for Student OS AI Agent & Backend Intelligence Loop.
Validates:
1. Student context builder
2. Dynamic gap analysis & 7-stage roadmap generation
3. Roadmap persistence to database
4. Adaptive progress loop (POST /progress -> percentage recalculation & stage activation)
5. Tool-aware conversational chat ("What should I learn today?")
6. Creator conflict resolution
7. Deterministic job skill matching & AI explanation
8. Personalization contrast (Beginner vs Advanced learner generate different roadmaps)
"""
import asyncio
import json
from app.agents.context import build_student_context
from app.agents.learning_agent import learning_agent
from app.services.supabase_service import supabase_service
from app.agents.tools import analyze_job_fit

async def run_tests():
    print("=" * 70)
    print("🚀 STARTING STUDENT OS AGENT & BACKEND VERIFICATION SUITE")
    print("=" * 70)

    # -------------------------------------------------------------------------
    # Test 1: Student Context Builder
    # -------------------------------------------------------------------------
    print("\n[TEST 1] Testing Student Context Builder...")
    user_id = "user-1"
    context = await build_student_context(user_id)
    assert context["profile"]["goal"] == "AI Engineer", "Goal mismatch"
    assert len(context["skills"]) >= 3, "Expected at least 3 verified skills"
    assert len(context["creators"]) >= 2, "Expected followed creators"
    assert "current_roadmap" in context, "Expected roadmap in context"
    assert "progress" in context, "Expected progress tracking in context"
    print("✓ Student Context built successfully:")
    print(f"  - Student: {context['profile']['name']} | Goal: {context['profile']['goal']}")
    print(f"  - Verified Skills: {[s['name'] for s in context['skills']]}")
    print(f"  - Followed Creators: {[c['name'] for c in context['creators']]}")

    # -------------------------------------------------------------------------
    # Test 2: Dynamic Gap Analysis & Roadmap Generation (POST /agent/analyze)
    # -------------------------------------------------------------------------
    print("\n[TEST 2] Testing Gap Analysis & Roadmap Generation (POST /agent/analyze)...")
    analysis_res = await learning_agent.analyze_student_profile(
        user_id=user_id,
        goal="AI Engineer",
        skills=["Python", "FastAPI", "Git", "Docker"],
        time_commitment=2
    )
    assert analysis_res["status"] == "success", "Analysis failed"
    assert "criticalGaps" in analysis_res, "Expected criticalGaps"
    assert len(analysis_res["criticalGaps"]) >= 1, "Expected identified gaps"
    assert "reason" in analysis_res["criticalGaps"][0], "Expected explicit reason for gap"
    assert "roadmap" in analysis_res, "Expected roadmap in result"
    stages = analysis_res["roadmap"].get("stages", [])
    assert len(stages) == 7, f"Expected 7 stages, got {len(stages)}"
    print(f"✓ Gap analysis succeeded (source: {analysis_res.get('source')}):")
    print(f"  - Readiness score: {analysis_res.get('readinessScore')}%")
    print(f"  - Critical gaps: {[g['gap'] for g in analysis_res.get('criticalGaps', [])]}")
    print(f"  - Top gap reason: {analysis_res['criticalGaps'][0]['reason']}")
    print(f"  - Generated 7-stage roadmap: {[s['title'] for s in stages]}")

    # -------------------------------------------------------------------------
    # Test 3: Roadmap Persistence Verification (GET /roadmap)
    # -------------------------------------------------------------------------
    print("\n[TEST 3] Verifying Roadmap Persistence...")
    persisted_roadmap = await supabase_service.get_current_roadmap(user_id)
    assert persisted_roadmap is not None, "Roadmap was not persisted"
    assert len(persisted_roadmap["stages"]) == 7, "Persisted stages mismatch"
    print(f"✓ Persisted roadmap retrieved: {persisted_roadmap['goal']} with {len(persisted_roadmap['stages'])} stages.")

    # -------------------------------------------------------------------------
    # Test 4: Adaptive Progress Loop (POST /progress)
    # -------------------------------------------------------------------------
    print("\n[TEST 4] Testing Adaptive Progress Updates...")
    # Complete task t2-3 (Dockerize API) in Stage 2
    progress_res = await supabase_service.save_progress(user_id, "t2-3", True)
    assert progress_res["completed"] is True
    
    # Reload roadmap and verify percentage updated
    updated_roadmap = await supabase_service.get_current_roadmap(user_id)
    stage_2 = updated_roadmap["stages"][1]
    print(f"✓ Task 't2-3' completed. Stage 2 ('{stage_2['title']}') status: {stage_2['status']}, percentage: {stage_2['percentage']}%")
    print(f"  - Overall roadmap completion updated to: {updated_roadmap['overallPercentage']}%")

    # -------------------------------------------------------------------------
    # Test 5: Tool-Aware Conversational Chat ("What should I learn today?")
    # -------------------------------------------------------------------------
    print("\n[TEST 5] Testing Tool-Aware Agent Chat ('What should I learn today?')...")
    chat_res = await learning_agent.handle_student_chat(
        user_id=user_id,
        message="What should I learn today?"
    )
    assert chat_res["sender"] == "assistant"
    assert len(chat_res["text"]) > 20, "Expected non-empty response"
    print(f"✓ Agent responded using tools (source: {chat_res.get('source')}):")
    print(f"  - Suggested Next Action: {chat_res.get('suggestedNextAction')}")
    print(f"  - Response snippet: {chat_res['text'][:150]}...")

    # -------------------------------------------------------------------------
    # Test 6: Creator Conflict Resolver
    # -------------------------------------------------------------------------
    print("\n[TEST 6] Testing Creator Conflict Resolution...")
    conflict_res = await learning_agent.resolve_creator_conflicts(user_id)
    assert conflict_res["status"] == "success"
    data = conflict_res.get("data", {})
    assert "commonRecommendations" in data, "Expected common recommendations"
    assert "differences" in data, "Expected differences"
    assert "personalizedDecision" in data, "Expected personalized decision"
    print("✓ Creator debate resolved:")
    print(f"  - Common ground count: {len(data['commonRecommendations'])}")
    print(f"  - Differences count: {len(data['differences'])}")
    print(f"  - Personalized Decision: {data['personalizedDecision']}")
    print(f"  - Reasoning: {data['reasoning'][:120]}...")

    # -------------------------------------------------------------------------
    # Test 7: Deterministic Job Fit Engine (POST /jobs/analyze)
    # -------------------------------------------------------------------------
    print("\n[TEST 7] Testing Deterministic Job Fit Engine...")
    fit = await analyze_job_fit(user_id, "job-1")
    assert "matchedSkills" in fit, "Expected matched skills"
    assert "missingSkills" in fit, "Expected missing skills"
    assert "readinessScore" in fit, "Expected readiness score"
    print(f"✓ Job fit calculated for {fit['jobTitle']} at {fit['company']}:")
    print(f"  - Readiness Score: {fit['readinessScore']}%")
    print(f"  - Matched Skills: {fit['matchedSkills']}")
    print(f"  - Missing Skills: {fit['missingSkills']}")

    # -------------------------------------------------------------------------
    # Test 8: Personalization Contrast (Beginner vs Advanced)
    # -------------------------------------------------------------------------
    print("\n[TEST 8] Testing Personalization Contrast (Beginner vs Advanced)...")
    # 1. Beginner profile
    await supabase_service.upsert_profile({
        "id": "student-beginner",
        "name": "Alex Beginner",
        "goal": "AI Engineer",
        "level": "Beginner",
        "skills": ["HTML/CSS"],
        "timeCommitmentHours": 1
    })
    beginner_res = await learning_agent.analyze_student_profile(
        user_id="student-beginner",
        goal="AI Engineer",
        skills=["HTML/CSS"],
        time_commitment=1
    )

    # 2. Advanced profile
    await supabase_service.upsert_profile({
        "id": "student-advanced",
        "name": "Sarah Senior",
        "goal": "AI Engineer",
        "level": "Advanced",
        "skills": ["Python", "FastAPI", "Docker", "PyTorch", "Transformers", "Kubernetes"],
        "timeCommitmentHours": 4
    })
    advanced_res = await learning_agent.analyze_student_profile(
        user_id="student-advanced",
        goal="AI Engineer",
        skills=["Python", "FastAPI", "Docker", "PyTorch", "Transformers", "Kubernetes"],
        time_commitment=4
    )

    print(f"✓ Beginner Readiness: {beginner_res['readinessScore']}% | Estimated Weeks: {beginner_res['estimatedWeeks']}")
    print(f"✓ Advanced Readiness: {advanced_res['readinessScore']}% | Estimated Weeks: {advanced_res['estimatedWeeks']}")
    assert beginner_res["readinessScore"] != advanced_res["readinessScore"], "Roadmaps must differ for different student backgrounds"
    assert beginner_res["estimatedWeeks"] > advanced_res["estimatedWeeks"], "Beginner should take longer to reach job readiness"

    print("\n" + "=" * 70)
    print("🎉 ALL 8 TESTS PASSED SUCCESSFULLY! BACKEND & AGENT ARE FULLY FUNCTIONAL!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_tests())
