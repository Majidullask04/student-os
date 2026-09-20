import time
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.agent import AnalyzeRequest, ChatRequest
from app.core.security import get_current_user
from app.agents.learning_agent import learning_agent
from app.agents.context import build_student_context
from app.services.supabase_service import supabase_service
from app.db.database import db

router = APIRouter(prefix="/agent", tags=["agent"])

# Per-user daily rate limiter (Schema v2 Guardrails §45)
USER_RATE_LIMITS: Dict[str, Dict[str, Any]] = {}
MAX_DAILY_CHAT_REQUESTS = 60

def check_daily_rate_limit(user_id: str):
    """Enforces daily request rate limit per student (§45 Guardrails)."""
    today_str = date.today().isoformat()
    record = USER_RATE_LIMITS.get(user_id, {"date": today_str, "count": 0})

    if record["date"] != today_str:
        record = {"date": today_str, "count": 0}

    if record["count"] >= MAX_DAILY_CHAT_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily agent request limit ({MAX_DAILY_CHAT_REQUESTS}) reached. Quota resets tomorrow."
        )

    record["count"] += 1
    USER_RATE_LIMITS[user_id] = record

@router.post("/analyze")
async def analyze_student_profile(req: AnalyzeRequest, user: dict = Depends(get_current_user)):
    """
    Analyzes student skill gaps and generates an adaptive 7-stage learning roadmap.
    Persists the roadmap to the database and records analysis into agent memory.
    """
    user_id = user["id"]
    await supabase_service.record_audit_log(
        user_id=user_id,
        action="agent_gap_analysis",
        entity_type="roadmap",
        metadata={"goal": req.goal}
    )
    return await learning_agent.analyze_student_profile(
        user_id=user_id,
        goal=req.goal,
        skills=req.skills,
        time_commitment=req.timeCommitmentHours
    )

@router.post("/chat")
async def chat_with_agent(req: ChatRequest, user: dict = Depends(get_current_user)):
    """
    Intelligent multi-agent conversation routing with full observability (§42, §52),
    persistent conversation history (§37), and rate-limit guardrails (§45).
    """
    user_id = user["id"]
    check_daily_rate_limit(user_id)

    start_time = time.perf_counter()

    # 1. Fetch or create persistent conversation thread
    conv = await supabase_service.get_or_create_conversation(user_id=user_id, title="Student OS Chat")
    conv_id = conv.get("id")

    # 2. Persist user prompt into messages table
    await supabase_service.add_message(
        conversation_id=conv_id,
        role="user",
        content=req.message
    )

    # 3. Route to orchestrator
    from app.agents.orchestrator import orchestrator
    res = await orchestrator.route_and_execute(
        user_id=user_id,
        message=req.message,
        session_id=conv_id
    )

    latency_ms = int((time.perf_counter() - start_time) * 1000)
    agent_meta = res.get("orchestratorMeta", {})
    agent_name = agent_meta.get("delegatedAgent", "AgentOrchestrator")
    tool_calls = res.get("toolCalls", [])
    tools_used = [tc.get("tool_name", "tool") for tc in tool_calls]

    # Estimated token usage (~4 chars/token)
    tokens_est = int((len(req.message) + len(res.get("text", ""))) / 4) + 120
    cost_usd = round(tokens_est * 0.00000015, 6)

    # 4. Record Agent Observability Run (§42, §52)
    run_id = await supabase_service.record_agent_run(
        user_id=user_id,
        agent_name=agent_name,
        input_summary=req.message,
        tools_used=tools_used,
        status="success",
        latency_ms=latency_ms,
        tokens_used=tokens_est,
        cost_usd=cost_usd
    )

    # 5. Record individual tool calls
    for tc in tool_calls:
        await supabase_service.record_tool_call(
            run_id=run_id,
            tool_name=tc.get("tool_name", "tool"),
            input_json=tc.get("input_json", {}),
            output_json=tc.get("output_json", {}),
            latency_ms=tc.get("latency_ms", 150),
            status=tc.get("status", "success")
        )

    # 6. Persist assistant reply with tool_calls in messages table
    await supabase_service.add_message(
        conversation_id=conv_id,
        role="assistant",
        content=res.get("text", ""),
        tool_calls=tool_calls
    )

    # Attach observability metadata to response
    res["agentRun"] = {
        "runId": run_id,
        "conversationId": conv_id,
        "latencyMs": latency_ms,
        "tokensUsed": tokens_est,
        "costUsd": cost_usd,
        "agent": agent_name
    }

    return res

@router.get("/messages")
async def get_agent_messages(user: dict = Depends(get_current_user)):
    """
    Returns persisted chat message history for the active conversation (§37).
    """
    user_id = user["id"]
    conv = await supabase_service.get_or_create_conversation(user_id=user_id)
    return await supabase_service.get_conversation_messages(conversation_id=conv["id"])

@router.get("/observability/runs")
async def get_agent_runs(limit: int = 10, user: dict = Depends(get_current_user)):
    """
    Returns recent observable agent execution runs and tool traces (§42, §52).
    """
    user_id = user["id"]
    runs = [r for r in db.agent_runs.values() if r.get("user_id") == user_id]
    runs.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return runs[:limit]

@router.post("/resolve-conflicts")
async def resolve_creator_conflicts(
    debates: Optional[str] = None, 
    user: dict = Depends(get_current_user)
):
    """
    Resolves educational disputes between tech creators tailored to this student's context.
    """
    return await learning_agent.resolve_creator_conflicts(
        user_id=user["id"],
        creator_viewpoints=debates
    )

@router.get("/context")
async def get_agent_context(user: dict = Depends(get_current_user)):
    """
    Retrieves the complete, unified Student Context (single source of truth for agent).
    """
    return await build_student_context(user["id"])
