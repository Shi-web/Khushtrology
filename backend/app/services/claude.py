"""
Groq AI service for generating astrological interpretations.
"""
from groq import Groq
from app.config import settings
from app.models.schemas import ChartResponse, TransitPlanet

client = Groq(api_key=settings.groq_api_key)

READING_PROMPTS = {
    "natal": (
        "You are a precise, gifted astrologer writing a deeply personal natal reading. "
        "Every statement you make MUST name the exact planet, sign, degree, and house from the chart provided — "
        "never speak in generalities that could apply to anyone. "
        "Cover: Sun (core identity), Moon (emotional world), Rising (outward persona), "
        "Mercury (mind and communication), Venus (love nature), Mars (drive and will), "
        "and at least one outer planet (Jupiter, Saturn, Uranus, Neptune, or Pluto) that stands out. "
        "Weave these placements into a coherent portrait of this specific person — "
        "their strengths, blind spots, and life themes. "
        "If you catch yourself writing something that could fit any chart, rewrite it to be chart-specific."
    ),
    "love": (
        "You are a precise, relationship-focused astrologer. "
        "Every statement MUST cite the exact sign, degree, and house from the chart provided. "
        "Analyze: Venus (what they love and how they attract), Mars (desire style and sexual energy), "
        "the 5th house cusp and any planets in it (romance, play, chemistry), "
        "the 7th house cusp and any planets in it (partnership patterns, the type of person they attract), "
        "and the Descendant sign (the mirror they seek in others). "
        "Translate these placements into real relationship behaviours — attachment style, what lights them up, "
        "patterns to watch for. Never write a sentence that could apply to someone with a different chart."
    ),
    "career": (
        "You are a precise vocational astrologer. "
        "Every statement MUST name the exact sign, degree, and house from the chart provided. "
        "Analyze: the Midheaven sign (public role and reputation), the 10th house ruler and its placement, "
        "Saturn (where discipline is required and mastery is earned), "
        "the 2nd house cusp (earning style and values around money), "
        "the 6th house cusp (daily work environment and routines), "
        "and any planets in the 10th house. "
        "Translate these into concrete career strengths, ideal environments, and potential pitfalls. "
        "Never write a sentence that could apply to someone with a different chart."
    ),
    "spiritual": (
        "You are a precise, spiritually-oriented astrologer. "
        "Every statement MUST name the exact sign, degree, and house from the chart provided. "
        "Analyze: the North Node sign and house (the soul's growth edge in this lifetime), "
        "the South Node sign and house (ingrained patterns and past-life gifts), "
        "any planets in the 12th house (hidden strengths, shadow material, contemplative gifts), "
        "Neptune's placement (where the transcendent and the illusory meet), "
        "and Pluto's placement (the arena of deep transformation). "
        "Offer specific spiritual practices, themes, and invitations that arise directly from these placements. "
        "Never write a sentence that could apply to someone with a different chart."
    ),
}


def _chart_to_text(chart: ChartResponse, name: str) -> str:
    lines = [f"Birth Chart for {name}:", ""]
    lines.append("PLANETARY POSITIONS:")
    for p in chart.planets:
        retro = " (Retrograde)" if p.retrograde else ""
        lines.append(f"  {p.name}: {p.sign} {p.degree}° — House {p.house}{retro}")

    lines.append("")
    lines.append("CHART ANGLES:")
    lines.append(f"  Ascendant (Rising): {chart.angles.ASC}")
    lines.append(f"  Midheaven (MC):     {chart.angles.MC}")
    lines.append(f"  Descendant:         {chart.angles.DSC}")
    lines.append(f"  IC:                 {chart.angles.IC}")

    lines.append("")
    lines.append("HOUSE CUSPS:")
    for i, cusp in enumerate(chart.house_cusps, 1):
        lines.append(f"  House {i:2d}: {cusp}")

    return "\n".join(lines)


TRANSIT_SYSTEM_PROMPT = (
    "You are a precise transit astrologer interpreting how today's planetary movements are activating "
    "a specific person's natal chart. You have been given today's planets placed into their natal houses. "
    "For each significant transit, name: the transiting planet, its current sign and degree, the natal house "
    "it occupies, and what that house rules for this person specifically (using their natal placements in that house if any). "
    "Focus on the 3–4 most meaningful transits — especially any outer planets (Jupiter, Saturn, Uranus, Neptune, Pluto) "
    "in personally sensitive houses (1st, 4th, 7th, 10th, 8th, 12th). "
    "Be specific: don't say 'Jupiter brings expansion' — say what expands, for whom, and why. "
    "Write in warm, direct prose. 3–4 paragraphs. Every sentence must be tied to a named planet, house, and natal placement."
)

HOUSE_DOMAINS = {
    1: "Self & Identity", 2: "Money & Values", 3: "Mind & Communication",
    4: "Home & Roots", 5: "Creativity & Romance", 6: "Health & Service",
    7: "Partnerships", 8: "Transformation", 9: "Expansion & Belief",
    10: "Career & Legacy", 11: "Community & Vision", 12: "Shadow & Spirit",
}


def _transits_to_text(transit_planets: list[TransitPlanet], natal_chart: ChartResponse, name: str) -> str:
    lines = [f"TODAY'S TRANSITS for {name} (placed in natal houses):", ""]
    for p in transit_planets:
        retro = " ℞" if p.retrograde else ""
        domain = HOUSE_DOMAINS.get(p.transit_house, "")
        house_label = f"House {p.transit_house} — {domain}" if p.transit_house else "Unknown House"
        lines.append(f"  {p.name}: {p.sign} {p.degree}°{retro}  →  {house_label}")
    lines.append("")
    lines.append(f"NATAL PLANETS for {name}:")
    for p in natal_chart.planets:
        retro = " (Retrograde)" if p.retrograde else ""
        lines.append(f"  {p.name}: {p.sign} {p.degree}° — House {p.house}{retro}")
    lines.append("")
    lines.append("NATAL ANGLES:")
    lines.append(f"  ASC: {natal_chart.angles.ASC}  |  MC: {natal_chart.angles.MC}")
    return "\n".join(lines)


def generate_transit_reading(natal_chart: ChartResponse, name: str, transit_planets: list[TransitPlanet]) -> str:
    chart_text = _transits_to_text(transit_planets, natal_chart, name)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=900,
        messages=[
            {"role": "system", "content": TRANSIT_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Write a transit reading for {name} based on these exact placements. "
                    "Name each transiting planet and the house it's moving through. "
                    "Cross-reference with the natal planets listed — what natal placements does this transit touch? "
                    "Make every sentence specific to this chart. 3–4 paragraphs, 350–450 words.\n\n"
                    f"{chart_text}"
                ),
            },
        ],
    )
    return response.choices[0].message.content


def generate_reading(chart: ChartResponse, name: str, reading_type: str) -> str:
    system_prompt = READING_PROMPTS.get(reading_type, READING_PROMPTS["natal"])
    chart_text = _chart_to_text(chart, name)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=800,
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": (
                    f"Here is the chart. Write a {reading_type} reading using ONLY the placements below — "
                    f"cite each planet, sign, degree, and house by name as you go:\n\n"
                    f"{chart_text}\n\n"
                    "Write in flowing, warm prose — like a personal letter from a wise astrologer. "
                    "No bullet points. 3 to 4 paragraphs, 300–400 words. "
                    "Every sentence must be specific to this chart; cut anything generic."
                ),
            },
        ],
    )
    return response.choices[0].message.content
