"""
Sistema de restricciones para validación y evaluación de horarios.

Tipos de restricciones:
1. HARD (Duras): DEBEN cumplirse, si no el horario es inválido
2. SOFT (Blandas): DEBERÍAN cumplirse, penalizan el coste si no se cumplen

Cada restricción puede:
- Validar si se cumple (is_satisfied)
- Calcular el coste de violación (calculate_cost)
"""

from abc import ABC, abstractmethod
from typing import List
from uuid import UUID
from .entities import Teacher, Group, Room, TimeSlot
from .lesson import Lesson
from .timetable import Timetable


class ConstraintType:
    """Tipos de restricciones."""
    HARD = "HARD"
    SOFT = "SOFT"


class Constraint(ABC):
    """
    Clase base abstracta para todas las restricciones.
    
    Cada restricción debe implementar:
    - is_satisfied(): Verifica si la restricción se cumple
    - calculate_cost(): Calcula el coste de violación (0 si se cumple)
    """
    
    def __init__(self, constraint_type: str, weight: float = 1.0):
        """
        Args:
            constraint_type: HARD o SOFT
            weight: Peso de la restricción (relevante para SOFT)
        """
        self.constraint_type = constraint_type
        self.weight = weight
    
    @abstractmethod
    def is_satisfied(self, timetable: Timetable, **context) -> bool:
        """
        Verifica si la restricción se cumple.
        
        Args:
            timetable: Horario a evaluar
            **context: Datos adicionales necesarios (teachers, groups, etc.)
        
        Returns:
            True si la restricción se cumple
        """
        pass
    
    @abstractmethod
    def calculate_cost(self, timetable: Timetable, **context) -> float:
        """
        Calcula el coste de violación de la restricción.
        
        Args:
            timetable: Horario a evaluar
            **context: Datos adicionales necesarios
        
        Returns:
            Coste de violación (0 si se cumple, >0 si se viola)
        """
        pass
    
    @abstractmethod
    def get_description(self) -> str:
        """Descripción legible de la restricción."""
        pass
    
    def is_hard(self) -> bool:
        """Verifica si es una restricción dura."""
        return self.constraint_type == ConstraintType.HARD
    
    def is_soft(self) -> bool:
        """Verifica si es una restricción blanda."""
        return self.constraint_type == ConstraintType.SOFT


# ============================================================================
# RESTRICCIONES DURAS (HARD)
# ============================================================================

class NoTeacherConflictConstraint(Constraint):
    """
    RESTRICCIÓN DURA: Un profesor no puede estar en dos lugares simultáneamente.
    
    Esta es la restricción más fundamental.
    """
    
    def __init__(self):
        super().__init__(ConstraintType.HARD)
    
    def is_satisfied(self, timetable: Timetable, **context) -> bool:
        """Verifica que no haya profesores con clases simultáneas."""
        for time_slot_id in self._get_all_time_slots(timetable):
            lessons_in_slot = [l for l in timetable.lessons if l.time_slot_id == time_slot_id]
            teacher_ids = [l.teacher_id for l in lessons_in_slot]
            
            # Si hay IDs repetidos, hay conflicto
            if len(teacher_ids) != len(set(teacher_ids)):
                return False
        
        return True
    
    def calculate_cost(self, timetable: Timetable, **context) -> float:
        """Coste = número de conflictos de profesores."""
        cost = 0.0
        for time_slot_id in self._get_all_time_slots(timetable):
            lessons_in_slot = [l for l in timetable.lessons if l.time_slot_id == time_slot_id]
            teacher_ids = [l.teacher_id for l in lessons_in_slot]
            
            # Contar duplicados
            unique_teachers = len(set(teacher_ids))
            total_teachers = len(teacher_ids)
            cost += (total_teachers - unique_teachers)
        
        return cost * 1000.0  # Penalización muy alta para restricciones duras
    
    def get_description(self) -> str:
        return "Un profesor no puede tener dos clases simultáneas"
    
    def _get_all_time_slots(self, timetable: Timetable) -> set[UUID]:
        """Helper: obtiene todos los time_slots usados."""
        return {lesson.time_slot_id for lesson in timetable.lessons}


class NoGroupConflictConstraint(Constraint):
    """
    RESTRICCIÓN DURA: Un grupo no puede tener dos clases simultáneas.
    """
    
    def __init__(self):
        super().__init__(ConstraintType.HARD)
    
    def is_satisfied(self, timetable: Timetable, **context) -> bool:
        """Verifica que no haya grupos con clases simultáneas."""
        for time_slot_id in self._get_all_time_slots(timetable):
            lessons_in_slot = [l for l in timetable.lessons if l.time_slot_id == time_slot_id]
            group_ids = [l.group_id for l in lessons_in_slot]
            
            if len(group_ids) != len(set(group_ids)):
                return False
        
        return True
    
    def calculate_cost(self, timetable: Timetable, **context) -> float:
        """Coste = número de conflictos de grupos."""
        cost = 0.0
        for time_slot_id in self._get_all_time_slots(timetable):
            lessons_in_slot = [l for l in timetable.lessons if l.time_slot_id == time_slot_id]
            group_ids = [l.group_id for l in lessons_in_slot]
            
            unique_groups = len(set(group_ids))
            total_groups = len(group_ids)
            cost += (total_groups - unique_groups)
        
        return cost * 1000.0
    
    def get_description(self) -> str:
        return "Un grupo no puede tener dos clases simultáneas"
    
    def _get_all_time_slots(self, timetable: Timetable) -> set[UUID]:
        return {lesson.time_slot_id for lesson in timetable.lessons}


class NoRoomConflictConstraint(Constraint):
    """
    RESTRICCIÓN DURA: Un aula no puede estar ocupada por dos grupos simultáneamente.
    """
    
    def __init__(self):
        super().__init__(ConstraintType.HARD)
    
    def is_satisfied(self, timetable: Timetable, **context) -> bool:
        """Verifica que no haya aulas con doble ocupación."""
        for time_slot_id in self._get_all_time_slots(timetable):
            lessons_in_slot = [l for l in timetable.lessons if l.time_slot_id == time_slot_id]
            room_ids = [l.room_id for l in lessons_in_slot]
            
            if len(room_ids) != len(set(room_ids)):
                return False
        
        return True
    
    def calculate_cost(self, timetable: Timetable, **context) -> float:
        """Coste = número de conflictos de aulas."""
        cost = 0.0
        for time_slot_id in self._get_all_time_slots(timetable):
            lessons_in_slot = [l for l in timetable.lessons if l.time_slot_id == time_slot_id]
            room_ids = [l.room_id for l in lessons_in_slot]
            
            unique_rooms = len(set(room_ids))
            total_rooms = len(room_ids)
            cost += (total_rooms - unique_rooms)
        
        return cost * 1000.0
    
    def get_description(self) -> str:
        return "Un aula no puede tener dos clases simultáneas"
    
    def _get_all_time_slots(self, timetable: Timetable) -> set[UUID]:
        return {lesson.time_slot_id for lesson in timetable.lessons}


class RoomCapacityConstraint(Constraint):
    """
    RESTRICCIÓN DURA: El aula debe tener capacidad suficiente para el grupo.
    """
    
    def __init__(self):
        super().__init__(ConstraintType.HARD)
    
    def is_satisfied(self, timetable: Timetable, **context) -> bool:
        """Verifica que todas las aulas tengan capacidad suficiente."""
        groups: dict[UUID, Group] = context.get("groups", {})
        rooms: dict[UUID, Room] = context.get("rooms", {})
        
        for lesson in timetable.lessons:
            group = groups.get(lesson.group_id)
            room = rooms.get(lesson.room_id)
            
            if group and room:
                if room.capacity < group.num_students:
                    return False
        
        return True
    
    def calculate_cost(self, timetable: Timetable, **context) -> float:
        """Coste = número de aulas con capacidad insuficiente."""
        groups: dict[UUID, Group] = context.get("groups", {})
        rooms: dict[UUID, Room] = context.get("rooms", {})
        cost = 0.0
        
        for lesson in timetable.lessons:
            group = groups.get(lesson.group_id)
            room = rooms.get(lesson.room_id)
            
            if group and room:
                if room.capacity < group.num_students:
                    cost += 1.0
        
        return cost * 1000.0
    
    def get_description(self) -> str:
        return "Las aulas deben tener capacidad suficiente para los grupos"


# ============================================================================
# RESTRICCIONES BLANDAS (SOFT)
# ============================================================================

class MinimizeGapsConstraint(Constraint):
    """
    RESTRICCIÓN BLANDA: Minimizar huecos en los horarios de profesores.
    
    Un hueco es una franja horaria vacía entre dos clases del mismo día.
    """
    
    def __init__(self, weight: float = 1.0):
        super().__init__(ConstraintType.SOFT, weight)
    
    def is_satisfied(self, timetable: Timetable, **context) -> bool:
        """Una restricción blanda nunca se 'satisface' completamente."""
        return self.calculate_cost(timetable, **context) == 0
    
    def calculate_cost(self, timetable: Timetable, **context) -> float:
        """Coste = número total de huecos para todos los profesores."""
        time_slots: dict[UUID, TimeSlot] = context.get("time_slots", {})
        teachers: dict[UUID, Teacher] = context.get("teachers", {})
        
        if not time_slots or not teachers:
            return 0.0
        
        total_gaps = 0
        
        # Para cada profesor
        for teacher_id in teachers.keys():
            teacher_lessons = timetable.get_lessons_by_teacher(teacher_id)
            
            # Agrupar por día
            lessons_by_day: dict[int, List[TimeSlot]] = {}
            for lesson in teacher_lessons:
                slot = time_slots.get(lesson.time_slot_id)
                if slot:
                    day = slot.day.value
                    if day not in lessons_by_day:
                        lessons_by_day[day] = []
                    lessons_by_day[day].append(slot)
            
            # Contar huecos en cada día
            for day, slots in lessons_by_day.items():
                if len(slots) <= 1:
                    continue
                
                # Ordenar por hora
                sorted_slots = sorted(slots, key=lambda s: s.start_hour * 60 + s.start_minute)
                
                # Contar huecos (franjas entre clases)
                gaps = len(sorted_slots) - 1
                total_gaps += gaps
        
        return total_gaps * self.weight
    
    def get_description(self) -> str:
        return "Minimizar huecos en horarios de profesores"


class TeacherPreferenceConstraint(Constraint):
    """
    RESTRICCIÓN BLANDA: Respetar preferencias horarias de profesores.
    
    Penaliza asignar a un profesor en horarios no preferidos.
    """
    
    def __init__(self, weight: float = 2.0):
        super().__init__(ConstraintType.SOFT, weight)
    
    def is_satisfied(self, timetable: Timetable, **context) -> bool:
        return self.calculate_cost(timetable, **context) == 0
    
    def calculate_cost(self, timetable: Timetable, **context) -> float:
        """Coste = número de clases en horarios no disponibles."""
        teachers: dict[UUID, Teacher] = context.get("teachers", {})
        cost = 0.0
        
        for lesson in timetable.lessons:
            teacher = teachers.get(lesson.teacher_id)
            if teacher and not teacher.is_available(lesson.time_slot_id):
                cost += 1.0
        
        return cost * self.weight
    
    def get_description(self) -> str:
        return "Respetar preferencias horarias de profesores"


class BalancedDailyLoadConstraint(Constraint):
    """
    RESTRICCIÓN BLANDA: Distribuir equitativamente las clases a lo largo de la semana.
    
    Penaliza días con muchas clases y días con pocas.
    """
    
    def __init__(self, weight: float = 0.5):
        super().__init__(ConstraintType.SOFT, weight)
    
    def is_satisfied(self, timetable: Timetable, **context) -> bool:
        return self.calculate_cost(timetable, **context) == 0
    
    def calculate_cost(self, timetable: Timetable, **context) -> float:
        """Coste = desviación estándar de clases por día."""
        time_slots: dict[UUID, TimeSlot] = context.get("time_slots", {})
        teachers: dict[UUID, Teacher] = context.get("teachers", {})
        
        if not time_slots or not teachers:
            return 0.0
        
        total_cost = 0.0
        
        # Para cada profesor
        for teacher_id in teachers.keys():
            teacher_lessons = timetable.get_lessons_by_teacher(teacher_id)
            
            # Contar clases por día
            lessons_per_day: dict[int, int] = {i: 0 for i in range(7)}
            for lesson in teacher_lessons:
                slot = time_slots.get(lesson.time_slot_id)
                if slot:
                    lessons_per_day[slot.day.value] += 1
            
            # Calcular desviación
            values = list(lessons_per_day.values())
            if values:
                mean = sum(values) / len(values)
                variance = sum((x - mean) ** 2 for x in values) / len(values)
                total_cost += variance ** 0.5
        
        return total_cost * self.weight
    
    def get_description(self) -> str:
        return "Distribuir clases equilibradamente durante la semana"


# ============================================================================
# COLECCIÓN DE RESTRICCIONES
# ============================================================================

def get_default_constraints() -> List[Constraint]:
    """
    Devuelve el conjunto de restricciones por defecto para el MVP.
    
    Returns:
        Lista de restricciones (duras y blandas)
    """
    return [
        # Restricciones duras (fundamentales)
        NoTeacherConflictConstraint(),
        NoGroupConflictConstraint(),
        NoRoomConflictConstraint(),
        RoomCapacityConstraint(),
        
        # Restricciones blandas (optimización)
        MinimizeGapsConstraint(weight=1.0),
        TeacherPreferenceConstraint(weight=2.0),
        BalancedDailyLoadConstraint(weight=0.5),
    ]
