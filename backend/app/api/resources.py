from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from app.core.security import get_current_user
from app.agents.learning_agent import learning_agent
from app.services.supabase_service import supabase_service
from app.services.context_service import context_service

router = APIRouter(prefix="/resources", tags=["resources"])

class ScrapeRequest(BaseModel):
    url: str
    main_content_only: bool = True

@router.get("/live-search")
async def live_search_educational_resources(
    q: str = Query(..., min_length=2, description="Search query for live educational resources"),
    num_results: int = Query(default=10, ge=1, le=20, description="Number of results to retrieve")
):
    """
    Real-time educational content search powered by Context.dev (POST /web/search).
    Discovers authoritative documentation, tutorials, and roadmap curricula across the web.
    """
    if not context_service.is_configured():
        raise HTTPException(
            status_code=503, 
            detail="Context.dev service is not configured. Missing CONTEXT_DEV_API_KEY."
        )
    try:
        results = context_service.search_educational_content(query=q, num_results=num_results)
        return results
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch live educational content: {str(e)}")

@router.post("/live-scrape")
async def live_scrape_educational_resource(request: ScrapeRequest):
    """
    Real-time educational scraper powered by Context.dev (POST /web/scrape).
    Extracts high-value, clean markdown documentation directly from tutorial or documentation URLs.
    """
    if not context_service.is_configured():
        raise HTTPException(
            status_code=503, 
            detail="Context.dev service is not configured. Missing CONTEXT_DEV_API_KEY."
        )
    try:
        scraped = context_service.scrape_educational_resource(
            url=request.url,
            main_content_only=request.main_content_only
        )
        return scraped
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to scrape educational resource: {str(e)}")

@router.get("/recommended")
async def get_recommended_resources(user: dict = Depends(get_current_user)):
    """
    Ranks learning resources dynamically according to the student's active roadmap milestone,
    identified skill gaps, followed creators, and difficulty level.
    """
    user_id = user["id"]
    return await learning_agent.get_recommended_resources(user_id)

@router.get("")
async def get_all_resources(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = Query(default=20, le=50)
):
    """
    Retrieves the catalog of learning resources with optional filtering.
    """
    return await supabase_service.get_resources(category=category, difficulty=difficulty, limit=limit)

