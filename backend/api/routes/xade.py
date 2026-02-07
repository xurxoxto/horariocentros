"""
Rutas API para la integración con XADE.

Endpoints para:
1. Importar datos desde ficheros CSV descargados de XADE
2. Confirmar la importación (crear entidades en el sistema)
3. Exportar el horario resuelto en formato CSV para subir a XADE
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from typing import List, Optional
from datetime import datetime
from uuid import UUID
import io
import json

from backend.xade.importer import import_from_csv_files, import_from_zip, XadeImportResult
from backend.xade.exporter import (
    export_group_timetable_csv,
    export_full_timetable_csv,
    export_timetable_zip,
)
from backend.domain.entities import (
    Teacher, Subject, Group, Room, TimeSlot, SubjectAssignment,
    DayOfWeek, generate_id,
)
from backend.api.store import store


router = APIRouter()


# ============================================================================
# IMPORTACIÓN DESDE XADE
# ============================================================================

@router.post("/import/preview")
async def preview_xade_import(files: List[UploadFile] = File(...)):
    """
    Previsualizar los datos que se importarán desde XADE.
    
    Sube uno o más ficheros CSV (o un ZIP) descargados de XADE Horarios.
    Retorna un preview de los datos que se importarán sin modificar la base de datos.
    
    Los ficheros se clasifican automáticamente por su nombre:
    - profesores.csv, materias.csv, grupos.csv, aulas.csv, cursos.csv, horario_base.csv
    """
    csv_files = {}
    
    for upload_file in files:
        content = await upload_file.read()
        filename = upload_file.filename or "unknown.csv"
        
        if filename.lower().endswith('.zip'):
            # Process ZIP file
            result = import_from_zip(content)
            return {
                "status": "preview",
                "data": {
                    "teachers": result.teachers,
                    "subjects": result.subjects,
                    "groups": result.groups,
                    "rooms": result.rooms,
                    "courses": result.courses,
                    "time_slots": result.time_slots,
                    "assignments": result.assignments,
                },
                "summary": result.summary,
                "files_processed": result.files_processed,
                "warnings": result.warnings,
                "errors": result.errors,
            }
        else:
            csv_files[filename] = content
    
    if not csv_files:
        raise HTTPException(status_code=400, detail="Non se atoparon ficheiros CSV válidos")
    
    result = import_from_csv_files(csv_files)
    
    # Remove 'raw' field to reduce response size
    def clean_raw(items):
        return [{k: v for k, v in item.items() if k != 'raw'} for item in items]
    
    return {
        "status": "preview",
        "data": {
            "teachers": clean_raw(result.teachers),
            "subjects": clean_raw(result.subjects),
            "groups": clean_raw(result.groups),
            "rooms": clean_raw(result.rooms),
            "courses": clean_raw(result.courses),
            "time_slots": clean_raw(result.time_slots),
            "assignments": clean_raw(result.assignments),
        },
        "summary": result.summary,
        "files_processed": result.files_processed,
        "warnings": result.warnings,
        "errors": result.errors,
    }


@router.post("/import/confirm")
async def confirm_xade_import(files: List[UploadFile] = File(...)):
    """
    Confirmar e importar los datos de XADE al sistema.
    
    Sube los mismos ficheros que en el preview. Los datos se crean en la base de datos.
    Si ya existen entidades con el mismo nombre, se omiten y se reporta un aviso.
    """
    csv_files = {}
    result = None
    
    for upload_file in files:
        content = await upload_file.read()
        filename = upload_file.filename or "unknown.csv"
        
        if filename.lower().endswith('.zip'):
            result = import_from_zip(content)
            break
        else:
            csv_files[filename] = content
    
    if result is None:
        if not csv_files:
            raise HTTPException(status_code=400, detail="Non se atoparon ficheiros válidos")
        result = import_from_csv_files(csv_files)
    
    created = {
        "teachers": 0,
        "subjects": 0,
        "groups": 0,
        "rooms": 0,
        "time_slots": 0,
        "assignments": 0,
    }
    skipped = {
        "teachers": 0,
        "subjects": 0,
        "groups": 0,
        "rooms": 0,
        "time_slots": 0,
    }
    import_warnings = list(result.warnings)
    
    # Create teachers
    teacher_map = {}  # xade_name -> uuid
    for t_data in result.teachers:
        try:
            teacher_id = generate_id()
            teacher = Teacher(
                id=teacher_id,
                name=t_data['name'],
            )
            store.create_teacher(teacher)
            teacher_map[t_data['name']] = teacher_id
            created["teachers"] += 1
        except (ValueError, Exception) as e:
            if "already exists" in str(e).lower():
                skipped["teachers"] += 1
                # Try to find existing teacher
                existing = [t for t in store.list_teachers() if t.name == t_data['name']]
                if existing:
                    teacher_map[t_data['name']] = existing[0].id
            else:
                import_warnings.append(f"Erro ao crear profesor '{t_data['name']}': {str(e)}")
    
    # Create subjects
    subject_map = {}  # xade_name -> uuid
    for s_data in result.subjects:
        try:
            subject_id = generate_id()
            subject = Subject(
                id=subject_id,
                name=s_data['name'],
                code=s_data['xade_code'] or s_data['name'][:10].upper().replace(' ', '_'),
                hours_per_week=s_data['hours_per_week'],
            )
            store.create_subject(subject)
            subject_map[s_data['name']] = subject_id
            created["subjects"] += 1
        except (ValueError, Exception) as e:
            if "already exists" in str(e).lower():
                skipped["subjects"] += 1
                existing = [s for s in store.list_subjects() if s.name == s_data['name']]
                if existing:
                    subject_map[s_data['name']] = existing[0].id
            else:
                import_warnings.append(f"Erro ao crear materia '{s_data['name']}': {str(e)}")
    
    # Create groups
    group_map = {}  # xade_name -> uuid
    for g_data in result.groups:
        try:
            group_id = generate_id()
            group = Group(
                id=group_id,
                name=g_data['name'],
                level=g_data.get('level', g_data.get('course', 'SEN_NIVEL')),
                num_students=g_data.get('num_students', 25),
            )
            store.create_group(group)
            group_map[g_data['name']] = group_id
            created["groups"] += 1
        except (ValueError, Exception) as e:
            if "already exists" in str(e).lower():
                skipped["groups"] += 1
                existing = [g for g in store.list_groups() if g.name == g_data['name']]
                if existing:
                    group_map[g_data['name']] = existing[0].id
            else:
                import_warnings.append(f"Erro ao crear grupo '{g_data['name']}': {str(e)}")
    
    # Create rooms
    for r_data in result.rooms:
        try:
            room_id = generate_id()
            room = Room(
                id=room_id,
                name=r_data['name'],
                capacity=r_data.get('capacity', 30),
                room_type=r_data.get('room_type', 'standard'),
            )
            store.create_room(room)
            created["rooms"] += 1
        except (ValueError, Exception) as e:
            if "already exists" in str(e).lower():
                skipped["rooms"] += 1
            else:
                import_warnings.append(f"Erro ao crear aula '{r_data['name']}': {str(e)}")
    
    # Create time slots
    for ts_data in result.time_slots:
        try:
            slot_id = generate_id()
            day_enum = DayOfWeek(ts_data['day'])
            time_slot = TimeSlot(
                id=slot_id,
                day=day_enum,
                start_hour=ts_data['start_hour'],
                start_minute=ts_data['start_minute'],
                duration_minutes=ts_data['duration_minutes'],
            )
            store.create_time_slot(time_slot)
            created["time_slots"] += 1
        except (ValueError, Exception) as e:
            if "already exists" in str(e).lower():
                skipped["time_slots"] += 1
            else:
                import_warnings.append(f"Erro ao crear franxa horaria: {str(e)}")
    
    # Create assignments (if teacher, subject, and group can be resolved)
    for a_data in result.assignments:
        teacher_id = teacher_map.get(a_data.get('teacher_name'))
        subject_id = subject_map.get(a_data.get('subject_name'))
        group_id = group_map.get(a_data.get('group_name'))
        
        if teacher_id and subject_id and group_id:
            try:
                assignment_id = generate_id()
                assignment = SubjectAssignment(
                    id=assignment_id,
                    teacher_id=teacher_id,
                    subject_id=subject_id,
                    group_id=group_id,
                )
                store.create_assignment(assignment)
                created["assignments"] += 1
            except Exception as e:
                import_warnings.append(
                    f"Erro ao crear asignación ({a_data.get('teacher_name')} - "
                    f"{a_data.get('subject_name')} - {a_data.get('group_name')}): {str(e)}"
                )
        else:
            missing = []
            if not teacher_id:
                missing.append(f"profesor '{a_data.get('teacher_name')}'")
            if not subject_id:
                missing.append(f"materia '{a_data.get('subject_name')}'")
            if not group_id:
                missing.append(f"grupo '{a_data.get('group_name')}'")
            import_warnings.append(
                f"Asignación omitida: non se atoparon {', '.join(missing)}"
            )
    
    return {
        "status": "imported",
        "created": created,
        "skipped": skipped,
        "warnings": import_warnings,
        "errors": result.errors,
        "summary": {
            "total_created": sum(created.values()),
            "total_skipped": sum(skipped.values()),
        }
    }


# ============================================================================
# EXPORTACIÓN PARA XADE
# ============================================================================

@router.get("/export/preview")
async def preview_xade_export(
    schedule_id: Optional[str] = Query(None, description="ID del horario a exportar (opcional, usa el más reciente)")
):
    """
    Previsualizar los datos que se exportarán para XADE.
    
    Retorna un resumen de lo que contendría el fichero de exportación.
    """
    # Get schedule lessons
    schedules = store.list_schedules() if hasattr(store, 'list_schedules') else []
    
    if schedule_id:
        schedule = store.get_schedule(UUID(schedule_id)) if hasattr(store, 'get_schedule') else None
        if not schedule:
            raise HTTPException(status_code=404, detail=f"Horario con ID {schedule_id} non atopado")
    elif schedules:
        schedule = schedules[-1]  # Most recent
    else:
        # Build from current assignments and data
        return {
            "status": "no_schedule",
            "message": "Non hai horarios xerados. Xera un horario primeiro antes de exportar.",
            "entities": {
                "teachers": len(store.list_teachers()),
                "subjects": len(store.list_subjects()),
                "groups": len(store.list_groups()),
                "rooms": len(store.list_rooms()),
                "assignments": len(store.list_assignments()),
            }
        }
    
    # Build lessons data from schedule
    lessons_data = []
    groups = {g.id: g for g in store.list_groups()}
    teachers = {t.id: t for t in store.list_teachers()}
    subjects = {s.id: s for s in store.list_subjects()}
    rooms = {r.id: r for r in store.list_rooms()}
    
    if hasattr(schedule, 'lessons'):
        for lesson in schedule.lessons:
            teacher = teachers.get(lesson.teacher_id)
            subject = subjects.get(lesson.subject_id)
            group = groups.get(lesson.group_id)
            room = rooms.get(lesson.room_id)
            
            lessons_data.append({
                "group_name": group.name if group else "?",
                "teacher_name": teacher.name if teacher else "?",
                "subject_name": subject.name if subject else "?",
                "subject_code": subject.code if subject else "?",
                "room_name": room.name if room else "?",
                "day": lesson.day if hasattr(lesson, 'day') else 0,
                "start_hour": lesson.start_hour if hasattr(lesson, 'start_hour') else 0,
                "start_minute": lesson.start_minute if hasattr(lesson, 'start_minute') else 0,
            })
    
    # Group by group
    by_group = {}
    for l in lessons_data:
        gn = l['group_name']
        if gn not in by_group:
            by_group[gn] = []
        by_group[gn].append(l)
    
    return {
        "status": "ready",
        "schedule_id": str(schedule.id) if hasattr(schedule, 'id') else None,
        "total_lessons": len(lessons_data),
        "groups": list(by_group.keys()),
        "lessons_per_group": {k: len(v) for k, v in by_group.items()},
    }


@router.get("/export/csv")
async def export_xade_csv(
    schedule_id: Optional[str] = Query(None),
    language: str = Query('gl', description="Idioma: 'gl' (galego) ou 'es' (castelán)"),
    format: str = Query('zip', description="Formato: 'zip' (un ficheiro por grupo) ou 'unified' (un só ficheiro)"),
):
    """
    Exportar el horario en formato CSV para subir a XADE.
    
    Genera un ZIP con un CSV por grupo, o un CSV unificado.
    """
    # Get all data
    groups = store.list_groups()
    teachers = {t.id: t for t in store.list_teachers()}
    subjects = {s.id: s for s in store.list_subjects()}
    rooms_dict = {r.id: r for r in store.list_rooms()}
    
    # Try to get schedule lessons
    lessons_data = []
    schedules = store.list_schedules() if hasattr(store, 'list_schedules') else []
    
    schedule = None
    if schedule_id:
        schedule = store.get_schedule(UUID(schedule_id)) if hasattr(store, 'get_schedule') else None
    elif schedules:
        schedule = schedules[-1]
    
    if schedule and hasattr(schedule, 'lessons'):
        time_slots = {ts.id: ts for ts in store.list_time_slots()}
        
        for lesson in schedule.lessons:
            teacher = teachers.get(lesson.teacher_id)
            subject = subjects.get(lesson.subject_id)
            group = next((g for g in groups if g.id == lesson.group_id), None)
            room = rooms_dict.get(lesson.room_id)
            ts = time_slots.get(lesson.time_slot_id) if hasattr(lesson, 'time_slot_id') else None
            
            lessons_data.append({
                "group_name": group.name if group else "?",
                "teacher_name": teacher.name if teacher else "?",
                "subject_name": subject.name if subject else "?",
                "subject_code": subject.code if subject else "?",
                "room_name": room.name if room else "?",
                "day": ts.day.value if ts else 0,
                "start_hour": ts.start_hour if ts else 0,
                "start_minute": ts.start_minute if ts else 0,
                "duration_minutes": ts.duration_minutes if ts else 60,
            })
    
    if not lessons_data:
        raise HTTPException(
            status_code=404,
            detail="Non hai datos de horario para exportar. Xera un horario primeiro."
        )
    
    center_name = "Centro Educativo"
    
    if format == 'unified':
        csv_content = export_full_timetable_csv(center_name, lessons_data, language)
        
        return StreamingResponse(
            io.BytesIO(csv_content.encode('utf-8-sig')),
            media_type='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename="horario_xade_{datetime.now().strftime("%Y%m%d")}.csv"'
            }
        )
    else:
        # Group lessons by group name
        by_group = {}
        for l in lessons_data:
            gn = l['group_name']
            if gn not in by_group:
                by_group[gn] = []
            by_group[gn].append(l)
        
        zip_content = export_timetable_zip(
            center_name, by_group, 
            include_teacher_schedules=True,
            language=language,
            prefix='horario_xade'
        )
        
        return StreamingResponse(
            io.BytesIO(zip_content),
            media_type='application/zip',
            headers={
                'Content-Disposition': f'attachment; filename="horarios_xade_{datetime.now().strftime("%Y%m%d")}.zip"'
            }
        )


# ============================================================================
# INFORMACIÓN Y UTILIDADES
# ============================================================================

@router.get("/info")
async def xade_info():
    """
    Información sobre la integración con XADE y los formatos soportados.
    """
    return {
        "name": "Integración XADE",
        "description": "Importar e exportar datos entre HorarioCentros e o sistema XADE da Xunta de Galicia",
        "import_formats": {
            "csv": {
                "description": "Ficheiros CSV descargados de XADE Horarios",
                "separator": ";",
                "encoding": "UTF-8 ou ISO-8859-1 (detección automática)",
                "files": [
                    {"name": "profesores.csv", "description": "Lista de profesores do centro"},
                    {"name": "materias.csv", "description": "Lista de materias/asignaturas"},
                    {"name": "grupos.csv", "description": "Grupos simples do centro"},
                    {"name": "aulas.csv", "description": "Espazos/aulas do centro"},
                    {"name": "cursos.csv", "description": "Cursos/niveis educativos"},
                    {"name": "horario_base.csv", "description": "Franxas horarias (sesións)"},
                    {"name": "asignaciones.csv", "description": "Asignacións profesor-materia-grupo"},
                ],
            },
            "zip": {
                "description": "Ficheiro ZIP cos CSV de XADE",
            },
        },
        "export_formats": {
            "csv_unified": "Un ficheiro CSV co horario completo",
            "zip": "Un ZIP cun CSV por grupo e profesor",
        },
        "workflow": [
            "1. Configurar a información necesaria en XADE (abrir novo curso escolar)",
            "2. Descargar os ficheiros CSV de XADE Horarios (pestaña 'Descargas')",
            "3. Importar os ficheiros CSV en HorarioCentros",
            "4. Configurar restricións e preferencias en HorarioCentros",
            "5. Xerar o horario en HorarioCentros",
            "6. Exportar a solución en formato CSV",
            "7. Subir o ficheiro CSV a XADE Horarios (pestaña 'Subidas')",
        ],
    }
