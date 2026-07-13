from fastapi import APIRouter, Depends, HTTPException
from supabase import create_client
from pydantic import BaseModel
from typing import Optional

from app.config import settings
from app.services.auth import get_current_user
from app.models.schemas import ChartResponse

router = APIRouter(prefix="/charts", tags=["saved-charts"])


def _db():
    if not settings.supabase_url or not settings.supabase_service_key:
        raise HTTPException(503, "Database not configured")
    return create_client(settings.supabase_url, settings.supabase_service_key)


class SaveChartRequest(BaseModel):
    label: Optional[str] = None
    birth_name: str
    birth_date: str
    birth_time: str
    city: str
    country: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    timezone: str = "UTC"
    house_system: str = "P"
    chart: ChartResponse


class UpdateReadingsRequest(BaseModel):
    reading_type: str
    reading_text: str


@router.post("/save", status_code=201)
def save_chart(body: SaveChartRequest, user=Depends(get_current_user)):
    row = {
        "user_id": str(user.id),
        "label": body.label or body.birth_name,
        "birth_name": body.birth_name,
        "birth_date": body.birth_date,
        "birth_time": body.birth_time,
        "city": body.city,
        "country": body.country,
        "lat": body.lat,
        "lon": body.lon,
        "timezone": body.timezone,
        "house_system": body.house_system,
        "chart_json": body.chart.model_dump(),
    }
    result = _db().table("saved_charts").insert(row).execute()
    return result.data[0]


@router.get("/saved")
def get_saved_charts(user=Depends(get_current_user)):
    result = (
        _db()
        .table("saved_charts")
        .select("*")
        .eq("user_id", str(user.id))
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.patch("/saved/{chart_id}/readings", status_code=200)
def update_readings(chart_id: str, body: UpdateReadingsRequest, user=Depends(get_current_user)):
    db = _db()
    result = (
        db.table("saved_charts")
        .select("readings_json")
        .eq("id", chart_id)
        .eq("user_id", str(user.id))
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(404, "Chart not found or not yours")
    current = result.data.get("readings_json") or {}
    current[body.reading_type] = body.reading_text
    db.table("saved_charts").update({"readings_json": current}).eq("id", chart_id).eq("user_id", str(user.id)).execute()
    return {"ok": True}


@router.delete("/saved/{chart_id}", status_code=200)
def delete_chart(chart_id: str, user=Depends(get_current_user)):
    result = (
        _db()
        .table("saved_charts")
        .delete()
        .eq("id", chart_id)
        .eq("user_id", str(user.id))
        .execute()
    )
    if not result.data:
        raise HTTPException(404, "Chart not found or not yours")
    return {"deleted": True}
