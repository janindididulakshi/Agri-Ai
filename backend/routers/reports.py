import io
from collections import Counter, defaultdict
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_user
from models.db_models import FarmConsultation, Farmer, MarketplaceOrder, WeatherLog

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/{farmer_id}/summary")
def report_summary_json(
    farmer_id: UUID,
    db: Session = Depends(get_db),
    user: Farmer = Depends(get_current_user),
):
    if user.id != farmer_id:
        raise HTTPException(status_code=403, detail="අනුමත නොවේ")

    consultations = (
        db.query(FarmConsultation).filter(FarmConsultation.farmer_id == farmer_id).all()
    )
    orders = db.query(MarketplaceOrder).filter(MarketplaceOrder.farmer_id == farmer_id).all()
    weather_logs = db.query(WeatherLog).filter(WeatherLog.farmer_id == farmer_id).all()

    crops = [c.recommended_crop for c in consultations if c.recommended_crop]
    top_crop = Counter(crops).most_common(1)[0][0] if crops else None

    sales_total = sum(float(o.total_price or 0) for o in orders)

    monthly = defaultdict(int)
    for c in consultations:
        if c.session_date:
            monthly[c.session_date.strftime("%Y-%m")] += 1

    weather_monthly_temp = defaultdict(list)
    for w in weather_logs:
        if w.recorded_at and w.temperature is not None:
            weather_monthly_temp[w.recorded_at.strftime("%Y-%m")].append(float(w.temperature))

    weather_chart = [
        {"month": k, "avg_temp": round(sum(v) / len(v), 2)}
        for k, v in sorted(weather_monthly_temp.items())[-12:]
    ]

    consult_chart = [{"month": k, "count": monthly[k]} for k in sorted(monthly.keys())[-12:]]

    return {
        "total_consultations": len(consultations),
        "top_crop": top_crop,
        "sales_total_lkr": sales_total,
        "consultations_by_month": consult_chart,
        "weather_avg_by_month": weather_chart,
        "weather_samples": len(weather_logs),
        "orders_count": len(orders),
    }


@router.get("/{farmer_id}/annual")
def annual_report(
    farmer_id: UUID,
    db: Session = Depends(get_db),
    user: Farmer = Depends(get_current_user),
):
    if user.id != farmer_id:
        raise HTTPException(status_code=403, detail="අනුමත නොවේ")

    consultations = (
        db.query(FarmConsultation).filter(FarmConsultation.farmer_id == farmer_id).all()
    )
    orders = db.query(MarketplaceOrder).filter(MarketplaceOrder.farmer_id == farmer_id).all()
    weather = db.query(WeatherLog).filter(WeatherLog.farmer_id == farmer_id).all()

    crops = [c.recommended_crop for c in consultations if c.recommended_crop]
    top_crop = Counter(crops).most_common(1)[0][0] if crops else "—"

    sales_total = sum(float(o.total_price or 0) for o in orders)

    monthly = defaultdict(int)
    for c in consultations:
        if c.session_date:
            key = c.session_date.strftime("%Y-%m")
            monthly[key] += 1

    pdf_buf = io.BytesIO()
    cnv = canvas.Canvas(pdf_buf, pagesize=A4)
    width, height = A4
    y = height - 40
    cnv.setTitle("Annual Farm Summary")

    def line(txt: str, dy: int = 16):
        nonlocal y
        cnv.drawString(40, y, txt[:120])
        y -= dy

    line(f"Smart Farm Intelligence — Annual Report ({datetime.utcnow().year})", 24)
    line(f"Farmer ID: {farmer_id}", 20)
    line(f"Total consultations: {len(consultations)}", 16)
    line(f"Most recommended crop: {top_crop}", 16)
    line(f"Marketplace sales total (LKR): {sales_total:.2f}", 16)
    line(f"Weather log samples: {len(weather)}", 16)
    line("", 12)
    line("Monthly consultations:", 16)
    for k in sorted(monthly.keys())[-12:]:
        line(f"  {k}: {monthly[k]}", 14)

    line("", 12)
    line("Next season: Continue crop diversification based on soil tests.", 16)

    cnv.showPage()
    cnv.save()
    pdf_buf.seek(0)

    filename = f"farm_report_{farmer_id}.pdf"
    return StreamingResponse(
        pdf_buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
