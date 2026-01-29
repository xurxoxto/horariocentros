"""
Schemas Pydantic para validación y serialización de datos.

Define la estructura de request/response para la API REST.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime
from enum import Enum


class FreeHourPreferenceEnum(str, Enum):
    """Preferencias para ubicación de horas libres."""
    NO_PREFERENCE = "no_preference"
    FIRST_HOUR = "first_hour"
    LAST_HOUR = "last_hour"
    FIRST_AND_LAST = "first_and_last"
    MIDDLE_HOURS = "middle_hours"
    CONSECUTIVE = "consecutive"
    SPECIFIC_HOURS = "specific_hours"


# ============================================================================
# SCHEMAS DE ENTIDADES
# ============================================================================

class TeacherCreate(BaseModel):
    """Schema para crear un profesor."""
    name: str = Field(..., min_length=1, max_length=255, description="Nombre del profesor")
    max_hours_per_day: Optional[int] = Field(None, ge=1, description="Máximo de horas por día")
    max_hours_per_week: Optional[int] = Field(None, ge=1, description="Máximo de horas por semana")
    prefer_consecutive_free_hours: bool = Field(False, description="Prefiere horas libres juntas")
    free_hour_preference: FreeHourPreferenceEnum = Field(FreeHourPreferenceEnum.NO_PREFERENCE, description="Preferencia de ubicación de horas libres")
    preferred_free_hours: List[int] = Field(default_factory=list, description="Horas específicas preferidas para libres (1-7)")
    guard_hours: int = Field(0, ge=0, description="Horas de guardia semanales")
    break_guard_hours: int = Field(0, ge=0, description="Horas de guardia de recreo semanales")
    support_hours: int = Field(0, ge=0, description="Horas de apoyo semanales")
    coordination_hours: int = Field(0, ge=0, description="Horas de coordinación semanales")
    management_hours: int = Field(0, ge=0, description="Horas de equipo directivo semanales")
    no_coordination_next_to_free: bool = Field(False, description="Coordinación no puede ir junto a hora libre")


class TeacherUpdate(BaseModel):
    """Schema para actualizar un profesor."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    max_hours_per_day: Optional[int] = Field(None, ge=1)
    max_hours_per_week: Optional[int] = Field(None, ge=1)
    prefer_consecutive_free_hours: Optional[bool] = None
    free_hour_preference: Optional[FreeHourPreferenceEnum] = None
    preferred_free_hours: Optional[List[int]] = None
    guard_hours: Optional[int] = Field(None, ge=0)
    break_guard_hours: Optional[int] = Field(None, ge=0)
    support_hours: Optional[int] = Field(None, ge=0)
    coordination_hours: Optional[int] = Field(None, ge=0)
    management_hours: Optional[int] = Field(None, ge=0)
    no_coordination_next_to_free: Optional[bool] = None


class TeacherResponse(BaseModel):
    """Schema para respuesta de profesor."""
    id: UUID
    name: str
    max_hours_per_day: Optional[int] = None
    max_hours_per_week: Optional[int] = None
    prefer_consecutive_free_hours: bool = False
    free_hour_preference: str = "no_preference"
    preferred_free_hours: List[int] = Field(default_factory=list)
    guard_hours: int = 0
    break_guard_hours: int = 0
    support_hours: int = 0
    coordination_hours: int = 0
    management_hours: int = 0
    no_coordination_next_to_free: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


class SubjectCreate(BaseModel):
    """Schema para crear una asignatura."""
    name: str = Field(..., min_length=1, max_length=255, description="Nombre de la asignatura")
    code: str = Field(..., min_length=1, max_length=50, description="Código único")
    hours_per_week: int = Field(..., ge=1, description="Horas semanales")
    requires_lab: bool = Field(False, description="¿Requiere laboratorio?")
    excluded_room_ids: List[UUID] = Field(default_factory=list, description="IDs de aulas donde NO puede impartirse")


class SubjectUpdate(BaseModel):
    """Schema para actualizar una asignatura."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    hours_per_week: Optional[int] = Field(None, ge=1)
    requires_lab: Optional[bool] = None
    excluded_room_ids: Optional[List[UUID]] = None


class SubjectResponse(BaseModel):
    """Schema para respuesta de asignatura."""
    id: UUID
    name: str
    code: str
    hours_per_week: int
    requires_lab: bool
    excluded_room_ids: List[UUID] = Field(default_factory=list)
    created_at: datetime
    
    class Config:
        from_attributes = True


class GroupCreate(BaseModel):
    """Schema para crear un grupo."""
    name: str = Field(..., min_length=1, max_length=255, description="Nombre del grupo (ej: 1º ESO A)")
    level: str = Field(..., min_length=1, max_length=100, description="Nivel educativo (ej: ESO)")
    num_students: int = Field(..., ge=1, description="Número de estudiantes")


class GroupUpdate(BaseModel):
    """Schema para actualizar un grupo."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    level: Optional[str] = Field(None, min_length=1, max_length=100)
    num_students: Optional[int] = Field(None, ge=1)


class GroupResponse(GroupCreate):
    """Schema para respuesta de grupo."""
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class RoomCreate(BaseModel):
    """Schema para crear un aula."""
    name: str = Field(..., min_length=1, max_length=255, description="Nombre/número del aula")
    capacity: int = Field(..., ge=1, description="Capacidad máxima")
    room_type: str = Field("standard", description="Tipo de aula (standard, laboratory, etc.)")


class RoomUpdate(BaseModel):
    """Schema para actualizar un aula."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    capacity: Optional[int] = Field(None, ge=1)
    room_type: Optional[str] = None


class RoomResponse(RoomCreate):
    """Schema para respuesta de aula."""
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class TimeSlotCreate(BaseModel):
    """Schema para crear una franja horaria."""
    day: int = Field(..., ge=0, le=6, description="Día (0=lunes, 6=domingo)")
    start_hour: int = Field(..., ge=0, le=23, description="Hora de inicio")
    start_minute: int = Field(..., ge=0, le=59, description="Minuto de inicio")
    duration_minutes: int = Field(..., ge=30, description="Duración en minutos")


class TimeSlotUpdate(BaseModel):
    """Schema para actualizar una franja horaria."""
    day: Optional[int] = Field(None, ge=0, le=6)
    start_hour: Optional[int] = Field(None, ge=0, le=23)
    start_minute: Optional[int] = Field(None, ge=0, le=59)
    duration_minutes: Optional[int] = Field(None, ge=30)


class TimeSlotResponse(TimeSlotCreate):
    """Schema para respuesta de franja horaria."""
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class SubjectAssignmentCreate(BaseModel):
    """Schema para crear una asignación profesor-asignatura-grupo."""
    teacher_id: UUID = Field(..., description="ID del profesor")
    subject_id: UUID = Field(..., description="ID de la asignatura")
    group_id: UUID = Field(..., description="ID del grupo")


class SubjectAssignmentResponse(SubjectAssignmentCreate):
    """Schema para respuesta de asignación."""
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE GENERACIÓN DE HORARIOS
# ============================================================================

class LessonResponse(BaseModel):
    """Schema para respuesta de lección asignada."""
    id: UUID
    teacher_id: UUID
    subject_id: UUID
    group_id: UUID
    room_id: UUID
    time_slot_id: UUID


class ScheduleGenerationRequest(BaseModel):
    """Schema para solicitar generación de horario."""
    center_name: str = Field(..., min_length=1, description="Nombre del centro educativo")
    max_iterations: int = Field(10000, ge=100, description="Máximo de iteraciones del algoritmo")
    timeout_seconds: int = Field(300, ge=10, description="Tiempo máximo de generación en segundos")


class ConstraintViolation(BaseModel):
    """Schema para reporte de violación de restricción."""
    constraint: str
    description: str


class ScheduleEvaluationResponse(BaseModel):
    """Schema para evaluación de restricciones."""
    is_valid: bool = Field(..., description="¿El horario es válido?")
    total_cost: float = Field(..., description="Coste total")
    hard_violations: List[str] = Field(..., description="Restricciones duras violadas")
    soft_costs: Dict[str, float] = Field(..., description="Costes de restricciones blandas")


class ScheduleResponse(BaseModel):
    """Schema para respuesta de horario generado."""
    id: UUID
    center_name: str
    lessons: List[LessonResponse]
    evaluation: ScheduleEvaluationResponse
    created_at: datetime
    
    class Config:
        from_attributes = True


class ScheduleListResponse(BaseModel):
    """Schema para lista de horarios."""
    total: int
    schedules: List[ScheduleResponse]


class TeacherScheduleResponse(BaseModel):
    """Schema para horario de un profesor."""
    teacher_id: UUID
    teacher_name: str
    lessons: List[LessonResponse]
    total_hours: int
    days_with_classes: int


class GroupScheduleResponse(BaseModel):
    """Schema para horario de un grupo."""
    group_id: UUID
    group_name: str
    lessons: List[LessonResponse]
    total_hours: int


# ============================================================================
# SCHEMAS DE ESTADÍSTICAS
# ============================================================================

class EntityCountsResponse(BaseModel):
    """Schema para conteos de entidades."""
    teachers: int
    subjects: int
    groups: int
    rooms: int
    time_slots: int
    subject_assignments: int
    total_schedules_generated: int


class HealthResponse(BaseModel):
    """Schema para estado de salud de la API."""
    status: str = Field(..., description="Estado de la API (healthy, degraded, unhealthy)")
    version: str = Field(..., description="Versión de la API")
    database_connected: bool = Field(..., description="¿Base de datos conectada?")
    entities: EntityCountsResponse = Field(..., description="Conteo de entidades")


# ============================================================================
# SCHEMAS DE ERRORES
# ============================================================================

class ErrorResponse(BaseModel):
    """Schema para respuesta de error."""
    error: str = Field(..., description="Tipo de error")
    message: str = Field(..., description="Mensaje de error")
    detail: Optional[str] = Field(None, description="Detalles adicionales")


class ValidationErrorResponse(BaseModel):
    """Schema para errores de validación."""
    error: str = "validation_error"
    message: str = "Error en la validación de datos"
    errors: List[Dict] = Field(..., description="Detalles de cada error")
