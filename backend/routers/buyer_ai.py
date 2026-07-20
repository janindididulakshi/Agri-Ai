from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session
from database import get_db
from models.db_models import MarketplaceProduct
from services.opencode_service import opencode_chat_reply

router = APIRouter(prefix="/buyer-ai", tags=["buyer-ai"])

class BuyerChatMessage(BaseModel):
    message: str
    chat_history: List[Dict[str, str]] = []

@router.post("/message")
async def buyer_chat(body: BuyerChatMessage):
    # Public AI helper for buyers
    system_context = (
        "You are a helpful assistant for the Sri Lankan Agri Marketplace. "
        "Help buyers find products, understand prices, and seasonal availability. "
        "Answer in Sinhala if the user asks in Sinhala."
    )
    reply = await opencode_chat_reply(
        message=body.message,
        chat_history=body.chat_history,
        lat=None,
        lon=None,
        weather_context="N/A",
        location_name="Sri Lanka",
        doa_knowledge=system_context,
    )
    return {"reply": reply}

@router.get("/search")
def ai_smart_search(q: str, db: Session = Depends(get_db)):
    # Simple semantic search
    words = q.strip().split()
    if not words:
        return {"products": []}
    
    filters = []
    for w in words:
        filters.append(MarketplaceProduct.crop_name.ilike(f"%{w}%"))
        filters.append(MarketplaceProduct.location.ilike(f"%{w}%"))

    items = (
        db.query(MarketplaceProduct)
        .filter(MarketplaceProduct.is_available == True)
        .filter(or_(*filters))
        .limit(20)
        .all()
    )
    return {"products": items}