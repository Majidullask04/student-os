import os
from typing import List, Any, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Student OS API"
    API_V1_STR: str = "/api"
    
    # Supabase credentials
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    
    # Gemini API
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Context.dev API for Real-Time Educational Scraping & Web Search
    CONTEXT_DEV_API_KEY: str = os.getenv("CONTEXT_DEV_API_KEY", "")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # Environment & Auth Enforcement
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    ENFORCE_AUTH: bool = os.getenv("ENFORCE_AUTH", "").lower() in ("true", "1", "yes") or os.getenv("ENVIRONMENT", "").lower() == "production"

    # CORS origins
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:3030,http://127.0.0.1:3030,http://localhost:8000,https://student-os.vercel.app,https://student-os-lime-psi.vercel.app"
    CORS_ORIGIN_REGEX: str = r"https:\/\/.*\.amplifyapp\.com"

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

