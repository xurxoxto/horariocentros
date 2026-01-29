"""
Timetable: Representa un horario completo (conjunto de lecciones).

Un Timetable es el resultado de la generación de horarios.
Contiene todas las Lessons asignadas y métodos para validar y consultar.
"""

from dataclasses import dataclass, field
from typing import List, Set, Dict, Optional
from uuid import UUID
from .lesson import Lesson
from .entities import Teacher, Group, TimeSlot


@dataclass
class Timetable:
    """
    Representa un horario completo.
    
    Atributos:
        lessons: Lista de todas las lecciones asignadas
        metadata: Información adicional (ej: fecha de generación, versión)
    """
    lessons: List[Lesson] = field(default_factory=list)
    metadata: Dict[str, str] = field(default_factory=dict)
    
    def add_lesson(self, lesson: Lesson) -> None:
        """Añade una lección al horario."""
        self.lessons.append(lesson)
    
    def remove_lesson(self, lesson_id: UUID) -> None:
        """Elimina una lección del horario."""
        self.lessons = [l for l in self.lessons if l.id != lesson_id]
    
    def get_lessons_by_teacher(self, teacher_id: UUID) -> List[Lesson]:
        """Obtiene todas las lecciones de un profesor."""
        return [l for l in self.lessons if l.teacher_id == teacher_id]
    
    def get_lessons_by_group(self, group_id: UUID) -> List[Lesson]:
        """Obtiene todas las lecciones de un grupo."""
        return [l for l in self.lessons if l.group_id == group_id]
    
    def get_lessons_by_room(self, room_id: UUID) -> List[Lesson]:
        """Obtiene todas las lecciones en un aula."""
        return [l for l in self.lessons if l.room_id == room_id]
    
    def get_lessons_by_time_slot(self, time_slot_id: UUID) -> List[Lesson]:
        """Obtiene todas las lecciones en una franja horaria."""
        return [l for l in self.lessons if l.time_slot_id == time_slot_id]
    
    def has_conflicts(self) -> bool:
        """
        Verifica si el horario tiene conflictos (restricciones duras violadas).
        
        Returns:
            True si hay al menos un conflicto
        """
        for i, lesson1 in enumerate(self.lessons):
            for lesson2 in self.lessons[i + 1:]:
                if lesson1.conflicts_with(lesson2):
                    return True
        return False
    
    def find_conflicts(self) -> List[tuple[Lesson, Lesson]]:
        """
        Encuentra todos los pares de lecciones que tienen conflictos.
        
        Returns:
            Lista de tuplas (lesson1, lesson2) que tienen conflicto
        """
        conflicts = []
        for i, lesson1 in enumerate(self.lessons):
            for lesson2 in self.lessons[i + 1:]:
                if lesson1.conflicts_with(lesson2):
                    conflicts.append((lesson1, lesson2))
        return conflicts
    
    def is_valid(self) -> bool:
        """
        Verifica si el horario es válido (sin conflictos).
        
        Un horario válido es aquel donde:
        1. No hay conflictos de recursos (profesor, grupo, aula)
        2. Todas las lecciones tienen asignaciones válidas
        """
        return not self.has_conflicts()
    
    def get_teacher_schedule(self, teacher_id: UUID, time_slots: List[TimeSlot]) -> Dict[UUID, Optional[Lesson]]:
        """
        Obtiene el horario de un profesor organizado por franjas horarias.
        
        Returns:
            Diccionario {time_slot_id: lesson o None}
        """
        teacher_lessons = self.get_lessons_by_teacher(teacher_id)
        schedule = {slot.id: None for slot in time_slots}
        
        for lesson in teacher_lessons:
            schedule[lesson.time_slot_id] = lesson
        
        return schedule
    
    def get_group_schedule(self, group_id: UUID, time_slots: List[TimeSlot]) -> Dict[UUID, Optional[Lesson]]:
        """
        Obtiene el horario de un grupo organizado por franjas horarias.
        
        Returns:
            Diccionario {time_slot_id: lesson o None}
        """
        group_lessons = self.get_lessons_by_group(group_id)
        schedule = {slot.id: None for slot in time_slots}
        
        for lesson in group_lessons:
            schedule[lesson.time_slot_id] = lesson
        
        return schedule
    
    def count_lessons(self) -> int:
        """Cuenta el número total de lecciones."""
        return len(self.lessons)
    
    def is_empty(self) -> bool:
        """Verifica si el horario está vacío."""
        return len(self.lessons) == 0
    
    def clear(self) -> None:
        """Limpia todas las lecciones del horario."""
        self.lessons.clear()
    
    def __str__(self) -> str:
        return f"Timetable(lessons={len(self.lessons)}, valid={self.is_valid()})"
    
    def __repr__(self) -> str:
        return self.__str__()
