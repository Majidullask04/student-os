from fastapi import APIRouter
from app.schemas.agent import FollowCreatorRequest

from app.db.database import db

router = APIRouter(prefix="/creators", tags=["creators"])

@router.get("")
async def get_creators():
    results = []
    for cid, c in db.creators.items():
        results.append({
            "id": c["id"],
            "name": c["name"],
            "handle": c["handle"],
            "followers": c["followers"],
            "bio": c["bio"],
            "avatarUrl": c.get("avatar_url", ""),
            "isFollowing": cid in db.followed_creators.get("user-1", []),
            "tags": c.get("tags", []),
            "platform": c.get("platform", "YouTube"),
            "categories": ["AI/ML"] if "AI" in str(c.get("tags")) else ["Web Dev", "DevOps"],
            "featuredSeries": c.get("featured_series", []),
            "whyRelevant": c.get("why_relevant", "")
        })
    return results

@router.post("/follow")
async def follow_creator(req: FollowCreatorRequest):
    return {"success": True, "creatorId": req.creatorId, "isFollowing": True}
