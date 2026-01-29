"""
Persistence layer for database storage.

Provides:
- SQLAlchemy ORM models (models.py)
- Database configuration (database.py)
- Store implementation (store.py)
"""

from backend.persistence.models import (
    Base,
    Teacher,
    Subject,
    Group,
    Room,
    TimeSlot,
    SubjectAssignment,
    Lesson,
    Schedule,
)
from backend.persistence.database import (
    engine,
    SessionLocal,
    get_db,
    get_session,
    init_db,
    drop_db,
)
from backend.persistence.store import DatabaseStore

__all__ = [
    "Base",
    "Teacher",
    "Subject",
    "Group",
    "Room",
    "TimeSlot",
    "SubjectAssignment",
    "Lesson",
    "Schedule",
    "engine",
    "SessionLocal",
    "get_db",
    "get_session",
    "init_db",
    "drop_db",
    "DatabaseStore",
]
