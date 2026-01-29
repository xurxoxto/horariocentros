"""
Endpoints para gestión de profesores (CRUD).
Ahora usa DatabaseStore (backend.persistence.store) en lugar de diccionarios en memoria (Phase 3).
"""

from fastapi import APIRouter, HTTPException, Query, Path
from typing import List
from uuid import UUID
from datetime import datetime

from backend.domain.entities import Teacher, generate_id, FreeHourPreference
from backend.api.schemas import TeacherCreate, TeacherUpdate, TeacherResponse
from backend.api.store import store

router = APIRouter()


@router.post("", response_model=TeacherResponse, status_code=201)
async def create_teacher(teacher_data: TeacherCreate):
    """Crear un nuevo profesor."""
    teacher_id = generate_id()
    
    try:
        teacher = Teacher(
            id=teacher_id,
            name=teacher_data.name,
            max_hours_per_day=teacher_data.max_hours_per_day,
            max_hours_per_week=teacher_data.max_hours_per_week,
            prefer_consecutive_free_hours=teacher_data.prefer_consecutive_free_hours,
            free_hour_preference=FreeHourPreference(teacher_data.free_hour_preference.value),
            preferred_free_hours=set(teacher_data.preferred_free_hours),
            guard_hours=teacher_data.guard_hours,
            break_guard_hours=teacher_data.break_guard_hours,
            support_hours=teacher_data.support_hours,
            coordination_hours=teacher_data.coordination_hours,
            management_hours=teacher_data.management_hours,
            no_coordination_next_to_free=teacher_data.no_coordination_next_to_free,
        )
        created = store.create_teacher(teacher)
        
        return TeacherResponse(
            id=created.id,
            name=created.name,
            max_hours_per_day=created.max_hours_per_day,
            max_hours_per_week=created.max_hours_per_week,
            prefer_consecutive_free_hours=created.prefer_consecutive_free_hours,
            free_hour_preference=created.free_hour_preference.value,
            preferred_free_hours=list(created.preferred_free_hours),
            guard_hours=created.guard_hours,
            break_guard_hours=created.break_guard_hours,
            support_hours=created.support_hours,
            coordination_hours=created.coordination_hours,
            management_hours=created.management_hours,
            no_coordination_next_to_free=created.no_coordination_next_to_free,
            created_at=datetime.now()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=List[TeacherResponse])
async def list_teachers(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=1000)):
    """Listar todos los profesores."""
    teachers_list = store.list_teachers()[skip:skip + limit]
    return [
        TeacherResponse(
            id=t.id,
            name=t.name,
            max_hours_per_day=t.max_hours_per_day,
            max_hours_per_week=t.max_hours_per_week,
            prefer_consecutive_free_hours=t.prefer_consecutive_free_hours,
            free_hour_preference=t.free_hour_preference.value,
            preferred_free_hours=list(t.preferred_free_hours),
            guard_hours=t.guard_hours,
            break_guard_hours=t.break_guard_hours,
            support_hours=t.support_hours,
            coordination_hours=t.coordination_hours,
            management_hours=t.management_hours,
            no_coordination_next_to_free=t.no_coordination_next_to_free,
            created_at=datetime.now()
        )
        for t in teachers_list
    ]


@router.get("/{teacher_id}", response_model=TeacherResponse)
async def get_teacher(teacher_id: UUID = Path(..., description="ID del profesor")):
    """Obtener un profesor específico."""
    teacher = store.get_teacher(teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail=f"Profesor con ID {teacher_id} no encontrado")
    
    return TeacherResponse(
        id=teacher.id,
        name=teacher.name,
        max_hours_per_day=teacher.max_hours_per_day,
        max_hours_per_week=teacher.max_hours_per_week,
        prefer_consecutive_free_hours=teacher.prefer_consecutive_free_hours,
        free_hour_preference=teacher.free_hour_preference.value,
        preferred_free_hours=list(teacher.preferred_free_hours),
        guard_hours=teacher.guard_hours,
        break_guard_hours=teacher.break_guard_hours,
        support_hours=teacher.support_hours,
        coordination_hours=teacher.coordination_hours,
        management_hours=teacher.management_hours,
        no_coordination_next_to_free=teacher.no_coordination_next_to_free,
        created_at=datetime.now()
    )


@router.put("/{teacher_id}", response_model=TeacherResponse)
async def update_teacher(
    teacher_id: UUID = Path(..., description="ID del profesor"),
    teacher_data: TeacherUpdate = None
):
    """Actualizar un profesor."""
    teacher = store.get_teacher(teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail=f"Profesor con ID {teacher_id} no encontrado")
    
    try:
        new_free_pref = FreeHourPreference(teacher_data.free_hour_preference.value) if teacher_data.free_hour_preference is not None else teacher.free_hour_preference
        new_preferred_hours = set(teacher_data.preferred_free_hours) if teacher_data.preferred_free_hours is not None else teacher.preferred_free_hours
        
        updated_teacher = Teacher(
            id=teacher_id,
            name=teacher_data.name if teacher_data.name is not None else teacher.name,
            max_hours_per_day=teacher_data.max_hours_per_day if teacher_data.max_hours_per_day is not None else teacher.max_hours_per_day,
            max_hours_per_week=teacher_data.max_hours_per_week if teacher_data.max_hours_per_week is not None else teacher.max_hours_per_week,
            prefer_consecutive_free_hours=teacher_data.prefer_consecutive_free_hours if teacher_data.prefer_consecutive_free_hours is not None else teacher.prefer_consecutive_free_hours,
            free_hour_preference=new_free_pref,
            preferred_free_hours=new_preferred_hours,
            guard_hours=teacher_data.guard_hours if teacher_data.guard_hours is not None else teacher.guard_hours,
            break_guard_hours=teacher_data.break_guard_hours if teacher_data.break_guard_hours is not None else teacher.break_guard_hours,
            support_hours=teacher_data.support_hours if teacher_data.support_hours is not None else teacher.support_hours,
            coordination_hours=teacher_data.coordination_hours if teacher_data.coordination_hours is not None else teacher.coordination_hours,
            management_hours=teacher_data.management_hours if teacher_data.management_hours is not None else teacher.management_hours,
            no_coordination_next_to_free=teacher_data.no_coordination_next_to_free if teacher_data.no_coordination_next_to_free is not None else teacher.no_coordination_next_to_free,
        )
        updated = store.update_teacher(teacher_id, updated_teacher)
        
        return TeacherResponse(
            id=updated.id,
            name=updated.name,
            max_hours_per_day=updated.max_hours_per_day,
            max_hours_per_week=updated.max_hours_per_week,
            prefer_consecutive_free_hours=updated.prefer_consecutive_free_hours,
            free_hour_preference=updated.free_hour_preference.value,
            preferred_free_hours=list(updated.preferred_free_hours),
            guard_hours=updated.guard_hours,
            break_guard_hours=updated.break_guard_hours,
            support_hours=updated.support_hours,
            coordination_hours=updated.coordination_hours,
            management_hours=updated.management_hours,
            no_coordination_next_to_free=updated.no_coordination_next_to_free,
            created_at=datetime.now()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{teacher_id}", status_code=204)
async def delete_teacher(teacher_id: UUID = Path(..., description="ID del profesor")):
    """Eliminar un profesor."""
    success = store.delete_teacher(teacher_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Profesor con ID {teacher_id} no encontrado")
    return None
