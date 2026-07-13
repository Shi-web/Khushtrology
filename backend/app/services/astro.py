"""
Astrology calculation service using pyswisseph.
Converts birth data → planetary positions, house cusps, angles.
"""
import swisseph as swe
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Optional
from app.models.schemas import Planet, Angles, ChartResponse

# Planets to calculate (id, display name)
PLANETS = [
    (swe.SUN,     "Sun"),
    (swe.MOON,    "Moon"),
    (swe.MERCURY, "Mercury"),
    (swe.VENUS,   "Venus"),
    (swe.MARS,    "Mars"),
    (swe.JUPITER, "Jupiter"),
    (swe.SATURN,  "Saturn"),
    (swe.URANUS,  "Uranus"),
    (swe.NEPTUNE, "Neptune"),
    (swe.PLUTO,   "Pluto"),
]

ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

HOUSE_SYSTEM_CODES = {
    "P": b"P",  # Placidus
    "W": b"W",  # Whole sign
    "K": b"K",  # Koch
    "E": b"E",  # Equal house
}

SIGN_OFFSETS = {
    "Aries": 0, "Taurus": 30, "Gemini": 60, "Cancer": 90,
    "Leo": 120, "Virgo": 150, "Libra": 180, "Scorpio": 210,
    "Sagittarius": 240, "Capricorn": 270, "Aquarius": 300, "Pisces": 330,
}


def _degree_to_sign_degree(longitude: float) -> tuple[str, float]:
    sign_index = int(longitude // 30)
    degree = longitude % 30
    return ZODIAC_SIGNS[sign_index % 12], round(degree, 2)


def _jd_from_datetime(dt: datetime) -> float:
    return swe.julday(
        dt.year, dt.month, dt.day,
        dt.hour + dt.minute / 60.0 + dt.second / 3600.0,
        swe.GREG_CAL,
    )


def _house_for_planet(longitude: float, cusps: list[float]) -> int:
    # cusps[i] (0-indexed) is the cusp of house i+1
    for i in range(12):
        start = cusps[i]
        end = cusps[(i + 1) % 12]
        in_range = (
            start <= longitude < end
            if start <= end
            else (longitude >= start or longitude < end)
        )
        if in_range:
            return i + 1
    return 12


def _parse_cusp_string(cusp_str: str) -> float:
    """'Aries 15.3°' → 15.3  |  'Taurus 5.0°' → 35.0"""
    parts = cusp_str.split()
    sign = parts[0]
    degree = float(parts[1].rstrip("°"))
    return SIGN_OFFSETS[sign] + degree


def calculate_current_transits() -> list[dict]:
    from datetime import timezone as tz
    now = datetime.now(tz.utc)
    jd = _jd_from_datetime(now)
    result = []
    for pid, pname in PLANETS:
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED
        calc_result, _ = swe.calc_ut(jd, pid, flags)
        lon = calc_result[0]
        speed = calc_result[3]
        sign, degree = _degree_to_sign_degree(lon)
        result.append({
            "name": pname,
            "sign": sign,
            "degree": degree,
            "retrograde": speed < 0,
            "longitude": round(lon, 4),
        })
    return result


def place_in_transit_houses(transit_planets: list[dict], cusp_strings: list[str]) -> list[dict]:
    cusps = [_parse_cusp_string(c) for c in cusp_strings]
    return [{**tp, "transit_house": _house_for_planet(tp["longitude"], cusps)} for tp in transit_planets]


def calculate_chart(
    date: str,
    time: str,
    lat: float,
    lon: float,
    house_system: str = "P",
    timezone: str = "UTC",
) -> ChartResponse:
    local_dt = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    local_dt = local_dt.replace(tzinfo=ZoneInfo(timezone))
    utc_dt = local_dt.astimezone(ZoneInfo("UTC"))
    jd = _jd_from_datetime(utc_dt)

    hs_code = HOUSE_SYSTEM_CODES.get(house_system, b"P")
    cusps_raw, ascmc = swe.houses(jd, lat, lon, hs_code)
    cusps = list(cusps_raw)  # cusps[i] (0-indexed) is the cusp of house i+1

    planets: list[Planet] = []
    for pid, pname in PLANETS:
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED
        result, _ = swe.calc_ut(jd, pid, flags)
        lon_deg = result[0]
        speed = result[3]
        sign, degree = _degree_to_sign_degree(lon_deg)
        house = _house_for_planet(lon_deg, cusps)
        planets.append(Planet(
            name=pname,
            sign=sign,
            degree=degree,
            house=house,
            retrograde=speed < 0,
        ))

    def fmt_angle(lon_deg: float) -> str:
        s, d = _degree_to_sign_degree(lon_deg)
        return f"{s} {d}°"

    asc_lon = ascmc[0]
    mc_lon  = ascmc[1]
    angles = Angles(
        ASC=fmt_angle(asc_lon),
        MC=fmt_angle(mc_lon),
        DSC=fmt_angle((asc_lon + 180) % 360),
        IC=fmt_angle((mc_lon  + 180) % 360),
    )

    house_cusps = [fmt_angle(c) for c in cusps]

    sun_planet  = next(p for p in planets if p.name == "Sun")
    moon_planet = next(p for p in planets if p.name == "Moon")
    asc_sign, _ = _degree_to_sign_degree(asc_lon)

    return ChartResponse(
        planets=planets,
        angles=angles,
        house_cusps=house_cusps,
        sun_sign=sun_planet.sign,
        moon_sign=moon_planet.sign,
        rising_sign=asc_sign,
    )
