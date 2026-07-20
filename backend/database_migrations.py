from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError


def ensure_marketplace_product_columns(engine):
    with engine.connect() as conn:
        for col_name, col_type in [
            ("seller_name", "VARCHAR(100)"),
            ("description", "TEXT"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE marketplace_products ADD COLUMN {col_name} {col_type}"))
            except ProgrammingError:
                # Column already exists or incompatible type; ignore if already present.
                conn.rollback()
            except Exception:
                conn.rollback()
