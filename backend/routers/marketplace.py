from datetime import date, datetime
from typing import Optional, Union
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_user
from models.db_models import Farmer, MarketplaceOrder, MarketplaceProduct

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


class ProductIn(BaseModel):
    crop_name: str
    quantity: float
    unit: str = "kg"
    price_per_unit: float
    photo_url: Optional[str] = None
    seller_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    harvest_date: Optional[datetime] = None
    is_available: bool = True


class ProductUpdate(BaseModel):
    crop_name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    price_per_unit: Optional[float] = None
    photo_url: Optional[str] = None
    seller_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    harvest_date: Optional[datetime] = None
    is_available: Optional[bool] = None


class OrderIn(BaseModel):
    product_id: UUID
    buyer_name: str
    buyer_phone: str
    buyer_address: Optional[str] = None
    quantity: float
    payment_method: str = "cod"


class OrderStatusBody(BaseModel):
    order_status: str


def _harvest_date_only(val: Optional[Union[date, datetime]]) -> Optional[date]:
    if val is None:
        return None
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    return None


@router.post("/products")
def create_product(
    body: ProductIn,
    db: Session = Depends(get_db),
    user: Farmer = Depends(get_current_user),
):
    try:
        p = MarketplaceProduct(
            farmer_id=user.id,
            crop_name=body.crop_name,
            quantity=body.quantity,
            unit=body.unit,
            price_per_unit=body.price_per_unit,
            photo_url=body.photo_url,
            seller_name=body.seller_name or user.full_name,
            description=body.description,
            location=body.location or user.location,
            harvest_date=_harvest_date_only(body.harvest_date),
            is_available=body.is_available,
        )
        db.add(p)
        db.commit()
        db.refresh(p)
        return {"id": str(p.id), "message": "එකතු කරන ලදී"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"වැරැද්ද: {str(e)}")


@router.get("/products")
def list_products(
    farmer_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
):
    q = db.query(MarketplaceProduct).filter(MarketplaceProduct.is_available == True)  # noqa: E712
    if farmer_id:
        q = q.filter(MarketplaceProduct.farmer_id == farmer_id)
    items = q.order_by(MarketplaceProduct.created_at.desc()).all()
    return {"products": items}


@router.get("/products/mine")
def my_products(db: Session = Depends(get_db), user: Farmer = Depends(get_current_user)):
    items = (
        db.query(MarketplaceProduct)
        .filter(MarketplaceProduct.farmer_id == user.id)
        .order_by(MarketplaceProduct.created_at.desc())
        .all()
    )
    return {"products": items}


@router.put("/products/{product_id}")
def update_product(
    product_id: UUID,
    body: ProductUpdate,
    db: Session = Depends(get_db),
    user: Farmer = Depends(get_current_user),
):
    p = db.query(MarketplaceProduct).filter(MarketplaceProduct.id == product_id).first()
    if not p or p.farmer_id != user.id:
        raise HTTPException(status_code=404, detail="නිෂ්පාදනය හමු නොවීය")
    data = body.model_dump(exclude_unset=True)
    if "harvest_date" in data and data["harvest_date"] is not None:
        data["harvest_date"] = _harvest_date_only(data["harvest_date"])
    for k, v in data.items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/products/{product_id}")
def delete_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    user: Farmer = Depends(get_current_user),
):
    p = db.query(MarketplaceProduct).filter(MarketplaceProduct.id == product_id).first()
    if not p or p.farmer_id != user.id:
        raise HTTPException(status_code=404, detail="නිෂ්පාදනය හමු නොවීය")
    db.delete(p)
    db.commit()
    return {"ok": True}


@router.post("/orders")
def create_order(body: OrderIn, db: Session = Depends(get_db)):
    try:
        prod = db.query(MarketplaceProduct).filter(MarketplaceProduct.id == body.product_id).first()
        if not prod or not prod.is_available:
            raise HTTPException(status_code=404, detail="නිෂ්පාදනය ලබා ගත නොහැක")
        if body.quantity <= 0 or body.quantity > prod.quantity:
            raise HTTPException(status_code=400, detail="ප්‍රමාණය වලංගු නොවේ")
        total = float(body.quantity) * float(prod.price_per_unit)
        pm = (body.payment_method or "cod").strip().lower()
        order = MarketplaceOrder(
            product_id=prod.id,
            farmer_id=prod.farmer_id,
            buyer_name=body.buyer_name,
            buyer_phone=body.buyer_phone,
            buyer_address=body.buyer_address,
            quantity=body.quantity,
            total_price=total,
            payment_method=pm,
            order_status="pending",
        )
        db.add(order)
        prod.quantity = float(prod.quantity) - float(body.quantity)
        if prod.quantity <= 0:
            prod.is_available = False
        db.commit()
        db.refresh(order)
        return {"order_id": str(order.id), "total_price": total}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/orders/farmer/{farmer_id}")
def farmer_orders(
    farmer_id: UUID,
    db: Session = Depends(get_db),
    user: Farmer = Depends(get_current_user),
):
    if user.id != farmer_id:
        raise HTTPException(status_code=403, detail="අනුමත නොවේ")
    orders = db.query(MarketplaceOrder).filter(MarketplaceOrder.farmer_id == farmer_id).all()
    return {"orders": orders}


@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: UUID,
    body: OrderStatusBody,
    db: Session = Depends(get_db),
    user: Farmer = Depends(get_current_user),
):
    o = db.query(MarketplaceOrder).filter(MarketplaceOrder.id == order_id).first()
    if not o or o.farmer_id != user.id:
        raise HTTPException(status_code=404, detail="ඇණවුම හමු නොවීය")
    o.order_status = body.order_status
    db.commit()
    return {"ok": True}


@router.get("/orders/track")
def track_order(
    phone: str = Query(...),
    order: UUID = Query(..., alias="order"),
    db: Session = Depends(get_db),
):
    o = (
        db.query(MarketplaceOrder)
        .filter(MarketplaceOrder.buyer_phone == phone, MarketplaceOrder.id == order)
        .first()
    )
    if not o:
        raise HTTPException(status_code=404, detail="ඇණවුම හමු නොවීය")
    return {"order": o}
