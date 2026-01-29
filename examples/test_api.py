#!/usr/bin/env python
"""
Script de demostración de la API REST.

Crea entidades, genera un horario y muestra los resultados.
"""

import requests
import json
from uuid import UUID
import time


BASE_URL = "http://localhost:8000/api"


def print_section(title):
    """Imprime un encabezado de sección."""
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")


def print_response(response, title="Respuesta"):
    """Imprime una respuesta formateada."""
    print(f"📡 {title}")
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2, default=str))
    except:
        print(response.text)
    print()


def create_teachers():
    """Crea profesores de ejemplo."""
    print_section("1️⃣  CREAR PROFESORES")
    
    teachers_data = [
        {
            "name": "Juan Pérez",
            "email": "juan.perez@escuela.edu",
            "max_hours_per_day": 6,
            "max_hours_per_week": 25
        },
        {
            "name": "María García",
            "email": "maria.garcia@escuela.edu",
            "max_hours_per_day": 6,
            "max_hours_per_week": 25
        }
    ]
    
    teachers = []
    for teacher_data in teachers_data:
        response = requests.post(f"{BASE_URL}/teachers", json=teacher_data)
        if response.status_code == 201:
            teacher = response.json()
            teachers.append(teacher)
            print(f"✅ Profesor creado: {teacher['name']} ({teacher['id']})")
        else:
            print_response(response, f"❌ Error al crear {teacher_data['name']}")
    
    return teachers


def create_subjects():
    """Crea asignaturas de ejemplo."""
    print_section("2️⃣  CREAR ASIGNATURAS")
    
    subjects_data = [
        {
            "name": "Matemáticas",
            "code": "MAT-101",
            "hours_per_week": 3,
            "requires_lab": False
        },
        {
            "name": "Lengua Española",
            "code": "LEN-101",
            "hours_per_week": 2,
            "requires_lab": False
        }
    ]
    
    subjects = []
    for subject_data in subjects_data:
        response = requests.post(f"{BASE_URL}/subjects", json=subject_data)
        if response.status_code == 201:
            subject = response.json()
            subjects.append(subject)
            print(f"✅ Asignatura creada: {subject['name']} ({subject['code']})")
        else:
            print_response(response, f"❌ Error al crear {subject_data['name']}")
    
    return subjects


def create_groups():
    """Crea grupos de ejemplo."""
    print_section("3️⃣  CREAR GRUPOS")
    
    groups_data = [
        {
            "name": "1º ESO A",
            "level": "ESO",
            "num_students": 25
        },
        {
            "name": "1º ESO B",
            "level": "ESO",
            "num_students": 23
        }
    ]
    
    groups = []
    for group_data in groups_data:
        response = requests.post(f"{BASE_URL}/groups", json=group_data)
        if response.status_code == 201:
            group = response.json()
            groups.append(group)
            print(f"✅ Grupo creado: {group['name']} ({group['num_students']} estudiantes)")
        else:
            print_response(response, f"❌ Error al crear {group_data['name']}")
    
    return groups


def create_rooms():
    """Crea aulas de ejemplo."""
    print_section("4️⃣  CREAR AULAS")
    
    rooms_data = [
        {
            "name": "Aula 101",
            "capacity": 30,
            "room_type": "standard"
        },
        {
            "name": "Aula 102",
            "capacity": 30,
            "room_type": "standard"
        }
    ]
    
    rooms = []
    for room_data in rooms_data:
        response = requests.post(f"{BASE_URL}/rooms", json=room_data)
        if response.status_code == 201:
            room = response.json()
            rooms.append(room)
            print(f"✅ Aula creada: {room['name']} (capacidad: {room['capacity']})")
        else:
            print_response(response, f"❌ Error al crear {room_data['name']}")
    
    return rooms


def create_time_slots():
    """Crea franjas horarias de ejemplo."""
    print_section("5️⃣  CREAR FRANJAS HORARIAS")
    
    slots_data = []
    days = [0, 1]  # Lunes y martes
    hours = [8, 9, 10, 11, 12]
    
    for day in days:
        for hour in hours:
            slots_data.append({
                "day": day,
                "start_hour": hour,
                "start_minute": 0,
                "duration_minutes": 60
            })
    
    slots = []
    for slot_data in slots_data:
        response = requests.post(f"{BASE_URL}/time-slots", json=slot_data)
        if response.status_code == 201:
            slot = response.json()
            slots.append(slot)
    
    print(f"✅ {len(slots)} franjas horarias creadas")
    return slots


def create_assignments(teachers, subjects, groups):
    """Crea asignaciones profesor-asignatura-grupo."""
    print_section("6️⃣  CREAR ASIGNACIONES")
    
    assignments_data = [
        {
            "teacher_id": teachers[0]['id'],
            "subject_id": subjects[0]['id'],
            "group_id": groups[0]['id']
        },
        {
            "teacher_id": teachers[0]['id'],
            "subject_id": subjects[0]['id'],
            "group_id": groups[1]['id']
        },
        {
            "teacher_id": teachers[1]['id'],
            "subject_id": subjects[1]['id'],
            "group_id": groups[0]['id']
        },
        {
            "teacher_id": teachers[1]['id'],
            "subject_id": subjects[1]['id'],
            "group_id": groups[1]['id']
        }
    ]
    
    assignments = []
    for assignment_data in assignments_data:
        response = requests.post(f"{BASE_URL}/assignments", json=assignment_data)
        if response.status_code == 201:
            assignment = response.json()
            assignments.append(assignment)
    
    print(f"✅ {len(assignments)} asignaciones creadas")
    return assignments


def generate_schedule():
    """Genera un horario."""
    print_section("7️⃣  GENERAR HORARIO")
    
    schedule_request = {
        "center_name": "Escuela Ejemplo",
        "max_iterations": 10000,
        "timeout_seconds": 300
    }
    
    response = requests.post(f"{BASE_URL}/schedules/generate", json=schedule_request)
    
    if response.status_code == 201:
        schedule = response.json()
        print(f"✅ Horario generado exitosamente!")
        print(f"   - ID: {schedule['id']}")
        print(f"   - Lecciones: {len(schedule['lessons'])}")
        print(f"   - Válido: {schedule['evaluation']['is_valid']}")
        print(f"   - Coste: {schedule['evaluation']['total_cost']:.2f}")
        if schedule['evaluation']['hard_violations']:
            print(f"   - Violaciones: {schedule['evaluation']['hard_violations']}")
        return schedule
    else:
        print_response(response, "❌ Error al generar horario")
        return None


def get_teacher_schedule(schedule_id, teacher_id):
    """Obtiene el horario de un profesor."""
    print_section("8️⃣  VER HORARIO DE PROFESOR")
    
    response = requests.get(f"{BASE_URL}/schedules/{schedule_id}/teacher/{teacher_id}")
    
    if response.status_code == 200:
        teacher_schedule = response.json()
        print(f"✅ Horario de {teacher_schedule['teacher_name']}")
        print(f"   - Lecciones: {len(teacher_schedule['lessons'])}")
        print(f"   - Horas totales: {teacher_schedule['total_hours']}")
        print(f"   - Días con clases: {teacher_schedule['days_with_classes']}")
        return teacher_schedule
    else:
        print_response(response, "❌ Error al obtener horario")
        return None


def get_health():
    """Obtiene el estado de salud de la API."""
    print_section("📊 ESTADO DE LA API")
    
    response = requests.get("http://localhost:8000/health")
    if response.status_code == 200:
        health = response.json()
        print_response(response, "✅ Estado de la API")
    else:
        print(f"❌ Error al obtener estado: {response.status_code}")


def main():
    """Ejecuta el flujo completo de demostración."""
    print("\n")
    print("╔" + "="*78 + "╗")
    print("║" + " "*78 + "║")
    print("║" + "  🎓 DEMOSTRACIÓN - API REST DE GENERACIÓN DE HORARIOS".center(78) + "║")
    print("║" + " "*78 + "║")
    print("╚" + "="*78 + "╝")
    
    try:
        # Crear entidades
        teachers = create_teachers()
        subjects = create_subjects()
        groups = create_groups()
        rooms = create_rooms()
        time_slots = create_time_slots()
        
        # Crear asignaciones
        assignments = create_assignments(teachers, subjects, groups)
        
        # Generar horario
        schedule = generate_schedule()
        
        if schedule:
            # Ver horarios
            get_teacher_schedule(schedule['id'], teachers[0]['id'])
            
            # Estado de la API
            get_health()
        
        print_section("✅ DEMOSTRACIÓN COMPLETADA")
        print("Accede a la documentación en: http://localhost:8000/docs")
        print()
    
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: No se puede conectar a la API")
        print("Asegúrate de que el servidor está ejecutándose:")
        print("   python -m backend.api.main")
        print()


if __name__ == "__main__":
    main()
