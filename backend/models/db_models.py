import uuid

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, String, Text, func, text, JSON
from sqlalchemy.orm import relationship

from config import get_settings
from database import Base

# Choose DB-specific column types at import time so the models work with SQLite locally
settings = get_settings()
_db_url = (settings.DATABASE_URL or "").lower()
_is_postgres = _db_url.startswith("postgres") or _db_url.startswith("postgresql") or "supabase" in _db_url

if _is_postgres:
    from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
    JSON_TYPE = JSONB
    UUID_TYPE = PG_UUID
else:
    JSON_TYPE = JSON
    UUID_TYPE = String


class Farmer(Base):
    __tablename__ = "farmers"
    id = Column(
        UUID_TYPE(as_uuid=True) if _is_postgres else UUID_TYPE(36),
        primary_key=True,
        default=(uuid.uuid4 if _is_postgres else lambda: str(uuid.uuid4())),
        server_default=(text("gen_random_uuid()") if _is_postgres else None),
    )
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    phone = Column(String(20))
    role = Column(String(20), default="farmer")
    location = Column(String(100))
    photo_url = Column(Text)
    language = Column(String(10), default="si")
    theme = Column(String(20), default="green")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    consultations = relationship("FarmConsultation", back_populates="farmer")
    weather_logs = relationship("WeatherLog", back_populates="farmer")
    products = relationship("MarketplaceProduct", back_populates="farmer")
    orders = relationship("MarketplaceOrder", back_populates="farmer")
    alerts = relationship("Alert", back_populates="farmer")


class FarmConsultation(Base):
    __tablename__ = "farm_consultations"
    id = Column(
        UUID_TYPE(as_uuid=True) if _is_postgres else UUID_TYPE(36),
        primary_key=True,
        default=(uuid.uuid4 if _is_postgres else lambda: str(uuid.uuid4())),
        server_default=(text("gen_random_uuid()") if _is_postgres else None),
    )
    farmer_id = Column(
        UUID_TYPE(as_uuid=True) if _is_postgres else UUID_TYPE(36),
        ForeignKey("farmers.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    soil_type = Column(String(50))
    water_source = Column(String(50))
    recommended_crop = Column(String(100))
    confidence_score = Column(Float)
    weather_data = Column(JSON_TYPE)
    shap_values = Column(JSON_TYPE)
    fertilizer_rec = Column(Text)
    chat_history = Column(JSON_TYPE)
    session_date = Column(DateTime(timezone=True), server_default=func.now())

    farmer = relationship("Farmer", back_populates="consultations")


class WeatherLog(Base):
    __tablename__ = "weather_logs"
    id = Column(
        UUID_TYPE(as_uuid=True) if _is_postgres else UUID_TYPE(36),
        primary_key=True,
        default=(uuid.uuid4 if _is_postgres else lambda: str(uuid.uuid4())),
        server_default=(text("gen_random_uuid()") if _is_postgres else None),
    )
    farmer_id = Column(
        UUID_TYPE(as_uuid=True) if _is_postgres else UUID_TYPE(36),
        ForeignKey("farmers.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    location_name = Column(String(100))
    temperature = Column(Float)
    humidity = Column(Float)
    rainfall = Column(Float)
    wind_speed = Column(Float)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    farmer = relationship("Farmer", back_populates="weather_logs")


class MarketplaceProduct(Base):
    __tablename__ = "marketplace_products"
    id = Column(
        UUID_TYPE(as_uuid=True) if _is_postgres else UUID_TYPE(36),
        primary_key=True,
        default=(uuid.uuid4 if _is_postgres else lambda: str(uuid.uuid4())),
        server_default=(text("gen_random_uuid()") if _is_postgres else None),
    )
    farmer_id = Column(
        UUID_TYPE(as_uuid=True) if _is_postgres else UUID_TYPE(36),
        ForeignKey("farmers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    crop_name = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), default="kg")
    price_per_unit = Column(Float, nullable=False)
    photo_url = Column(Text)
    seller_name = Column(String(100))
    description = Column(Text)
    location = Column(String(100))
    harvest_date = Column(Date)
    is_available = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    farmer = relationship("Farmer", back_populates="products")


class MarketplaceOrder(Base):
    __tablename__ = "marketplace_orders"
    id = Column(
        UUID_TYPE(as_uuid=True) if _is_postgres else UUID_TYPE(36),
        primary_key=True,
        default=(uuid.uuid4 if _is_postgres else lambda: str(uuid.uuid4())),
        server_default=(text("gen_random_uuid()") if _is_postgres else None),
    )
    product_id = Column(
        UUID_TYPE(as_uuid=True) if _is_postgres else UUID_TYPE(36),
        ForeignKey("marketplace_products.id"),
        nullable=False,
        index=True,
    )
    farmer_id = Column(
        UUID_TYPE(as_uuid=True) if _is_postgres else UUID_TYPE(36),
        ForeignKey("farmers.id"),
        nullable=False,
        index=True,
    )
    buyer_name = Column(String(100))
    buyer_phone = Column(String(20), index=True)
    buyer_address = Column(Text)
    quantity = Column(Float)
    total_price = Column(Float)
    payment_method = Column(String(20), default="cod")
    order_status = Column(String(30), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    farmer = relationship("Farmer", back_populates="orders")


class Alert(Base):
    __tablename__ = "alerts"
    id = Column(
        UUID_TYPE(as_uuid=True) if _is_postgres else UUID_TYPE(36),
        primary_key=True,
        default=(uuid.uuid4 if _is_postgres else lambda: str(uuid.uuid4())),
        server_default=(text("gen_random_uuid()") if _is_postgres else None),
    )
    farmer_id = Column(
        UUID_TYPE(as_uuid=True) if _is_postgres else UUID_TYPE(36),
        ForeignKey("farmers.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    alert_type = Column(String(50))
    message = Column(Text)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    farmer = relationship("Farmer", back_populates="alerts")


class DOAKnowledgeBase(Base):
    __tablename__ = "doa_knowledge_base"
    id = Column(
        UUID_TYPE(as_uuid=True) if _is_postgres else UUID_TYPE(36),
        primary_key=True,
        default=(uuid.uuid4 if _is_postgres else lambda: str(uuid.uuid4())),
        server_default=(text("gen_random_uuid()") if _is_postgres else None),
    )
    crop_name_sinhala = Column(String(100))
    crop_name_english = Column(String(100))
    suitable_districts = Column(Text)
    soil_type = Column(String(100))
    season = Column(String(50))
    fertilizer_rec = Column(Text)
    pest_info = Column(Text)
    planting_tips = Column(Text)
