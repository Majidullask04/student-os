from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Extracts and validates Supabase JWT token.
    Falls back gracefully to a default test student in dev mode when token is absent.
    """
    if not credentials:
        # Dev fallback when testing locally without an active auth session
        return {
            "id": "00000000-0000-0000-0000-000000000001",
            "email": "student@studentos.dev",
            "name": "Student",
            "is_authenticated": False
        }

    token = credentials.credentials

    # If Supabase JWT Secret is provided, verify signature
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
            user_id = payload.get("sub")
            email = payload.get("email", "")
            if user_id is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
            return {
                "id": user_id,
                "email": email,
                "name": payload.get("user_metadata", {}).get("name", email.split("@")[0]),
                "is_authenticated": True
            }
        except JWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired authentication token")

    # If no secret configured yet in dev, decode unverified for developer convenience
    try:
        claims = jwt.get_unverified_claims(token)
        return {
            "id": claims.get("sub", "00000000-0000-0000-0000-000000000001"),
            "email": claims.get("email", "student@studentos.dev"),
            "name": claims.get("user_metadata", {}).get("name", "Student"),
            "is_authenticated": True
        }
    except Exception:
        return {
            "id": "00000000-0000-0000-0000-000000000001",
            "email": "student@studentos.dev",
            "name": "Student",
            "is_authenticated": False
        }
