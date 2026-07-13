from collections import Counter
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import create_client

from app.config import settings
from app.models.schemas import (
    ChartResponse,
    TransitHousesResponse,
    TransitPlanet,
    TransitReadingRequest,
    TransitReadingResponse,
)
from app.services import astro
from app.services.auth import get_current_user
from app.services.claude import generate_transit_reading

router = APIRouter(prefix="/transits", tags=["transits"])
limiter = Limiter(key_func=get_remote_address)


def _db():
    if not settings.supabase_url or not settings.supabase_service_key:
        raise HTTPException(503, "Database not configured")
    return create_client(settings.supabase_url, settings.supabase_service_key)


@router.get("/houses", response_model=TransitHousesResponse)
@limiter.limit("10/minute")
async def get_transit_houses(
    request: Request,
    chart_id: str | None = None,
    user=Depends(get_current_user),
):
    query = _db().table("saved_charts").select("*").eq("user_id", str(user.id))
    if chart_id:
        query = query.eq("id", chart_id)
    result = query.order("created_at", desc=True).limit(1).execute()
    if not result.data:
        raise HTTPException(404, "No saved chart found. Calculate and save your birth chart first.")

    saved = result.data[0]
    chart_json = saved["chart_json"]

    raw_transits = astro.calculate_current_transits()
    placed = astro.place_in_transit_houses(raw_transits, chart_json["house_cusps"])
    transit_planets = [TransitPlanet(**p) for p in placed]

    house_counts = Counter(p.transit_house for p in transit_planets if p.transit_house)
    most_activated = house_counts.most_common(1)[0][0] if house_counts else None

    return TransitHousesResponse(
        transit_planets=transit_planets,
        date=date.today().isoformat(),
        chart_id=str(saved["id"]),
        chart_label=saved.get("label") or saved.get("birth_name", "Your Chart"),
        most_activated_house=most_activated,
        natal_chart=ChartResponse(**chart_json),
        name=saved.get("birth_name", ""),
    )


@router.post("/reading", response_model=TransitReadingResponse)
@limiter.limit("5/minute")
async def get_transit_reading(request: Request, body: TransitReadingRequest, user=Depends(get_current_user)):
    try:
        reading = generate_transit_reading(
            natal_chart=body.natal_chart,
            name=body.name,
            transit_planets=body.transit_planets,
        )
        return TransitReadingResponse(reading=reading)
    except Exception as e:
        raise HTTPException(500, f"Transit reading failed: {e}")
