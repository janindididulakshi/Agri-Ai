import os, sys
from database import get_session_factory
from models.db_models import Farmer
from deps import verify_password

SessionLocal = get_session_factory()
db = SessionLocal()

users = db.query(Farmer).all()
for u in users:
    print(f"User: {u.email}, ID: {u.id}, Password Hash: {u.password}")
    print("Test pass 123456:", verify_password("123456", u.password))
