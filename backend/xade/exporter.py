"""
Módulo de exportación de horarios para XADE.

Genera los ficheros CSV en el formato que XADE espera para importar
los horarios resueltos. Se suben desde la aplicación "Xade Horarios"
en la pestaña "Subidas".

El formato de exportación genera un CSV por grupo con las sesiones del horario,
incluyendo: día, sesión, materia, profesor y aula.
"""

import csv
import io
import zipfile
from typing import Dict, List, Optional, Any
from datetime import datetime


DAY_NAMES_GL = {
    0: 'Luns',
    1: 'Martes',
    2: 'Mércores',
    3: 'Xoves',
    4: 'Venres',
    5: 'Sábado',
    6: 'Domingo',
}

DAY_NAMES_ES = {
    0: 'Lunes',
    1: 'Martes',
    2: 'Miércoles',
    3: 'Jueves',
    4: 'Viernes',
    5: 'Sábado',
    6: 'Domingo',
}


def _format_time(hour: int, minute: int = 0) -> str:
    """Formatear hora en HH:MM."""
    return f"{hour:02d}:{minute:02d}"


def export_group_timetable_csv(
    group_name: str,
    lessons: List[Dict[str, Any]],
    language: str = 'gl'
) -> str:
    """
    Exportar el horario de un grupo como CSV para XADE.
    
    Args:
        group_name: Nombre del grupo
        lessons: Lista de lecciones con campos:
            - day (int): 0=lunes, 4=viernes
            - start_hour (int): hora de inicio
            - start_minute (int): minuto de inicio
            - end_hour (int): hora de fin (opcional)
            - end_minute (int): minuto de fin (opcional)
            - duration_minutes (int): duración en minutos
            - subject_name (str): nombre de la materia
            - subject_code (str): código de la materia
            - teacher_name (str): nombre del profesor
            - room_name (str): nombre del aula
            - session_number (int): número de sesión (opcional)
        language: 'gl' (gallego) o 'es' (castellano)
    
    Returns:
        Contenido CSV como string
    """
    day_names = DAY_NAMES_GL if language == 'gl' else DAY_NAMES_ES
    
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';', quoting=csv.QUOTE_MINIMAL)
    
    # Header
    if language == 'gl':
        writer.writerow([
            'Grupo', 'Día', 'Sesión', 'Hora_Inicio', 'Hora_Fin',
            'Materia', 'Código_Materia', 'Profesor/a', 'Aula'
        ])
    else:
        writer.writerow([
            'Grupo', 'Día', 'Sesión', 'Hora_Inicio', 'Hora_Fin',
            'Materia', 'Código_Materia', 'Profesor/a', 'Aula'
        ])
    
    # Sort lessons by day, then by start hour
    sorted_lessons = sorted(lessons, key=lambda l: (l.get('day', 0), l.get('start_hour', 0), l.get('start_minute', 0)))
    
    for lesson in sorted_lessons:
        day = lesson.get('day', 0)
        start_hour = lesson.get('start_hour', 0)
        start_minute = lesson.get('start_minute', 0)
        duration = lesson.get('duration_minutes', 60)
        
        end_total = start_hour * 60 + start_minute + duration
        end_hour = lesson.get('end_hour', end_total // 60)
        end_minute = lesson.get('end_minute', end_total % 60)
        
        session_num = lesson.get('session_number', '')
        
        writer.writerow([
            group_name,
            day_names.get(day, str(day)),
            session_num,
            _format_time(start_hour, start_minute),
            _format_time(end_hour, end_minute),
            lesson.get('subject_name', ''),
            lesson.get('subject_code', ''),
            lesson.get('teacher_name', ''),
            lesson.get('room_name', ''),
        ])
    
    return output.getvalue()


def export_teacher_timetable_csv(
    teacher_name: str,
    lessons: List[Dict[str, Any]],
    language: str = 'gl'
) -> str:
    """
    Exportar el horario de un profesor como CSV.
    
    Args:
        teacher_name: Nombre del profesor
        lessons: Lista de lecciones con los mismos campos que export_group_timetable_csv
                 más group_name
        language: 'gl' o 'es'
    
    Returns:
        Contenido CSV como string
    """
    day_names = DAY_NAMES_GL if language == 'gl' else DAY_NAMES_ES
    
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';', quoting=csv.QUOTE_MINIMAL)
    
    writer.writerow([
        'Profesor/a', 'Día', 'Sesión', 'Hora_Inicio', 'Hora_Fin',
        'Materia', 'Grupo', 'Aula'
    ])
    
    sorted_lessons = sorted(lessons, key=lambda l: (l.get('day', 0), l.get('start_hour', 0), l.get('start_minute', 0)))
    
    for lesson in sorted_lessons:
        day = lesson.get('day', 0)
        start_hour = lesson.get('start_hour', 0)
        start_minute = lesson.get('start_minute', 0)
        duration = lesson.get('duration_minutes', 60)
        
        end_total = start_hour * 60 + start_minute + duration
        end_hour = lesson.get('end_hour', end_total // 60)
        end_minute = lesson.get('end_minute', end_total % 60)
        
        writer.writerow([
            teacher_name,
            day_names.get(day, str(day)),
            lesson.get('session_number', ''),
            _format_time(start_hour, start_minute),
            _format_time(end_hour, end_minute),
            lesson.get('subject_name', ''),
            lesson.get('group_name', ''),
            lesson.get('room_name', ''),
        ])
    
    return output.getvalue()


def export_full_timetable_csv(
    center_name: str,
    all_lessons: List[Dict[str, Any]],
    language: str = 'gl'
) -> str:
    """
    Exportar el horario completo del centro como CSV unificado.
    
    Args:
        center_name: Nombre del centro
        all_lessons: Todas las lecciones del horario
        language: 'gl' o 'es'
    
    Returns:
        Contenido CSV como string
    """
    day_names = DAY_NAMES_GL if language == 'gl' else DAY_NAMES_ES
    
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';', quoting=csv.QUOTE_MINIMAL)
    
    # Metadata header
    writer.writerow([f'# Centro: {center_name}'])
    writer.writerow([f'# Data de exportación: {datetime.now().strftime("%d/%m/%Y %H:%M")}'])
    writer.writerow([f'# Xerado por HorarioCentros'])
    writer.writerow([])
    
    writer.writerow([
        'Grupo', 'Día', 'Sesión', 'Hora_Inicio', 'Hora_Fin',
        'Materia', 'Código_Materia', 'Profesor/a', 'Aula'
    ])
    
    sorted_lessons = sorted(all_lessons, key=lambda l: (
        l.get('group_name', ''),
        l.get('day', 0),
        l.get('start_hour', 0),
        l.get('start_minute', 0)
    ))
    
    for lesson in sorted_lessons:
        day = lesson.get('day', 0)
        start_hour = lesson.get('start_hour', 0)
        start_minute = lesson.get('start_minute', 0)
        duration = lesson.get('duration_minutes', 60)
        
        end_total = start_hour * 60 + start_minute + duration
        end_hour = lesson.get('end_hour', end_total // 60)
        end_minute = lesson.get('end_minute', end_total % 60)
        
        writer.writerow([
            lesson.get('group_name', ''),
            day_names.get(day, str(day)),
            lesson.get('session_number', ''),
            _format_time(start_hour, start_minute),
            _format_time(end_hour, end_minute),
            lesson.get('subject_name', ''),
            lesson.get('subject_code', ''),
            lesson.get('teacher_name', ''),
            lesson.get('room_name', ''),
        ])
    
    return output.getvalue()


def export_timetable_zip(
    center_name: str,
    lessons_by_group: Dict[str, List[Dict[str, Any]]],
    include_teacher_schedules: bool = True,
    language: str = 'gl',
    prefix: str = 'horario'
) -> bytes:
    """
    Exportar el horario completo como ZIP con un CSV por grupo (y opcionalmente por profesor).
    
    Args:
        center_name: Nombre del centro
        lessons_by_group: Diccionario {nombre_grupo: [lecciones]}
        include_teacher_schedules: Si incluir también horarios por profesor
        language: 'gl' o 'es'
        prefix: Prefijo para los nombres de fichero
    
    Returns:
        Contenido del ZIP en bytes
    """
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Export per group
        all_lessons = []
        for group_name, lessons in lessons_by_group.items():
            csv_content = export_group_timetable_csv(group_name, lessons, language)
            safe_name = group_name.replace(' ', '_').replace('/', '-').replace('º', 'o')
            zf.writestr(f"{prefix}_{safe_name}.csv", csv_content.encode('utf-8-sig'))
            all_lessons.extend(lessons)
        
        # Export unified file
        unified = export_full_timetable_csv(center_name, all_lessons, language)
        zf.writestr(f"{prefix}_completo.csv", unified.encode('utf-8-sig'))
        
        # Export per teacher
        if include_teacher_schedules:
            lessons_by_teacher: Dict[str, List[Dict[str, Any]]] = {}
            for group_name, lessons in lessons_by_group.items():
                for lesson in lessons:
                    teacher = lesson.get('teacher_name', 'Sen profesor')
                    if teacher not in lessons_by_teacher:
                        lessons_by_teacher[teacher] = []
                    lesson_with_group = {**lesson, 'group_name': group_name}
                    lessons_by_teacher[teacher].append(lesson_with_group)
            
            for teacher_name, t_lessons in lessons_by_teacher.items():
                csv_content = export_teacher_timetable_csv(teacher_name, t_lessons, language)
                safe_name = teacher_name.replace(' ', '_').replace(',', '').replace('/', '-')
                zf.writestr(f"{prefix}_profesor_{safe_name}.csv", csv_content.encode('utf-8-sig'))
    
    return zip_buffer.getvalue()
