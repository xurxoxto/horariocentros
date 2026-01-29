"""
Aplicación FastAPI principal.

Punto de entrada del servidor REST.
Ahora usa SQLite + SQLAlchemy para persistencia (Phase 3).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime

from backend.api.routes import teachers, schedules, entities
from backend.api.schemas import HealthResponse, EntityCountsResponse
from backend.api.store import store


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


# ============================================================================
# RUTAS GENERALES
# ============================================================================

@app.get("/", tags=["General"])
async def root():
    """Raíz de la API."""
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

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Manejador para rutas no encontradas."""
    return JSONResponse(
        status_code=404,
        content={
            "error": "not_found",
            "message": f"La ruta {request.url.path} no existe",
            "docs": "/docs"
        }
    )


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
