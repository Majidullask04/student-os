"""
Verification suite for Student OS AI Job Search & Career Agent
Adapted from MadsLorentzen/ai-job-search.
"""
import asyncio
from app.agents.job_search_agent import job_search_agent, generate_job_key
from app.agents.context import build_student_context

async def run_tests():
    print("=" * 75)
    print("💼 TESTING AI JOB SEARCH & CAREER AGENT (MadsLorentzen Architecture)")
    print("=" * 75)

    user_id = "user-1"
    context = await build_student_context(user_id)

    # -------------------------------------------------------------------------
    # Test 1: Canonical Job Key Deduplication
    # -------------------------------------------------------------------------
    print("\n[TEST 1] Testing Canonical Job Key Deduplication...")
    key1 = generate_job_key("Cognitive Scale AI", "Junior AI Engineer")
    key2 = generate_job_key("Cognitive Scale AI, Inc.", "Junior AI Engineer (Remote)")
    key1_again = generate_job_key("Cognitive Scale AI", "Junior AI Engineer")
    
    assert key1 == key1_again, "Identical company & role must yield identical deterministic key"
    assert "_" in key1, "Key must contain separator"
    assert len(key1.split("_")[-1]) == 6, "Key must end with 6-char hash suffix"
    print(f"✓ Canonical Key 1: {key1}")
    print(f"✓ Canonical Key 2: {key2}")

    # -------------------------------------------------------------------------
    # Test 2: 5-Dimensional Fit Scoring Framework
    # -------------------------------------------------------------------------
    print("\n[TEST 2] Testing 5-Dimensional Fit Evaluation...")
    sample_job = {
        "id": "test-job-ai",
        "title": "Junior AI Engineer",
        "company": "Cognitive Scale AI",
        "location": "Remote",
        "skills_required": ["Python", "FastAPI", "RAG", "Vector Databases", "Docker"]
    }
    fit = job_search_agent.evaluate_5d_fit(context, sample_job)

    assert "scores" in fit, "Expected 5D scores"
    assert "technical" in fit["scores"], "Expected technical score"
    assert "experience" in fit["scores"], "Expected experience score"
    assert "careerAlignment" in fit["scores"], "Expected career score"
    assert "behavioral" in fit["scores"], "Expected behavioral score"
    assert fit["locationGate"] == "PASS", "Remote role should PASS location gate"
    assert 0 <= fit["overallScore"] <= 100, "Score must be bounded between 0 and 100"
    assert fit["verdict"] in ["Strong Fit", "Good Fit", "Moderate Fit", "Weak Fit"], "Invalid verdict band"

    print(f"✓ 5D Fit Score: {fit['overallScore']}% ({fit['verdictBadge']})")
    print(f"  • Technical (30%):        {fit['scores']['technical']}%")
    print(f"  • Experience/Projects (25%): {fit['scores']['experience']}%")
    print(f"  • Career Alignment (30%): {fit['scores']['careerAlignment']}%")
    print(f"  • Behavioral Fit (15%):   {fit['scores']['behavioral']}%")
    print(f"  • Location Gate:          {fit['locationGate']} ({fit['locationNote']})")
    print(f"  • Matched Skills:         {fit['matchedSkills']}")
    print(f"  • Missing Gaps:           {fit['missingSkills']}")
    print(f"  • Project Evidence:       {fit['projectsAsEvidence']}")

    # -------------------------------------------------------------------------
    # Test 3: Search, Deduplication & Ranked Shortlist
    # -------------------------------------------------------------------------
    print("\n[TEST 3] Testing Search & Ranked Shortlist...")
    ranked = await job_search_agent.search_and_rank_jobs(user_id=user_id, limit=5)
    assert len(ranked) >= 2, "Expected at least 2 ranked candidates"
    # Ensure ranked in descending order of matchScore
    for i in range(len(ranked) - 1):
        assert ranked[i]["matchScore"] >= ranked[i+1]["matchScore"], "Jobs must be sorted by matchScore descending"
    print(f"✓ Retrieved and ranked {len(ranked)} jobs:")
    for j in ranked:
        print(f"  • [{j['matchScore']}% | {j['verdictBadge']}] {j['title']} @ {j['company']} ({j['location']})")

    # -------------------------------------------------------------------------
    # Test 4: Application Kit Generation (/apply)
    # -------------------------------------------------------------------------
    print("\n[TEST 4] Testing Application Kit Generation (/apply)...")
    app_kit = await job_search_agent.generate_application_kit(user_id=user_id, job_id="job-1")
    assert "tailoredCvBullets" in app_kit, "Expected tailored CV bullets"
    assert "tailoredCoverLetter" in app_kit, "Expected tailored cover letter"
    assert "atsAnalysis" in app_kit, "Expected ATS analysis"
    assert len(app_kit["tailoredCvBullets"]) >= 1, "Expected at least 1 CV bullet"
    assert "Cognitive Scale AI" in app_kit["tailoredCoverLetter"], "Cover letter must name target company"

    print(f"✓ Application Kit for {app_kit['jobTitle']} @ {app_kit['company']}:")
    print(f"  • Tailored CV Bullet: {app_kit['tailoredCvBullets'][0]}")
    print(f"  • ATS Readiness:      {app_kit['atsAnalysis']['atsReadinessScore']}%")
    print(f"  • Cover Pitch Excerpt:\n    \"{app_kit['tailoredCoverLetter'][:160]}...\"")

    # -------------------------------------------------------------------------
    # Test 5: Interview Preparation Engine (/interview)
    # -------------------------------------------------------------------------
    print("\n[TEST 5] Testing Interview Prep Engine (/interview)...")
    prep = await job_search_agent.generate_interview_prep(user_id=user_id, job_id="job-1")
    assert "technicalDeepDives" in prep, "Expected technical deep dives"
    assert "behavioralStarQuestions" in prep, "Expected STAR behavioral questions"
    assert "smartQuestionsToAsk" in prep, "Expected smart questions to ask"
    assert len(prep["technicalDeepDives"]) >= 2, "Expected at least 2 technical questions"
    assert len(prep["behavioralStarQuestions"]) >= 1, "Expected at least 1 STAR question"

    print(f"✓ Interview Prep for {prep['jobTitle']} @ {prep['company']}:")
    print(f"  • Tech Question: {prep['technicalDeepDives'][0]['question']}")
    print(f"    ↳ Strategy:    {prep['technicalDeepDives'][0]['sampleAnswerStrategy'][:100]}...")
    print(f"  • STAR Story:    {prep['behavioralStarQuestions'][0]['recommendedStory'][:100]}...")
    print(f"  • Question to Ask: \"{prep['smartQuestionsToAsk'][0]}\"")

    print("\n" + "=" * 75)
    print("🏆 ALL JOB SEARCH AGENT TESTS PASSED (100% PASS)")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_tests())
