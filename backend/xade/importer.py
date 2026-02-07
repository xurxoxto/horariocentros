"""
Módulo de importación de datos desde XADE.

Parsea los ficheros CSV descargados de la aplicación "Xade Horarios"
(pestaña "Descargas") y los convierte a las entidades de dominio de HorarioCentros.

Ficheros CSV esperados de XADE:
- profesores.csv: Lista de profesores del centro
- materias.csv: Lista de materias/asignaturas
- grupos.csv: Grupos simples del centro
- aulas.csv: Espazos/aulas del centro
- cursos.csv: Cursos/niveles educativos
- horario_base.csv: Franjas horarias (sesiones) del horario base

El separador de campos en XADE es el punto y coma (;).
La codificación suele ser UTF-8 o ISO-8859-1 (Latin-1).
"""

import csv
import io
import zipfile
import os
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from uuid import UUID

from backend.domain.entities import (
    Teacher,
    Subject,
    Group,
    Room,
    TimeSlot,
    SubjectAssignment,
    DayOfWeek,
    generate_id,
)


@dataclass
class XadeImportResult:
    """Resultado de una importación desde XADE."""
    teachers: List[Dict[str, Any]] = field(default_factory=list)
    subjects: List[Dict[str, Any]] = field(default_factory=list)
    groups: List[Dict[str, Any]] = field(default_factory=list)
    rooms: List[Dict[str, Any]] = field(default_factory=list)
    courses: List[Dict[str, Any]] = field(default_factory=list)
    time_slots: List[Dict[str, Any]] = field(default_factory=list)
    assignments: List[Dict[str, Any]] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    files_processed: List[str] = field(default_factory=list)

    @property
    def summary(self) -> Dict[str, int]:
        return {
            "profesores": len(self.teachers),
            "materias": len(self.subjects),
            "grupos": len(self.groups),
            "aulas": len(self.rooms),
            "cursos": len(self.courses),
            "franxas_horarias": len(self.time_slots),
            "asignacións": len(self.assignments),
            "avisos": len(self.warnings),
            "erros": len(self.errors),
            "ficheiros_procesados": len(self.files_processed),
        }


def _detect_encoding(content: bytes) -> str:
    """Detectar la codificación del fichero CSV."""
    try:
        content.decode('utf-8')
        return 'utf-8'
    except UnicodeDecodeError:
        try:
            content.decode('iso-8859-1')
            return 'iso-8859-1'
        except UnicodeDecodeError:
            return 'utf-8'


def _detect_separator(first_line: str) -> str:
    """Detectar el separador de campos del CSV."""
    if ';' in first_line:
        return ';'
    elif '\t' in first_line:
        return '\t'
    elif ',' in first_line:
        return ','
    return ';'


def _parse_csv_content(content: bytes, filename: str = "") -> Tuple[List[Dict[str, str]], str]:
    """
    Parsear contenido CSV, detectando codificación y separador automáticamente.
    Retorna lista de diccionarios y el separador detectado.
    """
    encoding = _detect_encoding(content)
    text = content.decode(encoding)
    
    # Remove BOM if present
    if text.startswith('\ufeff'):
        text = text[1:]
    
    lines = text.strip().split('\n')
    if not lines:
        return [], ';'
    
    separator = _detect_separator(lines[0])
    
    reader = csv.DictReader(io.StringIO(text), delimiter=separator)
    rows = []
    for row in reader:
        # Clean keys and values
        cleaned = {}
        for k, v in row.items():
            if k is not None:
                key = k.strip().lower().replace(' ', '_').replace('/', '_')
                cleaned[key] = v.strip() if v else ''
        rows.append(cleaned)
    
    return rows, separator


def _classify_xade_file(filename: str, headers: List[str]) -> Optional[str]:
    """
    Clasificar un fichero CSV de XADE por su nombre o cabeceras.
    
    Returns: 'profesores', 'materias', 'grupos', 'aulas', 'cursos', 
             'horario_base', 'asignaciones', or None
    """
    fname = filename.lower()
    
    # Clasificar por nombre de fichero
    if any(kw in fname for kw in ['profesor', 'docente', 'teacher', 'profes']):
        return 'profesores'
    if any(kw in fname for kw in ['materia', 'asignatura', 'subject', 'disciplina']):
        return 'materias'
    if any(kw in fname for kw in ['grupo', 'group', 'clase']):
        return 'grupos'
    if any(kw in fname for kw in ['aula', 'espazo', 'espacio', 'room', 'sala']):
        return 'aulas'
    if any(kw in fname for kw in ['curso', 'nivel', 'course', 'ensinanza', 'enseñanza']):
        return 'cursos'
    if any(kw in fname for kw in ['horario', 'sesion', 'session', 'franxa', 'franja', 'timetable']):
        return 'horario_base'
    if any(kw in fname for kw in ['asignacion', 'assignment', 'tarea', 'docencia']):
        return 'asignaciones'
    
    # Clasificar por cabeceras si el nombre no es concluyente
    headers_lower = [h.lower() for h in headers]
    headers_str = ' '.join(headers_lower)
    
    if any(kw in headers_str for kw in ['departamento', 'especialidade']):
        return 'profesores'
    if any(kw in headers_str for kw in ['horas_semana', 'hours_per_week', 'abreviatura']):
        return 'materias'
    if any(kw in headers_str for kw in ['num_alumnos', 'quenda', 'turno']):
        return 'grupos'
    if any(kw in headers_str for kw in ['capacidade', 'capacidad', 'tipo_aula', 'planta']):
        return 'aulas'
    if any(kw in headers_str for kw in ['nivel', 'ensinanza']):
        return 'cursos'
    if any(kw in headers_str for kw in ['hora_inicio', 'hora_fin', 'sesión']):
        return 'horario_base'
    
    return None


def _parse_teachers(rows: List[Dict[str, str]], result: XadeImportResult) -> None:
    """Parsear fichero CSV de profesores."""
    for i, row in enumerate(rows):
        try:
            # Try different possible column names
            name = (
                row.get('nome', '') or row.get('nombre', '') or 
                row.get('name', '') or row.get('profesor', '') or
                row.get('profesor_a', '') or row.get('apelidos,_nome', '') or
                row.get('apelidos_nome', '') or row.get('nome_completo', '') or
                ''
            ).strip()
            
            if not name:
                # Try combining surname + first name
                surname = row.get('apelidos', '') or row.get('apellidos', '')
                firstname = row.get('nome', '') or row.get('nombre', '')
                if surname and firstname:
                    name = f"{surname.strip()}, {firstname.strip()}"
            
            if not name:
                # Try first non-empty column as name
                for v in row.values():
                    if v and v.strip() and not v.strip().isdigit():
                        name = v.strip()
                        break
            
            if not name:
                result.warnings.append(f"Profesores fila {i+2}: sen nome, omitida")
                continue
            
            code = (
                row.get('código', '') or row.get('codigo', '') or 
                row.get('code', '') or row.get('id', '') or
                row.get('clave', '') or ''
            ).strip()
            
            department = (
                row.get('departamento', '') or row.get('department', '') or
                row.get('especialidade', '') or ''
            ).strip()
            
            result.teachers.append({
                'xade_code': code,
                'name': name,
                'department': department,
                'raw': row,
            })
        except Exception as e:
            result.errors.append(f"Profesores fila {i+2}: {str(e)}")


def _parse_subjects(rows: List[Dict[str, str]], result: XadeImportResult) -> None:
    """Parsear fichero CSV de materias."""
    for i, row in enumerate(rows):
        try:
            name = (
                row.get('nome', '') or row.get('nombre', '') or
                row.get('name', '') or row.get('materia', '') or
                row.get('denominación', '') or row.get('denominacion', '') or
                ''
            ).strip()
            
            code = (
                row.get('código', '') or row.get('codigo', '') or
                row.get('code', '') or row.get('clave', '') or
                row.get('abreviatura', '') or row.get('id', '') or
                ''
            ).strip()
            
            hours_str = (
                row.get('horas_semana', '') or row.get('horas_semanais', '') or
                row.get('hours_per_week', '') or row.get('horas', '') or
                row.get('sesiones', '') or row.get('sesións', '') or
                '1'
            ).strip()
            
            try:
                hours = int(hours_str) if hours_str else 1
            except ValueError:
                hours = 1
            
            course = (
                row.get('curso', '') or row.get('course', '') or
                row.get('nivel', '') or ''
            ).strip()
            
            if not name:
                result.warnings.append(f"Materias fila {i+2}: sen nome, omitida")
                continue
            
            if not code:
                # Generate code from name
                code = name[:10].upper().replace(' ', '_')
            
            result.subjects.append({
                'xade_code': code,
                'name': name,
                'hours_per_week': hours,
                'course': course,
                'raw': row,
            })
        except Exception as e:
            result.errors.append(f"Materias fila {i+2}: {str(e)}")


def _parse_groups(rows: List[Dict[str, str]], result: XadeImportResult) -> None:
    """Parsear fichero CSV de grupos."""
    for i, row in enumerate(rows):
        try:
            name = (
                row.get('nome', '') or row.get('nombre', '') or
                row.get('name', '') or row.get('grupo', '') or
                row.get('denominación', '') or row.get('denominacion', '') or
                ''
            ).strip()
            
            code = (
                row.get('código', '') or row.get('codigo', '') or
                row.get('code', '') or row.get('clave', '') or
                row.get('id', '') or ''
            ).strip()
            
            course = (
                row.get('curso', '') or row.get('course', '') or
                row.get('nivel', '') or row.get('ensinanza', '') or
                ''
            ).strip()
            
            num_students_str = (
                row.get('num_alumnos', '') or row.get('n_alumnos', '') or
                row.get('alumnos', '') or row.get('nº_alumnos', '') or
                row.get('num_students', '') or '25'
            ).strip()
            
            try:
                num_students = int(num_students_str) if num_students_str else 25
            except ValueError:
                num_students = 25
            
            shift = (
                row.get('quenda', '') or row.get('turno', '') or
                row.get('shift', '') or ''
            ).strip()
            
            if not name:
                result.warnings.append(f"Grupos fila {i+2}: sen nome, omitido")
                continue
            
            result.groups.append({
                'xade_code': code,
                'name': name,
                'course': course,
                'level': course or 'SEN_NIVEL',
                'num_students': num_students,
                'shift': shift,
                'raw': row,
            })
        except Exception as e:
            result.errors.append(f"Grupos fila {i+2}: {str(e)}")


def _parse_rooms(rows: List[Dict[str, str]], result: XadeImportResult) -> None:
    """Parsear fichero CSV de aulas/espazos."""
    for i, row in enumerate(rows):
        try:
            name = (
                row.get('nome', '') or row.get('nombre', '') or
                row.get('name', '') or row.get('aula', '') or
                row.get('espazo', '') or row.get('espacio', '') or
                row.get('denominación', '') or row.get('denominacion', '') or
                ''
            ).strip()
            
            code = (
                row.get('código', '') or row.get('codigo', '') or
                row.get('code', '') or row.get('clave', '') or
                row.get('id', '') or ''
            ).strip()
            
            capacity_str = (
                row.get('capacidade', '') or row.get('capacidad', '') or
                row.get('capacity', '') or row.get('prazas', '') or
                row.get('plazas', '') or '30'
            ).strip()
            
            try:
                capacity = int(capacity_str) if capacity_str else 30
            except ValueError:
                capacity = 30
            
            room_type = (
                row.get('tipo', '') or row.get('tipo_aula', '') or
                row.get('type', '') or 'standard'
            ).strip().lower()
            
            # Map XADE room types to our types
            type_map = {
                'aula': 'standard',
                'laboratorio': 'laboratory',
                'lab': 'laboratory',
                'informática': 'computer_lab',
                'informatica': 'computer_lab',
                'ximnasio': 'gym',
                'gimnasio': 'gym',
                'salón de actos': 'auditorium',
                'salon de actos': 'auditorium',
                'biblioteca': 'standard',
                'taller': 'laboratory',
                'obradoiro': 'laboratory',
            }
            mapped_type = type_map.get(room_type, room_type if room_type else 'standard')
            
            if not name:
                result.warnings.append(f"Aulas fila {i+2}: sen nome, omitida")
                continue
            
            result.rooms.append({
                'xade_code': code,
                'name': name,
                'capacity': capacity,
                'room_type': mapped_type,
                'raw': row,
            })
        except Exception as e:
            result.errors.append(f"Aulas fila {i+2}: {str(e)}")


def _parse_courses(rows: List[Dict[str, str]], result: XadeImportResult) -> None:
    """Parsear fichero CSV de cursos/niveles."""
    for i, row in enumerate(rows):
        try:
            name = (
                row.get('nome', '') or row.get('nombre', '') or
                row.get('name', '') or row.get('curso', '') or
                row.get('denominación', '') or row.get('denominacion', '') or
                ''
            ).strip()
            
            code = (
                row.get('código', '') or row.get('codigo', '') or
                row.get('code', '') or row.get('clave', '') or
                row.get('id', '') or ''
            ).strip()
            
            level = (
                row.get('nivel', '') or row.get('ensinanza', '') or
                row.get('enseñanza', '') or row.get('etapa', '') or
                ''
            ).strip()
            
            if not name and not code:
                result.warnings.append(f"Cursos fila {i+2}: sen nome nin código, omitido")
                continue
            
            result.courses.append({
                'xade_code': code,
                'name': name or code,
                'level': level,
                'raw': row,
            })
        except Exception as e:
            result.errors.append(f"Cursos fila {i+2}: {str(e)}")


def _parse_timetable_base(rows: List[Dict[str, str]], result: XadeImportResult) -> None:
    """Parsear fichero CSV de horario base (franjas horarias)."""
    day_map = {
        'luns': DayOfWeek.MONDAY, 'lunes': DayOfWeek.MONDAY, 'monday': DayOfWeek.MONDAY, 'l': DayOfWeek.MONDAY,
        'martes': DayOfWeek.TUESDAY, 'tuesday': DayOfWeek.TUESDAY, 'ma': DayOfWeek.TUESDAY, 'm': DayOfWeek.TUESDAY,
        'mércores': DayOfWeek.WEDNESDAY, 'miércoles': DayOfWeek.WEDNESDAY, 'wednesday': DayOfWeek.WEDNESDAY, 'me': DayOfWeek.WEDNESDAY, 'x': DayOfWeek.WEDNESDAY,
        'xoves': DayOfWeek.THURSDAY, 'jueves': DayOfWeek.THURSDAY, 'thursday': DayOfWeek.THURSDAY, 'xo': DayOfWeek.THURSDAY, 'j': DayOfWeek.THURSDAY,
        'venres': DayOfWeek.FRIDAY, 'viernes': DayOfWeek.FRIDAY, 'friday': DayOfWeek.FRIDAY, 'v': DayOfWeek.FRIDAY,
    }
    
    for i, row in enumerate(rows):
        try:
            day_str = (
                row.get('día', '') or row.get('dia', '') or
                row.get('day', '') or ''
            ).strip().lower()
            
            day = day_map.get(day_str)
            if day is None:
                # Try parsing as number (0=Monday)
                try:
                    day_num = int(day_str)
                    day = DayOfWeek(day_num)
                except (ValueError, KeyError):
                    result.warnings.append(f"Horario base fila {i+2}: día non recoñecido '{day_str}', omitida")
                    continue
            
            start_time = (
                row.get('hora_inicio', '') or row.get('inicio', '') or
                row.get('start', '') or row.get('de', '') or
                ''
            ).strip()
            
            end_time = (
                row.get('hora_fin', '') or row.get('fin', '') or
                row.get('end', '') or row.get('ata', '') or row.get('a', '') or
                ''
            ).strip()
            
            session_name = (
                row.get('sesión', '') or row.get('sesion', '') or
                row.get('session', '') or row.get('nome', '') or
                ''
            ).strip()
            
            if not start_time:
                result.warnings.append(f"Horario base fila {i+2}: sen hora de inicio, omitida")
                continue
            
            # Parse time HH:MM
            try:
                parts = start_time.replace('.', ':').split(':')
                start_hour = int(parts[0])
                start_minute = int(parts[1]) if len(parts) > 1 else 0
            except (ValueError, IndexError):
                result.warnings.append(f"Horario base fila {i+2}: hora de inicio inválida '{start_time}'")
                continue
            
            # Calculate duration
            duration = 60  # default
            if end_time:
                try:
                    parts = end_time.replace('.', ':').split(':')
                    end_hour = int(parts[0])
                    end_minute = int(parts[1]) if len(parts) > 1 else 0
                    duration = (end_hour * 60 + end_minute) - (start_hour * 60 + start_minute)
                    if duration <= 0:
                        duration = 60
                except (ValueError, IndexError):
                    pass
            
            result.time_slots.append({
                'day': day.value,
                'day_name': day.name,
                'start_hour': start_hour,
                'start_minute': start_minute,
                'duration_minutes': duration,
                'session_name': session_name,
                'raw': row,
            })
        except Exception as e:
            result.errors.append(f"Horario base fila {i+2}: {str(e)}")


def _parse_assignments(rows: List[Dict[str, str]], result: XadeImportResult) -> None:
    """Parsear fichero CSV de asignaciones/docencia."""
    for i, row in enumerate(rows):
        try:
            teacher = (
                row.get('profesor', '') or row.get('profesor_a', '') or
                row.get('docente', '') or row.get('teacher', '') or
                ''
            ).strip()
            
            subject = (
                row.get('materia', '') or row.get('asignatura', '') or
                row.get('subject', '') or ''
            ).strip()
            
            group = (
                row.get('grupo', '') or row.get('group', '') or
                row.get('clase', '') or ''
            ).strip()
            
            if not teacher or not subject or not group:
                result.warnings.append(
                    f"Asignacións fila {i+2}: datos incompletos (profesor='{teacher}', "
                    f"materia='{subject}', grupo='{group}'), omitida"
                )
                continue
            
            result.assignments.append({
                'teacher_name': teacher,
                'subject_name': subject,
                'group_name': group,
                'raw': row,
            })
        except Exception as e:
            result.errors.append(f"Asignacións fila {i+2}: {str(e)}")


def import_from_csv_files(files: Dict[str, bytes]) -> XadeImportResult:
    """
    Importar datos desde múltiples ficheros CSV de XADE.
    
    Args:
        files: Diccionario {nombre_fichero: contenido_bytes}
    
    Returns:
        XadeImportResult con todos los datos parseados
    """
    result = XadeImportResult()
    
    for filename, content in files.items():
        try:
            rows, separator = _parse_csv_content(content, filename)
            if not rows:
                result.warnings.append(f"Ficheiro '{filename}' está baleiro ou non ten datos")
                continue
            
            headers = list(rows[0].keys()) if rows else []
            file_type = _classify_xade_file(filename, headers)
            
            if file_type == 'profesores':
                _parse_teachers(rows, result)
                result.files_processed.append(f"{filename} (profesores)")
            elif file_type == 'materias':
                _parse_subjects(rows, result)
                result.files_processed.append(f"{filename} (materias)")
            elif file_type == 'grupos':
                _parse_groups(rows, result)
                result.files_processed.append(f"{filename} (grupos)")
            elif file_type == 'aulas':
                _parse_rooms(rows, result)
                result.files_processed.append(f"{filename} (aulas)")
            elif file_type == 'cursos':
                _parse_courses(rows, result)
                result.files_processed.append(f"{filename} (cursos)")
            elif file_type == 'horario_base':
                _parse_timetable_base(rows, result)
                result.files_processed.append(f"{filename} (horario base)")
            elif file_type == 'asignaciones':
                _parse_assignments(rows, result)
                result.files_processed.append(f"{filename} (asignacións)")
            else:
                # Try to auto-detect by content
                result.warnings.append(
                    f"Non se puido clasificar o ficheiro '{filename}'. "
                    f"Cabeceiras: {headers[:5]}... "
                    f"Use nomes como: profesores.csv, materias.csv, grupos.csv, aulas.csv, cursos.csv, horario_base.csv"
                )
        except Exception as e:
            result.errors.append(f"Erro ao procesar '{filename}': {str(e)}")
    
    return result


def import_from_zip(zip_content: bytes) -> XadeImportResult:
    """
    Importar datos desde un fichero ZIP con los CSV de XADE.
    
    Args:
        zip_content: Contenido del fichero ZIP en bytes
    
    Returns:
        XadeImportResult con todos los datos parseados
    """
    files = {}
    
    try:
        with zipfile.ZipFile(io.BytesIO(zip_content)) as zf:
            for name in zf.namelist():
                if name.lower().endswith('.csv') and not name.startswith('__MACOSX'):
                    files[os.path.basename(name)] = zf.read(name)
    except zipfile.BadZipFile:
        result = XadeImportResult()
        result.errors.append("O ficheiro non é un ZIP válido")
        return result
    
    if not files:
        result = XadeImportResult()
        result.errors.append("O ficheiro ZIP non contén ficheiros CSV")
        return result
    
    return import_from_csv_files(files)
