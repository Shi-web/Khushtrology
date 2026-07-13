from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from timezonefinder import TimezoneFinder
from app.models.schemas import ChartRequest, ChartResponse
from app.services import astro, geo

router = APIRouter(prefix="/chart", tags=["chart"])
limiter = Limiter(key_func=get_remote_address)

_tf = TimezoneFinder()


@router.get("/timezone")
@limiter.limit("30/minute")
async def get_timezone(request: Request, lat: float, lon: float):
    tz = _tf.timezone_at(lat=lat, lng=lon)
    if not tz:
        raise HTTPException(status_code=404, detail="Timezone not found for these coordinates")
    return {"timezone": tz}


@router.post("", response_model=ChartResponse)
@limiter.limit("10/minute")
async def calculate_chart(request: Request, req: ChartRequest):
    try:
        lat = req.lat
        lon = req.lon

        if lat is None or lon is None:
            lat, lon = await geo.geocode(req.city, req.country)

        chart = astro.calculate_chart(
            date=req.date,
            time=req.time,
            lat=lat,
            lon=lon,
            house_system=req.house_system,
            timezone=req.timezone,
        )
        return chart
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chart calculation failed: {e}")
