from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, profiles, agent, roadmap, resources, creators, jobs

app = FastAPI(
    title="Student OS API",
    description="A personal AI agent that guides students from learning to career readiness.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.get("/")
async def root():
    return {
        "service": "Student OS API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }
