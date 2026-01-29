# API REST - Documentación

## 📚 Descripción

API REST completa para el sistema de generación automática de horarios académicos. Construida con FastAPI.

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 2. Iniciar el servidor

```bash
# Opción 1: Usando el script
./run_api.sh

# Opción 2: Directamente con uvicorn
python -m uvicorn backend.api.main:app --reload
```

El servidor estará disponible en `http://localhost:8000`

## 📖 Documentación Interactiva

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔌 Endpoints Disponibles

### Profesores (Teachers)
```
POST   /api/teachers           - Crear profesor
GET    /api/teachers           - Listar profesores
GET    /api/teachers/{id}      - Obtener profesor
PUT    /api/teachers/{id}      - Actualizar profesor
DELETE /api/teachers/{id}      - Eliminar profesor
```

### Asignaturas (Subjects)
```
POST   /api/subjects           - Crear asignatura
GET    /api/subjects           - Listar asignaturas
GET    /api/subjects/{id}      - Obtener asignatura
PUT    /api/subjects/{id}      - Actualizar asignatura
DELETE /api/subjects/{id}      - Eliminar asignatura
```

### Grupos (Groups)
```
POST   /api/groups             - Crear grupo
GET    /api/groups             - Listar grupos
GET    /api/groups/{id}        - Obtener grupo
PUT    /api/groups/{id}        - Actualizar grupo
DELETE /api/groups/{id}        - Eliminar grupo
```

### Aulas (Rooms)
```
POST   /api/rooms              - Crear aula
GET    /api/rooms              - Listar aulas
GET    /api/rooms/{id}         - Obtener aula
PUT    /api/rooms/{id}         - Actualizar aula
DELETE /api/rooms/{id}         - Eliminar aula
```

### Franjas Horarias (TimeSlots)
```
POST   /api/time-slots         - Crear franja horaria
GET    /api/time-slots         - Listar franjas horarias
GET    /api/time-slots/{id}    - Obtener franja horaria
PUT    /api/time-slots/{id}    - Actualizar franja horaria
DELETE /api/time-slots/{id}    - Eliminar franja horaria
```

### Asignaciones (Assignments)
```
POST   /api/assignments        - Crear asignación
GET    /api/assignments        - Listar asignaciones
GET    /api/assignments/{id}   - Obtener asignación
DELETE /api/assignments/{id}   - Eliminar asignación
```

### Horarios (Schedules)
```
POST   /api/schedules/generate                         - Generar horario
GET    /api/schedules                                  - Listar horarios
GET    /api/schedules/{id}                             - Obtener horario
GET    /api/schedules/{id}/teacher/{teacher_id}       - Horario de profesor
GET    /api/schedules/{id}/group/{group_id}           - Horario de grupo
DELETE /api/schedules/{id}                             - Eliminar horario
```

### General
```
GET    /                       - Info de la API
GET    /health                 - Estado de salud
GET    /api/stats              - Estadísticas
```

## 📝 Ejemplos de Uso

### 1. Crear un profesor

```bash
curl -X POST "http://localhost:8000/api/teachers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@escuela.edu",
    "max_hours_per_day": 6,
    "max_hours_per_week": 25
  }'
```

Respuesta:
```json
{
  "id": "12345678-1234-5678-1234-567812345678",
  "name": "Juan Pérez",
  "email": "juan@escuela.edu",
  "max_hours_per_day": 6,
  "max_hours_per_week": 25,
  "created_at": "2026-01-22T17:30:00"
}
```

### 2. Crear una asignatura

```bash
curl -X POST "http://localhost:8000/api/subjects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Matemáticas",
    "code": "MAT-101",
    "hours_per_week": 3,
    "requires_lab": false
  }'
```

### 3. Crear un grupo

```bash
curl -X POST "http://localhost:8000/api/groups" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "1º ESO A",
    "level": "ESO",
    "num_students": 25
  }'
```

### 4. Crear una aula

```bash
curl -X POST "http://localhost:8000/api/rooms" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aula 101",
    "capacity": 30,
    "room_type": "standard"
  }'
```

### 5. Crear franjas horarias

```bash
curl -X POST "http://localhost:8000/api/time-slots" \
  -H "Content-Type: application/json" \
  -d '{
    "day": 0,
    "start_hour": 8,
    "start_minute": 0,
    "duration_minutes": 60
  }'
```

### 6. Crear asignación

```bash
curl -X POST "http://localhost:8000/api/assignments" \
  -H "Content-Type: application/json" \
  -d '{
    "teacher_id": "teacher-id-aquí",
    "subject_id": "subject-id-aquí",
    "group_id": "group-id-aquí"
  }'
```

### 7. Generar horario

```bash
curl -X POST "http://localhost:8000/api/schedules/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "center_name": "Escuela Ejemplo",
    "max_iterations": 10000,
    "timeout_seconds": 300
  }'
```

Respuesta:
```json
{
  "id": "schedule-id",
  "center_name": "Escuela Ejemplo",
  "lessons": [
    {
      "id": "lesson-id",
      "teacher_id": "teacher-id",
      "subject_id": "subject-id",
      "group_id": "group-id",
      "room_id": "room-id",
      "time_slot_id": "slot-id"
    }
  ],
  "evaluation": {
    "is_valid": true,
    "total_cost": 7.13,
    "hard_violations": [],
    "soft_costs": {
      "Minimizar huecos": 6.0,
      "Distribuir clases": 1.13
    }
  }
}
```

## 🧪 Demostración Automatizada

Ejecuta el script de demostración para crear entidades y generar un horario:

```bash
# Primero, en una terminal, inicia el servidor
./run_api.sh

# En otra terminal, ejecuta la demostración
python examples/test_api.py
```

## 🔧 Configuración

### Variables de entorno

```bash
# Host del servidor (default: 0.0.0.0)
API_HOST=0.0.0.0

# Puerto (default: 8000)
API_PORT=8000

# Modo debug (default: true)
DEBUG=true
```

## 📊 Modelos de Datos

### Teacher (Profesor)
```python
{
  "id": UUID,
  "name": str,
  "email": Optional[str],
  "max_hours_per_day": Optional[int],
  "max_hours_per_week": Optional[int],
  "created_at": datetime
}
```

### Subject (Asignatura)
```python
{
  "id": UUID,
  "name": str,
  "code": str,
  "hours_per_week": int,
  "requires_lab": bool,
  "created_at": datetime
}
```

### Group (Grupo)
```python
{
  "id": UUID,
  "name": str,
  "level": str,
  "num_students": int,
  "created_at": datetime
}
```

### Room (Aula)
```python
{
  "id": UUID,
  "name": str,
  "capacity": int,
  "room_type": str,
  "created_at": datetime
}
```

### TimeSlot (Franja Horaria)
```python
{
  "id": UUID,
  "day": int,           # 0=lunes, 6=domingo
  "start_hour": int,    # 0-23
  "start_minute": int,  # 0-59
  "duration_minutes": int,
  "created_at": datetime
}
```

## 🔐 Seguridad (Próximamente)

- [ ] Autenticación con JWT
- [ ] Autorización basada en roles
- [ ] Rate limiting
- [ ] HTTPS/TLS

## 📈 Performance

- Generación de horarios: < 1 segundo (casos simples)
- Listados: instantáneo
- Búsquedas: < 100ms

## 🐛 Solución de Problemas

### Error: "Port already in use"
```bash
# Usar otro puerto
python -m uvicorn backend.api.main:app --port 8001
```

### Error: "Connection refused"
Asegúrate de que el servidor está ejecutándose en otra terminal.

### Error al generar horario
- Verifica que haya profesores, grupos, asignaturas, aulas y franjas horarias
- Verifica que haya asignaciones profesor-asignatura-grupo

## 📞 Soporte

Para reportar bugs o sugerir mejoras, abre un issue en GitHub.

---

**Próximas mejoras (Fase 3)**:
- Persistencia con SQLite
- Autenticación y autorización
- Validación avanzada
- Tests completos
