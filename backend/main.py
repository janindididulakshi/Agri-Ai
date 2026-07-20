import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, get_engine, get_session_factory
from database_migrations import ensure_marketplace_product_columns
from routers import auth, chat, marketplace, predict, reports, weather, buyer_ai
from routers import farmer_extras
from seed_doa import seed_doa_if_empty

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    eng = get_engine()
    Base.metadata.create_all(bind=eng)
    ensure_marketplace_product_columns(eng)
    logger.info("Database tables ensured")
    Db = get_session_factory()
    db = Db()
    try:
        seed_doa_if_empty(db)
        logger.info("DOA knowledge seed checked")
    finally:
        db.close()
    yield


app = FastAPI(title="Smart Farm Intelligence API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins so Vercel can connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Smart Farm Intelligence API is running!"}


@app.get("/health")
def health():
    return {"status": "ok", "service": "smart-farm-ai"}


app.include_router(auth.router)
app.include_router(weather.router)
app.include_router(predict.router)
app.include_router(chat.router)
app.include_router(marketplace.router)
app.include_router(reports.router)
app.include_router(farmer_extras.router)
app.include_router(buyer_ai.router)
