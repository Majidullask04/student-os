from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings

security = HTTPBearer(auto_error=False)

JWT_SECRET = settings.SUPABASE_JWT_SECRET or "student-os-jwt-secret-key-2026"
JWT_ALGORITHM = "HS256"

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Extracts and validates JWT access tokens.
    Supports Supabase cloud JWTs and local development tokens.
    In production (or when ENFORCE_AUTH is true), strictly enforces 401 Unauthorized
    on missing, expired, or invalid signatures.
    """
    if not credentials:
        if settings.ENFORCE_AUTH:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {
            "id": "00000000-0000-0000-0000-000000000001",
            "email": "student@studentos.dev",
            "name": "Student",
            "is_authenticated": False
        }

    token = credentials.credentials

    # 1. Attempt verification with JWT_SECRET
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"verify_aud": False}
        )
        user_id = payload.get("sub")
        email = payload.get("email", "")
        if user_id:
            return {
                "id": user_id,
                "email": email,
                "name": payload.get("user_metadata", {}).get("name", email.split("@")[0] if email else "Student"),
                "is_authenticated": True
            }
    except Exception:
        pass

    # 2. In production or enforced environments, reject invalid signatures
    if settings.ENFORCE_AUTH:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Development/Local test fallback for mock or unverified tokens
    try:
        claims = jwt.get_unverified_claims(token)
        user_id = claims.get("sub", "00000000-0000-0000-0000-000000000001")
        email = claims.get("email", "student@studentos.dev")
        return {
            "id": user_id,
            "email": email,
            "name": claims.get("user_metadata", {}).get("name", email.split("@")[0]),
            "is_authenticated": True
        }
    except Exception:
        return {
            "id": "00000000-0000-0000-0000-000000000001",
            "email": "student@studentos.dev",
            "name": "Student",
            "is_authenticated": False
        }
