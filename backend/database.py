import logging
import time

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()
_engine = None
SessionLocal = None


def init_engine():
    global _engine
    if _engine is not None:
        return _engine

    url = settings.DATABASE_URL.strip()
    if not url:
        logger.error("DATABASE_URL is empty — Supabase PostgreSQL is required.")
        raise RuntimeError("DATABASE_URL must be set for Supabase PostgreSQL.")

    _is_postgres = url.startswith("postgres") or url.startswith("postgresql") or "supabase" in url

    last_err = None
    for attempt in range(1, 4):
        try:
            pool_kwargs = {}
            if _is_postgres:
                pool_kwargs = {
                    "pool_size": 10,
                    "max_overflow": 10,
                    "pool_recycle": 300,
                }
            eng = create_engine(url, pool_pre_ping=True, echo=False, **pool_kwargs)
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            _engine = eng
            logger.info("Supabase PostgreSQL: connected OK (attempt %s/3)", attempt)
            print(f"[database] Supabase PostgreSQL connected (attempt {attempt}/3)")
            return _engine
        except Exception as e:
            last_err = e
            logger.warning("DB connection attempt %s/3 failed: %s", attempt, e)
            print(f"[database] Connection attempt {attempt}/3 failed: {e}")
            if attempt < 3:
                time.sleep(1.0)

    logger.error("Giving up after 3 attempts: %s", last_err)
    print(f"[database] FAILED after 3 attempts: {last_err}")
    raise RuntimeError(f"Cannot connect to Supabase PostgreSQL after 3 attempts: {last_err}") from last_err


def get_engine():
    return init_engine()


def get_session_factory():
    global SessionLocal
    if SessionLocal is None:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=init_engine())
    return SessionLocal


Base = declarative_base()


def get_db():
    DbSession = get_session_factory()
    db = DbSession()
    try:
        yield db
    finally:
        db.close()
