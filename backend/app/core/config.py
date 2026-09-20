import os
from typing import List
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
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # Environment & Auth Enforcement
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    ENFORCE_AUTH: bool = os.getenv("ENFORCE_AUTH", "").lower() in ("true", "1", "yes") or os.getenv("ENVIRONMENT", "").lower() == "production"

    # CORS origins
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", 
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:8000,https://student-os.vercel.app,https://student-os-lime-psi.vercel.app"
        ).split(",")
        if origin.strip()
    ]
    CORS_ORIGIN_REGEX: str = os.getenv("CORS_ORIGIN_REGEX", r"https:\/\/.*\.amplifyapp\.com")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

