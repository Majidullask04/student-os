import os
from typing import Dict, Any, List, Optional
from app.core.config import settings

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
                print(f"[SupabaseService] Client initialization error: {e}")

    def is_connected(self) -> bool:
        return self.client is not None

    async def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_connected():
            return None
        try:
            res = self.client.table("profiles").select("*").eq("id", user_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"[Supabase] get_profile error: {e}")
        return None

    async def upsert_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_connected():
            return profile_data
        try:
            res = self.client.table("profiles").upsert(profile_data).execute()
            return res.data[0] if res.data else profile_data
        except Exception as e:
            print(f"[Supabase] upsert_profile error: {e}")
            return profile_data

    async def save_agent_memory(self, user_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        if not self.is_connected():
            return
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
        if not self.is_connected():
            return []
        try:
            res = self.client.table("agent_memory").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
            return list(reversed(res.data)) if res.data else []
        except Exception as e:
            print(f"[Supabase] get_recent_agent_memory error: {e}")
            return []

supabase_service = SupabaseService()
