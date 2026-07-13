from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.schemas import ReadingRequest, ReadingResponse
from app.services.claude import generate_reading

router = APIRouter(prefix="/reading", tags=["reading"])
limiter = Limiter(key_func=get_remote_address)


@router.post("", response_model=ReadingResponse)
@limiter.limit("5/minute;20/day")
async def get_reading(request: Request, req: ReadingRequest):
    try:
        text = generate_reading(
            chart=req.chart,
            name=req.name,
            reading_type=req.reading_type,
        )
        return ReadingResponse(reading=text, reading_type=req.reading_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reading generation failed: {e}")
