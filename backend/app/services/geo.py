"""
Geocoding service — resolves city/country to lat/lon via Nominatim (no API key needed).
Falls back to the user-provided lat/lon if geocoding fails.
"""
import httpx

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "Khushtrology/1.0 (hello@khushtrology.com)"}


async def geocode(city: str, country: str) -> tuple[float, float]:
    query = f"{city}, {country}"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            NOMINATIM_URL,
            params={"q": query, "format": "json", "limit": 1},
            headers=HEADERS,
        )
        r.raise_for_status()
        results = r.json()
        if not results:
            raise ValueError(f"Could not geocode '{query}'. Please provide lat/lon manually.")
        lat = float(results[0]["lat"])
        lon = float(results[0]["lon"])
        return lat, lon
