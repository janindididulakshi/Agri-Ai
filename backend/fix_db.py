import sqlalchemy as sa
import config
e = sa.create_engine(config.get_settings().DATABASE_URL)
with e.begin() as conn:
    print(conn.execute(sa.text("SELECT pg_cancel_backend(pid) FROM pg_stat_activity WHERE pid != pg_backend_pid() AND state = 'active'")).fetchall())
