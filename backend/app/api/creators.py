from fastapi import APIRouter
from app.schemas.agent import FollowCreatorRequest

router = APIRouter(prefix="/creators", tags=["creators"])

@router.get("")
async def get_creators():
    return [
        {
            "id": "karpathy",
            "name": "Andrej Karpathy",
            "handle": "@karpathy",
            "followers": "1.1M+",
            "bio": "Former Tesla AI, OpenAI. Explains complex AI concepts simply.",
            "isFollowing": True
        },
        {
            "id": "kunalkushwaha",
            "name": "Kunal Kushwaha",
            "handle": "@kunalkushwaha",
            "followers": "1.2M+",
            "bio": "Teaches DevOps, DSA, web development and open source.",
            "isFollowing": True
        }
    ]

@router.post("/follow")
async def follow_creator(req: FollowCreatorRequest):
    return {"success": True, "creatorId": req.creatorId, "isFollowing": True}
