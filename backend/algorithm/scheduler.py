"""
Motor principal de generación de horarios.

Este es el core del algoritmo que genera horarios válidos
usando backtracking con heurísticas.

Flujo:
1. Recibe entidades (profesores, grupos, asignaturas, aulas, slots)
2. Genera lista de asignaciones pendientes
3. Aplica backtracking para asignar cada lección
4. Evalúa restricciones y optimiza
5. Devuelve horario o reporta imposibilidad
"""

import logging
from typing import List, Dict, Optional, Tuple
from uuid import UUID
from dataclasses import dataclass
from copy import deepcopy
import random

from ..domain.entities import Teacher, Subject, Group, Room, TimeSlot, SubjectAssignment, generate_id
from ..domain.lesson import Lesson
from ..domain.timetable import Timetable
from ..domain.constraints import Constraint, get_default_constraints
from .evaluator import ConstraintEvaluator, EvaluationResult


logger = logging.getLogger(__name__)


@dataclass
class SchedulingRequest:
    """
    Solicitud de generación de horario.
    
    Contiene todas las entidades y configuración necesaria.
    """
    teachers: Dict[UUID, Teacher]
    subjects: Dict[UUID, Subject]
    groups: Dict[UUID, Group]
    rooms: Dict[UUID, Room]
    time_slots: Dict[UUID, TimeSlot]
    subject_assignments: List[SubjectAssignment]  # Qué profesor enseña qué a quién
    constraints: Optional[List[Constraint]] = None
    max_iterations: int = 10000
    timeout_seconds: int = 300


@dataclass
class PendingLesson:
    """
    Representa una lección que aún no ha sido asignada a un slot.
    
    Contiene la información de qué debe enseñarse (profesor, asignatura, grupo)
    pero aún no tiene asignado aula ni franja horaria.
    """
    subject_assignment: SubjectAssignment
    teacher: Teacher
    subject: Subject
    group: Group
    
    # Heurística: dificultad de asignación (calculada)
    difficulty_score: float = 0.0


class SchedulerEngine:
    """
    Motor de generación de horarios usando backtracking con heurísticas.
    """
    
    def __init__(self, request: SchedulingRequest):
        """
        Args:
            request: Solicitud con todas las entidades y configuración
        """
        self.request = request
        
        # Usar restricciones por defecto si no se especifican
        if request.constraints is None:
            self.constraints = get_default_constraints()
        else:
            self.constraints = request.constraints
        
        self.evaluator = ConstraintEvaluator(self.constraints)
        
        # Estadísticas
        self.iterations = 0
        self.backtracks = 0
        
        logger.info(f"SchedulerEngine initialized with {len(self.constraints)} constraints")
    
    def generate(self) -> Tuple[Optional[Timetable], EvaluationResult]:
        """
        Genera un horario completo.
        
        Returns:
            Tupla (timetable, evaluation_result)
            - Si no se puede generar, timetable será None
        """
        logger.info("Starting timetable generation...")
        
        # 1. Generar lista de lecciones pendientes
        pending_lessons = self._generate_pending_lessons()
        logger.info(f"Generated {len(pending_lessons)} pending lessons")
        
        if not pending_lessons:
            logger.warning("No pending lessons to schedule")
            empty_timetable = Timetable()
            result = self.evaluator.evaluate(
                empty_timetable,
                self.request.teachers,
                self.request.groups,
                self.request.rooms,
                self.request.time_slots,
                self.request.subjects
            )
            return empty_timetable, result
        
        # 2. Ordenar por dificultad (heurística)
        pending_lessons = self._sort_by_difficulty(pending_lessons)
        
        # 3. Intentar generar con backtracking
        timetable = Timetable()
        success = self._backtrack(timetable, pending_lessons, 0)
        
        # 4. Evaluar resultado
        result = self.evaluator.evaluate(
            timetable,
            self.request.teachers,
            self.request.groups,
            self.request.rooms,
            self.request.time_slots,
            self.request.subjects
        )
        
        if success:
            logger.info(f"✅ Generation successful! Iterations: {self.iterations}, Backtracks: {self.backtracks}")
            logger.info(f"Total cost: {result.total_cost:.2f}")
        else:
            logger.error(f"❌ Generation failed after {self.iterations} iterations")
            return None, result
        
        return timetable, result
    
    def _generate_pending_lessons(self) -> List[PendingLesson]:
        """
        Genera la lista de lecciones que deben ser asignadas.
        
        Por cada SubjectAssignment, generamos N lecciones donde N = hours_per_week
        de la asignatura.
        """
        pending = []
        
        for assignment in self.request.subject_assignments:
            teacher = self.request.teachers.get(assignment.teacher_id)
            subject = self.request.subjects.get(assignment.subject_id)
            group = self.request.groups.get(assignment.group_id)
            
            if not teacher or not subject or not group:
                logger.warning(f"Skipping invalid assignment: {assignment}")
                continue
            
            # Crear N lecciones pendientes (N = horas semanales)
            for _ in range(subject.hours_per_week):
                pending.append(PendingLesson(
                    subject_assignment=assignment,
                    teacher=teacher,
                    subject=subject,
                    group=group
                ))
        
        return pending
    
    def _sort_by_difficulty(self, pending_lessons: List[PendingLesson]) -> List[PendingLesson]:
        """
        Ordena las lecciones pendientes por dificultad de asignación.
        
        Heurísticas:
        1. Profesores con menos disponibilidad primero
        2. Grupos más grandes primero (menos aulas disponibles)
        3. Asignaturas que requieren laboratorio primero
        """
        for lesson in pending_lessons:
            score = 0.0
            
            # Heurística 1: Disponibilidad del profesor
            total_slots = len(self.request.time_slots)
            unavailable_slots = len(lesson.teacher.unavailable_slots)
            availability_ratio = 1.0 - (unavailable_slots / total_slots if total_slots > 0 else 0)
            score += (1.0 - availability_ratio) * 100  # Menos disponibilidad = mayor score
            
            # Heurística 2: Tamaño del grupo
            score += lesson.group.num_students * 0.1
            
            # Heurística 3: Requiere laboratorio
            if lesson.subject.requires_lab:
                score += 50
            
            lesson.difficulty_score = score
        
        # Ordenar de mayor a menor dificultad
        return sorted(pending_lessons, key=lambda x: x.difficulty_score, reverse=True)
    
    def _backtrack(
        self,
        timetable: Timetable,
        pending_lessons: List[PendingLesson],
        index: int
    ) -> bool:
        """
        Algoritmo de backtracking recursivo.
        
        Args:
            timetable: Horario actual (puede estar parcialmente completo)
            pending_lessons: Lista de lecciones pendientes ordenadas
            index: Índice de la lección actual a asignar
        
        Returns:
            True si se logró asignar todas las lecciones
        """
        self.iterations += 1
        
        # Límite de iteraciones
        if self.iterations > self.request.max_iterations:
            logger.warning(f"Max iterations reached: {self.request.max_iterations}")
            return False
        
        # Caso base: todas las lecciones asignadas
        if index >= len(pending_lessons):
            return True
        
        # Obtener lección actual
        pending = pending_lessons[index]
        
        # Intentar todas las combinaciones de (aula, time_slot)
        candidates = self._get_candidates(pending)
        
        # Aleatorizar para diversidad (opcional)
        # random.shuffle(candidates)
        
        for room_id, time_slot_id in candidates:
            # Crear lección
            lesson = Lesson(
                id=generate_id(),
                teacher_id=pending.teacher.id,
                subject_id=pending.subject.id,
                group_id=pending.group.id,
                room_id=room_id,
                time_slot_id=time_slot_id
            )
            
            # Añadir temporalmente
            timetable.add_lesson(lesson)
            
            # Verificar si es válido (restricciones duras)
            if self._is_valid_partial(timetable):
                # Continuar recursivamente
                if self._backtrack(timetable, pending_lessons, index + 1):
                    return True
            
            # Backtrack: quitar la lección
            timetable.remove_lesson(lesson.id)
            self.backtracks += 1
        
        # No se pudo asignar esta lección
        return False
    
    def _get_candidates(self, pending: PendingLesson) -> List[Tuple[UUID, UUID]]:
        """
        Obtiene las combinaciones candidatas de (aula, time_slot) para una lección.
        
        Filtra por:
        - Disponibilidad del profesor
        - Capacidad del aula
        - Tipo de aula (si requiere laboratorio)
        
        Returns:
            Lista de tuplas (room_id, time_slot_id)
        """
        candidates = []
        
        for room in self.request.rooms.values():
            # Verificar capacidad
            if not room.can_accommodate(pending.group.num_students):
                continue
            
            # Verificar tipo de aula
            # if pending.subject.requires_lab and room.room_type.value != "laboratory":
            #     continue
            
            for time_slot in self.request.time_slots.values():
                # Verificar disponibilidad del profesor
                if not pending.teacher.is_available(time_slot.id):
                    continue
                
                candidates.append((room.id, time_slot.id))
        
        return candidates
    
    def _is_valid_partial(self, timetable: Timetable) -> bool:
        """
        Verifica si el horario parcial cumple las restricciones duras.
        
        Optimización: solo verifica restricciones duras (las blandas se evalúan al final).
        """
        return self.evaluator.is_valid_assignment(
            timetable,
            self.request.teachers,
            self.request.groups,
            self.request.rooms,
            self.request.time_slots
        )
    
    def get_statistics(self) -> Dict[str, int]:
        """Obtiene estadísticas de la ejecución."""
        return {
            "iterations": self.iterations,
            "backtracks": self.backtracks,
        }


# ============================================================================
# FUNCIONES DE UTILIDAD
# ============================================================================

def create_simple_schedule(
    teachers: List[Teacher],
    subjects: List[Subject],
    groups: List[Group],
    rooms: List[Room],
    time_slots: List[TimeSlot],
    subject_assignments: List[SubjectAssignment],
    constraints: Optional[List[Constraint]] = None,
    max_iterations: int = 10000
) -> Tuple[Optional[Timetable], EvaluationResult]:
    """
    Función helper para generar un horario de forma simple.
    
    Args:
        teachers: Lista de profesores
        subjects: Lista de asignaturas
        groups: Lista de grupos
        rooms: Lista de aulas
        time_slots: Lista de franjas horarias
        subject_assignments: Lista de asignaciones profesor-asignatura-grupo
        constraints: Restricciones personalizadas (opcional)
        max_iterations: Límite de iteraciones
    
    Returns:
        Tupla (timetable, evaluation_result)
    """
    # Convertir listas a diccionarios
    teachers_dict = {t.id: t for t in teachers}
    subjects_dict = {s.id: s for s in subjects}
    groups_dict = {g.id: g for g in groups}
    rooms_dict = {r.id: r for r in rooms}
    time_slots_dict = {ts.id: ts for ts in time_slots}
    
    # Crear request
    request = SchedulingRequest(
        teachers=teachers_dict,
        subjects=subjects_dict,
        groups=groups_dict,
        rooms=rooms_dict,
        time_slots=time_slots_dict,
        subject_assignments=subject_assignments,
        constraints=constraints,
        max_iterations=max_iterations
    )
    
    # Generar
    engine = SchedulerEngine(request)
    return engine.generate()
