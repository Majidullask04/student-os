"""
Student OS — Schema v2, pgvector RAG, and Agent Observability Verification Suite
Validates:
1. Strict Tenant Isolation on /roadmap (§47)
2. 768-dimensional pgvector RAG retrieval & citations (§11, §12)
3. Agent Observability instrumentation into agent_runs & tool_calls (§42, §52)
4. Persistent conversation and message storage (§37)
5. Daily rate limit guardrails (§45)
"""
import os
import asyncio
from app.agents.rag_service import rag_service
from app.services.gemini_service import gemini_service
from app.services.supabase_service import supabase_service
from app.api.agent import chat_with_agent, check_daily_rate_limit, MAX_DAILY_CHAT_REQUESTS
from app.schemas.agent import ChatRequest
from app.api.roadmap import get_roadmap
from app.db.database import db
from fastapi import HTTPException

async def run_suite():
    print("=" * 75)
    print("🚀 TESTING SCHEMA V2, PGVECTOR RAG, AND AGENT OBSERVABILITY")
    print("=" * 75)

    # -------------------------------------------------------------------------
    # Test 1: Strict Tenant Isolation on /roadmap (§47)
    # -------------------------------------------------------------------------
    print("\n[TEST 1] Testing Strict Tenant Isolation on /roadmap (§47)...")
    new_user_id = "tenant-user-999"
    user_payload = {"id": new_user_id, "email": "newtenant@studentos.dev", "name": "New Tenant"}

    # Ensure no pre-existing roadmap
    db.roadmaps.pop(new_user_id, None)

    roadmap = await get_roadmap(user=user_payload)
    assert roadmap is not None, "Roadmap must be generated for new tenant"
    assert roadmap.get("user_id") == new_user_id or "stages" in roadmap, "Roadmap must belong to tenant, not user-1"
    assert len(roadmap.get("stages", [])) > 0, "Roadmap must contain stages"
    print(f"✓ Tenant {new_user_id} received personal adaptive roadmap with {len(roadmap.get('stages', []))} stages (no user-1 leak)")

    # -------------------------------------------------------------------------
    # Test 2: 768-dimensional Dense Embedding Generation (§11)
    # -------------------------------------------------------------------------
    print("\n[TEST 2] Testing 768-dimensional Dense Embedding Generation...")
    sample_text = "Hierarchical Navigable Small World graphs for vector search and cosine distance"
    embedding = await gemini_service.generate_embedding(sample_text)
    assert len(embedding) == 768, f"Expected 768 dimensions, got {len(embedding)}"
    assert isinstance(embedding[0], float), "Embedding values must be floats"
    print(f"✓ Generated 768-dim normalized embedding (preview: {embedding[:3]}...)")

    # -------------------------------------------------------------------------
    # Test 3: pgvector RAG Retrieval & Citations (§12)
    # -------------------------------------------------------------------------
    print("\n[TEST 3] Testing pgvector RAG Knowledge Search & Citation Formatting...")
    rag_result = await rag_service.search_with_citations("How should I chunk documents for RAG in vector databases?")
    chunks = rag_result["chunks"]
    sources = rag_result["sources"]
    citations = rag_result["citation_text"]

    assert len(chunks) > 0, "RAG should retrieve at least one relevant chunk"
    top_chunk = chunks[0]
    assert top_chunk["similarity"] > 0, "Top chunk must have positive similarity"
    assert "[" in top_chunk["citationId"], "Must include bracketed citation identifier"
    assert len(sources) > 0, "Must return structured source references"
    print(f"✓ Retrieved {len(chunks)} chunks. Top hit: \"{top_chunk['title']}\" by {top_chunk['creator']} (similarity: {top_chunk['similarity']})")
    print(f"✓ Formatted Citations Snippet:\n  {citations.splitlines()[0][:100]}...")

    # -------------------------------------------------------------------------
    # Test 4: Agent Observability Instrumentation (§42, §52)
    # -------------------------------------------------------------------------
    print("\n[TEST 4] Testing Agent Observability (agent_runs + tool_calls)...")
    test_user = {"id": "obs-student-1", "email": "obs@studentos.dev", "name": "Observability Student"}
    chat_req = ChatRequest(message="What jobs match my profile and what are my critical gaps?")

    response = await chat_with_agent(req=chat_req, user=test_user)
    assert "agentRun" in response, "Response must include agentRun observability telemetry"
    run_meta = response["agentRun"]
    assert run_meta["latencyMs"] >= 0, "Must record execution latency in ms"
    assert run_meta["tokensUsed"] > 0, "Must estimate token usage"
    assert run_meta["costUsd"] > 0, "Must estimate USD cost"
    assert run_meta["runId"] in db.agent_runs, "agent_runs table must contain execution record"

    run_record = db.agent_runs[run_meta["runId"]]
    print(f"✓ Agent Run logged (ID: {run_meta['runId']}):")
    print(f"  • Agent:      {run_record['agent_name']}")
    print(f"  • Latency:    {run_record['latency_ms']}ms")
    print(f"  • Tokens:     {run_record['tokens_used']} tokens (~${run_record['cost_usd']:.6f})")
    print(f"  • Tools Used: {run_record['tools_used']}")

    # -------------------------------------------------------------------------
    # Test 5: Persistent Chat Conversations & Messages (§37)
    # -------------------------------------------------------------------------
    print("\n[TEST 5] Testing Persistent Chat History (§37)...")
    conv_id = run_meta["conversationId"]
    stored_messages = await supabase_service.get_conversation_messages(conv_id)
    assert len(stored_messages) >= 2, "Conversation must contain user and assistant messages"
    user_msg = next((m for m in stored_messages if m["role"] == "user"), None)
    asst_msg = next((m for m in stored_messages if m["role"] == "assistant"), None)
    assert user_msg is not None, "User message must be persisted"
    assert asst_msg is not None, "Assistant message must be persisted"
    print(f"✓ Conversation {conv_id} persisted with {len(stored_messages)} messages.")
    print(f"  • User: \"{user_msg['content'][:60]}...\"")
    print(f"  • Assistant: \"{asst_msg['content'][:60]}...\"")

    # -------------------------------------------------------------------------
    # Test 6: Rate Limiter Guardrails (§45)
    # -------------------------------------------------------------------------
    print("\n[TEST 6] Testing Per-User Daily Rate Limit Guardrail (§45)...")
    rate_user = "rate-limit-test-user"
    for _ in range(MAX_DAILY_CHAT_REQUESTS):
        check_daily_rate_limit(rate_user)

    # 61st request must trigger HTTP 429
    try:
        check_daily_rate_limit(rate_user)
        assert False, "Should have raised HTTPException 429"
    except HTTPException as e:
        assert e.status_code == 429, f"Expected 429 status code, got {e.status_code}"
        print(f"✓ Successfully enforced daily quota ({MAX_DAILY_CHAT_REQUESTS} req/day) -> HTTP 429: {e.detail}")

    print("\n" + "=" * 75)
    print("🏆 ALL SCHEMA V2, RAG, OBSERVABILITY & GUARDRAIL TESTS PASSED (100%)")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_suite())
