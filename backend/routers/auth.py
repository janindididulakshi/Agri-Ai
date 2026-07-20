from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from config import get_settings
from database import get_db
from deps import create_access_token, get_current_user, hash_password, verify_password
from models.db_models import Farmer

router = APIRouter(prefix="/auth", tags=["auth"])

settings = get_settings()


class RegisterBody(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    phone: Optional[str] = None
    role: str = "farmer"
    location: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    phone: Optional[str]
    role: str
    location: Optional[str]
    photo_url: Optional[str]
    language: str
    theme: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


@router.post("/register", response_model=dict)
def register(body: RegisterBody, db: Session = Depends(get_db)):
    try:
        email_norm = str(body.email).lower().strip()
        exists = db.query(Farmer).filter(func.lower(Farmer.email) == email_norm).first()
        if exists:
            raise HTTPException(status_code=400, detail="මෙම විද්‍යුත් තැපෑල දැනටමත් ලියාපදිංචි වී ඇත.")
        user = Farmer(
            full_name=body.full_name.strip(),
            email=email_norm,
            password=hash_password(body.password),
            phone=(body.phone.strip() if body.phone else None),
            role=(body.role or "farmer").strip(),
            location=(body.location.strip() if body.location else None),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        token = create_access_token({"sub": str(user.id)})
        data = UserOut.model_validate(user).model_dump(mode="json")
        return {"access_token": token, "token_type": "bearer", "user": data}
    except HTTPException:
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="මෙම විද්‍යුත් තැපෑල දැනටමත් ලියාපදිංචි වී ඇත.",
        )
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="ලියාපදිංචිය අසාර්ථකයි. නැවත උත්සාහ කරන්න.")


class LoginJsonBody(BaseModel):
    email: EmailStr
    password: str


@router.post("/login-json", response_model=dict)
def login_json(body: LoginJsonBody, db: Session = Depends(get_db)):
    email_norm = str(body.email).lower().strip()
    user = db.query(Farmer).filter(func.lower(Farmer.email) == email_norm).first()
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="විද්‍යුත් තැපෑල හෝ මුරපදය වැරදියි.",
        )
    token = create_access_token({"sub": str(user.id)})
    data = UserOut.model_validate(user).model_dump(mode="json")
    return {"access_token": token, "token_type": "bearer", "user": data}


@router.post("/login", response_model=dict)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    username_norm = (form_data.username or "").lower().strip()
    user = db.query(Farmer).filter(func.lower(Farmer.email) == username_norm).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="විද්‍යුත් තැපෑල හෝ මුරපදය වැරදියි.",
        )
    token = create_access_token({"sub": str(user.id)})
    data = UserOut.model_validate(user).model_dump(mode="json")
    return {"access_token": token, "token_type": "bearer", "user": data}


@router.get("/profile", response_model=UserOut)
def profile(current: Farmer = Depends(get_current_user)):
    return current


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    language: Optional[str] = None
    theme: Optional[str] = None
    photo_url: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


@router.patch("/profile", response_model=UserOut)
def patch_profile(
    body: ProfileUpdate,
    db: Session = Depends(get_db),
    current: Farmer = Depends(get_current_user),
):
    try:
        data = body.model_dump(exclude_unset=True)
        for k, v in data.items():
            setattr(current, k, v)
        db.commit()
        db.refresh(current)
        return current
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="පැතිකඩ යාවත්කාලීන කිරීම අසාර්ථකයි.")


@router.post("/password")
def change_password(
    body: PasswordChange,
    db: Session = Depends(get_db),
    current: Farmer = Depends(get_current_user),
):
    if not verify_password(body.current_password, current.password):
        raise HTTPException(status_code=400, detail="වර්තමාන මුරපදය වැරදියි.")
    try:
        current.password = hash_password(body.new_password)
        db.commit()
        return {"ok": True}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="මුරපදය වෙනස් කිරීම අසාර්ථකයි.")
