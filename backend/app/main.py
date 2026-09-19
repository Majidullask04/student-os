from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, profiles, agent, roadmap, resources, creators, jobs, assessment, projects

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="A personal AI agent that guides students from learning to career readiness.",
    version="1.0.0"
)

# Production-grade CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(agent.router)
app.include_router(roadmap.router)
app.include_router(resources.router)
app.include_router(creators.router)
app.include_router(jobs.router)
app.include_router(assessment.router)
app.include_router(projects.router)

@app.get("/")
async def root():
    return {
        "service": "Student OS API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }
