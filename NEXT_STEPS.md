# 🎯 Próximos Pasos - Roadmap de Desarrollo

## ✅ COMPLETADO - Fase 1: Core del Sistema

### Lo que ya tienes funcionando:

1. ✅ **Arquitectura limpia**: Dominio separado de infraestructura
2. ✅ **Modelos de dominio puros**: Teacher, Subject, Group, Room, TimeSlot, Lesson, Timetable
3. ✅ **Sistema de restricciones**: 7 restricciones (4 duras, 3 blandas)
4. ✅ **Motor de generación**: Backtracking con heurísticas
5. ✅ **Evaluador de restricciones**: Cálculo de coste y validación
6. ✅ **Ejemplo funcional**: Genera horarios correctamente
7. ✅ **Documentación completa**: ARCHITECTURE.md, PROJECT_STATUS.md, QUICKSTART.md

---

## 🚀 Fase 2: API REST con FastAPI

### Objetivo
Exponer el motor de generación mediante una API REST para que pueda usarse desde cualquier cliente (web, móvil, etc.)

### Tareas

#### 2.1. Configuración Base
- [ ] Crear módulo `backend/api/`
- [ ] Configurar FastAPI app principal
- [ ] Configurar CORS para desarrollo
- [ ] Documentación automática con Swagger

#### 2.2. Endpoints de Entidades (CRUD)
- [ ] POST/GET/PUT/DELETE `/api/teachers`
- [ ] POST/GET/PUT/DELETE `/api/subjects`
- [ ] POST/GET/PUT/DELETE `/api/groups`
- [ ] POST/GET/PUT/DELETE `/api/rooms`
- [ ] POST/GET/PUT/DELETE `/api/time-slots`
- [ ] POST/GET/PUT/DELETE `/api/assignments`

#### 2.3. Endpoint de Generación
- [ ] POST `/api/schedules/generate` - Generar horario
- [ ] GET `/api/schedules/{id}` - Obtener horario generado
- [ ] GET `/api/schedules/{id}/conflicts` - Ver conflictos
- [ ] GET `/api/schedules/{id}/teacher/{teacher_id}` - Horario de profesor
- [ ] GET `/api/schedules/{id}/group/{group_id}` - Horario de grupo

#### 2.4. Validación y Errores
- [ ] Schemas Pydantic para request/response
- [ ] Manejo de errores HTTP
- [ ] Validación de datos de entrada

#### 2.5. Testing
- [ ] Tests de endpoints con pytest
- [ ] Tests de integración
- [ ] Mocks para el motor de generación

### Estructura de archivos sugerida

```
backend/api/
├── __init__.py
├── main.py              # App FastAPI principal
├── schemas.py           # Pydantic schemas
├── routes/
│   ├── __init__.py
│   ├── teachers.py
│   ├── subjects.py
│   ├── groups.py
│   ├── rooms.py
│   ├── time_slots.py
│   ├── assignments.py
│   └── schedules.py     # Endpoint de generación
├── dependencies.py      # Inyección de dependencias
└── errors.py           # Manejo de errores
```

### Ejemplo de código

```python
# backend/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import teachers, subjects, schedules

app = FastAPI(
    title="Sistema de Generación de Horarios",
    description="API REST para generación automática de horarios académicos",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(teachers.router, prefix="/api/teachers", tags=["teachers"])
app.include_router(subjects.router, prefix="/api/subjects", tags=["subjects"])
app.include_router(schedules.router, prefix="/api/schedules", tags=["schedules"])

@app.get("/")
def root():
    return {"message": "API de Generación de Horarios", "version": "1.0.0"}
```

```python
# backend/api/routes/schedules.py
from fastapi import APIRouter, HTTPException
from ..schemas import ScheduleRequest, ScheduleResponse
from backend.algorithm.scheduler import create_simple_schedule

router = APIRouter()

@router.post("/generate", response_model=ScheduleResponse)
async def generate_schedule(request: ScheduleRequest):
    """Genera un horario automáticamente."""
    timetable, result = create_simple_schedule(
        teachers=request.teachers,
        subjects=request.subjects,
        # ...
    )
    
    if not result.is_valid:
        raise HTTPException(status_code=400, detail="No se pudo generar horario")
    
    return ScheduleResponse(
        timetable=timetable,
        cost=result.total_cost,
        conflicts=result.hard_violations
    )
```

### Comandos útiles

```bash
# Ejecutar API en desarrollo
uvicorn backend.api.main:app --reload

# Ver documentación
# Abrir: http://localhost:8000/docs

# Tests
pytest backend/api/tests/
```

---

## 📦 Fase 3: Persistencia con SQLite

### Objetivo
Guardar datos de forma persistente para no tener que recrear entidades cada vez.

### Tareas

#### 3.1. Configuración Base
- [ ] Crear módulo `backend/persistence/`
- [ ] Configurar SQLAlchemy
- [ ] Configurar Alembic para migraciones
- [ ] Crear base de datos SQLite

#### 3.2. Modelos SQLAlchemy
- [ ] Modelo `TeacherModel`
- [ ] Modelo `SubjectModel`
- [ ] Modelo `GroupModel`
- [ ] Modelo `RoomModel`
- [ ] Modelo `TimeSlotModel`
- [ ] Modelo `SubjectAssignmentModel`
- [ ] Modelo `TimetableModel`
- [ ] Modelo `LessonModel`

#### 3.3. Repositorios
- [ ] `TeacherRepository` (CRUD)
- [ ] `SubjectRepository`
- [ ] `GroupRepository`
- [ ] `RoomRepository`
- [ ] `TimeSlotRepository`
- [ ] `TimetableRepository`

#### 3.4. Mappers
- [ ] Mapper: Dominio ↔ SQLAlchemy models
- [ ] Conversión automática

#### 3.5. Migraciones
- [ ] Crear migración inicial
- [ ] Scripts de seed data

### Estructura de archivos sugerida

```
backend/persistence/
├── __init__.py
├── database.py          # Configuración SQLite
├── models.py           # SQLAlchemy models
├── repositories.py     # Patrón repositorio
├── mappers.py          # Dominio ↔ Persistencia
└── migrations/         # Alembic migrations
```

### Ejemplo de código

```python
# backend/persistence/models.py
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class TeacherModel(Base):
    __tablename__ = "teachers"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String)
    max_hours_per_day = Column(Integer)
    max_hours_per_week = Column(Integer)
```

```python
# backend/persistence/repositories.py
from typing import List, Optional
from uuid import UUID
from .models import TeacherModel
from backend.domain.entities import Teacher

class TeacherRepository:
    def __init__(self, session):
        self.session = session
    
    def create(self, teacher: Teacher) -> Teacher:
        model = TeacherModel(
            id=str(teacher.id),
            name=teacher.name,
            # ...
        )
        self.session.add(model)
        self.session.commit()
        return teacher
    
    def get_by_id(self, teacher_id: UUID) -> Optional[Teacher]:
        model = self.session.query(TeacherModel).filter_by(id=str(teacher_id)).first()
        if not model:
            return None
        return Teacher(
            id=UUID(model.id),
            name=model.name,
            # ...
        )
    
    def get_all(self) -> List[Teacher]:
        models = self.session.query(TeacherModel).all()
        return [self._to_domain(m) for m in models]
```

### Comandos útiles

```bash
# Crear migración
alembic revision --autogenerate -m "Initial migration"

# Aplicar migraciones
alembic upgrade head

# Revertir migración
alembic downgrade -1
```

---

## 🎨 Fase 4: Frontend con React

### Objetivo
Crear una interfaz web moderna para gestionar entidades y visualizar horarios.

### Tareas

#### 4.1. Configuración Base
- [ ] Crear proyecto React con Vite
- [ ] Configurar TypeScript
- [ ] Configurar TailwindCSS
- [ ] Configurar React Router

#### 4.2. Componentes Básicos
- [ ] Layout principal
- [ ] Navbar
- [ ] Sidebar
- [ ] Footer

#### 4.3. Páginas de Entidades
- [ ] Lista de profesores + formulario
- [ ] Lista de asignaturas + formulario
- [ ] Lista de grupos + formulario
- [ ] Lista de aulas + formulario
- [ ] Configuración de franjas horarias

#### 4.4. Página de Generación
- [ ] Botón "Generar Horario"
- [ ] Indicador de progreso
- [ ] Mostrar resultado

#### 4.5. Visualización de Horarios
- [ ] Grid de horario semanal
- [ ] Filtro por profesor
- [ ] Filtro por grupo
- [ ] Indicadores de conflictos
- [ ] Exportar a PDF/CSV

#### 4.6. Estado y API
- [ ] Cliente API con fetch/axios
- [ ] Gestión de estado (Context/Zustand/Redux)
- [ ] Manejo de errores
- [ ] Loading states

### Estructura sugerida

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── TimetableGrid.tsx
│   │   └── EntityForm.tsx
│   ├── pages/
│   │   ├── TeachersPage.tsx
│   │   ├── SubjectsPage.tsx
│   │   ├── GeneratePage.tsx
│   │   └── TimetablePage.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

### Ejemplo de código

```tsx
// frontend/src/components/TimetableGrid.tsx
import React from 'react';

interface Lesson {
  subject: string;
  teacher: string;
  room: string;
}

interface Props {
  lessons: Lesson[][];
}

export const TimetableGrid: React.FC<Props> = ({ lessons }) => {
  return (
    <div className="grid grid-cols-6 gap-2">
      {lessons.map((day, i) => (
        <div key={i} className="border p-2">
          <h3 className="font-bold">{getDayName(i)}</h3>
          {day.map((lesson, j) => (
            <div key={j} className="bg-blue-100 p-2 my-1 rounded">
              <p className="font-semibold">{lesson.subject}</p>
              <p className="text-sm">{lesson.teacher}</p>
              <p className="text-xs text-gray-600">{lesson.room}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

### Comandos útiles

```bash
# Crear proyecto
npm create vite@latest frontend -- --template react-ts

# Instalar dependencias
cd frontend
npm install

# Desarrollo
npm run dev

# Build
npm run build
```

---

## 🔧 Fase 5: Mejoras y Optimización

### Algoritmos Avanzados
- [ ] Implementar algoritmo genético
- [ ] Implementar simulated annealing
- [ ] Comparar rendimiento

### Restricciones Adicionales
- [ ] Restricción de consecutividad (clases de misma asignatura seguidas)
- [ ] Restricción de descansos mínimos
- [ ] Restricción de asignaturas en horas específicas
- [ ] Restricción de disponibilidad de aulas por tipo

### Importación/Exportación
- [ ] Importar desde CSV
- [ ] Importar desde Excel
- [ ] Exportar horarios a PDF
- [ ] Exportar a iCal para calendarios

### Multi-tenancy
- [ ] Sistema de autenticación
- [ ] Múltiples centros educativos
- [ ] Roles y permisos

### Optimizaciones
- [ ] Cache de evaluaciones
- [ ] Paralelización
- [ ] Algoritmos más eficientes

---

## 📚 Recursos Útiles

### Documentación
- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)

### Algoritmos de Scheduling
- "Handbook of Scheduling" - Brucker
- "Constraint Satisfaction Problems" - Russell & Norvig
- Paper: "A Survey of Automated Timetabling"

### Herramientas
- [OR-Tools](https://developers.google.com/optimization) - Optimización de Google
- [PuLP](https://coin-or.github.io/pulp/) - Programación lineal en Python

---

## 🎯 Prioridades Recomendadas

### Corto Plazo (1-2 semanas)
1. API REST básica con FastAPI
2. Endpoints CRUD para todas las entidades
3. Endpoint de generación

### Medio Plazo (1 mes)
1. Persistencia con SQLite
2. Frontend básico con React
3. Visualización de horarios

### Largo Plazo (2-3 meses)
1. Algoritmos avanzados
2. Importación/exportación
3. Multi-tenancy

---

## 💡 Consejos

1. **Mantén la arquitectura limpia**: No mezcles capas
2. **Tests primero**: Escribe tests para cada nueva funcionalidad
3. **Iteraciones pequeñas**: Mejor hacer poco bien que mucho mal
4. **Documenta mientras desarrollas**: No dejes la documentación para el final
5. **Git commits descriptivos**: Facilita volver atrás si algo falla

---

## ✨ ¡Éxito en el desarrollo!

Tienes una base sólida. Ahora es cuestión de ir construyendo capa por capa, manteniendo la calidad del código y la separación de responsabilidades.

**Recuerda**: Un sistema bien diseñado es fácil de mantener y extender. ¡Has hecho un excelente trabajo hasta ahora! 🚀
