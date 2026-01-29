# Sistema de Generación Automática de Horarios Académicos

Sistema moderno de generación automática de horarios para centros educativos, con arquitectura limpia y código mantenible.

## 🎯 Características

- ✅ Generación automática de horarios usando backtracking con heurísticas
- ✅ Restricciones duras (obligatorias) y blandas (optimización)
- ✅ Arquitectura limpia: dominio separado de infraestructura
- ✅ **API REST con FastAPI** ← **¡YA DISPONIBLE!**
- ✅ Código extensible y mantenible
- ✅ 100% gratuito y open source

## 📁 Estructura del Proyecto

```
scheduler-app/
├── backend/
│   ├── domain/          # Lógica de negocio pura (7 entidades)
│   ├── algorithm/       # Motor de generación (backtracking + heurísticas)
│   ├── api/            # FastAPI REST ✅ (COMPLETADA)
│   └── persistence/    # SQLAlchemy + SQLite (próximamente)
├── examples/           # Ejemplos de uso
└── requirements.txt
```

## 🚀 Instalación

```bash
# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar ejemplo
python examples/simple_example.py
```

## 🔌 API REST

La API REST está **completamente operativa** y lista para usar:

```bash
# Iniciar servidor
python -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8000

# En otra terminal, ejecutar demostración
python examples/test_api.py
```

**Documentación Interactiva**:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Endpoints Principales**:
- `POST/GET /api/teachers` - Gestión de profesores
- `POST/GET /api/subjects` - Gestión de asignaturas
- `POST/GET /api/groups` - Gestión de grupos
- `POST/GET /api/rooms` - Gestión de aulas
- `POST/GET /api/time-slots` - Franjas horarias
- `POST/GET /api/assignments` - Asignaciones profesor-asignatura-grupo
- `POST /api/schedules` - **Generar horario**
- `GET /api/schedules` - Recuperar horarios generados

Ver [API_STATUS.md](./API_STATUS.md) para documentación completa.

## 📚 Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del sistema
- [API_STATUS.md](./API_STATUS.md) - Estado y documentación de la API
- [QUICKSTART.md](./QUICKSTART.md) - Guía rápida de inicio
