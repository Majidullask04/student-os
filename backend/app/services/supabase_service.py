import os
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
from app.core.config import settings
from app.db.database import db

class SupabaseService:
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        self.client = None

        if self.url and self.key:
            try:
                from supabase import create_client
                self.client = create_client(self.url, self.key)
            except Exception as e:
                print(f"[SupabaseService] Client initialization warning: {e}")

    def is_connected(self) -> bool:
        return self.client is not None

    # =========================================================================
    # 1. Profiles
    # =========================================================================
    async def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected():
            try:
                res = self.client.table("profiles").select("*").eq("id", user_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase] get_profile error: {e}")

        return db.profiles.get(user_id)

    async def upsert_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        user_id = profile_data.get("id", "user-1")
        # In-memory update
        current = db.profiles.get(user_id, {})
        updated = {**current, **profile_data, "updated_at": datetime.utcnow().isoformat()}
        db.profiles[user_id] = updated

        if self.is_connected():
            try:
                res = self.client.table("profiles").upsert(profile_data).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase] upsert_profile error: {e}")

        return updated

    # =========================================================================
    # 2. Skills
    # =========================================================================
    async def get_skills(self, user_id: str) -> List[Dict[str, Any]]:
        if self.is_connected():
            try:
                res = self.client.table("student_skills").select("*").eq("user_id", user_id).execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"[Supabase] get_skills error: {e}")

        return db.skills.get(user_id, [])

    async def upsert_skills(self, user_id: str, skills: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        db.skills[user_id] = skills
        if self.is_connected():
            try:
                # Sync skills
                for sk in skills:
                    record = {
                        "user_id": user_id,
                        "name": sk.get("name"),
                        "proficiency": sk.get("proficiency", 50),
                        "category": sk.get("category", "General")
                    }
                    self.client.table("student_skills").upsert(record).execute()
            except Exception as e:
                print(f"[Supabase] upsert_skills error: {e}")
        return skills

    # =========================================================================
    # 3. Creators
    # =========================================================================
    async def get_all_creators(self) -> List[Dict[str, Any]]:
        if self.is_connected():
            try:
                res = self.client.table("creators").select("*").execute()
                if res.data and len(res.data) > 0:
                    return res.data
            except Exception as e:
                print(f"[Supabase] get_all_creators error: {e}")

        return list(db.creators.values())

    async def get_followed_creators(self, user_id: str) -> List[Dict[str, Any]]:
        creator_ids = db.followed_creators.get(user_id, [])
        if self.is_connected():
            try:
                res = self.client.table("followed_creators").select("creator_id").eq("user_id", user_id).execute()
                if res.data:
                    creator_ids = [r["creator_id"] for r in res.data]
            except Exception as e:
                print(f"[Supabase] get_followed_creators error: {e}")

        return [db.creators[cid] for cid in creator_ids if cid in db.creators]

    async def set_followed_creators(self, user_id: str, creator_ids: List[str]) -> List[str]:
        db.followed_creators[user_id] = creator_ids
        if self.is_connected():
            try:
                # Clear and re-add
                self.client.table("followed_creators").delete().eq("user_id", user_id).execute()
                for cid in creator_ids:
                    self.client.table("followed_creators").insert({"user_id": user_id, "creator_id": cid}).execute()
            except Exception as e:
                print(f"[Supabase] set_followed_creators error: {e}")
        return creator_ids

    # =========================================================================
    # 4. Resources
    # =========================================================================
    async def get_resources(
        self, 
        category: Optional[str] = None, 
        tags: Optional[List[str]] = None,
        difficulty: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        if self.is_connected():
            try:
                query = self.client.table("resources").select("*")
                if category:
                    query = query.eq("category", category)
                if difficulty:
                    query = query.eq("difficulty", difficulty)
                res = query.limit(limit).execute()
                if res.data and len(res.data) > 0:
                    return res.data
            except Exception as e:
                print(f"[Supabase] get_resources error: {e}")

        items = db.resources
        if category:
            items = [r for r in items if r.get("category", "").lower() == category.lower()]
        if difficulty:
            items = [r for r in items if r.get("difficulty", "").lower() == difficulty.lower()]
        if tags:
            tag_set = set(t.lower() for t in tags)
            items = [r for r in items if any(t.lower() in tag_set for t in r.get("tags", []))]

        return items[:limit]

    # =========================================================================
    # 5. Roadmaps & Stages
    # =========================================================================
    async def get_current_roadmap(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected():
            try:
                res = self.client.table("roadmaps").select("*, roadmap_modules(*, roadmap_tasks(*))").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
                if res.data and len(res.data) > 0:
                    raw = res.data[0]
                    # Map to standardized format
                    modules = raw.get("roadmap_modules", [])
                    modules.sort(key=lambda m: m.get("stage_number", 0))
                    stages = []
                    for m in modules:
                        stages.append({
                            "stageNumber": m.get("stage_number"),
                            "title": m.get("title"),
                            "status": m.get("status"),
                            "description": m.get("description"),
                            "whyThisStep": m.get("why_this_step"),
                            "percentage": m.get("percentage", 0),
                            "tasks": [
                                {
                                    "id": t.get("id"),
                                    "title": t.get("title"),
                                    "type": t.get("task_type", "Theory"),
                                    "estimatedHours": float(t.get("estimated_hours", 2.0)),
                                    "completed": t.get("completed", False)
                                }
                                for t in m.get("roadmap_tasks", [])
                            ]
                        })
                    return {
                        "id": raw.get("id"),
                        "user_id": user_id,
                        "goal": raw.get("goal"),
                        "overallPercentage": raw.get("overall_percentage", 0),
                        "stages": stages
                    }
            except Exception as e:
                print(f"[Supabase] get_current_roadmap error: {e}")

        return db.roadmaps.get(user_id)

    async def save_roadmap(
        self, 
        user_id: str, 
        goal: str, 
        stages: List[Dict[str, Any]], 
        overall_percentage: int = 0
    ) -> Dict[str, Any]:
        roadmap_id = f"roadmap-{user_id}"
        roadmap_obj = {
            "id": roadmap_id,
            "user_id": user_id,
            "goal": goal,
            "targetRole": goal,
            "overallPercentage": overall_percentage,
            "stages": stages,
            "updated_at": datetime.utcnow().isoformat()
        }
        db.roadmaps[user_id] = roadmap_obj

        if self.is_connected():
            try:
                # Upsert main roadmap
                rm_res = self.client.table("roadmaps").upsert({
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "goal": goal,
                    "target_role": goal,
                    "overall_percentage": overall_percentage
                }).execute()
            except Exception as e:
                print(f"[Supabase] save_roadmap error: {e}")

        return roadmap_obj

    async def inject_adaptive_milestone(
        self,
        user_id: str,
        title: str,
        description: str,
        tasks: List[Dict[str, Any]],
        why_this_step: str,
        reason: str = "Skill Gap Remediation"
    ) -> Dict[str, Any]:
        """
        Dynamically adapts the student's active roadmap by inserting a tailored milestone/stage.
        """
        roadmap = await self.get_current_roadmap(user_id)
        if not roadmap:
            roadmap = await self.save_roadmap(
                user_id=user_id,
                goal="AI Engineer",
                stages=[],
                overall_percentage=0
            )

        stages = roadmap.get("stages", [])
        new_stage_num = len(stages) + 1

        new_stage = {
            "stageNumber": new_stage_num,
            "title": title,
            "status": "In Progress",
            "description": description,
            "whyThisStep": why_this_step,
            "percentage": 0,
            "reason": reason,
            "tasks": [
                {
                    "id": t.get("id", f"task-adapt-{uuid.uuid4().hex[:6]}"),
                    "title": t.get("title", "Practice Exercise"),
                    "type": t.get("type", "Hands-on"),
                    "estimatedHours": float(t.get("estimatedHours", 2.0)),
                    "completed": False
                }
                for t in tasks
            ]
        }

        stages.append(new_stage)
        roadmap["stages"] = stages
        db.roadmaps[user_id] = roadmap
        return new_stage

    # =========================================================================
    # 6. Progress
    # =========================================================================
    async def get_progress(self, user_id: str) -> Dict[str, bool]:
        if self.is_connected():
            try:
                res = self.client.table("progress_history").select("task_id, completed").eq("user_id", user_id).execute()
                if res.data:
                    return {r["task_id"]: r["completed"] for r in res.data}
            except Exception as e:
                print(f"[Supabase] get_progress error: {e}")

        return db.progress.get(user_id, {})

    async def save_progress(self, user_id: str, task_id: str, completed: bool = True) -> Dict[str, Any]:
        if user_id not in db.progress:
            db.progress[user_id] = {}
        db.progress[user_id][task_id] = completed

        # Also mutate tasks in the current active roadmap
        roadmap = db.roadmaps.get(user_id)
        active_milestone = "Learning"
        module_percentage = 0
        completed_task_obj = None

        if roadmap and "stages" in roadmap:
            total_tasks = 0
            completed_tasks = 0
            stages = roadmap["stages"]

            for stage in stages:
                stage_total = len(stage.get("tasks", []))
                stage_completed = 0
                for t in stage.get("tasks", []):
                    if t.get("id") == task_id:
                        t["completed"] = completed
                        completed_task_obj = t
                    if t.get("completed", False):
                        stage_completed += 1
                        completed_tasks += 1
                    total_tasks += 1
                
                if stage_total > 0:
                    stage["percentage"] = int((stage_completed / stage_total) * 100)
                    if stage_completed == stage_total:
                        stage["status"] = "Completed"
                    elif stage_completed > 0:
                        stage["status"] = "In Progress"
                    if completed_task_obj and any(t.get("id") == task_id for t in stage.get("tasks", [])):
                        module_percentage = stage["percentage"]

            # Automatically transition next milestone to In Progress when prior is completed
            for i, stg in enumerate(stages):
                if stg.get("status") == "Completed" and i + 1 < len(stages):
                    if stages[i + 1].get("status") in ["Upcoming", "Next"]:
                        stages[i + 1]["status"] = "In Progress"

            # Determine currently active milestone
            for stg in stages:
                if stg.get("status") in ["In Progress", "Next"]:
                    active_milestone = stg.get("title", "")
                    break

            # Recalculate overall percentage
            if total_tasks > 0:
                roadmap["overallPercentage"] = int((completed_tasks / total_tasks) * 100)

            # If task completed is a project, register into projects table as verified evidence
            if completed and completed_task_obj and completed_task_obj.get("type") == "Project":
                user_projs = db.projects.get(user_id, [])
                if not any(p.get("title") == completed_task_obj.get("title") for p in user_projs):
                    user_projs.append({
                        "id": f"proj-{len(user_projs)+1}",
                        "title": completed_task_obj.get("title"),
                        "description": f"Verified project completed from roadmap: {active_milestone}",
                        "tech_stack": ["Python", "AI", "FastAPI"],
                        "status": "Completed"
                    })
                    db.projects[user_id] = user_projs

        if self.is_connected():
            try:
                # Update task in Supabase
                self.client.table("roadmap_tasks").update({"completed": completed}).eq("id", task_id).execute()
                # Audit into progress_history
                self.client.table("progress_history").insert({
                    "user_id": user_id,
                    "task_id": task_id,
                    "completed": completed
                }).execute()
            except Exception as e:
                print(f"[Supabase] save_progress error: {e}")

        return {
            "taskId": task_id,
            "completed": completed,
            "modulePercentage": module_percentage,
            "overallPercentage": roadmap.get("overallPercentage", 0) if roadmap else 0,
            "activeMilestone": active_milestone
        }

    # =========================================================================
    # 7. Projects
    # =========================================================================
    async def get_projects(self, user_id: str) -> List[Dict[str, Any]]:
        if self.is_connected():
            try:
                res = self.client.table("projects").select("*").eq("user_id", user_id).execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"[Supabase] get_projects error: {e}")

        return db.projects.get(user_id, [])

    async def save_project(self, user_id: str, project_data: Dict[str, Any]) -> Dict[str, Any]:
        if user_id not in db.projects:
            db.projects[user_id] = []
        proj_id = project_data.get("id", f"proj-{len(db.projects[user_id]) + 1}")
        project_data["id"] = proj_id
        db.projects[user_id].append(project_data)

        if self.is_connected():
            try:
                self.client.table("projects").insert({
                    "user_id": user_id,
                    **project_data
                }).execute()
            except Exception as e:
                print(f"[Supabase] save_project error: {e}")

        return project_data

    async def upsert_project(self, user_id: str, project_data: Dict[str, Any]) -> Dict[str, Any]:
        return await self.save_project(user_id, project_data)

    # =========================================================================
    # 8. Jobs
    # =========================================================================
    async def get_jobs(self, query: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        if self.is_connected():
            try:
                res = self.client.table("jobs").select("*").limit(limit).execute()
                if res.data and len(res.data) > 0:
                    return res.data
            except Exception as e:
                print(f"[Supabase] get_jobs error: {e}")

        jobs = db.jobs
        if query:
            q = query.lower()
            jobs = [j for j in jobs if q in j.get("title", "").lower() or q in j.get("company", "").lower()]
        return jobs[:limit]

    # =========================================================================
    # 9. Agent Memory
    # =========================================================================
    async def save_agent_memory(self, user_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        mem_item = {
            "id": f"mem-{uuid.uuid4().hex[:8]}",
            "role": role,
            "content": content,
            "metadata": metadata or {},
            "created_at": datetime.utcnow().isoformat()
        }
        if user_id not in db.agent_memory:
            db.agent_memory[user_id] = []
        db.agent_memory[user_id].append(mem_item)

        if self.is_connected():
            try:
                self.client.table("agent_memory").insert({
                    "user_id": user_id,
                    "role": role,
                    "content": content,
                    "metadata": metadata or {}
                }).execute()
            except Exception as e:
                print(f"[Supabase] save_agent_memory error: {e}")

    async def get_recent_agent_memory(self, user_id: str, limit: int = 6) -> List[Dict[str, Any]]:
        if self.is_connected():
            try:
                res = self.client.table("agent_memory").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
                if res.data:
                    return list(reversed(res.data))
            except Exception as e:
                print(f"[Supabase] get_recent_agent_memory error: {e}")

        items = db.agent_memory.get(user_id, [])
        return items[-limit:]

    # =========================================================================
    # 10. Conversations & Persistent Chat Messages (Schema v2 §37)
    # =========================================================================
    async def get_or_create_conversation(self, user_id: str, title: str = "New conversation") -> Dict[str, Any]:
        if self.is_connected():
            try:
                res = self.client.table("conversations").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
                new_conv = {"user_id": user_id, "title": title}
                ins = self.client.table("conversations").insert(new_conv).execute()
                if ins.data:
                    return ins.data[0]
            except Exception as e:
                print(f"[Supabase] get_or_create_conversation error: {e}")

        # In-memory fallback
        user_convs = db.conversations.get(user_id, [])
        if user_convs:
            return user_convs[0]
        new_c = {
            "id": f"conv-{uuid.uuid4().hex[:8]}",
            "user_id": user_id,
            "title": title,
            "created_at": datetime.utcnow().isoformat()
        }
        if user_id not in db.conversations:
            db.conversations[user_id] = []
        db.conversations[user_id].append(new_c)
        return new_c

    async def get_conversation_messages(self, conversation_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        if self.is_connected():
            try:
                res = self.client.table("messages").select("*").eq("conversation_id", conversation_id).order("created_at", asc=True).limit(limit).execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"[Supabase] get_conversation_messages error: {e}")

        return db.messages.get(conversation_id, [])

    async def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        tool_calls: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        msg = {
            "id": f"msg-{uuid.uuid4().hex[:8]}",
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "tool_calls": tool_calls or [],
            "created_at": datetime.utcnow().isoformat()
        }
        if conversation_id not in db.messages:
            db.messages[conversation_id] = []
        db.messages[conversation_id].append(msg)

        if self.is_connected():
            try:
                self.client.table("messages").insert({
                    "conversation_id": conversation_id,
                    "role": role,
                    "content": content,
                    "tool_calls": tool_calls or []
                }).execute()
            except Exception as e:
                print(f"[Supabase] add_message error: {e}")
        return msg

    # =========================================================================
    # 11. Agent Observability (§42, §52)
    # =========================================================================
    async def record_agent_run(
        self,
        user_id: str,
        agent_name: str,
        input_summary: str,
        tools_used: List[str],
        status: str = "success",
        latency_ms: Optional[int] = None,
        tokens_used: int = 0,
        cost_usd: float = 0.0
    ) -> str:
        run_id = f"run-{uuid.uuid4().hex[:8]}"
        run_record = {
            "id": run_id,
            "user_id": user_id,
            "agent_name": agent_name,
            "input_summary": input_summary[:200],
            "tools_used": tools_used,
            "status": status,
            "latency_ms": latency_ms or 0,
            "tokens_used": tokens_used,
            "cost_usd": cost_usd,
            "created_at": datetime.utcnow().isoformat()
        }
        db.agent_runs[run_id] = run_record

        if self.is_connected():
            try:
                res = self.client.table("agent_runs").insert({
                    "user_id": user_id,
                    "agent_name": agent_name,
                    "input_summary": input_summary[:200],
                    "tools_used": tools_used,
                    "status": status,
                    "latency_ms": latency_ms,
                    "tokens_used": tokens_used,
                    "cost_usd": cost_usd
                }).execute()
                if res.data:
                    return res.data[0].get("id", run_id)
            except Exception as e:
                print(f"[Supabase] record_agent_run error: {e}")

        return run_id

    async def record_tool_call(
        self,
        run_id: str,
        tool_name: str,
        input_json: Dict[str, Any],
        output_json: Dict[str, Any],
        latency_ms: int,
        status: str = "success"
    ) -> Dict[str, Any]:
        tc_record = {
            "id": f"tc-{uuid.uuid4().hex[:8]}",
            "run_id": run_id,
            "tool_name": tool_name,
            "input_json": input_json,
            "output_json": output_json,
            "latency_ms": latency_ms,
            "status": status,
            "created_at": datetime.utcnow().isoformat()
        }
        if run_id not in db.tool_calls:
            db.tool_calls[run_id] = []
        db.tool_calls[run_id].append(tc_record)

        if self.is_connected():
            try:
                self.client.table("tool_calls").insert({
                    "run_id": run_id,
                    "tool_name": tool_name,
                    "input_json": input_json,
                    "output_json": output_json,
                    "latency_ms": latency_ms,
                    "status": status
                }).execute()
            except Exception as e:
                print(f"[Supabase] record_tool_call error: {e}")

        return tc_record

    # =========================================================================
    # 12. Audit Logs (§77)
    # =========================================================================
    async def record_audit_log(
        self,
        user_id: Optional[str],
        action: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ):
        log_record = {
            "id": f"audit-{uuid.uuid4().hex[:8]}",
            "user_id": user_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "metadata": metadata or {},
            "ip_address": ip_address,
            "created_at": datetime.utcnow().isoformat()
        }
        db.audit_logs.append(log_record)

        if self.is_connected():
            try:
                self.client.table("audit_logs").insert({
                    "user_id": user_id,
                    "action": action,
                    "entity_type": entity_type,
                    "entity_id": entity_id,
                    "metadata": metadata or {}
                }).execute()
            except Exception as e:
                print(f"[Supabase] record_audit_log error: {e}")

supabase_service = SupabaseService()
