from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class AuthRequest(BaseModel):
    email: str
    password: str
    name: str = "Majidulla"

@router.post("/signup")
async def signup(req: AuthRequest):
    return {
        "success": True,
        "token": "token_" + req.email,
        "user": {"name": req.name, "email": req.email}
    }

@router.post("/login")
async def login(req: AuthRequest):
    return {
        "success": True,
        "token": "token_" + req.email,
        "user": {"name": req.name, "email": req.email}
    }
