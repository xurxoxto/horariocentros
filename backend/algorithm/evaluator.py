"""
Evaluador de restricciones para horarios.

Este módulo evalúa un horario contra un conjunto de restricciones
y calcula el coste total (fitness function).
"""

from typing import List, Dict, Tuple
from ..domain.timetable import Timetable
from ..domain.constraints import Constraint, ConstraintType
from ..domain.entities import Teacher, Group, Room, TimeSlot, Subject


class EvaluationResult:
    """
    Resultado de la evaluación de un horario.
    
    Atributos:
        is_valid: Si cumple todas las restricciones duras
        total_cost: Coste total (restricciones blandas)
        hard_violations: Lista de restricciones duras violadas
        soft_costs: Diccionario {restricción: coste}
    """
    
    def __init__(self):
        self.is_valid: bool = True
        self.total_cost: float = 0.0
        self.hard_violations: List[str] = []
        self.soft_costs: Dict[str, float] = {}
    
    def __str__(self) -> str:
        return f"EvaluationResult(valid={self.is_valid}, cost={self.total_cost:.2f}, hard_violations={len(self.hard_violations)})"
    
    def __repr__(self) -> str:
        return self.__str__()


class ConstraintEvaluator:
    """
    Evalúa un horario contra un conjunto de restricciones.
    """
    
    def __init__(self, constraints: List[Constraint]):
        """
        Args:
            constraints: Lista de restricciones a evaluar
        """
        self.constraints = constraints
        self.hard_constraints = [c for c in constraints if c.is_hard()]
        self.soft_constraints = [c for c in constraints if c.is_soft()]
    
    def evaluate(
        self,
        timetable: Timetable,
        teachers: Dict,
        groups: Dict,
        rooms: Dict,
        time_slots: Dict,
        subjects: Dict = None
    ) -> EvaluationResult:
        """
        Evalúa un horario completo.
        
        Args:
            timetable: Horario a evaluar
            teachers: Diccionario {id: Teacher}
            groups: Diccionario {id: Group}
            rooms: Diccionario {id: Room}
            time_slots: Diccionario {id: TimeSlot}
            subjects: Diccionario {id: Subject} (opcional)
        
        Returns:
            EvaluationResult con el resultado de la evaluación
        """
        result = EvaluationResult()
        
        # Contexto para las restricciones
        context = {
            "teachers": teachers,
            "groups": groups,
            "rooms": rooms,
            "time_slots": time_slots,
            "subjects": subjects or {}
        }
        
        # 1. Evaluar restricciones duras
        for constraint in self.hard_constraints:
            if not constraint.is_satisfied(timetable, **context):
                result.is_valid = False
                result.hard_violations.append(constraint.get_description())
            
            # Incluso para restricciones duras, calculamos el coste
            cost = constraint.calculate_cost(timetable, **context)
            if cost > 0:
                result.soft_costs[constraint.get_description()] = cost
                result.total_cost += cost
        
        # 2. Evaluar restricciones blandas
        for constraint in self.soft_constraints:
            cost = constraint.calculate_cost(timetable, **context)
            if cost > 0:
                result.soft_costs[constraint.get_description()] = cost
                result.total_cost += cost
        
        return result
    
    def is_valid_assignment(
        self,
        timetable: Timetable,
        teachers: Dict,
        groups: Dict,
        rooms: Dict,
        time_slots: Dict
    ) -> bool:
        """
        Verifica rápidamente si una asignación cumple las restricciones duras.
        
        Útil durante la generación para descartar asignaciones inválidas rápidamente.
        
        Returns:
            True si cumple todas las restricciones duras
        """
        context = {
            "teachers": teachers,
            "groups": groups,
            "rooms": rooms,
            "time_slots": time_slots
        }
        
        for constraint in self.hard_constraints:
            if not constraint.is_satisfied(timetable, **context):
                return False
        
        return True
    
    def calculate_soft_cost(
        self,
        timetable: Timetable,
        teachers: Dict,
        groups: Dict,
        rooms: Dict,
        time_slots: Dict
    ) -> float:
        """
        Calcula solo el coste de restricciones blandas.
        
        Útil para comparar diferentes soluciones válidas.
        
        Returns:
            Coste total de restricciones blandas
        """
        context = {
            "teachers": teachers,
            "groups": groups,
            "rooms": rooms,
            "time_slots": time_slots
        }
        
        total_cost = 0.0
        for constraint in self.soft_constraints:
            total_cost += constraint.calculate_cost(timetable, **context)
        
        return total_cost
    
    def get_constraint_summary(self) -> Dict[str, int]:
        """
        Obtiene un resumen de las restricciones configuradas.
        
        Returns:
            Diccionario con conteos por tipo
        """
        return {
            "total": len(self.constraints),
            "hard": len(self.hard_constraints),
            "soft": len(self.soft_constraints)
        }
    
    def __str__(self) -> str:
        summary = self.get_constraint_summary()
        return f"ConstraintEvaluator(total={summary['total']}, hard={summary['hard']}, soft={summary['soft']})"
