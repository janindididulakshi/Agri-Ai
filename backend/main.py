import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
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

_executor = ThreadPoolExecutor(max_workers=1)


def _run_db_init():
    """Run synchronous DB init using a dedicated connection, not the main pool."""
    import os
    from sqlalchemy import create_engine, text
    from sqlalchemy.pool import NullPool
    try:
        url = os.environ.get("DATABASE_URL", "").strip()
        if not url:
            return
        is_pg = url.startswith("postgres")
        connect_args = {}
        if is_pg:
            connect_args = {
                "sslmode": "require", "connect_timeout": 15,
                "keepalives": 1, "keepalives_idle": 30,
                "keepalives_interval": 5, "keepalives_count": 3,
            }
        # NullPool: each operation opens/closes its own connection — zero pool pressure
        init_eng = create_engine(url, poolclass=NullPool, connect_args=connect_args)
        with init_eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        # Run migrations on the dedicated engine
        Base.metadata.create_all(bind=init_eng, checkfirst=True)
        ensure_marketplace_product_columns(init_eng)
        logger.info("Database tables ensured (init engine)")
        # Seed using the dedicated engine session
        from sqlalchemy.orm import sessionmaker
        InitSession = sessionmaker(bind=init_eng)
        db = InitSession()
        try:
            seed_doa_if_empty(db)
            logger.info("DOA knowledge seed checked")
        finally:
            db.close()
        init_eng.dispose()
    except Exception as e:
        logger.error("DB init error (non-fatal): %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run DB init in background using a dedicated engine (does NOT block the main pool)
    loop = asyncio.get_event_loop()
    loop.run_in_executor(_executor, _run_db_init)
    logger.info("DB initialization running in background")
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
_API_PREFIXES = ("auth", "marketplace", "weather", "predict", "chat", "reports", "farmer", "buyer", "health", "docs", "openapi", "redoc")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Don't intercept API routes
    if full_path.split("/")[0] in _API_PREFIXES:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Not found")
    file_path = os.path.join(dist_dir, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # If the missing file is an asset (JS, CSS, images, etc.), return 404 so it doesn't silently return HTML
    if full_path.startswith("assets/") or full_path.endswith((".js", ".css", ".png", ".jpg", ".map", ".json", ".ico")):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Asset not found")

    # Return index.html for client-side routing
    index_path = os.path.join(dist_dir, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    from fastapi.responses import JSONResponse
    return JSONResponse({"message": "Smart Farm API running"}, status_code=200)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
