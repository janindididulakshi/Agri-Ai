# Stage 1: Build the React frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend

# Install dependencies and build
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Python backend and serve the application
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies required for machine learning libraries and PostgreSQL
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set the working directory to backend so Uvicorn can find modules properly
WORKDIR /app/backend

# Expose port (Railway provides $PORT dynamically)
EXPOSE 8000

# Start FastAPI and serve both API and frontend
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
