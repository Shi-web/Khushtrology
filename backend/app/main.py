from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.routers import chart, reading, payments, donations, charts_saved, transits

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Khushtrology API",
    description="Astrology engine + AI readings + Stripe payments",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chart.router)
app.include_router(reading.router)
app.include_router(payments.router)
app.include_router(donations.router)
app.include_router(charts_saved.router)
app.include_router(transits.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Khushtrology API"}


@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "healthy"}
