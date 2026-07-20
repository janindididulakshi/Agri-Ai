import asyncio
from main import app

async def main():
    try:
        async with app.router.lifespan_context(app):
            print("lifespan entered successfully")
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
