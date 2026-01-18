# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register User
**POST** `/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "teacher"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "teacher"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
**POST** `/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "teacher"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
**GET** `/auth/me`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "teacher"
  }
}
```

## Timetable Management

### Get Timetable Entries
**GET** `/timetable/entries`

Query Parameters:
- `teacherId` (optional): Filter by teacher ID
- `studentGroupId` (optional): Filter by student group ID
- `roomId` (optional): Filter by room ID
- `date` (optional): Filter by specific date (YYYY-MM-DD)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "subjectId": "math101",
      "teacherId": "t1",
      "roomId": "r101",
      "timeSlotId": "ts1",
      "studentGroupId": "g10a",
      "date": "2024-01-15",
      "status": "scheduled",
      "notes": ""
    }
  ]
}
```

### Create Timetable Entry
**POST** `/timetable/entries`

Request:
```json
{
  "subjectId": "math101",
  "teacherId": "t1",
  "roomId": "r101",
  "timeSlotId": "ts1",
  "studentGroupId": "g10a",
  "date": "2024-01-15"
}
```

### Update Timetable Entry
**PUT** `/timetable/entries/:id`

Request:
```json
{
  "roomId": "r102",
  "notes": "Room changed due to maintenance"
}
```

### Delete Timetable Entry
**DELETE** `/timetable/entries/:id`

Response:
```json
{
  "success": true
}
```

## Room Management

### Get All Rooms
**GET** `/rooms`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Room 101",
      "building": "Main Building",
      "floor": 1,
      "capacity": 30,
      "type": "classroom",
      "equipment": ["projector", "whiteboard"],
      "available": true
    }
  ]
}
```

### Create Room
**POST** `/rooms`

Request:
```json
{
  "name": "Science Lab 2",
  "building": "Science Block",
  "floor": 2,
  "capacity": 25,
  "type": "lab",
  "equipment": ["microscopes", "lab benches"]
}
```

## Subject Management

### Get All Subjects
**GET** `/subjects`

### Create Subject
**POST** `/subjects`

Request:
```json
{
  "name": "Advanced Mathematics",
  "code": "MATH301",
  "department": "Mathematics",
  "credits": 4,
  "requiresLab": false,
  "color": "#4F46E5"
}
```

## Teacher Management

### Get All Teachers
**GET** `/teachers`

### Create Teacher
**POST** `/teachers`

Request:
```json
{
  "userId": "u123",
  "name": "Dr. Jane Smith",
  "email": "jane.smith@school.edu",
  "subjects": ["math101", "math201"],
  "availability": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ],
  "preferences": {
    "maxConsecutiveClasses": 3,
    "preferredTimeSlots": ["ts1", "ts2"],
    "avoidTimeSlots": []
  }
}
```

## Student Group Management

### Get All Student Groups
**GET** `/student-groups`

### Create Student Group
**POST** `/student-groups`

Request:
```json
{
  "name": "Grade 10 A",
  "grade": "10",
  "stream": "Science",
  "studentCount": 32,
  "students": ["s1", "s2", "s3"]
}
```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Real-time Events (WebSocket)

### Connect to WebSocket
```javascript
const socket = io('http://localhost:8000');
```

### Join Timetable Room
```javascript
socket.emit('join-timetable', timetableId);
```

### Listen for Updates
```javascript
socket.on('timetable-changed', (changes) => {
  console.log('Timetable updated:', changes);
});
```

### Send Updates
```javascript
socket.emit('timetable-update', {
  timetableId: 'tt1',
  changes: { /* changes object */ }
});
```
