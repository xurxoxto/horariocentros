# ─────────────────────────────────────────────
# Stage 1: Build React/Vite frontend
# ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Python backend + built frontend
# ─────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Data directory for SQLite (mount a volume here for persistence)
RUN mkdir -p /data
ENV DATABASE_URL=sqlite:////data/horariocentros.db

EXPOSE 8000

# Use shell form so $PORT env var is resolved at runtime (required by Railway)
CMD uvicorn backend.api.main:app --host 0.0.0.0 --port ${PORT:-8000}
