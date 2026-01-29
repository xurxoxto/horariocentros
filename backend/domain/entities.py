"""
Modelos de dominio puros - Sin dependencias de frameworks.

Estos modelos representan las entidades fundamentales del negocio:
- Teacher: Profesor
- Subject: Asignatura
- Group: Grupo/clase de estudiantes
- Room: Aula física
- TimeSlot: Franja horaria (día + hora)

Principios:
1. Inmutabilidad donde sea posible (usar dataclasses frozen)
2. Validación en el constructor
3. Sin lógica de persistencia
4. Sin dependencias de FastAPI o SQLAlchemy
"""

from dataclasses import dataclass, field
from typing import Optional, Set
from enum import Enum
from uuid import uuid4, UUID


class DayOfWeek(Enum):
    """Días de la semana (lunes = 0)."""
    MONDAY = 0
    TUESDAY = 1
    WEDNESDAY = 2
    THURSDAY = 3
    FRIDAY = 4
    SATURDAY = 5
    SUNDAY = 6


class RoomType(Enum):
    """Tipos de aulas."""
    STANDARD = "standard"
    LABORATORY = "laboratory"
    COMPUTER_LAB = "computer_lab"
    GYM = "gym"
    AUDITORIUM = "auditorium"


@dataclass(frozen=True)
class TimeSlot:
    """
    Representa una franja horaria específica.
    
    Ejemplos:
    - Lunes 8:00-9:00
    - Martes 10:30-12:00
    
    Atributos:
        id: Identificador único
        day: Día de la semana
        start_hour: Hora de inicio (0-23)
        start_minute: Minuto de inicio (0-59)
        duration_minutes: Duración en minutos
    """
    id: UUID
    day: DayOfWeek
    start_hour: int
    start_minute: int
    duration_minutes: int
    
    def __post_init__(self):
        """Validación de datos."""
        if not 0 <= self.start_hour <= 23:
            raise ValueError(f"start_hour debe estar entre 0 y 23, recibido: {self.start_hour}")
        if not 0 <= self.start_minute <= 59:
            raise ValueError(f"start_minute debe estar entre 0 y 59, recibido: {self.start_minute}")
        if self.duration_minutes <= 0:
            raise ValueError(f"duration_minutes debe ser positivo, recibido: {self.duration_minutes}")
    
    @property
    def end_hour(self) -> int:
        """Calcula la hora de finalización."""
        total_minutes = self.start_hour * 60 + self.start_minute + self.duration_minutes
        return total_minutes // 60
    
    @property
    def end_minute(self) -> int:
        """Calcula el minuto de finalización."""
        total_minutes = self.start_hour * 60 + self.start_minute + self.duration_minutes
        return total_minutes % 60
    
    def __str__(self) -> str:
        return f"{self.day.name} {self.start_hour:02d}:{self.start_minute:02d}-{self.end_hour:02d}:{self.end_minute:02d}"


class HourType(Enum):
    """Tipos de horas especiales para profesores."""
    TEACHING = "teaching"           # Hora de docencia normal
    FREE = "free"                   # Hora libre
    GUARD = "guard"                 # Guardia
    BREAK_GUARD = "break_guard"     # Guardia de recreo
    SUPPORT = "support"             # Apoyo
    COORDINATION = "coordination"   # Coordinación
    MANAGEMENT = "management"       # Equipo directivo


class FreeHourPreference(Enum):
    """Preferencias para ubicación de horas libres."""
    NO_PREFERENCE = "no_preference"           # Sin preferencia
    FIRST_HOUR = "first_hour"                 # A primera hora
    LAST_HOUR = "last_hour"                   # A última hora
    FIRST_AND_LAST = "first_and_last"         # A primera y última hora
    MIDDLE_HOURS = "middle_hours"             # En horas intermedias
    CONSECUTIVE = "consecutive"               # Juntas/consecutivas
    SPECIFIC_HOURS = "specific_hours"         # En horas específicas (se define aparte)


@dataclass
class Teacher:
    """
    Representa un profesor.
    
    Atributos:
        id: Identificador único
        name: Nombre completo
        max_hours_per_day: Máximo de horas diarias (opcional)
        max_hours_per_week: Máximo de horas semanales (opcional)
        unavailable_slots: Franjas donde NO está disponible
        prefer_consecutive_free_hours: Si prefiere las horas libres juntas
        free_hour_preference: Preferencia de ubicación de horas libres
        preferred_free_hours: Lista de horas preferidas para las libres (1-7, donde 1=primera hora)
        guard_hours: Número de horas de guardia semanales
        break_guard_hours: Número de horas de guardia de recreo semanales
        support_hours: Número de horas de apoyo semanales
        coordination_hours: Número de horas de coordinación semanales
        management_hours: Número de horas de equipo directivo semanales
        no_coordination_next_to_free: Coordinación no puede ir junto a hora libre
    """
    id: UUID
    name: str
    max_hours_per_day: Optional[int] = None
    max_hours_per_week: Optional[int] = None
    unavailable_slots: Set[UUID] = field(default_factory=set)
    prefer_consecutive_free_hours: bool = False
    free_hour_preference: FreeHourPreference = FreeHourPreference.NO_PREFERENCE
    preferred_free_hours: Set[int] = field(default_factory=set)  # Horas específicas (1-7)
    guard_hours: int = 0
    break_guard_hours: int = 0
    support_hours: int = 0
    coordination_hours: int = 0
    management_hours: int = 0
    no_coordination_next_to_free: bool = False
    
    def __post_init__(self):
        """Validación de datos."""
        if not self.name.strip():
            raise ValueError("El nombre del profesor no puede estar vacío")
        if self.max_hours_per_day is not None and self.max_hours_per_day <= 0:
            raise ValueError("max_hours_per_day debe ser positivo")
        if self.max_hours_per_week is not None and self.max_hours_per_week <= 0:
            raise ValueError("max_hours_per_week debe ser positivo")
    
    def is_available(self, time_slot_id: UUID) -> bool:
        """Verifica si el profesor está disponible en una franja horaria."""
        return time_slot_id not in self.unavailable_slots
    
    @property
    def total_non_teaching_hours(self) -> int:
        """Total de horas no lectivas."""
        return self.guard_hours + self.break_guard_hours + self.support_hours + self.coordination_hours + self.management_hours
    
    def __str__(self) -> str:
        return f"Teacher({self.name})"


@dataclass
class Subject:
    """
    Representa una asignatura.
    
    Atributos:
        id: Identificador único
        name: Nombre de la asignatura
        code: Código corto (ej: MAT-101)
        hours_per_week: Horas semanales requeridas
        requires_lab: Si requiere laboratorio
        excluded_room_ids: IDs de aulas donde NO puede impartirse esta asignatura
    """
    id: UUID
    name: str
    code: str
    hours_per_week: int
    requires_lab: bool = False
    excluded_room_ids: Set[UUID] = field(default_factory=set)
    
    def __post_init__(self):
        """Validación de datos."""
        if not self.name.strip():
            raise ValueError("El nombre de la asignatura no puede estar vacío")
        if not self.code.strip():
            raise ValueError("El código de la asignatura no puede estar vacío")
        if self.hours_per_week <= 0:
            raise ValueError("hours_per_week debe ser positivo")
    
    def __str__(self) -> str:
        return f"Subject({self.code} - {self.name})"


@dataclass
class Group:
    """
    Representa un grupo o clase de estudiantes.
    
    Atributos:
        id: Identificador único
        name: Nombre del grupo (ej: "1º ESO A", "2º Bachillerato Ciencias")
        level: Nivel educativo (ej: "ESO", "Bachillerato")
        num_students: Número de estudiantes
    """
    id: UUID
    name: str
    level: str
    num_students: int
    
    def __post_init__(self):
        """Validación de datos."""
        if not self.name.strip():
            raise ValueError("El nombre del grupo no puede estar vacío")
        if self.num_students <= 0:
            raise ValueError("num_students debe ser positivo")
    
    def __str__(self) -> str:
        return f"Group({self.name})"


@dataclass
class Room:
    """
    Representa un aula física.
    
    Atributos:
        id: Identificador único
        name: Nombre/número del aula
        capacity: Capacidad máxima de estudiantes
        room_type: Tipo de aula
    """
    id: UUID
    name: str
    capacity: int
    room_type: RoomType = RoomType.STANDARD
    
    def __post_init__(self):
        """Validación de datos."""
        if not self.name.strip():
            raise ValueError("El nombre del aula no puede estar vacío")
        if self.capacity <= 0:
            raise ValueError("capacity debe ser positiva")
    
    def can_accommodate(self, num_students: int) -> bool:
        """Verifica si el aula puede acomodar un número de estudiantes."""
        return self.capacity >= num_students
    
    def __str__(self) -> str:
        return f"Room({self.name} - {self.room_type.value})"


@dataclass
class SubjectAssignment:
    """
    Representa la asignación de un profesor a una asignatura para un grupo.
    
    Por ejemplo: "El profesor Juan enseña Matemáticas al grupo 1º ESO A"
    
    Atributos:
        id: Identificador único
        teacher_id: ID del profesor
        subject_id: ID de la asignatura
        group_id: ID del grupo
    """
    id: UUID
    teacher_id: UUID
    subject_id: UUID
    group_id: UUID
    
    def __str__(self) -> str:
        return f"Assignment(teacher={self.teacher_id}, subject={self.subject_id}, group={self.group_id})"


# Función helper para generar IDs
def generate_id() -> UUID:
    """Genera un UUID único."""
    return uuid4()
