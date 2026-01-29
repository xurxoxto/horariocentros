"""
Ejemplo simple de uso del motor de generación de horarios.

Este script demuestra cómo usar el sistema sin necesidad de API o base de datos.
"""

import sys
from pathlib import Path
# Añadir el directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent.parent))

import logging
from uuid import UUID

from backend.domain.entities import (
    Teacher, Subject, Group, Room, TimeSlot, SubjectAssignment,
    DayOfWeek, RoomType, generate_id
)
from backend.algorithm.scheduler import create_simple_schedule
from backend.domain.constraints import get_default_constraints


# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_sample_data():
    """
    Crea un conjunto simple de datos de prueba.
    
    Escenario:
    - 2 profesores
    - 2 asignaturas
    - 2 grupos
    - 2 aulas
    - 5 franjas horarias (lunes y martes, 3 slots cada día)
    """
    
    # Profesores
    teacher1 = Teacher(
        id=generate_id(),
        name="Juan Pérez",
        email="juan.perez@escuela.edu",
        max_hours_per_day=6,
        max_hours_per_week=25
    )
    
    teacher2 = Teacher(
        id=generate_id(),
        name="María García",
        email="maria.garcia@escuela.edu",
        max_hours_per_day=6,
        max_hours_per_week=25
    )
    
    # Asignaturas
    math = Subject(
        id=generate_id(),
        name="Matemáticas",
        code="MAT-101",
        hours_per_week=3
    )
    
    spanish = Subject(
        id=generate_id(),
        name="Lengua Española",
        code="LEN-101",
        hours_per_week=2
    )
    
    # Grupos
    group1a = Group(
        id=generate_id(),
        name="1º ESO A",
        level="ESO",
        num_students=25
    )
    
    group1b = Group(
        id=generate_id(),
        name="1º ESO B",
        level="ESO",
        num_students=23
    )
    
    # Aulas
    room101 = Room(
        id=generate_id(),
        name="Aula 101",
        capacity=30,
        room_type=RoomType.STANDARD
    )
    
    room102 = Room(
        id=generate_id(),
        name="Aula 102",
        capacity=30,
        room_type=RoomType.STANDARD
    )
    
    # Franjas horarias (lunes y martes, 8:00-13:00, slots de 1 hora)
    slots = []
    for day in [DayOfWeek.MONDAY, DayOfWeek.TUESDAY]:
        for hour in [8, 9, 10, 11, 12]:
            slot = TimeSlot(
                id=generate_id(),
                day=day,
                start_hour=hour,
                start_minute=0,
                duration_minutes=60
            )
            slots.append(slot)
    
    # Asignaciones: quién enseña qué a quién
    assignments = [
        # Juan enseña Matemáticas a 1º ESO A
        SubjectAssignment(
            id=generate_id(),
            teacher_id=teacher1.id,
            subject_id=math.id,
            group_id=group1a.id
        ),
        # Juan enseña Matemáticas a 1º ESO B
        SubjectAssignment(
            id=generate_id(),
            teacher_id=teacher1.id,
            subject_id=math.id,
            group_id=group1b.id
        ),
        # María enseña Lengua a 1º ESO A
        SubjectAssignment(
            id=generate_id(),
            teacher_id=teacher2.id,
            subject_id=spanish.id,
            group_id=group1a.id
        ),
        # María enseña Lengua a 1º ESO B
        SubjectAssignment(
            id=generate_id(),
            teacher_id=teacher2.id,
            subject_id=spanish.id,
            group_id=group1b.id
        ),
    ]
    
    return {
        "teachers": [teacher1, teacher2],
        "subjects": [math, spanish],
        "groups": [group1a, group1b],
        "rooms": [room101, room102],
        "time_slots": slots,
        "assignments": assignments
    }


def print_timetable(timetable, teachers, subjects, groups, rooms, time_slots):
    """
    Imprime el horario de forma legible.
    """
    if not timetable or timetable.is_empty():
        print("❌ No se pudo generar un horario válido")
        return
    
    print("\n" + "="*80)
    print("📅 HORARIO GENERADO")
    print("="*80)
    
    # Crear mapas para búsqueda rápida
    teachers_map = {t.id: t for t in teachers}
    subjects_map = {s.id: s for s in subjects}
    groups_map = {g.id: g for g in groups}
    rooms_map = {r.id: r for r in rooms}
    slots_map = {ts.id: ts for ts in time_slots}
    
    # Agrupar por grupo
    for group in groups:
        print(f"\n🎓 Horario del grupo: {group.name}")
        print("-" * 80)
        
        group_lessons = timetable.get_lessons_by_group(group.id)
        
        # Ordenar por día y hora
        sorted_lessons = sorted(
            group_lessons,
            key=lambda l: (
                slots_map[l.time_slot_id].day.value,
                slots_map[l.time_slot_id].start_hour
            )
        )
        
        for lesson in sorted_lessons:
            slot = slots_map[lesson.time_slot_id]
            teacher = teachers_map[lesson.teacher_id]
            subject = subjects_map[lesson.subject_id]
            room = rooms_map[lesson.room_id]
            
            print(f"  {slot.day.name:10s} {slot.start_hour:02d}:{slot.start_minute:02d} | "
                  f"{subject.code:8s} | Prof: {teacher.name:20s} | Aula: {room.name}")
    
    print("\n" + "="*80)


def main():
    """
    Función principal de demostración.
    """
    logger.info("🚀 Iniciando generación de horario de ejemplo...")
    
    # 1. Crear datos de prueba
    data = create_sample_data()
    logger.info(f"✅ Datos creados: {len(data['teachers'])} profesores, "
                f"{len(data['groups'])} grupos, {len(data['time_slots'])} slots")
    
    # 2. Generar horario
    logger.info("🔄 Generando horario...")
    timetable, result = create_simple_schedule(
        teachers=data["teachers"],
        subjects=data["subjects"],
        groups=data["groups"],
        rooms=data["rooms"],
        time_slots=data["time_slots"],
        subject_assignments=data["assignments"],
        constraints=get_default_constraints(),
        max_iterations=10000
    )
    
    # 3. Mostrar resultados
    if timetable and result.is_valid:
        logger.info(f"✅ ¡Horario generado exitosamente!")
        logger.info(f"   - Lecciones: {timetable.count_lessons()}")
        logger.info(f"   - Coste total: {result.total_cost:.2f}")
        logger.info(f"   - Restricciones duras violadas: {len(result.hard_violations)}")
        
        print_timetable(
            timetable,
            data["teachers"],
            data["subjects"],
            data["groups"],
            data["rooms"],
            data["time_slots"]
        )
        
        # Mostrar costes por restricción
        if result.soft_costs:
            print("\n📊 Costes por restricción:")
            print("-" * 80)
            for constraint, cost in result.soft_costs.items():
                print(f"  {constraint:50s} : {cost:.2f}")
        
    else:
        logger.error("❌ No se pudo generar un horario válido")
        if result.hard_violations:
            logger.error(f"   Restricciones violadas:")
            for violation in result.hard_violations:
                logger.error(f"   - {violation}")


if __name__ == "__main__":
    main()
