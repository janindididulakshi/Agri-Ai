from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from config import get_settings
from database import get_db
from models.db_models import Farmer

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

_BCRYPT_MAX = 72


def _utf8_bytes_72(s: str) -> bytes:
    b = s.encode("utf-8")
    return b[:_BCRYPT_MAX] if len(b) > _BCRYPT_MAX else b


def verify_password(plain: str, hashed: str) -> bool:
    if not plain or not hashed:
        return False
    try:
        return bcrypt.checkpw(_utf8_bytes_72(plain), hashed.encode("utf-8"))
    except (ValueError, AttributeError):
        return False


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_utf8_bytes_72(password), bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Farmer:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="පිවිසීම අවලංගුයි. නැවත login වන්න.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        user_id = UUID(str(sub))
    except (JWTError, ValueError, TypeError):
        raise credentials_exception
        
    from models.db_models import _is_postgres
    if _is_postgres:
        user = db.query(Farmer).filter(Farmer.id == user_id).first()
    else:
        user = db.query(Farmer).filter(Farmer.id == str(user_id)).first()
        
    if not user:
        raise credentials_exception
    return user


def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)),
) -> Optional[Farmer]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = UUID(str(payload.get("sub")))
        from models.db_models import _is_postgres
        if _is_postgres:
            return db.query(Farmer).filter(Farmer.id == user_id).first()
        else:
            return db.query(Farmer).filter(Farmer.id == str(user_id)).first()
    except Exception:
        return None
