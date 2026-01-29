"""
Domain package - Lógica de negocio pura.
"""

from .entities import (
    Teacher,
    Subject,
    Group,
    Room,
    TimeSlot,
    SubjectAssignment,
    DayOfWeek,
    RoomType,
    generate_id,
)

__all__ = [
    "Teacher",
    "Subject",
    "Group",
    "Room",
    "TimeSlot",
    "SubjectAssignment",
    "DayOfWeek",
    "RoomType",
    "generate_id",
]
