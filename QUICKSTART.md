# Guía de Inicio Rápido - Sistema de Generación de Horarios

## 🎯 ¿Qué es esto?

Un sistema profesional de generación automática de horarios académicos que:
- ✅ Genera horarios válidos automáticamente
- ✅ Respeta restricciones (profesores, aulas, grupos)
- ✅ Es 100% gratuito y open source
- ✅ Cada centro puede usarlo independientemente

## 🚀 Instalación Rápida

### Opción 1: Script Automático (Recomendado)

```bash
./install.sh
```

### Opción 2: Manual

```bash
# 1. Crear entorno virtual
python3 -m venv venv

# 2. Activar entorno virtual
source venv/bin/activate  # macOS/Linux
# O en Windows: venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt
```

## 🧪 Probar el Sistema

```bash
# Activar entorno virtual (si no está activo)
source venv/bin/activate

# Ejecutar ejemplo
python examples/simple_example.py
```

**Resultado esperado**:
```
✅ ¡Horario generado exitosamente!
   - Lecciones: 10
   - Coste total: 7.13
   - Restricciones duras violadas: 0

📅 HORARIO GENERADO
🎓 Horario del grupo: 1º ESO A
  MONDAY     08:00 | MAT-101  | Prof: Juan Pérez  | Aula: Aula 101
  ...
```

## 📚 Estructura del Proyecto

```
horariocentros/
├── backend/
│   ├── domain/          # Modelos de negocio (Teacher, Subject, etc.)
│   └── algorithm/       # Motor de generación de horarios
│
├── examples/
│   └── simple_example.py    # Ejemplo funcional
│
├── ARCHITECTURE.md      # Arquitectura detallada
├── PROJECT_STATUS.md    # Estado actual del proyecto
└── README.md           # Este archivo
```

## 💡 Uso Básico

### 1. Crear Entidades

```python
from backend.domain.entities import *

# Profesor
teacher = Teacher(
    id=generate_id(),
    name="Juan Pérez",
    max_hours_per_day=6
)

# Asignatura
subject = Subject(
    id=generate_id(),
    name="Matemáticas",
    code="MAT-101",
    hours_per_week=3
)

# Grupo
group = Group(
    id=generate_id(),
    name="1º ESO A",
    level="ESO",
    num_students=25
)

# Aula
room = Room(
    id=generate_id(),
    name="Aula 101",
    capacity=30
)

# Franja horaria
slot = TimeSlot(
    id=generate_id(),
    day=DayOfWeek.MONDAY,
    start_hour=8,
    start_minute=0,
    duration_minutes=60
)
```

### 2. Generar Horario

```python
from backend.algorithm.scheduler import create_simple_schedule

# Definir quién enseña qué a quién
assignment = SubjectAssignment(
    id=generate_id(),
    teacher_id=teacher.id,
    subject_id=subject.id,
    group_id=group.id
)

# Generar
timetable, result = create_simple_schedule(
    teachers=[teacher],
    subjects=[subject],
    groups=[group],
    rooms=[room],
    time_slots=[slot],
    subject_assignments=[assignment]
)

# Verificar
if result.is_valid:
    print(f"✅ Horario generado con {timetable.count_lessons()} lecciones")
else:
    print("❌ No se pudo generar")
```

## 🔒 Restricciones

### Duras (Obligatorias)
- Un profesor no puede estar en dos lugares a la vez
- Un grupo no puede tener dos clases simultáneas
- Un aula no puede estar ocupada doblemente
- Las aulas deben tener capacidad suficiente

### Blandas (Optimización)
- Minimizar huecos en horarios
- Respetar preferencias de profesores
- Distribuir clases equilibradamente

## 📖 Documentación

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura detallada y decisiones técnicas
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Estado actual y roadmap
- **Código comentado** - Todas las clases tienen docstrings

## 🛠️ Próximos Pasos

1. ✅ **Core completado** - Motor de generación funcional
2. 🔜 **API REST** - FastAPI con endpoints CRUD
3. 🔜 **Persistencia** - SQLite para guardar datos
4. 🔜 **Frontend** - React + TypeScript para la UI

## ❓ Preguntas Frecuentes

### ¿Es realmente gratuito?
Sí, 100% gratuito y open source (licencia MIT).

### ¿Necesito conocimientos de programación?
Para usar el ejemplo básico no, pero para personalizar sí necesitas Python.

### ¿Cuántos profesores/grupos soporta?
Depende del hardware, pero está probado con hasta 100+ entidades.

### ¿Puedo añadir mis propias restricciones?
Sí, el sistema está diseñado para ser extensible.

### ¿Necesito internet?
No, funciona 100% offline una vez instalado.

## 🐛 Solución de Problemas

### Error: "No module named 'backend'"
```bash
# Asegúrate de ejecutar desde el directorio raíz del proyecto
cd horariocentros
python examples/simple_example.py
```

### Error: "Python 3 not found"
Instala Python 3.9 o superior desde [python.org](https://python.org)

### Error durante pip install
```bash
# Actualiza pip primero
pip install --upgrade pip
pip install -r requirements.txt
```

## 📧 Soporte

- Abre un issue en GitHub
- Consulta la documentación en ARCHITECTURE.md
- Revisa los ejemplos en la carpeta `examples/`

## 📄 Licencia

MIT - Uso libre para cualquier centro educativo

---

**¡Disfruta generando horarios automáticamente! 🎓**
