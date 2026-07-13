from fastapi import HTTPException
from supabase import create_client

from app.config import settings


def _db():
    if not settings.supabase_url or not settings.supabase_service_key:
        raise HTTPException(503, "Database not configured")
    return create_client(settings.supabase_url, settings.supabase_service_key)


def log_donation(donor_name: str, amount: int, stripe_session_id: str | None = None):
    row = {
        "donor_name": donor_name,
        "amount": amount,
        "stripe_session_id": stripe_session_id,
    }
    try:
        _db().table("donations").insert(row).execute()
    except Exception as e:
        # Stripe retries webhooks — a duplicate session id means we already logged this one
        if "duplicate key" in str(e) or "23505" in str(e):
            return
        raise


def get_total() -> int:
    result = _db().table("donations").select("amount").execute()
    return sum(r["amount"] for r in result.data)
