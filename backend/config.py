import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class Settings:
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    OPENCODE_API_KEY: str = os.getenv("OPENCODE_API_KEY", "")
    OPENCODE_MODEL: str = os.getenv("OPENCODE_MODEL", "").strip()
    OPENCODE_BASE_URL: str = os.getenv("OPENCODE_BASE_URL", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agri_local.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REACT_APP_API_URL: str = os.getenv("REACT_APP_API_URL", "http://localhost:8000")


@lru_cache
def get_settings() -> Settings:
    return Settings()
