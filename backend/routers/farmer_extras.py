from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_user
from models.db_models import Alert, FarmConsultation, Farmer

router = APIRouter(tags=["farmer"])


@router.get("/alerts")
def list_alerts(db: Session = Depends(get_db), user: Farmer = Depends(get_current_user)):
    rows = (
        db.query(Alert)
        .filter(Alert.farmer_id == user.id)
        .order_by(Alert.created_at.desc())
        .limit(50)
        .all()
    )
    return {"alerts": rows}


class AlertReadBody(BaseModel):
    is_read: bool = True


@router.put("/alerts/{alert_id}/read")
def mark_alert_read(
    alert_id: UUID,
    body: AlertReadBody,
    db: Session = Depends(get_db),
    user: Farmer = Depends(get_current_user),
):
    a = db.query(Alert).filter(Alert.id == alert_id, Alert.farmer_id == user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="තොරතුරු නැත")
    a.is_read = body.is_read
    db.commit()
    return {"ok": True}


@router.get("/consultations/recent")
def recent_consultations(
    limit: int = 10,
    db: Session = Depends(get_db),
    user: Farmer = Depends(get_current_user),
):
    rows = (
        db.query(FarmConsultation)
        .filter(FarmConsultation.farmer_id == user.id)
        .order_by(FarmConsultation.session_date.desc())
        .limit(limit)
        .all()
    )
    out = []
    for r in rows:
        out.append(
            {
                "id": str(r.id),
                "recommended_crop": r.recommended_crop,
                "confidence_score": r.confidence_score,
                "session_date": r.session_date.isoformat() if r.session_date else None,
                "has_chat": bool(r.chat_history),
            }
        )
    return {"consultations": out}
