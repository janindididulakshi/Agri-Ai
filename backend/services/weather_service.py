import logging
from typing import Any, Dict, List, Optional

import httpx

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def reverse_geocode(lat: float, lon: float) -> Dict[str, Any]:
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {"lat": lat, "lon": lon, "format": "json"}
    headers = {"User-Agent": "SmartFarmAI/1.0 (edu)"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(url, params=params, headers=headers)
        r.raise_for_status()
        data = r.json()
    addr = data.get("address") or {}
    village = (
        addr.get("village")
        or addr.get("town")
        or addr.get("suburb")
        or addr.get("city")
        or addr.get("hamlet")
        or addr.get("county")
        or "Unknown"
    )
    display = data.get("display_name") or str(village)
    return {"village": village, "display_name": display, "raw": data}


async def fetch_current_weather(lat: float, lon: float) -> Dict[str, Any]:
    if not settings.OPENWEATHER_API_KEY:
        raise ValueError("OPENWEATHER_API_KEY not configured")
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        return r.json()


async def fetch_forecast(lat: float, lon: float) -> Dict[str, Any]:
    if not settings.OPENWEATHER_API_KEY:
        raise ValueError("OPENWEATHER_API_KEY not configured")
    url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        return r.json()


def build_forecast_days(forecast_payload: Dict[str, Any], days: int = 7) -> List[Dict[str, Any]]:
    """Aggregate OpenWeather 3h list into daily-ish summaries (take ~8 slots per day)."""
    items = forecast_payload.get("list") or []
    by_day: Dict[str, List[Dict]] = {}
    for it in items:
        dt = it.get("dt_txt", "")[:10]
        if not dt:
            continue
        by_day.setdefault(dt, []).append(it)
    out = []
    for d in sorted(by_day.keys())[:days]:
        chunk = by_day[d]
        temps = [c["main"]["temp"] for c in chunk if "main" in c]
        rains = [
            (c.get("rain") or {}).get("3h", 0) + (c.get("snow") or {}).get("3h", 0)
            for c in chunk
        ]
        icons = [c["weather"][0]["icon"] for c in chunk if c.get("weather")]
        desc = chunk[0]["weather"][0]["description"] if chunk and chunk[0].get("weather") else ""
        out.append(
            {
                "date": d,
                "temp_min": min(temps) if temps else None,
                "temp_max": max(temps) if temps else None,
                "rain_mm": sum(rains) if rains else 0,
                "icon": icons[0] if icons else "",
                "description": desc,
            }
        )
    return out


def alerts_from_metrics(
    rainfall_mm: float, temp_c: float, wind_ms: float, humidity: float
) -> List[str]:
    msgs = []
    if rainfall_mm > 10:
        msgs.append("🌧️ වර්ෂාපාත අනතුරු")
    if temp_c > 35:
        msgs.append("🌡️ අධික උෂ්ණත්වය")
    if wind_ms > 40:
        msgs.append("💨 සැඩ සුළං")
    if humidity > 85:
        msgs.append("💧 අධික ආර්ද්‍රතා")
    return msgs
