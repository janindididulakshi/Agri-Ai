from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_user_optional
from models.db_models import Alert, Farmer, WeatherLog
from services import weather_service

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/gps")
async def weather_gps(
    lat: float = Query(...),
    lon: float = Query(...),
    db: Session = Depends(get_db),
    current: Optional[Farmer] = Depends(get_current_user_optional),
):
    try:
        geo = await weather_service.reverse_geocode(lat, lon)
        cw = await weather_service.fetch_current_weather(lat, lon)
        fc = await weather_service.fetch_forecast(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"කාලගුණ දත්ත ලබා ගැනීමට බැරි විය: {str(e)}")

    main = cw.get("main", {})
    wind = cw.get("wind", {})
    rain = cw.get("rain", {}).get("1h") or cw.get("rain", {}).get("3h") or 0
    weather_icon = cw["weather"][0]["icon"] if cw.get("weather") else ""
    desc = cw["weather"][0]["description"] if cw.get("weather") else ""

    sys = cw.get("sys", {})
    sunrise = sys.get("sunrise")
    sunset = sys.get("sunset")

    temp = float(main.get("temp", 0))
    feels = float(main.get("feels_like", temp))
    humidity = float(main.get("humidity", 0))
    wind_speed = float(wind.get("speed", 0))

    alerts_si = weather_service.alerts_from_metrics(float(rain), temp, wind_speed, humidity)

    farmer_id = current.id if current else None
    if farmer_id and alerts_si:
        for msg in alerts_si:
            db.add(
                Alert(
                    farmer_id=farmer_id,
                    alert_type="weather",
                    message=msg,
                )
            )

    log = WeatherLog(
        farmer_id=farmer_id,
        location_name=str(geo.get("village")),
        temperature=temp,
        humidity=humidity,
        rainfall=float(rain),
        wind_speed=wind_speed,
        recorded_at=datetime.now(timezone.utc),
    )
    db.add(log)
    db.commit()

    forecast = weather_service.build_forecast_days(fc, days=7)

    return {
        "location": geo.get("village"),
        "display_name": geo.get("display_name"),
        "temperature_c": temp,
        "feels_like_c": feels,
        "humidity": humidity,
        "rainfall_mm": float(rain),
        "wind_speed_ms": wind_speed,
        "description": desc,
        "icon": weather_icon,
        "sunrise": sunrise,
        "sunset": sunset,
        "alerts": alerts_si,
        "forecast_7d": forecast,
    }
