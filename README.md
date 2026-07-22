# Agri AI System

AI-powered farming platform for Sri Lankan agriculture. Includes a farmer PWA, a buyer marketplace, and a FastAPI backend with weather, ML predictions, AI chat, and PDF report generation.

## Project Structure

| Directory | Purpose | Port |
|---|---|---|
| `backend/` | FastAPI Python API (auth, weather, ML, AI chat, marketplace, PDF reports) | 8000 |
| `frontend/` | Farmer PWA "Govi AI" (dashboard, weather, chat, predictions, marketplace) | 3000 |

## Prerequisites

- **Python 3.10+** and **pip**
- **Node.js 18+** and **npm**
- API keys (see `.env` files):
  - `OPENCODE_API_KEY` — OpenCode Zen (get at https://opencode.ai/auth)
  - `OPENCODE_MODEL` — Model name (default: `deepseek-v4-flash-free`)
  - `OPENWEATHER_API_KEY` — OpenWeatherMap
  - `DATABASE_URL` — Supabase PostgreSQL (or falls back to SQLite)
  - `SECRET_KEY` — JWT signing

## Running the Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000

```

The API is served at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

## Running the Farmer Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:3000`.

## Running All Together

Start two terminals:

1. `cd backend && uvicorn main:app --reload --port 8000`
2. `cd frontend && npm run dev`

The frontend expects the backend at `http://localhost:8000` (set via `VITE_API_URL` in its `.env` file).
