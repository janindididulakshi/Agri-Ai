#!/usr/bin/env python
"""Create a test farmer account for development."""
import sys
sys.path.insert(0, '.')

from deps import create_access_token, hash_password
from database import get_session_factory
from models.db_models import Farmer
import uuid

db = get_session_factory()()
try:
    existing = db.query(Farmer).filter(Farmer.email == "test@example.com").first()
    if existing:
        print(f"[OK] Test user already exists: {existing.email}")
        user_id = existing.id
    else:
        user = Farmer(
            id=uuid.uuid4(),
            full_name="Test Farmer",
            email="test@example.com",
            password=hash_password("Test@123"),
            phone="0700123456",
            role="farmer",
            location="Kandy"
        )
        db.add(user)
        db.commit()
        print(f"[OK] Created test user: {user.email}")
        user_id = user.id
    
    token = create_access_token({"sub": str(user_id)})
    print(f"\nCredentials:")
    print(f"   Email: test@example.com")
    print(f"   Password: Test@123")
    print(f"\nToken: {token}")
    
finally:
    db.close()
