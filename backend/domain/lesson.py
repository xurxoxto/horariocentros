"""
Lesson: Representa una clase asignada en el horario.

Una Lesson conecta:
- Un profesor (Teacher)
- Una asignatura (Subject)
- Un grupo (Group)
- Un aula (Room)
- Una franja horaria (TimeSlot)
"""

from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True)
class Lesson:
    """
    Representa una clase específica en el horario.
    
    Ejemplo: "El profesor Juan enseña Matemáticas al grupo 1º ESO A
             en el aula 101 el lunes de 8:00 a 9:00"
    
    Atributos:
        id: Identificador único de la lección
        teacher_id: ID del profesor que imparte
        subject_id: ID de la asignatura
        group_id: ID del grupo que recibe la clase
        room_id: ID del aula donde se imparte
        time_slot_id: ID de la franja horaria
    """
    id: UUID
    teacher_id: UUID
    subject_id: UUID
    group_id: UUID
    room_id: UUID
    time_slot_id: UUID
    
    def involves_teacher(self, teacher_id: UUID) -> bool:
        """Verifica si esta lección involucra a un profesor específico."""
        return self.teacher_id == teacher_id
    
    def involves_group(self, group_id: UUID) -> bool:
        """Verifica si esta lección involucra a un grupo específico."""
        return self.group_id == group_id
    
    def involves_room(self, room_id: UUID) -> bool:
        """Verifica si esta lección usa un aula específica."""
        return self.room_id == room_id
    
    def involves_time_slot(self, time_slot_id: UUID) -> bool:
        """Verifica si esta lección ocurre en una franja horaria específica."""
        return self.time_slot_id == time_slot_id
    
    def conflicts_with(self, other: "Lesson") -> bool:
        """
        Verifica si esta lección tiene conflictos básicos con otra.
        
        Conflictos:
        1. Mismo profesor, mismo slot
        2. Mismo grupo, mismo slot
        3. Misma aula, mismo slot
        """
        if self.time_slot_id != other.time_slot_id:
            return False
        
        # Mismo profesor en dos lugares
        if self.teacher_id == other.teacher_id:
            return True
        
        # Mismo grupo en dos lugares
        if self.group_id == other.group_id:
            return True
        
        # Misma aula ocupada dos veces
        if self.room_id == other.room_id:
            return True
        
        return False
    
    def __str__(self) -> str:
        return f"Lesson(teacher={self.teacher_id}, subject={self.subject_id}, group={self.group_id}, slot={self.time_slot_id})"
