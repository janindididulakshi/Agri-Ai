from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError


def ensure_marketplace_product_columns(engine):
    """Add any missing columns to marketplace_products.
    Each column gets its own connection so a failure (column already exists)
    doesn't corrupt the transaction state — important for PgBouncer transaction mode.
    """
    for col_name, col_type in [
        ("seller_name", "VARCHAR(100)"),
        ("description", "TEXT"),
    ]:
        try:
            with engine.begin() as conn:
                conn.execute(text(f"ALTER TABLE marketplace_products ADD COLUMN {col_name} {col_type}"))
        except (ProgrammingError, Exception):
            # Column already exists or table doesn't exist yet — safe to ignore
            pass
