from fastapi import APIRouter, Depends
from app.schemas.roadmap import ProgressUpdate
from app.core.security import get_current_user
from app.services.supabase_service import supabase_service
from app.agents.context import build_student_context

router = APIRouter(tags=["roadmap"])

@router.get("/roadmap")
async def get_roadmap(user: dict = Depends(get_current_user)):
    """
    Returns the student's active personalized roadmap from database/Supabase.
    """
    user_id = user["id"]
    roadmap = await supabase_service.get_current_roadmap(user_id)
    if not roadmap:
        # Fallback to default user-1 roadmap if new session
        roadmap = await supabase_service.get_current_roadmap("user-1")
    return roadmap

@router.post("/progress")
async def update_progress(req: ProgressUpdate, user: dict = Depends(get_current_user)):
    """
    Updates task completion in database, deterministically recalculates module
    and overall roadmap percentages, detects completed stages, and stores progress memory.
    """
    user_id = user["id"]
    
    # 1. Update task in DB & recalculate roadmap
    res = await supabase_service.save_progress(
        user_id=user_id,
        task_id=req.taskId,
        completed=req.completed
    )

    # 2. Fetch updated roadmap state
    updated_roadmap = await supabase_service.get_current_roadmap(user_id)
    overall_percentage = updated_roadmap.get("overallPercentage", 0) if updated_roadmap else 0

    # 3. Check which milestone is now active
    active_stage_title = "In Progress"
    if updated_roadmap and "stages" in updated_roadmap:
        for stage in updated_roadmap["stages"]:
            if stage.get("status") in ["In Progress", "Next"]:
                active_stage_title = stage.get("title", "")
                break

    # 4. Save progress memory
    await supabase_service.save_agent_memory(
        user_id=user_id,
        role="system",
        content=f"Progress updated: Task {req.taskId} marked {'completed' if req.completed else 'incomplete'}. Overall roadmap completion: {overall_percentage}%. Active milestone: {active_stage_title}.",
        metadata={"taskId": req.taskId, "completed": req.completed, "overallPercentage": overall_percentage}
    )

    return {
        "success": True,
        "taskId": req.taskId,
        "completed": req.completed,
        "overallPercentage": overall_percentage,
        "activeMilestone": active_stage_title
    }
