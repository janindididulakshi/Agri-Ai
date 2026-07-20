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

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Determine the absolute path to the frontend/dist directory
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

# Mount the assets directory explicitly (Vite puts JS/CSS here)
assets_dir = os.path.join(dist_dir, "assets")
if os.path.isdir(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

# Catch-all route to serve the React SPA for any other paths (excluding API routes)
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    file_path = os.path.join(dist_dir, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    # Return index.html for client-side routing
    return FileResponse(os.path.join(dist_dir, "index.html"))
