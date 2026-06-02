"""
Módulo de importación de datos desde FET (Free Timetabling Software).

FET es un software libre de generación de horarios que usa ficheros XML con
extensión .fet. Muchos centros educativos españoles lo utilizan.

Estructura del fichero .fet:
  <fet version="...">
    <Institution_Name>...</Institution_Name>
    <Days_List>       → días de la semana
    <Hours_List>      → sesiones del día (con nombre = hora)
    <Teachers_List>   → profesores
    <Subjects_List>   → materias/asignaturas
    <Students_List>   → años educativos y grupos de alumnos
    <Rooms_List>      → aulas y espacios
    <Activities_List> → actividades (profe + materia + grupo)
    <Time_Constraints_List>  → restricciones horarias
    <Space_Constraints_List> → restricciones de espacio
"""

import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class FetImportResult:
    """Resultado de una importación desde un fichero FET."""
    institution_name: str = ""
    teachers: List[Dict[str, Any]] = field(default_factory=list)
    subjects: List[Dict[str, Any]] = field(default_factory=list)
    groups: List[Dict[str, Any]] = field(default_factory=list)
    rooms: List[Dict[str, Any]] = field(default_factory=list)
    days: List[str] = field(default_factory=list)
    hours: List[str] = field(default_factory=list)
    activities: List[Dict[str, Any]] = field(default_factory=list)
    assignments: List[Dict[str, Any]] = field(default_factory=list)  # derived from activities
    time_slots: List[Dict[str, Any]] = field(default_factory=list)   # derived from days × hours
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)

    @property
    def summary(self) -> Dict[str, int]:
        return {
            "profesores": len(self.teachers),
            "materias": len(self.subjects),
            "grupos": len(self.groups),
            "aulas": len(self.rooms),
            "actividades": len(self.activities),
            "asignaciónes": len(self.assignments),
            "franjas_horarias": len(self.time_slots),
            "avisos": len(self.warnings),
            "errores": len(self.errors),
        }


def _text(el: Optional[ET.Element], default: str = "") -> str:
    """Obtener texto de un elemento XML de forma segura."""
    if el is None:
        return default
    return (el.text or "").strip()


def _int_text(el: Optional[ET.Element], default: int = 0) -> int:
    """Obtener entero del texto de un elemento XML."""
    t = _text(el)
    try:
        return int(t) if t else default
    except ValueError:
        return default


def _parse_teachers(root: ET.Element, result: FetImportResult) -> None:
    """Extraer profesores de <Teachers_List>."""
    teachers_list = root.find("Teachers_List")
    if teachers_list is None:
        result.warnings.append("No se encontró <Teachers_List> en el fichero FET")
        return

    for teacher_el in teachers_list.findall("Teacher"):
        name = _text(teacher_el.find("Name"))
        if not name:
            continue

        target_hours_str = _text(teacher_el.find("Target_Number_of_Hours"))
        try:
            target_hours = int(target_hours_str) if target_hours_str else 0
        except ValueError:
            target_hours = 0

        # Materias para las que está cualificado
        qualified = []
        qs = teacher_el.find("Qualified_Subjects")
        if qs is not None:
            for qs_el in qs.findall("Qualified_Subject"):
                qname = _text(qs_el.find("Name"))
                if qname:
                    qualified.append(qname)

        result.teachers.append({
            "name": name,
            "target_hours": target_hours,
            "qualified_subjects": qualified,
            "xade_code": "",
            "department": "",
        })


def _parse_subjects(root: ET.Element, result: FetImportResult) -> None:
    """Extraer materias de <Subjects_List>."""
    subjects_list = root.find("Subjects_List")
    if subjects_list is None:
        result.warnings.append("No se encontró <Subjects_List> en el fichero FET")
        return

    for subject_el in subjects_list.findall("Subject"):
        name = _text(subject_el.find("Name"))
        if not name:
            continue
        result.subjects.append({
            "name": name,
            "xade_code": "",
            "hours_per_week": 0,
            "course": "",
        })


def _parse_students(root: ET.Element, result: FetImportResult) -> None:
    """
    Extraer grupos de alumnos de <Students_List>.

    La estructura FET tiene Years → Groups (o directamente alumnos sin group).
    Un Year puede tener varios Groups dentro.
    """
    students_list = root.find("Students_List")
    if students_list is None:
        result.warnings.append("No se encontró <Students_List> en el fichero FET")
        return

    for year_el in students_list.findall("Year"):
        year_name = _text(year_el.find("Name"))
        year_students = _int_text(year_el.find("Number_of_Students"), 0)
        year_level = year_name  # the "level" is the year name

        groups = year_el.findall("Group")
        if groups:
            for group_el in groups:
                group_name = _text(group_el.find("Name"))
                if not group_name:
                    continue
                num_students = _int_text(group_el.find("Number_of_Students"), year_students)

                # Check for subgroups (FET supports Year → Group → Subgroup)
                subgroups = group_el.findall("Subgroup")
                if subgroups:
                    for sg_el in subgroups:
                        sg_name = _text(sg_el.find("Name"))
                        if not sg_name:
                            continue
                        result.groups.append({
                            "name": sg_name,
                            "year": year_name,
                            "level": year_level,
                            "num_students": _int_text(sg_el.find("Number_of_Students"), num_students),
                            "xade_code": "",
                            "shift": "",
                        })
                else:
                    result.groups.append({
                        "name": group_name,
                        "year": year_name,
                        "level": year_level,
                        "num_students": num_students,
                        "xade_code": "",
                        "shift": "",
                    })
        else:
            # Year with no groups — use the Year itself as a group
            result.groups.append({
                "name": year_name,
                "year": year_name,
                "level": year_level,
                "num_students": year_students,
                "xade_code": "",
                "shift": "",
            })


def _parse_rooms(root: ET.Element, result: FetImportResult) -> None:
    """Extraer aulas de <Rooms_List>."""
    rooms_list = root.find("Rooms_List")
    if rooms_list is None:
        return  # rooms are optional

    for room_el in rooms_list.findall("Room"):
        name = _text(room_el.find("Name"))
        if not name:
            continue

        capacity = _int_text(room_el.find("Capacity"), 30)
        virtual = _text(room_el.find("Virtual")).lower() in ("true", "1", "yes")
        if virtual:
            continue  # skip virtual rooms

        # Detect room type from name keywords
        name_lower = name.lower()
        room_type = "standard"
        if any(kw in name_lower for kw in ["lab", "laboratorio", "laborator"]):
            room_type = "laboratory"
        elif any(kw in name_lower for kw in ["inform", "computadora", "ordenador", "pc"]):
            room_type = "computer_lab"
        elif any(kw in name_lower for kw in ["gimnasio", "ximnasio", "gym", "deport"]):
            room_type = "gym"
        elif any(kw in name_lower for kw in ["actos", "auditor", "salón"]):
            room_type = "auditorium"
        elif any(kw in name_lower for kw in ["taller", "obradoiro"]):
            room_type = "laboratory"

        result.rooms.append({
            "name": name,
            "capacity": capacity,
            "room_type": room_type,
            "xade_code": "",
        })


def _parse_days_hours(root: ET.Element, result: FetImportResult) -> None:
    """
    Extraer días y horas y construir time_slots (franjas horarias).

    FET hours can be:
    - Simple numbers: "1", "2", "3"...
    - Time strings: "8:00", "9:00"...
    - Named: "1ª hora", "Recreo"...

    We generate one time slot per day × hour combination.
    """
    # Days
    days_list = root.find("Days_List")
    if days_list is not None:
        for day_el in days_list.findall("Day"):
            day_name = _text(day_el.find("Name"))
            if day_name:
                result.days.append(day_name)

    # Hours
    hours_list = root.find("Hours_List")
    if hours_list is not None:
        for hour_el in hours_list.findall("Hour"):
            hour_name = _text(hour_el.find("Name"))
            if hour_name:
                result.hours.append(hour_name)

    # Day index → DayOfWeek value mapping (Mon=0 ... Fri=4)
    day_of_week_map = {}
    day_names_lower = [d.lower() for d in result.days]
    weekday_keywords = [
        ("lun", 0), ("mon", 0),
        ("mar", 1), ("tue", 1),
        ("mié", 2), ("mie", 2), ("mer", 2), ("wed", 2), ("xov", 2), ("xua", 2),
        ("jue", 3), ("thu", 3), ("xov", 3),
        ("vie", 4), ("fri", 4), ("ven", 4),
    ]
    for i, dname in enumerate(day_names_lower):
        matched = False
        for kw, dow in weekday_keywords:
            if dname.startswith(kw):
                day_of_week_map[i] = dow
                matched = True
                break
        if not matched:
            day_of_week_map[i] = i  # fallback: assume Monday=0

    # Parse hour names to extract start times
    def _parse_hour_time(hour_name: str) -> Optional[tuple]:
        """Try to parse 'HH:MM' or 'H.MM' from hour name string."""
        import re
        m = re.search(r"(\d{1,2})[:\.](\d{2})", hour_name)
        if m:
            return int(m.group(1)), int(m.group(2))
        # plain number → treat as period number (09:00 + N*55 min)
        try:
            n = int(hour_name.strip())
            base_h, base_m = 8, 0
            total = base_h * 60 + base_m + (n - 1) * 55
            return total // 60, total % 60
        except ValueError:
            return None

    for day_idx, day_name in enumerate(result.days):
        dow = day_of_week_map.get(day_idx, day_idx)
        for hour_idx, hour_name in enumerate(result.hours):
            time_parts = _parse_hour_time(hour_name)
            if time_parts:
                start_h, start_m = time_parts
            else:
                # Default: start at 08:00 + hour_idx * 55 min
                total = 8 * 60 + hour_idx * 55
                start_h, start_m = total // 60, total % 60

            result.time_slots.append({
                "day": dow,
                "day_name": day_name,
                "start_hour": start_h,
                "start_minute": start_m,
                "duration_minutes": 55,
                "session_name": f"{day_name} {hour_name}",
            })


def _parse_activities(root: ET.Element, result: FetImportResult) -> None:
    """
    Extraer actividades de <Activities_List>.

    Una actividad FET = sesión de una materia impartida por un profe a un grupo.
    Varias actividades con el mismo Activity_Group_Id son instancias del mismo
    par (materia, grupo, profe) repartidas a lo largo de la semana.

    Para los "assignments" de HorarioCentros, necesitamos una fila por
    (profe, materia, grupo) con el total de sesiones semanales (Total_Duration).
    """
    activities_list = root.find("Activities_List")
    if activities_list is None:
        result.warnings.append("No se encontró <Activities_List> en el fichero FET")
        return

    # Track unique (teacher, subject, group) combos to avoid duplicates
    seen: Dict[str, Dict[str, Any]] = {}

    for act_el in activities_list.findall("Activity"):
        active = _text(act_el.find("Active"))
        if active.lower() == "false":
            continue

        # A single activity can have multiple teachers or student groups
        teachers = [_text(t) for t in act_el.findall("Teacher") if _text(t)]
        subjects = [_text(s) for s in act_el.findall("Subject") if _text(s)]
        students = [_text(s) for s in act_el.findall("Students") if _text(s)]

        # Fallbacks for single-value format
        if not teachers:
            t = _text(act_el.find("Teacher"))
            if t:
                teachers = [t]
        if not subjects:
            s = _text(act_el.find("Subject"))
            if s:
                subjects = [s]
        if not students:
            s = _text(act_el.find("Students"))
            if s:
                students = [s]

        activity_group_id = _text(act_el.find("Activity_Group_Id"))
        total_duration = _int_text(act_el.find("Total_Duration"), 1)
        duration = _int_text(act_el.find("Duration"), 1)
        act_id = _text(act_el.find("Id"))

        # Store raw activity
        result.activities.append({
            "id": act_id,
            "activity_group_id": activity_group_id,
            "teachers": teachers,
            "subjects": subjects,
            "groups": students,
            "duration": duration,
            "total_duration": total_duration,
        })

        # Build deduplicated assignments
        for teacher in teachers:
            for subject in subjects:
                for group in students:
                    if not teacher or not subject or not group:
                        continue
                    key = f"{teacher}||{subject}||{group}"
                    if key not in seen:
                        seen[key] = {
                            "teacher_name": teacher,
                            "subject_name": subject,
                            "group_name": group,
                            "sessions_per_week": total_duration,
                        }
                    else:
                        # If we see this activity again under a different group ID,
                        # update sessions if bigger (Total_Duration is authoritative)
                        existing = seen[key]["sessions_per_week"]
                        seen[key]["sessions_per_week"] = max(existing, total_duration)

    result.assignments = list(seen.values())


def import_from_fet(content: bytes) -> FetImportResult:
    """
    Parsear un fichero .fet (XML de Free Timetabling Software).

    Args:
        content: Contenido del fichero .fet en bytes

    Returns:
        FetImportResult con todos los datos extraídos
    """
    result = FetImportResult()

    # Detect and handle encoding
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = content.decode("iso-8859-1")
        except UnicodeDecodeError:
            result.errors.append("No se pudo decodificar el fichero FET (codificación desconocida)")
            return result

    # Parse XML
    try:
        root = ET.fromstring(text)
    except ET.ParseError as e:
        result.errors.append(f"Error al parsear el XML del fichero FET: {e}")
        return result

    # Verify it's a FET file
    if root.tag != "fet":
        result.errors.append(
            f"El fichero no parece ser un fichero FET válido (tag raíz: <{root.tag}>, esperado: <fet>)"
        )
        return result

    # Extract institution name
    result.institution_name = _text(root.find("Institution_Name"))

    # Parse each section
    _parse_teachers(root, result)
    _parse_subjects(root, result)
    _parse_students(root, result)
    _parse_rooms(root, result)
    _parse_days_hours(root, result)
    _parse_activities(root, result)

    # Summary warnings
    if not result.teachers:
        result.warnings.append("No se encontraron profesores en el fichero FET")
    if not result.subjects:
        result.warnings.append("No se encontraron materias en el fichero FET")
    if not result.groups:
        result.warnings.append("No se encontraron grupos de alumnos en el fichero FET")

    return result
