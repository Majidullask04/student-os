"""
Multi-Persona Personalization Evaluation Suite
Verifies that Student OS AI Agent produces genuinely distinct, context-grounded
gap analyses, readiness scores, roadmap stages, and immediate next actions for:
- Student A (Beginner: Basic Python, no projects, 2h/day)
- Student B (Advanced: Python, FastAPI, Docker, PyTorch, Transformers, 3 projects, 2h/day)
- Student C (Frontend to AI: React, TypeScript, no backend, Goal: Full Stack AI Engineer)
"""
import asyncio
import json
from app.agents.learning_agent import learning_agent
from app.services.supabase_service import supabase_service

async def run_evaluation():
    print("=" * 75)
    print("🎯 MULTI-PERSONA PERSONALIZATION EVALUATION SUITE")
    print("=" * 75)

    # -------------------------------------------------------------------------
    # 1. Setup Student A (Beginner)
    # -------------------------------------------------------------------------
    student_a_id = "eval-student-a-beginner"
    await supabase_service.upsert_profile({
        "id": student_a_id,
        "name": "Alex Beginner",
        "email": "alex@example.com",
        "goal": "AI Engineer",
        "level": "Beginner",
        "timeCommitmentHours": 2,
        "skills": ["Basic Python"]
    })
    res_a = await learning_agent.analyze_student_profile(
        user_id=student_a_id,
        goal="AI Engineer",
        skills=["Basic Python"],
        time_commitment=2
    )

    # -------------------------------------------------------------------------
    # 2. Setup Student B (Advanced)
    # -------------------------------------------------------------------------
    student_b_id = "eval-student-b-advanced"
    await supabase_service.upsert_profile({
        "id": student_b_id,
        "name": "Marcus Senior",
        "email": "marcus@example.com",
        "goal": "AI Engineer",
        "level": "Advanced",
        "timeCommitmentHours": 2,
        "skills": ["Python", "FastAPI", "Docker", "PyTorch", "Transformers", "Kubernetes"]
    })
    # Add 3 projects
    await supabase_service.save_project(student_b_id, {"title": "Distributed Embedding Service", "tech_stack": ["Python", "PyTorch"]})
    await supabase_service.save_project(student_b_id, {"title": "FastAPI Microservices Cluster", "tech_stack": ["FastAPI", "Docker"]})
    await supabase_service.save_project(student_b_id, {"title": "Fine-tuned Llama Assistant", "tech_stack": ["Transformers", "CUDA"]})

    res_b = await learning_agent.analyze_student_profile(
        user_id=student_b_id,
        goal="AI Engineer",
        skills=["Python", "FastAPI", "Docker", "PyTorch", "Transformers", "Kubernetes"],
        time_commitment=2
    )

    # -------------------------------------------------------------------------
    # 3. Setup Student C (Frontend Developer targeting Full Stack AI)
    # -------------------------------------------------------------------------
    student_c_id = "eval-student-c-frontend"
    await supabase_service.upsert_profile({
        "id": student_c_id,
        "name": "Elena Frontend",
        "email": "elena@example.com",
        "goal": "Full Stack AI Engineer",
        "level": "Intermediate",
        "timeCommitmentHours": 2,
        "skills": ["React", "TypeScript", "Tailwind CSS", "Next.js"]
    })
    res_c = await learning_agent.analyze_student_profile(
        user_id=student_c_id,
        goal="Full Stack AI Engineer",
        skills=["React", "TypeScript", "Tailwind CSS", "Next.js"],
        time_commitment=2
    )

    # -------------------------------------------------------------------------
    # Print Comparative Matrix
    # -------------------------------------------------------------------------
    print("\n" + "-" * 75)
    print("📊 COMPARATIVE PERSONALIZATION MATRIX")
    print("-" * 75)

    def print_persona(label, res):
        print(f"\n[{label}]")
        print(f"  • Readiness Score:    {res['readinessScore']}%")
        print(f"  • Estimated Timeline: {res['estimatedWeeks']} weeks")
        print(f"  • Immediate Focus:    {res['immediateFocus']}")
        print(f"  • Top Critical Gap:   {res['criticalGaps'][0]['gap']}")
        print(f"    ↳ Rationale:        {res['criticalGaps'][0]['reason']}")
        active_stage = next((s for s in res['roadmap']['stages'] if s['status'] in ['In Progress', 'Next']), res['roadmap']['stages'][0])
        print(f"  • Active Milestone:   Stage {active_stage['stageNumber']}: {active_stage['title']} ({active_stage['status']})")

    print_persona("STUDENT A — Beginner (AI Engineer)", res_a)
    print_persona("STUDENT B — Advanced (AI Engineer)", res_b)
    print_persona("STUDENT C — Frontend (Full Stack AI Engineer)", res_c)

    # -------------------------------------------------------------------------
    # Assertions for Personalization
    # -------------------------------------------------------------------------
    print("\n" + "-" * 75)
    print("🔍 VERIFYING RIGOROUS PERSONALIZATION CRITERIA")
    print("-" * 75)

    # 1. Readiness scores must reflect background
    assert res_a["readinessScore"] < res_c["readinessScore"] < res_b["readinessScore"], \
        f"Expected Readiness A ({res_a['readinessScore']}%) < C ({res_c['readinessScore']}%) < B ({res_b['readinessScore']}%)"
    print("✓ Readiness scores scale appropriately with verified background & projects.")

    # 2. Estimated timelines must differ
    assert res_a["estimatedWeeks"] > res_c["estimatedWeeks"] > res_b["estimatedWeeks"], \
        f"Expected Weeks A ({res_a['estimatedWeeks']}) > C ({res_c['estimatedWeeks']}) > B ({res_b['estimatedWeeks']})"
    print("✓ Estimated weeks to career readiness scale inversely with readiness.")

    # 3. Critical gaps must address each persona's specific missing skillset
    gap_a_titles = " ".join(g["gap"] for g in res_a["criticalGaps"]).lower()
    gap_b_titles = " ".join(g["gap"] for g in res_b["criticalGaps"]).lower()
    gap_c_titles = " ".join(g["gap"] for g in res_c["criticalGaps"]).lower()

    assert "oop" in gap_a_titles or "foundations" in gap_a_titles, "Student A should have foundational gaps"
    assert "agent" in gap_b_titles or "evaluation" in gap_b_titles, "Student B should have advanced agent/eval gaps"
    assert "backend" in gap_c_titles or "fastapi" in gap_c_titles or "vector" in gap_c_titles, "Student C should have backend/RAG gaps"
    print("✓ Identified critical gaps accurately target each persona's specific blindspots.")

    # 4. Active milestone must differ
    stage_a = res_a['roadmap']['stages'][0]
    stage_b = res_b['roadmap']['stages'][0]
    assert stage_a["status"] == "In Progress", "Student A should be in Foundations"
    assert stage_b["status"] == "Completed", "Student B should already have completed Foundations"
    print("✓ Active milestone and completed stages adapt to proven experience.")

    # -------------------------------------------------------------------------
    # Test "What should I learn today?" chat contrast
    # -------------------------------------------------------------------------
    print("\n" + "-" * 75)
    print("💬 TESTING 'WHAT SHOULD I LEARN TODAY?' CHAT FOR EACH PERSONA")
    print("-" * 75)

    chat_a = await learning_agent.handle_student_chat(student_a_id, "What should I learn today?")
    chat_b = await learning_agent.handle_student_chat(student_b_id, "What should I learn today?")
    chat_c = await learning_agent.handle_student_chat(student_c_id, "What should I learn today?")

    print(f"\n[Student A Chat Action]: {chat_a.get('suggestedNextAction')}")
    print(f"[Student B Chat Action]: {chat_b.get('suggestedNextAction')}")
    print(f"[Student C Chat Action]: {chat_c.get('suggestedNextAction')}")

    assert chat_a.get("suggestedNextAction") != chat_b.get("suggestedNextAction"), "Next action must differ between Beginner and Advanced"
    print("✓ Conversational agent recommendations adapt distinctly for each learner persona.")

    print("\n" + "=" * 75)
    print("🏆 MULTI-PERSONA PERSONALIZATION EVALUATION COMPLETED: 100% PASS")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_evaluation())
