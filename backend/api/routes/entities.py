"""
Endpoints genéricos para todas las entidades (Subjects, Groups, Rooms, TimeSlots, Assignments).

Este módulo proporciona un patrón CRUD reutilizable.
Ahora usa DatabaseStore (backend.persistence.store) en lugar de diccionarios en memoria (Phase 3).
"""

from fastapi import APIRouter, HTTPException, Query, Path
from typing import List
from uuid import UUID
from datetime import datetime

from backend.domain.entities import Subject, Group, Room, TimeSlot, SubjectAssignment, generate_id
from backend.api.schemas import (
    SubjectCreate, SubjectUpdate, SubjectResponse,
    GroupCreate, GroupUpdate, GroupResponse,
    RoomCreate, RoomUpdate, RoomResponse,
    TimeSlotCreate, TimeSlotUpdate, TimeSlotResponse,
    SubjectAssignmentCreate, SubjectAssignmentResponse
)
from backend.api.store import store


# ============================================================================
# ROUTER DE ASIGNATURAS
# ============================================================================

subjects_router = APIRouter()


@subjects_router.post("", response_model=SubjectResponse, status_code=201)
async def create_subject(subject_data: SubjectCreate):
    """Crear una nueva asignatura."""
    subject_id = generate_id()
    
    try:
        subject = Subject(
            id=subject_id,
            name=subject_data.name,
            code=subject_data.code,
            hours_per_week=subject_data.hours_per_week,
            requires_lab=subject_data.requires_lab
        )
        created = store.create_subject(subject)
        
        return SubjectResponse(
            id=created.id,
            name=created.name,
            code=created.code,
            hours_per_week=created.hours_per_week,
            requires_lab=created.requires_lab,
            created_at=datetime.now()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@subjects_router.get("", response_model=List[SubjectResponse])
async def list_subjects(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=1000)):
    """Listar todas las asignaturas."""
    subjects_list = store.list_subjects()[skip:skip + limit]
    return [
        SubjectResponse(
            id=s.id,
            name=s.name,
            code=s.code,
            hours_per_week=s.hours_per_week,
            requires_lab=s.requires_lab,
            created_at=datetime.now()
        )
        for s in subjects_list
    ]


@subjects_router.get("/{subject_id}", response_model=SubjectResponse)
async def get_subject(subject_id: UUID = Path(..., description="ID de la asignatura")):
    """Obtener una asignatura específica."""
    subject = store.get_subject(subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail=f"Asignatura con ID {subject_id} no encontrada")
    
    return SubjectResponse(
        id=subject.id,
        name=subject.name,
        code=subject.code,
        hours_per_week=subject.hours_per_week,
        requires_lab=subject.requires_lab,
        created_at=datetime.now()
    )


@subjects_router.put("/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: UUID = Path(..., description="ID de la asignatura"),
    subject_data: SubjectUpdate = None
):
    """Actualizar una asignatura."""
    subject = store.get_subject(subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail=f"Asignatura con ID {subject_id} no encontrada")
    
    try:
        updated_subject = Subject(
            id=subject_id,
            name=subject_data.name if subject_data.name is not None else subject.name,
            code=subject_data.code if subject_data.code is not None else subject.code,
            hours_per_week=subject_data.hours_per_week if subject_data.hours_per_week is not None else subject.hours_per_week,
            requires_lab=subject_data.requires_lab if subject_data.requires_lab is not None else subject.requires_lab
        )
        updated = store.update_subject(subject_id, updated_subject)
        
        return SubjectResponse(
            id=updated.id,
            name=updated.name,
            code=updated.code,
            hours_per_week=updated.hours_per_week,
            requires_lab=updated.requires_lab,
            created_at=datetime.now()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@subjects_router.delete("/{subject_id}", status_code=204)
async def delete_subject(subject_id: UUID = Path(..., description="ID de la asignatura")):
    """Eliminar una asignatura."""
    success = store.delete_subject(subject_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Asignatura con ID {subject_id} no encontrada")
    return None


# ============================================================================
# ROUTER DE GRUPOS
# ============================================================================

groups_router = APIRouter()


@groups_router.post("", response_model=GroupResponse, status_code=201)
async def create_group(group_data: GroupCreate):
    """Crear un nuevo grupo."""
    group_id = generate_id()
    
    try:
        group = Group(
            id=group_id,
            name=group_data.name,
            level=group_data.level,
            num_students=group_data.num_students
        )
        created = store.create_group(group)
        
        return GroupResponse(
            id=created.id,
            name=created.name,
            level=created.level,
            num_students=created.num_students,
            created_at=datetime.now()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@groups_router.get("", response_model=List[GroupResponse])
async def list_groups(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=1000)):
    """Listar todos los grupos."""
    groups_list = store.list_groups()[skip:skip + limit]
    return [
        GroupResponse(
            id=g.id,
            name=g.name,
            level=g.level,
            num_students=g.num_students,
            created_at=datetime.now()
        )
        for g in groups_list
    ]


@groups_router.get("/{group_id}", response_model=GroupResponse)
async def get_group(group_id: UUID = Path(..., description="ID del grupo")):
    """Obtener un grupo específico."""
    group = store.get_group(group_id)
    if not group:
        raise HTTPException(status_code=404, detail=f"Grupo con ID {group_id} no encontrado")
    
    return GroupResponse(
        id=group.id,
        name=group.name,
        level=group.level,
        num_students=group.num_students,
        created_at=datetime.now()
    )


@groups_router.put("/{group_id}", response_model=GroupResponse)
async def update_group(
    group_id: UUID = Path(..., description="ID del grupo"),
    group_data: GroupUpdate = None
):
    """Actualizar un grupo."""
    group = store.get_group(group_id)
    if not group:
        raise HTTPException(status_code=404, detail=f"Grupo con ID {group_id} no encontrado")
    
    try:
        updated_group = Group(
            id=group_id,
            name=group_data.name if group_data.name is not None else group.name,
            level=group_data.level if group_data.level is not None else group.level,
            num_students=group_data.num_students if group_data.num_students is not None else group.num_students
        )
        updated = store.update_group(group_id, updated_group)
        
        return GroupResponse(
            id=updated.id,
            name=updated.name,
            level=updated.level,
            num_students=updated.num_students,
            created_at=datetime.now()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@groups_router.delete("/{group_id}", status_code=204)
async def delete_group(group_id: UUID = Path(..., description="ID del grupo")):
    """Eliminar un grupo."""
    success = store.delete_group(group_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Grupo con ID {group_id} no encontrado")
    return None


# ============================================================================
# ROUTER DE AULAS
# ============================================================================

rooms_router = APIRouter()


@rooms_router.post("", response_model=RoomResponse, status_code=201)
async def create_room(room_data: RoomCreate):
    """Crear una nueva aula."""
    room_id = generate_id()
    
    try:
        room = Room(
            id=room_id,
            name=room_data.name,
            capacity=room_data.capacity,
            room_type=room_data.room_type
        )
        created = store.create_room(room)
        
        return RoomResponse(
            id=created.id,
            name=created.name,
            capacity=created.capacity,
            room_type=created.room_type,
            created_at=datetime.now()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@rooms_router.get("", response_model=List[RoomResponse])
async def list_rooms(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=1000)):
    """Listar todas las aulas."""
    rooms_list = store.list_rooms()[skip:skip + limit]
    return [
        RoomResponse(
            id=r.id,
            name=r.name,
            capacity=r.capacity,
            room_type=r.room_type,
            created_at=datetime.now()
        )
        for r in rooms_list
    ]


@rooms_router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: UUID = Path(..., description="ID del aula")):
    """Obtener un aula específica."""
    room = store.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail=f"Aula con ID {room_id} no encontrada")
    
    return RoomResponse(
        id=room.id,
        name=room.name,
        capacity=room.capacity,
        room_type=room.room_type,
        created_at=datetime.now()
    )


@rooms_router.put("/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: UUID = Path(..., description="ID del aula"),
    room_data: RoomUpdate = None
):
    """Actualizar un aula."""
    room = store.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail=f"Aula con ID {room_id} no encontrada")
    
    try:
        updated_room = Room(
            id=room_id,
            name=room_data.name if room_data.name is not None else room.name,
            capacity=room_data.capacity if room_data.capacity is not None else room.capacity,
            room_type=room_data.room_type if room_data.room_type is not None else room.room_type
        )
        updated = store.update_room(room_id, updated_room)
        
        return RoomResponse(
            id=updated.id,
            name=updated.name,
            capacity=updated.capacity,
            room_type=updated.room_type,
            created_at=datetime.now()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@rooms_router.delete("/{room_id}", status_code=204)
async def delete_room(room_id: UUID = Path(..., description="ID del aula")):
    """Eliminar un aula."""
    success = store.delete_room(room_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Aula con ID {room_id} no encontrada")
    return None


# ============================================================================
# ROUTER DE FRANJAS HORARIAS
# ============================================================================

time_slots_router = APIRouter()


@time_slots_router.post("", response_model=TimeSlotResponse, status_code=201)
async def create_time_slot(slot_data: TimeSlotCreate):
    """Crear una nueva franja horaria."""
    slot_id = generate_id()
    
    try:
        # Convert day int (0-6) to DayOfWeek enum
        day_map = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        from backend.domain.entities import DayOfWeek
        day_enum = DayOfWeek[day_map[slot_data.day].upper()]
        
        time_slot = TimeSlot(
            id=slot_id,
            day=day_enum,
            start_hour=slot_data.start_hour,
            start_minute=slot_data.start_minute,
            duration_minutes=slot_data.duration_minutes
        )
        created = store.create_time_slot(time_slot)
        
        return TimeSlotResponse(
            id=created.id,
            day=list(DayOfWeek).index(created.day),  # Convert back to int for response
            start_hour=created.start_hour,
            start_minute=created.start_minute,
            duration_minutes=created.duration_minutes,
            created_at=datetime.now()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@time_slots_router.get("", response_model=List[TimeSlotResponse])
async def list_time_slots(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=1000)):
    """Listar todas las franjas horarias."""
    slots_list = store.list_time_slots()[skip:skip + limit]
    return [
        TimeSlotResponse(
            id=s.id,
            day=s.day,
            hour=s.hour,
            duration_minutes=s.duration_minutes,
            created_at=datetime.now()
        )
        for s in slots_list
    ]


@time_slots_router.get("/{slot_id}", response_model=TimeSlotResponse)
async def get_time_slot(slot_id: UUID = Path(..., description="ID de la franja horaria")):
    """Obtener una franja horaria específica."""
    time_slot = store.get_time_slot(slot_id)
    if not time_slot:
        raise HTTPException(status_code=404, detail=f"Franja horaria con ID {slot_id} no encontrada")
    
    return TimeSlotResponse(
        id=time_slot.id,
        day=time_slot.day,
        hour=time_slot.hour,
        duration_minutes=time_slot.duration_minutes,
        created_at=datetime.now()
    )


@time_slots_router.put("/{slot_id}", response_model=TimeSlotResponse)
async def update_time_slot(
    slot_id: UUID = Path(..., description="ID de la franja horaria"),
    slot_data: TimeSlotUpdate = None
):
    """Actualizar una franja horaria."""
    time_slot = store.get_time_slot(slot_id)
    if not time_slot:
        raise HTTPException(status_code=404, detail=f"Franja horaria con ID {slot_id} no encontrada")
    
    try:
        updated_slot = TimeSlot(
            id=slot_id,
            day=slot_data.day if slot_data.day is not None else time_slot.day,
            hour=slot_data.hour if slot_data.hour is not None else time_slot.hour,
            duration_minutes=slot_data.duration_minutes if slot_data.duration_minutes is not None else time_slot.duration_minutes
        )
        updated = store.update_time_slot(slot_id, updated_slot)
        
        return TimeSlotResponse(
            id=updated.id,
            day=updated.day,
            hour=updated.hour,
            duration_minutes=updated.duration_minutes,
            created_at=datetime.now()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@time_slots_router.delete("/{slot_id}", status_code=204)
async def delete_time_slot(slot_id: UUID = Path(..., description="ID de la franja horaria")):
    """Eliminar una franja horaria."""
    success = store.delete_time_slot(slot_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Franja horaria con ID {slot_id} no encontrada")
    return None


# ============================================================================
# ROUTER DE ASIGNACIONES
# ============================================================================

assignments_router = APIRouter()


@assignments_router.post("", response_model=SubjectAssignmentResponse, status_code=201)
async def create_assignment(assignment_data: SubjectAssignmentCreate):
    """Crear una nueva asignación profesor-asignatura-grupo."""
    # Validar que existan las entidades referenciadas
    if not store.get_teacher(assignment_data.teacher_id):
        raise HTTPException(status_code=400, detail=f"Profesor con ID {assignment_data.teacher_id} no existe")
    if not store.get_subject(assignment_data.subject_id):
        raise HTTPException(status_code=400, detail=f"Asignatura con ID {assignment_data.subject_id} no existe")
    if not store.get_group(assignment_data.group_id):
        raise HTTPException(status_code=400, detail=f"Grupo con ID {assignment_data.group_id} no existe")
    
    assignment_id = generate_id()
    assignment = SubjectAssignment(
        id=assignment_id,
        teacher_id=assignment_data.teacher_id,
        subject_id=assignment_data.subject_id,
        group_id=assignment_data.group_id
    )
    
    created = store.create_assignment(assignment)
    
    return SubjectAssignmentResponse(
        id=created.id,
        teacher_id=created.teacher_id,
        subject_id=created.subject_id,
        group_id=created.group_id,
        created_at=datetime.now()
    )


@assignments_router.get("", response_model=List[SubjectAssignmentResponse])
async def list_assignments(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=1000)):
    """Listar todas las asignaciones."""
    assignments_list = store.list_assignments()[skip:skip + limit]
    return [
        SubjectAssignmentResponse(
            id=a.id,
            teacher_id=a.teacher_id,
            subject_id=a.subject_id,
            group_id=a.group_id,
            created_at=datetime.now()
        )
        for a in assignments_list
    ]


@assignments_router.get("/{assignment_id}", response_model=SubjectAssignmentResponse)
async def get_assignment(assignment_id: UUID = Path(..., description="ID de la asignación")):
    """Obtener una asignación específica."""
    assignment = store.get_assignment(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail=f"Asignación con ID {assignment_id} no encontrada")
    
    return SubjectAssignmentResponse(
        id=assignment.id,
        teacher_id=assignment.teacher_id,
        subject_id=assignment.subject_id,
        group_id=assignment.group_id,
        created_at=datetime.now()
    )


@assignments_router.put("/{assignment_id}", response_model=SubjectAssignmentResponse)
async def update_assignment(
    assignment_id: UUID = Path(..., description="ID de la asignación"),
    assignment_data: SubjectAssignmentCreate = None
):
    """Actualizar una asignación."""
    assignment = store.get_assignment(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail=f"Asignación con ID {assignment_id} no encontrada")
    
    # Validar referencias
    if not store.get_teacher(assignment_data.teacher_id):
        raise HTTPException(status_code=400, detail=f"Profesor con ID {assignment_data.teacher_id} no existe")
    if not store.get_subject(assignment_data.subject_id):
        raise HTTPException(status_code=400, detail=f"Asignatura con ID {assignment_data.subject_id} no existe")
    if not store.get_group(assignment_data.group_id):
        raise HTTPException(status_code=400, detail=f"Grupo con ID {assignment_data.group_id} no existe")
    
    updated_assignment = SubjectAssignment(
        id=assignment_id,
        teacher_id=assignment_data.teacher_id,
        subject_id=assignment_data.subject_id,
        group_id=assignment_data.group_id
    )
    
    updated = store.update_assignment(assignment_id, updated_assignment)
    
    return SubjectAssignmentResponse(
        id=updated.id,
        teacher_id=updated.teacher_id,
        subject_id=updated.subject_id,
        group_id=updated.group_id,
        created_at=datetime.now()
    )


@assignments_router.delete("/{assignment_id}", status_code=204)
async def delete_assignment(assignment_id: UUID = Path(..., description="ID de la asignación")):
    """Eliminar una asignación."""
    success = store.delete_assignment(assignment_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Asignación con ID {assignment_id} no encontrada")
    return None
