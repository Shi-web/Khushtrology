from pydantic import BaseModel, Field
from typing import Optional, Literal


class ChartRequest(BaseModel):
    name: str
    date: str = Field(..., description="YYYY-MM-DD")
    time: str = Field(..., description="HH:MM in local time")
    city: str
    country: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    house_system: Literal["P", "W", "K", "E"] = "P"
    timezone: str = "UTC"


class Planet(BaseModel):
    name: str
    sign: str
    degree: float
    house: Optional[int] = None
    retrograde: bool = False


class Angles(BaseModel):
    ASC: str
    MC: str
    DSC: str
    IC: str


class ChartResponse(BaseModel):
    planets: list[Planet]
    angles: Angles
    house_cusps: list[str]
    sun_sign: str
    moon_sign: str
    rising_sign: str


class ReadingRequest(BaseModel):
    chart: ChartResponse
    name: str
    reading_type: Literal["natal", "love", "career", "spiritual"] = "natal"


class ReadingResponse(BaseModel):
    reading: str
    reading_type: str


class CheckoutSessionRequest(BaseModel):
    success_url: str
    cancel_url: str
    amount: float = Field(..., gt=0, description="Donation amount in USD")


class CheckoutSessionResponse(BaseModel):
    session_id: str
    url: str


class DonationCheckoutRequest(BaseModel):
    amount: int = Field(..., gt=0, description="Donation amount in cents")
    donor_name: str


class DonationCheckoutResponse(BaseModel):
    url: str


class DonationsTotalResponse(BaseModel):
    total: int


class TransitPlanet(BaseModel):
    name: str
    sign: str
    degree: float
    retrograde: bool
    longitude: float
    transit_house: Optional[int] = None


class TransitHousesResponse(BaseModel):
    transit_planets: list[TransitPlanet]
    date: str
    chart_id: str
    chart_label: str
    most_activated_house: Optional[int]
    natal_chart: ChartResponse
    name: str


class TransitReadingRequest(BaseModel):
    natal_chart: ChartResponse
    name: str
    transit_planets: list[TransitPlanet]


class TransitReadingResponse(BaseModel):
    reading: str
