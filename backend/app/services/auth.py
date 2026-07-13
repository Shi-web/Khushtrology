from fastapi import HTTPException, Header
from supabase import create_client
from app.config import settings


def _get_client():
    if not settings.supabase_url or not settings.supabase_service_key:
        raise HTTPException(503, "Auth service not configured — set SUPABASE_URL and SUPABASE_SERVICE_KEY")
    return create_client(settings.supabase_url, settings.supabase_service_key)


def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid Authorization header")
    token = authorization.removeprefix("Bearer ")
    client = _get_client()
    try:
        response = client.auth.get_user(token)
        if not response.user:
            raise HTTPException(401, "Invalid or expired token")
        return response.user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(401, f"Authentication failed: {e}")
