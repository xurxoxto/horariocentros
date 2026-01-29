# Arquitectura del Sistema de Generación de Horarios

## 🎯 Objetivo

Aplicación moderna de generación automática de horarios académicos con arquitectura limpia, código mantenible y capacidad de ejecución local.

## 🏗️ Principios de Diseño

1. **Separación de responsabilidades**: Dominio, algoritmo, API y persistencia claramente separados
2. **Independencia del framework**: La lógica de negocio no depende de FastAPI o SQLAlchemy
3. **Testabilidad**: Cada componente puede probarse de forma aislada
4. **Extensibilidad**: Fácil añadir nuevas restricciones o cambiar el algoritmo
5. **Gratuito y autocontenido**: Cada centro educativo puede ejecutarlo independientemente

## 📦 Estructura de Capas

```
┌─────────────────────────────────────┐
│         Frontend (React)            │  ← Fase 2
├─────────────────────────────────────┤
│      API REST (FastAPI)             │  ← Capa de presentación
├─────────────────────────────────────┤
│   Algorithm (Scheduler Engine)      │  ← Motor de optimización
├─────────────────────────────────────┤
│      Domain Models (Core)           │  ← Lógica de negocio pura
├─────────────────────────────────────┤
│   Persistence (SQLAlchemy)          │  ← Capa de datos
└─────────────────────────────────────┘
```

## 🔧 Stack Tecnológico

### Backend
- **Python 3.11+**: Lenguaje principal
- **FastAPI**: Framework web moderno, rápido y con tipado
- **SQLAlchemy**: ORM para abstracción de base de datos
- **SQLite**: Base de datos local (sin configuración)
- **Pydantic**: Validación de datos y schemas

### Frontend (Fase 2)
- **React 18**: Librería UI moderna
- **TypeScript**: Tipado estático
- **Vite**: Build tool rápido
- **TailwindCSS**: Estilos modernos y responsivos

### Desarrollo
- **pytest**: Testing
- **black**: Formateo de código
- **mypy**: Verificación de tipos

## 🎲 Flujo de Generación de Horarios

```
1. Usuario define entidades (profesores, grupos, aulas, asignaturas)
           ↓
2. Usuario define restricciones (duras y blandas)
           ↓
3. Sistema lanza el algoritmo de generación
           ↓
4. Algoritmo genera horario (backtracking + heurísticas)
           ↓
5. Sistema evalúa restricciones y calcula coste
           ↓
6. Sistema devuelve horario o reporta imposibilidad
           ↓
7. Usuario visualiza resultado y conflictos
```

## 📁 Estructura de Directorios

```
scheduler-app/
├── README.md
├── ARCHITECTURE.md
├── requirements.txt
├── .gitignore
│
├── backend/
│   ├── __init__.py
│   │
│   ├── domain/              # 🎯 Core del negocio (sin dependencias)
│   │   ├── __init__.py
│   │   ├── entities.py      # Teacher, Subject, Group, Room, TimeSlot
│   │   ├── lesson.py        # Clase Lesson (asignación)
│   │   ├── timetable.py     # Horario completo
│   │   └── constraints.py   # Interfaz de restricciones
│   │
│   ├── algorithm/           # 🧠 Motor de generación
│   │   ├── __init__.py
│   │   ├── scheduler.py     # Algoritmo principal
│   │   ├── strategies.py    # Backtracking, greedy, etc.
│   │   ├── evaluator.py     # Evaluación de restricciones
│   │   └── constraints_impl.py  # Restricciones concretas
│   │
│   ├── api/                 # 🌐 Endpoints REST
│   │   ├── __init__.py
│   │   ├── main.py          # Aplicación FastAPI
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── entities.py  # CRUD entidades
│   │   │   └── scheduler.py # Generación de horarios
│   │   └── dependencies.py  # Inyección de dependencias
│   │
│   ├── persistence/         # 💾 Capa de datos
│   │   ├── __init__.py
│   │   ├── database.py      # Configuración SQLite
│   │   ├── models.py        # SQLAlchemy models
│   │   └── repositories.py  # Patrón repositorio
│   │
│   └── tests/               # ✅ Tests
│       ├── __init__.py
│       ├── test_domain.py
│       ├── test_algorithm.py
│       └── test_api.py
│
├── frontend/                # 🎨 UI (Fase 2)
│   └── (React app)
│
├── examples/                # 📚 Datos de prueba
│   ├── sample_data.py
│   └── test_scenarios.py
│
└── docs/
    ├── API.md
    ├── ALGORITHM.md
    └── USER_GUIDE.md
```

## 🎯 Dominio: Entidades Core

### Entidades Principales

1. **Teacher** (Profesor)
   - ID único
   - Nombre
   - Preferencias horarias
   - Máximo horas por día/semana

2. **Subject** (Asignatura)
   - ID único
   - Nombre
   - Horas semanales requeridas

3. **Group** (Grupo/Clase)
   - ID único
   - Nombre
   - Número de estudiantes
   - Nivel educativo

4. **Room** (Aula)
   - ID único
   - Nombre
   - Capacidad
   - Tipo (laboratorio, aula normal, etc.)

5. **TimeSlot** (Franja Horaria)
   - Día de la semana
   - Hora de inicio
   - Duración

6. **Lesson** (Asignación)
   - Profesor + Subject + Group + Room + TimeSlot
   - Representa una clase asignada

7. **Timetable** (Horario Completo)
   - Conjunto de Lessons
   - Métodos de validación y evaluación

## 🔒 Restricciones

### Restricciones Duras (MUST)
- Un profesor no puede estar en dos sitios simultáneamente
- Un grupo no puede tener dos clases simultáneas
- Un aula no puede estar ocupada por dos grupos simultáneamente
- Respetar horas mínimas/máximas por asignatura

### Restricciones Blandas (SHOULD - optimizar)
- Minimizar huecos en horarios de profesores
- Respetar preferencias horarias
- Distribución equilibrada de horas por día
- Evitar clases muy tarde o muy temprano
- Agrupar clases de misma asignatura

## 🧮 Algoritmo (Fase 1)

### Estrategia: Backtracking con Heurísticas

```python
1. Generar lista de asignaciones pendientes
2. Ordenar por dificultad (heurística)
3. Para cada asignación:
   - Probar todos los slots disponibles
   - Verificar restricciones duras
   - Calcular coste de restricciones blandas
   - Elegir mejor opción
   - Si no hay opción válida → backtrack
4. Devolver horario o reportar imposibilidad
```

### Heurísticas de Ordenación
- Profesores con menos disponibilidad primero
- Asignaturas con más horas primero
- Grupos más grandes primero

## 🚀 Ejecución Local

```bash
# Backend
cd backend
pip install -r requirements.txt
python -m api.main

# Frontend (Fase 2)
cd frontend
npm install
npm run dev
```

## 🔄 Flujo de Desarrollo

### Fase 1: Core + Backend (actual)
1. ✅ Modelos de dominio
2. ✅ Motor de generación
3. ✅ Restricciones básicas
4. ✅ API REST
5. ✅ Persistencia SQLite
6. ✅ Datos de prueba

### Fase 2: Frontend
1. Configuración React + Vite
2. Componentes de formularios
3. Vista de horario (grid)
4. Indicadores de conflictos
5. Exportación de resultados

### Fase 3: Mejoras
1. Algoritmo más sofisticado (genético, simulated annealing)
2. Restricciones adicionales
3. Importación/exportación de datos
4. Multi-tenancy (varios centros)
5. Autenticación

## 📊 Modelo de Datos (MVP)

```sql
-- Entidades base
teachers (id, name, max_hours_per_day, max_hours_per_week)
subjects (id, name, hours_per_week)
groups (id, name, num_students, level)
rooms (id, name, capacity, room_type)
time_slots (id, day_of_week, start_time, duration)

-- Relaciones
subject_assignments (teacher_id, subject_id, group_id) -- ¿Quién enseña qué a quién?

-- Resultado
lessons (id, teacher_id, subject_id, group_id, room_id, time_slot_id)

-- Restricciones
teacher_preferences (teacher_id, time_slot_id, preference_level)
```

## 🎓 Decisiones Técnicas

### ¿Por qué FastAPI?
- Tipado automático con Pydantic
- Documentación interactiva automática (Swagger)
- Asíncrono (preparado para escalar)
- Moderna y pythonic

### ¿Por qué SQLite?
- Sin configuración (archivo local)
- Suficiente para un centro educativo
- Fácil migrar a PostgreSQL si crece

### ¿Por qué separar Domain de API?
- El algoritmo puede usarse sin API (CLI, tests)
- Fácil cambiar FastAPI por Flask si fuera necesario
- Testeable sin levantar servidor

### ¿Por qué Python para el algoritmo?
- Excelente para prototipado rápido
- Librerías de optimización disponibles (OR-Tools, PuLP)
- Fácil de leer y mantener
- Si el rendimiento fuera crítico, se puede reescribir en Rust/C++

## 🧪 Testing

```bash
# Tests unitarios (dominio)
pytest backend/tests/test_domain.py

# Tests de integración (algoritmo)
pytest backend/tests/test_algorithm.py

# Tests de API
pytest backend/tests/test_api.py
```

## 📝 Licencia

MIT - Libre y gratuito para cualquier centro educativo
