"""
Aplicación FastAPI principal.

Punto de entrada del servidor REST.
Ahora usa SQLite + SQLAlchemy para persistencia (Phase 3).
"""

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from datetime import datetime

from backend.api.routes import teachers, schedules, entities, xade, settings
from backend.api.schemas import HealthResponse, EntityCountsResponse
from backend.api.store import store

# Ruta al directorio de archivos estáticos del frontend
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"


# Crear app
app = FastAPI(
    title="Sistema de Generación Automática de Horarios",
    description="API REST para generación de horarios académicos con arquitectura limpia",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(teachers.router, prefix="/api/teachers", tags=["Teachers"])
app.include_router(entities.subjects_router, prefix="/api/subjects", tags=["Subjects"])
app.include_router(entities.groups_router, prefix="/api/groups", tags=["Groups"])
app.include_router(entities.rooms_router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(entities.time_slots_router, prefix="/api/time-slots", tags=["TimeSlots"])
app.include_router(entities.assignments_router, prefix="/api/assignments", tags=["Assignments"])
app.include_router(schedules.router, prefix="/api/schedules", tags=["Schedules"])
app.include_router(xade.router, prefix="/api/xade", tags=["XADE"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])


# ============================================================================
# RUTAS GENERALES
# ============================================================================

@app.get("/api/info", tags=["General"])
async def api_info():
    """Información de la API."""
    return {
        "message": "Sistema de Generación Automática de Horarios",
        "version": "0.2.0",
        "docs": "/docs",
        "status": "healthy"
    }


@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    """Verificar salud de la API."""
    summary = store.get_summary()
    
    return HealthResponse(
        status="healthy",
        version="0.2.0",
        database_connected=True,  # En futuro, verificar conexión real a BD
        entities=EntityCountsResponse(
            teachers=summary["teachers"],
            subjects=summary["subjects"],
            groups=summary["groups"],
            rooms=summary["rooms"],
            time_slots=summary["time_slots"],
            subject_assignments=summary["subject_assignments"],
            total_schedules_generated=0  # Será actualizado cuando conectemos BD
        )
    )


@app.get("/api/stats", tags=["General"])
async def get_stats():
    """Obtener estadísticas del sistema."""
    summary = store.get_summary()
    
    return {
        "timestamp": datetime.now(),
        "entities": summary,
        "api_version": "0.2.0"
    }


# ============================================================================
# MANEJO DE ERRORES
# ============================================================================

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Manejador para errores internos."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "Ocurrió un error interno en el servidor"
        }
    )


# ============================================================================
# SERVIR FRONTEND (archivos estáticos construidos con Vite)
# ============================================================================

if FRONTEND_DIR.exists():
    # Montar archivos estáticos (CSS, JS, imágenes)
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="static-assets")

    @app.get("/", include_in_schema=False)
    async def serve_root():
        """Servir index.html en la raíz."""
        return FileResponse(FRONTEND_DIR / "index.html")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        """Servir la aplicación frontend (SPA fallback)."""
        # No interceptar rutas de la API
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json") or full_path == "health":
            return JSONResponse(status_code=404, content={"error": "not_found"})
        # Intentar servir el archivo estático directamente
        file_path = FRONTEND_DIR / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        # Para cualquier otra ruta, devolver index.html (SPA routing)
        return FileResponse(FRONTEND_DIR / "index.html")

else:
    @app.get("/", tags=["General"])
    async def root_no_frontend():
        """Raíz sin frontend construido."""
        return {
            "message": "Sistema de Generación Automática de Horarios",
            "version": "0.2.0",
            "docs": "/docs",
            "note": "Frontend no construido. Ejecuta ./build.sh para construirlo."
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
