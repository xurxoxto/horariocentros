# API Usage Guide 🚀

## Quick Start

### 1. Start the Server

```bash
cd horariocentros
source venv/bin/activate
python -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### 2. Access Documentation

- **Swagger UI** (Interactive): http://localhost:8000/docs
- **ReDoc** (Static): http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### 3. Run Demo Script

```bash
# In another terminal
python examples/test_api.py
```

## API Endpoints Reference

### Health Check

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "0.2.0",
  "database_connected": true,
  "entities": {
    "teachers": 0,
    "subjects": 0,
    "groups": 0,
    "rooms": 0,
    "time_slots": 0,
    "subject_assignments": 0,
    "total_schedules_generated": 0
  }
}
```

### Statistics

```bash
curl http://localhost:8000/api/stats
```

## Teachers Endpoints

### Create a Teacher

```bash
curl -X POST http://localhost:8000/api/teachers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@escuela.edu",
    "max_hours_per_day": 6,
    "max_hours_per_week": 25
  }'
```

**Response:**
```json
{
  "id": "1cb8bed1-5dac-4067-9b8b-2a6fcf0b5e92",
  "name": "Juan Pérez",
  "email": "juan@escuela.edu",
  "max_hours_per_day": 6,
  "max_hours_per_week": 25,
  "created_at": "2026-01-22T17:51:06.204633"
}
```

### List All Teachers

```bash
curl http://localhost:8000/api/teachers
```

### Get Specific Teacher

```bash
curl http://localhost:8000/api/teachers/1cb8bed1-5dac-4067-9b8b-2a6fcf0b5e92
```

### Update Teacher

```bash
curl -X PUT http://localhost:8000/api/teachers/1cb8bed1-5dac-4067-9b8b-2a6fcf0b5e92 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez García",
    "max_hours_per_week": 30
  }'
```

### Delete Teacher

```bash
curl -X DELETE http://localhost:8000/api/teachers/1cb8bed1-5dac-4067-9b8b-2a6fcf0b5e92
```

## Subjects Endpoints

### Create a Subject

```bash
curl -X POST http://localhost:8000/api/subjects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Matemáticas",
    "code": "MAT-101",
    "hours_per_week": 4,
    "requires_lab": false
  }'
```

### List All Subjects

```bash
curl http://localhost:8000/api/subjects
```

### Get Specific Subject

```bash
curl http://localhost:8000/api/subjects/{subject_id}
```

### Update Subject

```bash
curl -X PUT http://localhost:8000/api/subjects/{subject_id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Matemáticas Avanzadas",
    "hours_per_week": 5
  }'
```

### Delete Subject

```bash
curl -X DELETE http://localhost:8000/api/subjects/{subject_id}
```

## Groups Endpoints

### Create a Group

```bash
curl -X POST http://localhost:8000/api/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "1º ESO A",
    "level": "ESO1",
    "num_students": 25
  }'
```

### List All Groups

```bash
curl http://localhost:8000/api/groups
```

### Get Specific Group

```bash
curl http://localhost:8000/api/groups/{group_id}
```

### Update Group

```bash
curl -X PUT http://localhost:8000/api/groups/{group_id} \
  -H "Content-Type: application/json" \
  -d '{
    "num_students": 28
  }'
```

### Delete Group

```bash
curl -X DELETE http://localhost:8000/api/groups/{group_id}
```

## Rooms Endpoints

### Create a Room

```bash
curl -X POST http://localhost:8000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aula 101",
    "capacity": 30,
    "room_type": "classroom"
  }'
```

### List All Rooms

```bash
curl http://localhost:8000/api/rooms
```

### Get Specific Room

```bash
curl http://localhost:8000/api/rooms/{room_id}
```

### Update Room

```bash
curl -X PUT http://localhost:8000/api/rooms/{room_id} \
  -H "Content-Type: application/json" \
  -d '{
    "capacity": 35
  }'
```

### Delete Room

```bash
curl -X DELETE http://localhost:8000/api/rooms/{room_id}
```

## Time Slots Endpoints

### Create a Time Slot

```bash
curl -X POST http://localhost:8000/api/time-slots \
  -H "Content-Type: application/json" \
  -d '{
    "day": "Monday",
    "hour": 8,
    "duration_minutes": 60
  }'
```

### List All Time Slots

```bash
curl http://localhost:8000/api/time-slots
```

### Get Specific Time Slot

```bash
curl http://localhost:8000/api/time-slots/{slot_id}
```

### Update Time Slot

```bash
curl -X PUT http://localhost:8000/api/time-slots/{slot_id} \
  -H "Content-Type: application/json" \
  -d '{
    "hour": 9
  }'
```

### Delete Time Slot

```bash
curl -X DELETE http://localhost:8000/api/time-slots/{slot_id}
```

## Assignments Endpoints

### Create an Assignment

```bash
curl -X POST http://localhost:8000/api/assignments \
  -H "Content-Type: application/json" \
  -d '{
    "teacher_id": "1cb8bed1-5dac-4067-9b8b-2a6fcf0b5e92",
    "subject_id": "abc12345-6789-def0-1234-567890abcdef",
    "group_id": "def67890-abcd-ef01-2345-6789abcdef01"
  }'
```

### List All Assignments

```bash
curl http://localhost:8000/api/assignments
```

### Get Specific Assignment

```bash
curl http://localhost:8000/api/assignments/{assignment_id}
```

### Update Assignment

```bash
curl -X PUT http://localhost:8000/api/assignments/{assignment_id} \
  -H "Content-Type: application/json" \
  -d '{
    "subject_id": "new-subject-id"
  }'
```

### Delete Assignment

```bash
curl -X DELETE http://localhost:8000/api/assignments/{assignment_id}
```

## Schedules Endpoints

### Generate a New Schedule

```bash
curl -X POST http://localhost:8000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "center_name": "Escuela Ejemplo",
    "academic_year": "2025-2026"
  }'
```

**Response includes:**
```json
{
  "id": "schedule-id",
  "center_name": "Escuela Ejemplo",
  "academic_year": "2025-2026",
  "status": "valid",
  "lessons": [
    {
      "id": "lesson-id",
      "teacher_id": "teacher-id",
      "subject_id": "subject-id",
      "group_id": "group-id",
      "room_id": "room-id",
      "day": "Monday",
      "hour": 8,
      "duration_minutes": 60
    }
  ],
  "evaluation": {
    "is_valid": true,
    "hard_violations": 0,
    "soft_cost": 7.13
  },
  "created_at": "2026-01-22T17:51:06.204633"
}
```

### List All Schedules

```bash
curl http://localhost:8000/api/schedules
```

### Get Specific Schedule

```bash
curl http://localhost:8000/api/schedules/{schedule_id}
```

### Get Teacher's Schedule

```bash
curl http://localhost:8000/api/schedules/{schedule_id}/teacher/{teacher_id}
```

**Returns only the lessons for that teacher.**

### Get Group's Schedule

```bash
curl http://localhost:8000/api/schedules/{schedule_id}/group/{group_id}
```

**Returns only the lessons for that group.**

### Delete Schedule

```bash
curl -X DELETE http://localhost:8000/api/schedules/{schedule_id}
```

## Using Python Requests

### Example: Create Teacher and Generate Schedule

```python
import requests
import json

BASE_URL = "http://localhost:8000/api"

# 1. Create a teacher
teacher_response = requests.post(
    f"{BASE_URL}/teachers",
    json={
        "name": "José García",
        "email": "jose@escuela.edu",
        "max_hours_per_day": 6,
        "max_hours_per_week": 25
    }
)
teacher = teacher_response.json()
teacher_id = teacher['id']
print(f"✅ Created teacher: {teacher_id}")

# 2. Create a subject
subject_response = requests.post(
    f"{BASE_URL}/subjects",
    json={
        "name": "Física",
        "code": "FIS-101",
        "hours_per_week": 3,
        "requires_lab": True
    }
)
subject = subject_response.json()
subject_id = subject['id']
print(f"✅ Created subject: {subject_id}")

# 3. Create a group
group_response = requests.post(
    f"{BASE_URL}/groups",
    json={
        "name": "2º ESO B",
        "level": "ESO2",
        "num_students": 22
    }
)
group = group_response.json()
group_id = group['id']
print(f"✅ Created group: {group_id}")

# 4. Create a room
room_response = requests.post(
    f"{BASE_URL}/rooms",
    json={
        "name": "Lab 1",
        "capacity": 25,
        "room_type": "laboratory"
    }
)
room = room_response.json()
room_id = room['id']
print(f"✅ Created room: {room_id}")

# 5. Create time slots
time_slots = []
for hour in range(8, 12):
    slot_response = requests.post(
        f"{BASE_URL}/time-slots",
        json={
            "day": "Monday",
            "hour": hour,
            "duration_minutes": 60
        }
    )
    time_slots.append(slot_response.json()['id'])
print(f"✅ Created {len(time_slots)} time slots")

# 6. Create an assignment
assignment_response = requests.post(
    f"{BASE_URL}/assignments",
    json={
        "teacher_id": teacher_id,
        "subject_id": subject_id,
        "group_id": group_id
    }
)
print(f"✅ Created assignment")

# 7. Generate schedule
schedule_response = requests.post(
    f"{BASE_URL}/schedules",
    json={
        "center_name": "Escuela de Ejemplo",
        "academic_year": "2025-2026"
    }
)
schedule = schedule_response.json()
print(f"✅ Generated schedule with {len(schedule['lessons'])} lessons")
print(f"   Valid: {schedule['evaluation']['is_valid']}")
print(f"   Cost: {schedule['evaluation']['soft_cost']}")

# 8. Get teacher's schedule
teacher_schedule = requests.get(
    f"{BASE_URL}/schedules/{schedule['id']}/teacher/{teacher_id}"
).json()
print(f"✅ Retrieved teacher schedule ({len(teacher_schedule)} lessons)")
```

## Error Handling

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 201 | Created | Teacher successfully created |
| 200 | OK | Successfully retrieved data |
| 204 | No Content | Successfully deleted |
| 400 | Bad Request | Invalid input data |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

### Example Error Response

```bash
curl -X POST http://localhost:8000/api/teachers \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan"}' # Missing required email field
```

**Response:**
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "email"],
      "msg": "Field required",
      "input": {"name": "Juan"}
    }
  ]
}
```

## Tips & Tricks

### Pretty-print JSON

```bash
curl http://localhost:8000/api/teachers | python -m json.tool
```

### Get just one teacher

```bash
curl http://localhost:8000/api/teachers | python -m json.tool | head -20
```

### Count entities

```bash
curl http://localhost:8000/health | python -c "import sys, json; data = json.load(sys.stdin); print(f\"Total entities: {sum(data['entities'].values())}\")"
```

### Save response to file

```bash
curl http://localhost:8000/api/schedules -o schedule.json
cat schedule.json | python -m json.tool
```

### Use jq for filtering

```bash
# List only teacher names
curl http://localhost:8000/api/teachers | jq '.[].name'

# Filter by condition
curl http://localhost:8000/api/groups | jq '.[] | select(.num_students > 25)'
```

## Debugging

### Check Server Logs

```bash
# If running in background, check logs
tail -f /tmp/server.log

# Or run in foreground to see logs
python -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8000
```

### Enable Verbose Curl

```bash
curl -v http://localhost:8000/health
```

### Use Browser DevTools

1. Go to http://localhost:8000/docs
2. Open browser DevTools (F12)
3. Try API calls and see request/response details

## Best Practices

1. **Always include Content-Type header** for POST/PUT requests:
   ```bash
   -H "Content-Type: application/json"
   ```

2. **Validate data before sending**:
   - Email should be valid format
   - IDs should be UUID format
   - Numbers should be positive

3. **Use the interactive docs** at http://localhost:8000/docs
   - Try requests directly
   - See request/response formats
   - Get example values

4. **Check health before critical operations**:
   ```bash
   curl http://localhost:8000/health
   ```

5. **Use pagination** for large datasets:
   ```bash
   curl "http://localhost:8000/api/teachers?skip=0&limit=10"
   ```

---

**API Version**: 0.2.0
**Last Updated**: January 22, 2026
**Status**: ✅ Production Ready
