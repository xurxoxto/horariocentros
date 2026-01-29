"""
Endpoints para generación y gestión de horarios.
"""

from fastapi import APIRouter, HTTPException, Path
from typing import List
from uuid import UUID, uuid4
from datetime import datetime

from backend.api.schemas import (
    ScheduleGenerationRequest,
    ScheduleResponse,
    ScheduleListResponse,
    TeacherScheduleResponse,
    GroupScheduleResponse,
    LessonResponse,
    ScheduleEvaluationResponse,
)
from backend.api.store import store
from backend.algorithm.scheduler import create_simple_schedule
from backend.domain.constraints import get_default_constraints
from backend.domain.lesson import Lesson


router = APIRouter()


@router.post("/generate", response_model=ScheduleResponse, status_code=201)
async def generate_schedule(request: ScheduleGenerationRequest):
    """
    Generar un nuevo horario automáticamente.
    
    Requiere que ya hayan sido creadas:
    - Profesores
    - Asignaturas
    - Grupos
    - Aulas
    - Franjas horarias
    - Asignaciones (profesor-asignatura-grupo)
    """
    
    # Obtener datos del store (ahora database-backed)
    teachers = store.list_teachers()
    subjects = store.list_subjects()
    groups = store.list_groups()
    rooms = store.list_rooms()
    time_slots = store.list_time_slots()
    assignments = store.list_assignments()
    
    # Validar que haya datos suficientes
    if not teachers or not subjects or not groups or not rooms or not time_slots:
        raise HTTPException(
            status_code=400,
            detail="Se requieren profesores, asignaturas, grupos, aulas y franjas horarias para generar horario"
        )
    
    if not assignments:
        raise HTTPException(
            status_code=400,
            detail="Se requieren asignaciones profesor-asignatura-grupo"
        )
    
    try:
        # Generar horario
        timetable, result = create_simple_schedule(
            teachers=teachers,
            subjects=subjects,
            groups=groups,
            rooms=rooms,
            time_slots=time_slots,
            subject_assignments=assignments,
            constraints=get_default_constraints(),
            max_iterations=request.max_iterations
        )
        
        if not result.is_valid:
            raise HTTPException(
                status_code=400,
                detail=f"No se pudo generar un horario válido. Restricciones violadas: {result.hard_violations}"
            )
        
        # Guardar horario en base de datos
        schedule_id = uuid4()
        
        lessons_response = [
            LessonResponse(
                id=lesson.id,
                teacher_id=lesson.teacher_id,
                subject_id=lesson.subject_id,
                group_id=lesson.group_id,
                room_id=lesson.room_id,
                time_slot_id=lesson.time_slot_id
            )
            for lesson in timetable.lessons
        ]
        
        evaluation_response = ScheduleEvaluationResponse(
            is_valid=result.is_valid,
            total_cost=result.total_cost,
            hard_violations=result.hard_violations,
            soft_costs=result.soft_costs
        )
        
        # Guardar en base de datos
        store.save_schedule(
            schedule_id=schedule_id,
            center_name=request.center_name,
            academic_year=request.academic_year,
            is_valid=result.is_valid,
            hard_violations=result.hard_violations,
            soft_cost=result.total_cost,
            lessons=timetable.lessons
        )
        
        return ScheduleResponse(
            id=schedule_id,
            center_name=request.center_name,
            lessons=lessons_response,
            evaluation=evaluation_response,
            created_at=datetime.now()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando horario: {str(e)}")


@router.get("", response_model=ScheduleListResponse)
async def list_schedules(skip: int = 0, limit: int = 100):
    """Listar todos los horarios generados."""
    schedules_list = []
    
    schedules = store.list_schedules()[skip:skip + limit]
    
    for schedule_data in schedules:
        schedules_list.append({
            "id": schedule_data["id"],
            "center_name": schedule_data["center_name"],
            "academic_year": schedule_data["academic_year"],
            "lessons": [],  # Empty for list view
            "evaluation": {
                "is_valid": schedule_data["is_valid"],
                "total_cost": schedule_data["soft_cost"],
                "hard_violations": schedule_data["hard_violations"],
                "soft_costs": {}
            },
            "created_at": schedule_data["created_at"]
        })
    
    all_schedules = store.list_schedules()
    
    return ScheduleListResponse(
        total=len(all_schedules),
        schedules=schedules_list
    )


@router.get("/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(schedule_id: UUID = Path(..., description="ID del horario")):
    """Obtener un horario específico con todas sus lecciones."""
    schedule_data = store.get_schedule(schedule_id)
    
    if not schedule_data:
        raise HTTPException(status_code=404, detail=f"Horario con ID {schedule_id} no encontrado")
    
    lessons_response = [
        LessonResponse(
            id=lesson["id"],
            teacher_id=lesson["teacher_id"],
            subject_id=lesson["subject_id"],
            group_id=lesson["group_id"],
            room_id=lesson["room_id"],
            time_slot_id=lesson["time_slot_id"]
        )
        for lesson in schedule_data["lessons"]
    ]
    
    evaluation_response = ScheduleEvaluationResponse(
        is_valid=schedule_data["is_valid"],
        total_cost=schedule_data["soft_cost"],
        hard_violations=schedule_data["hard_violations"],
        soft_costs={}
    )
    
    return ScheduleResponse(
        id=schedule_data["id"],
        center_name=schedule_data["center_name"],
        lessons=lessons_response,
        evaluation=evaluation_response,
        created_at=schedule_data["created_at"]
    )


@router.get("/{schedule_id}/teacher/{teacher_id}", response_model=TeacherScheduleResponse)
async def get_teacher_schedule(
    schedule_id: UUID = Path(..., description="ID del horario"),
    teacher_id: UUID = Path(..., description="ID del profesor")
):
    """Obtener el horario de un profesor específico dentro de un horario generado."""
    schedule_data = store.get_schedule(schedule_id)
    
    if not schedule_data:
        raise HTTPException(status_code=404, detail=f"Horario con ID {schedule_id} no encontrado")
    
    teacher = store.get_teacher(teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail=f"Profesor con ID {teacher_id} no encontrado")
    
    # Filter lessons for this teacher
    teacher_lessons = [
        lesson for lesson in schedule_data["lessons"]
        if lesson["teacher_id"] == teacher_id
    ]
    
    lessons_response = [
        LessonResponse(
            id=lesson["id"],
            teacher_id=lesson["teacher_id"],
            subject_id=lesson["subject_id"],
            group_id=lesson["group_id"],
            room_id=lesson["room_id"],
            time_slot_id=lesson["time_slot_id"]
        )
        for lesson in teacher_lessons
    ]
    
    # Calcular horas totales
    total_hours = len(teacher_lessons)
    
    return TeacherScheduleResponse(
        teacher_id=teacher_id,
        teacher_name=teacher.name,
        lessons=lessons_response,
        total_hours=total_hours,
        days_with_classes=len(set(l.time_slot_id for l in teacher_lessons))
    )


@router.get("/{schedule_id}/group/{group_id}", response_model=GroupScheduleResponse)
async def get_group_schedule(
    schedule_id: UUID = Path(..., description="ID del horario"),
    group_id: UUID = Path(..., description="ID del grupo")
):
    """Obtener el horario de un grupo específico dentro de un horario generado."""
    schedule_data = store.get_schedule(schedule_id)
    
    if not schedule_data:
        raise HTTPException(status_code=404, detail=f"Horario con ID {schedule_id} no encontrado")
    
    group = store.get_group(group_id)
    if not group:
        raise HTTPException(status_code=404, detail=f"Grupo con ID {group_id} no encontrado")
    
    # Filter lessons for this group
    group_lessons = [
        lesson for lesson in schedule_data["lessons"]
        if lesson["group_id"] == group_id
    ]
    
    lessons_response = [
        LessonResponse(
            id=lesson["id"],
            teacher_id=lesson["teacher_id"],
            subject_id=lesson["subject_id"],
            group_id=lesson["group_id"],
            room_id=lesson["room_id"],
            time_slot_id=lesson["time_slot_id"]
        )
        for lesson in group_lessons
    ]
    
    total_hours = len(group_lessons)
    
    return GroupScheduleResponse(
        group_id=group_id,
        group_name=group.name,
        lessons=lessons_response,
        total_hours=total_hours
    )


@router.delete("/{schedule_id}", status_code=204)
async def delete_schedule(schedule_id: UUID = Path(..., description="ID del horario")):
    """Eliminar un horario generado."""
    success = store.delete_schedule(schedule_id)
    
    if not success:
        raise HTTPException(status_code=404, detail=f"Horario con ID {schedule_id} no encontrado")
    
    return None
