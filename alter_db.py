import os
from sqlalchemy import text
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from backend.database import get_engine

engine = get_engine()
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE marketplace_products ADD COLUMN category VARCHAR(50) DEFAULT 'other';"))
        conn.commit()
        print("Column added successfully")
    except Exception as e:
        print(f"Error: {e}")
