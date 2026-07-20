from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_user
from models.db_models import DOAKnowledgeBase, FarmConsultation, Farmer
from services import weather_service
from services.opencode_service import opencode_chat_reply

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessageBody(BaseModel):
    message: str
    chat_history: List[Dict[str, str]] = []
    lat: Optional[float] = None
    lon: Optional[float] = None


def _doa_compact(db: Session, limit: int = 40) -> str:
    rows = db.query(DOAKnowledgeBase).limit(limit).all()
    lines = []
    for r in rows:
        lines.append(
            f"- {r.crop_name_sinhala}/{r.crop_name_english}: districts={r.suitable_districts}; "
            f"soil={r.soil_type}; season={r.season}; fertilizer={r.fertilizer_rec}; "
            f"pest={r.pest_info}; tips={r.planting_tips}"
        )
    return "\n".join(lines) if lines else ""


@router.post("/message")
async def chat_message(
    message: Optional[str] = Form(None),
    chat_history: Optional[str] = Form("[]"),
    lat: Optional[float] = Form(None),
    lon: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    user: Farmer = Depends(get_current_user),
):
    try:
        history = __import__("json").loads(chat_history or "[]")
        if not isinstance(history, list):
            raise ValueError("chat_history must be a list")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid chat_history format")

    weather_txt = "නොදන්නා"
    location_name = user.location or "ශ්‍රී ලංකාව"
    if lat is not None and lon is not None:
        try:
            geo = await weather_service.reverse_geocode(lat, lon)
            cw = await weather_service.fetch_current_weather(lat, lon)
            main = cw.get("main", {})
            rain = cw.get("rain", {}).get("1h") or 0
            weather_txt = (
                f"{main.get('temp')}°C, ආර්ද්‍රතාව {main.get('humidity')}%, "
                f"වර්ෂාපාතය ~{rain}mm"
            )
            location_name = str(geo.get("village") or location_name)
        except Exception:
            weather_txt = "කාලගුණ දත්ත ලබා ගැනීම අසමත්"

    message_text = message or "[Image attached]"
    image_b64 = None
    if image:
        content = await image.read()
        import base64
        image_b64 = base64.b64encode(content).decode('utf-8')
        history.append({"role": "user", "content": message_text, "image": f"uploaded:{image.filename}"})
    else:
        history.append({"role": "user", "content": message_text})

    doa_txt = _doa_compact(db)

    reply = await opencode_chat_reply(
        message_text,
        history,
        lat,
        lon,
        weather_txt,
        location_name,
        doa_txt,
        image_b64=image_b64,
        image_type=image.content_type if image else None,
    )

    updated = list(history)
    updated.append({"role": "assistant", "content": reply})

    row = FarmConsultation(
        farmer_id=user.id,
        chat_history=updated[-40:],
    )
    db.add(row)
    db.commit()

    return {"reply": reply, "updated_history": updated}
