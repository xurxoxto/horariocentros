"""
SQLAlchemy ORM Models for persistent database storage.

All models correspond to domain entities but include database-specific features:
- UUID primary keys (stored as TEXT in SQLite)
- Timestamps (created_at, updated_at)
- Foreign key relationships
- SQLAlchemy session management
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum, Float, TypeDecorator
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import UUID as PyUUID
import enum
import uuid

# Custom UUID type for SQLite compatibility (stores as TEXT)
class GUID(TypeDecorator):
    """Platform-independent GUID type that uses TEXT in SQLite."""
    impl = String
    cache_ok = True
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, PyUUID):
            return str(value)
        if isinstance(value, str):
            return value
        raise TypeError(f"Cannot convert {type(value)} to GUID")
    
    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, PyUUID):
            return value
        return PyUUID(value)

Base = declarative_base()


class Teacher(Base):
    """Persistent Teacher model."""
    __tablename__ = "teachers"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    max_hours_per_day = Column(Integer, nullable=False, default=6)
    max_hours_per_week = Column(Integer, nullable=False, default=30)
    prefer_consecutive_free_hours = Column(Boolean, nullable=False, default=False)
    free_hour_preference = Column(String(50), nullable=False, default="no_preference")
    preferred_free_hours = Column(String(100), nullable=False, default="")  # Stored as comma-separated integers
    guard_hours = Column(Integer, nullable=False, default=0)
    break_guard_hours = Column(Integer, nullable=False, default=0)
    support_hours = Column(Integer, nullable=False, default=0)
    coordination_hours = Column(Integer, nullable=False, default=0)
    management_hours = Column(Integer, nullable=False, default=0)
    no_coordination_next_to_free = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assignments = relationship("SubjectAssignment", back_populates="teacher", cascade="all, delete-orphan")
    lessons = relationship("Lesson", back_populates="teacher", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Teacher {self.id} - {self.name}>"


class Subject(Base):
    """Persistent Subject model."""
    __tablename__ = "subjects"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False, unique=True, index=True)
    hours_per_week = Column(Integer, nullable=False, default=1)
    requires_lab = Column(Boolean, nullable=False, default=False)
    excluded_room_ids = Column(String(1000), nullable=False, default="")  # Stored as comma-separated UUIDs
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assignments = relationship("SubjectAssignment", back_populates="subject", cascade="all, delete-orphan")
    lessons = relationship("Lesson", back_populates="subject", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Subject {self.id} - {self.code}>"


class Group(Base):
    """Persistent Group model."""
    __tablename__ = "groups"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True, index=True)
    level = Column(String(50), nullable=False)  # e.g., "ESO1", "BACH1"
    num_students = Column(Integer, nullable=False, default=25)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assignments = relationship("SubjectAssignment", back_populates="group", cascade="all, delete-orphan")
    lessons = relationship("Lesson", back_populates="group", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Group {self.id} - {self.name}>"


class Room(Base):
    """Persistent Room model."""
    __tablename__ = "rooms"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True, index=True)
    capacity = Column(Integer, nullable=False, default=30)
    room_type = Column(String(50), nullable=False, default="classroom")  # classroom, lab, gym, etc
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    lessons = relationship("Lesson", back_populates="room", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Room {self.id} - {self.name}>"


class TimeSlot(Base):
    """Persistent TimeSlot model."""
    __tablename__ = "time_slots"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    day = Column(String(10), nullable=False, index=True)  # Monday, Tuesday, etc (DayOfWeek enum value)
    start_hour = Column(Integer, nullable=False)  # 0-23
    start_minute = Column(Integer, nullable=False, default=0)  # 0-59
    duration_minutes = Column(Integer, nullable=False, default=60)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    lessons = relationship("Lesson", back_populates="time_slot", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<TimeSlot {self.id} - {self.day} {self.start_hour}:{self.start_minute:02d}>"


class SubjectAssignment(Base):
    """Persistent SubjectAssignment model - links teacher, subject, and group."""
    __tablename__ = "subject_assignments"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(GUID(), ForeignKey("teachers.id"), nullable=False, index=True)
    subject_id = Column(GUID(), ForeignKey("subjects.id"), nullable=False, index=True)
    group_id = Column(GUID(), ForeignKey("groups.id"), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = relationship("Teacher", back_populates="assignments")
    subject = relationship("Subject", back_populates="assignments")
    group = relationship("Group", back_populates="assignments")
    lessons = relationship("Lesson", back_populates="assignment", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<SubjectAssignment {self.id} - T:{self.teacher_id} S:{self.subject_id} G:{self.group_id}>"


class Lesson(Base):
    """Persistent Lesson model - represents a scheduled class instance."""
    __tablename__ = "lessons"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    assignment_id = Column(GUID(), ForeignKey("subject_assignments.id"), nullable=False, index=True)
    teacher_id = Column(GUID(), ForeignKey("teachers.id"), nullable=False, index=True)
    subject_id = Column(GUID(), ForeignKey("subjects.id"), nullable=False, index=True)
    group_id = Column(GUID(), ForeignKey("groups.id"), nullable=False, index=True)
    room_id = Column(GUID(), ForeignKey("rooms.id"), nullable=False, index=True)
    time_slot_id = Column(GUID(), ForeignKey("time_slots.id"), nullable=False, index=True)
    schedule_id = Column(GUID(), ForeignKey("schedules.id"), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    assignment = relationship("SubjectAssignment", back_populates="lessons")
    teacher = relationship("Teacher", back_populates="lessons")
    subject = relationship("Subject", back_populates="lessons")
    group = relationship("Group", back_populates="lessons")
    room = relationship("Room", back_populates="lessons")
    time_slot = relationship("TimeSlot", back_populates="lessons")
    schedule = relationship("Schedule", back_populates="lessons")
    
    def __repr__(self):
        return f"<Lesson {self.id} - {self.teacher_id}:{self.subject_id}:{self.group_id}>"


class CenterConfig(Base):
    """Persistent Center Configuration model - stores school schedule (jornada) settings."""
    __tablename__ = "center_config"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    center_name = Column(String(255), nullable=False, default="Mi Centro")
    academic_year = Column(String(20), nullable=False, default="2025-2026")
    schedule_type = Column(String(20), nullable=False, default="continua")  # continua, partida
    education_levels = Column(String(500), nullable=False, default="infantil,primaria,eso,bachillerato")
    periods_per_day = Column(Integer, nullable=False, default=6)
    days_per_week = Column(Integer, nullable=False, default=5)
    total_weekly_hours = Column(Integer, nullable=False, default=30)
    teaching_hours_per_week = Column(Integer, nullable=False, default=25)
    periods_config = Column(String(5000), nullable=False, default="[]")  # JSON: [{number, start_time, end_time, duration_minutes}]
    breaks_config = Column(String(2000), nullable=False, default="[]")  # JSON: [{after_period, start_time, end_time, name}]
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<CenterConfig {self.id} - {self.center_name}>"


class Schedule(Base):
    """Persistent Schedule model - represents a complete generated schedule."""
    __tablename__ = "schedules"
    
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    center_name = Column(String(255), nullable=False)
    academic_year = Column(String(50), nullable=False)  # e.g., "2025-2026"
    is_valid = Column(Boolean, nullable=False, default=True)
    hard_violations = Column(Integer, nullable=False, default=0)
    soft_cost = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    lessons = relationship("Lesson", back_populates="schedule", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Schedule {self.id} - {self.center_name} {self.academic_year}>"
