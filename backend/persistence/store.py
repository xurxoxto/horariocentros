"""
Database-backed store implementation.

Replaces InMemoryStore with SQLAlchemy ORM-based persistence.
All operations are committed to SQLite database.
"""

from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from backend.domain.entities import (
    Teacher as DomainTeacher,
    Subject as DomainSubject,
    Group as DomainGroup,
    Room as DomainRoom,
    TimeSlot as DomainTimeSlot,
    SubjectAssignment as DomainSubjectAssignment,
    FreeHourPreference,
)
from backend.domain.lesson import Lesson as DomainLesson
from backend.domain.timetable import Timetable as DomainTimetable

from backend.persistence.models import (
    Teacher as DBTeacher,
    Subject as DBSubject,
    Group as DBGroup,
    Room as DBRoom,
    TimeSlot as DBTimeSlot,
    SubjectAssignment as DBSubjectAssignment,
    Lesson as DBLesson,
    Schedule as DBSchedule,
)
from backend.persistence.database import get_session


class DatabaseStore:
    """
    SQLAlchemy-based persistent store.
    
    Replaces InMemoryStore for Phase 3. All operations persist to SQLite.
    """
    
    def __init__(self, session: Optional[Session] = None):
        """Initialize store with optional session (for testing)."""
        self.session = session or get_session()
    
    # ========================================================================
    # TEACHER OPERATIONS
    # ========================================================================
    
    def create_teacher(self, teacher: DomainTeacher) -> DomainTeacher:
        """Create a new teacher in database."""
        try:
            preferred_hours_str = ",".join(str(h) for h in teacher.preferred_free_hours) if teacher.preferred_free_hours else ""
            db_teacher = DBTeacher(
                id=teacher.id,
                name=teacher.name,
                max_hours_per_day=teacher.max_hours_per_day,
                max_hours_per_week=teacher.max_hours_per_week,
                prefer_consecutive_free_hours=teacher.prefer_consecutive_free_hours,
                free_hour_preference=teacher.free_hour_preference.value,
                preferred_free_hours=preferred_hours_str,
                guard_hours=teacher.guard_hours,
                break_guard_hours=teacher.break_guard_hours,
                support_hours=teacher.support_hours,
                coordination_hours=teacher.coordination_hours,
                management_hours=teacher.management_hours,
                no_coordination_next_to_free=teacher.no_coordination_next_to_free,
            )
            self.session.add(db_teacher)
            self.session.commit()
            return teacher
        except IntegrityError:
            self.session.rollback()
            raise ValueError(f"Teacher with name {teacher.name} already exists")
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def get_teacher(self, teacher_id: UUID) -> Optional[DomainTeacher]:
        """Get teacher by ID."""
        db_teacher = self.session.query(DBTeacher).filter(DBTeacher.id == teacher_id).first()
        if not db_teacher:
            return None
        preferred_hours = set(int(h) for h in db_teacher.preferred_free_hours.split(",") if h.strip()) if db_teacher.preferred_free_hours else set()
        return DomainTeacher(
            id=db_teacher.id,
            name=db_teacher.name,
            max_hours_per_day=db_teacher.max_hours_per_day,
            max_hours_per_week=db_teacher.max_hours_per_week,
            prefer_consecutive_free_hours=db_teacher.prefer_consecutive_free_hours,
            free_hour_preference=FreeHourPreference(db_teacher.free_hour_preference),
            preferred_free_hours=preferred_hours,
            guard_hours=db_teacher.guard_hours,
            break_guard_hours=db_teacher.break_guard_hours,
            support_hours=db_teacher.support_hours,
            coordination_hours=db_teacher.coordination_hours,
            management_hours=db_teacher.management_hours,
            no_coordination_next_to_free=db_teacher.no_coordination_next_to_free,
        )
    
    def list_teachers(self) -> List[DomainTeacher]:
        """List all teachers."""
        db_teachers = self.session.query(DBTeacher).all()
        result = []
        for t in db_teachers:
            preferred_hours = set(int(h) for h in t.preferred_free_hours.split(",") if h.strip()) if t.preferred_free_hours else set()
            result.append(DomainTeacher(
                id=t.id,
                name=t.name,
                max_hours_per_day=t.max_hours_per_day,
                max_hours_per_week=t.max_hours_per_week,
                prefer_consecutive_free_hours=t.prefer_consecutive_free_hours,
                free_hour_preference=FreeHourPreference(t.free_hour_preference),
                preferred_free_hours=preferred_hours,
                guard_hours=t.guard_hours,
                break_guard_hours=t.break_guard_hours,
                support_hours=t.support_hours,
                coordination_hours=t.coordination_hours,
                management_hours=t.management_hours,
                no_coordination_next_to_free=t.no_coordination_next_to_free,
            ))
        return result
    
    def update_teacher(self, teacher_id: UUID, teacher: DomainTeacher) -> DomainTeacher:
        """Update teacher."""
        db_teacher = self.session.query(DBTeacher).filter(DBTeacher.id == teacher_id).first()
        if not db_teacher:
            raise ValueError(f"Teacher {teacher_id} not found")
        
        try:
            preferred_hours_str = ",".join(str(h) for h in teacher.preferred_free_hours) if teacher.preferred_free_hours else ""
            db_teacher.name = teacher.name
            db_teacher.max_hours_per_day = teacher.max_hours_per_day
            db_teacher.max_hours_per_week = teacher.max_hours_per_week
            db_teacher.prefer_consecutive_free_hours = teacher.prefer_consecutive_free_hours
            db_teacher.free_hour_preference = teacher.free_hour_preference.value
            db_teacher.preferred_free_hours = preferred_hours_str
            db_teacher.guard_hours = teacher.guard_hours
            db_teacher.break_guard_hours = teacher.break_guard_hours
            db_teacher.support_hours = teacher.support_hours
            db_teacher.coordination_hours = teacher.coordination_hours
            db_teacher.management_hours = teacher.management_hours
            db_teacher.no_coordination_next_to_free = teacher.no_coordination_next_to_free
            self.session.commit()
            return teacher
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def delete_teacher(self, teacher_id: UUID) -> bool:
        """Delete teacher."""
        db_teacher = self.session.query(DBTeacher).filter(DBTeacher.id == teacher_id).first()
        if not db_teacher:
            return False
        
        try:
            self.session.delete(db_teacher)
            self.session.commit()
            return True
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    # ========================================================================
    # SUBJECT OPERATIONS
    # ========================================================================
    
    def create_subject(self, subject: DomainSubject) -> DomainSubject:
        """Create a new subject in database."""
        try:
            excluded_ids_str = ",".join(str(rid) for rid in subject.excluded_room_ids) if subject.excluded_room_ids else ""
            db_subject = DBSubject(
                id=subject.id,
                name=subject.name,
                code=subject.code,
                hours_per_week=subject.hours_per_week,
                requires_lab=subject.requires_lab,
                excluded_room_ids=excluded_ids_str,
            )
            self.session.add(db_subject)
            self.session.commit()
            return subject
        except IntegrityError:
            self.session.rollback()
            raise ValueError(f"Subject with code {subject.code} already exists")
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def get_subject(self, subject_id: UUID) -> Optional[DomainSubject]:
        """Get subject by ID."""
        db_subject = self.session.query(DBSubject).filter(DBSubject.id == subject_id).first()
        if not db_subject:
            return None
        excluded_ids = set(UUID(rid) for rid in db_subject.excluded_room_ids.split(",") if rid.strip()) if db_subject.excluded_room_ids else set()
        return DomainSubject(
            id=db_subject.id,
            name=db_subject.name,
            code=db_subject.code,
            hours_per_week=db_subject.hours_per_week,
            requires_lab=db_subject.requires_lab,
            excluded_room_ids=excluded_ids,
        )
    
    def list_subjects(self) -> List[DomainSubject]:
        """List all subjects."""
        db_subjects = self.session.query(DBSubject).all()
        result = []
        for s in db_subjects:
            excluded_ids = set(UUID(rid) for rid in s.excluded_room_ids.split(",") if rid.strip()) if s.excluded_room_ids else set()
            result.append(DomainSubject(
                id=s.id,
                name=s.name,
                code=s.code,
                hours_per_week=s.hours_per_week,
                requires_lab=s.requires_lab,
                excluded_room_ids=excluded_ids,
            ))
        return result
    
    def update_subject(self, subject_id: UUID, subject: DomainSubject) -> DomainSubject:
        """Update subject."""
        db_subject = self.session.query(DBSubject).filter(DBSubject.id == subject_id).first()
        if not db_subject:
            raise ValueError(f"Subject {subject_id} not found")
        
        try:
            db_subject.name = subject.name
            db_subject.code = subject.code
            db_subject.hours_per_week = subject.hours_per_week
            db_subject.requires_lab = subject.requires_lab
            excluded_ids_str = ",".join(str(rid) for rid in subject.excluded_room_ids) if subject.excluded_room_ids else ""
            db_subject.excluded_room_ids = excluded_ids_str
            self.session.commit()
            return subject
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def delete_subject(self, subject_id: UUID) -> bool:
        """Delete subject."""
        db_subject = self.session.query(DBSubject).filter(DBSubject.id == subject_id).first()
        if not db_subject:
            return False
        
        try:
            self.session.delete(db_subject)
            self.session.commit()
            return True
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    # ========================================================================
    # GROUP OPERATIONS
    # ========================================================================
    
    def create_group(self, group: DomainGroup) -> DomainGroup:
        """Create a new group in database."""
        try:
            db_group = DBGroup(
                id=group.id,
                name=group.name,
                level=group.level,
                num_students=group.num_students,
            )
            self.session.add(db_group)
            self.session.commit()
            return group
        except IntegrityError:
            self.session.rollback()
            raise ValueError(f"Group with name {group.name} already exists")
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def get_group(self, group_id: UUID) -> Optional[DomainGroup]:
        """Get group by ID."""
        db_group = self.session.query(DBGroup).filter(DBGroup.id == group_id).first()
        if not db_group:
            return None
        return DomainGroup(
            id=db_group.id,
            name=db_group.name,
            level=db_group.level,
            num_students=db_group.num_students,
        )
    
    def list_groups(self) -> List[DomainGroup]:
        """List all groups."""
        db_groups = self.session.query(DBGroup).all()
        return [
            DomainGroup(
                id=g.id,
                name=g.name,
                level=g.level,
                num_students=g.num_students,
            )
            for g in db_groups
        ]
    
    def update_group(self, group_id: UUID, group: DomainGroup) -> DomainGroup:
        """Update group."""
        db_group = self.session.query(DBGroup).filter(DBGroup.id == group_id).first()
        if not db_group:
            raise ValueError(f"Group {group_id} not found")
        
        try:
            db_group.name = group.name
            db_group.level = group.level
            db_group.num_students = group.num_students
            self.session.commit()
            return group
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def delete_group(self, group_id: UUID) -> bool:
        """Delete group."""
        db_group = self.session.query(DBGroup).filter(DBGroup.id == group_id).first()
        if not db_group:
            return False
        
        try:
            self.session.delete(db_group)
            self.session.commit()
            return True
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    # ========================================================================
    # ROOM OPERATIONS
    # ========================================================================
    
    def create_room(self, room: DomainRoom) -> DomainRoom:
        """Create a new room in database."""
        try:
            db_room = DBRoom(
                id=room.id,
                name=room.name,
                capacity=room.capacity,
                room_type=room.room_type,
            )
            self.session.add(db_room)
            self.session.commit()
            return room
        except IntegrityError:
            self.session.rollback()
            raise ValueError(f"Room with name {room.name} already exists")
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def get_room(self, room_id: UUID) -> Optional[DomainRoom]:
        """Get room by ID."""
        db_room = self.session.query(DBRoom).filter(DBRoom.id == room_id).first()
        if not db_room:
            return None
        return DomainRoom(
            id=db_room.id,
            name=db_room.name,
            capacity=db_room.capacity,
            room_type=db_room.room_type,
        )
    
    def list_rooms(self) -> List[DomainRoom]:
        """List all rooms."""
        db_rooms = self.session.query(DBRoom).all()
        return [
            DomainRoom(
                id=r.id,
                name=r.name,
                capacity=r.capacity,
                room_type=r.room_type,
            )
            for r in db_rooms
        ]
    
    def update_room(self, room_id: UUID, room: DomainRoom) -> DomainRoom:
        """Update room."""
        db_room = self.session.query(DBRoom).filter(DBRoom.id == room_id).first()
        if not db_room:
            raise ValueError(f"Room {room_id} not found")
        
        try:
            db_room.name = room.name
            db_room.capacity = room.capacity
            db_room.room_type = room.room_type
            self.session.commit()
            return room
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def delete_room(self, room_id: UUID) -> bool:
        """Delete room."""
        db_room = self.session.query(DBRoom).filter(DBRoom.id == room_id).first()
        if not db_room:
            return False
        
        try:
            self.session.delete(db_room)
            self.session.commit()
            return True
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    # ========================================================================
    # TIME SLOT OPERATIONS
    # ========================================================================
    
    def create_time_slot(self, time_slot: DomainTimeSlot) -> DomainTimeSlot:
        """Create a new time slot in database."""
        try:
            db_slot = DBTimeSlot(
                id=time_slot.id,
                day=time_slot.day,
                hour=time_slot.hour,
                duration_minutes=time_slot.duration_minutes,
            )
            self.session.add(db_slot)
            self.session.commit()
            return time_slot
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def get_time_slot(self, slot_id: UUID) -> Optional[DomainTimeSlot]:
        """Get time slot by ID."""
        db_slot = self.session.query(DBTimeSlot).filter(DBTimeSlot.id == slot_id).first()
        if not db_slot:
            return None
        return DomainTimeSlot(
            id=db_slot.id,
            day=db_slot.day,
            hour=db_slot.hour,
            duration_minutes=db_slot.duration_minutes,
        )
    
    def list_time_slots(self) -> List[DomainTimeSlot]:
        """List all time slots."""
        db_slots = self.session.query(DBTimeSlot).all()
        return [
            DomainTimeSlot(
                id=s.id,
                day=s.day,
                hour=s.hour,
                duration_minutes=s.duration_minutes,
            )
            for s in db_slots
        ]
    
    def update_time_slot(self, slot_id: UUID, time_slot: DomainTimeSlot) -> DomainTimeSlot:
        """Update time slot."""
        db_slot = self.session.query(DBTimeSlot).filter(DBTimeSlot.id == slot_id).first()
        if not db_slot:
            raise ValueError(f"TimeSlot {slot_id} not found")
        
        try:
            db_slot.day = time_slot.day
            db_slot.hour = time_slot.hour
            db_slot.duration_minutes = time_slot.duration_minutes
            self.session.commit()
            return time_slot
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def delete_time_slot(self, slot_id: UUID) -> bool:
        """Delete time slot."""
        db_slot = self.session.query(DBTimeSlot).filter(DBTimeSlot.id == slot_id).first()
        if not db_slot:
            return False
        
        try:
            self.session.delete(db_slot)
            self.session.commit()
            return True
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    # ========================================================================
    # SUBJECT ASSIGNMENT OPERATIONS
    # ========================================================================
    
    def create_assignment(self, assignment: DomainSubjectAssignment) -> DomainSubjectAssignment:
        """Create a new subject assignment in database."""
        try:
            db_assignment = DBSubjectAssignment(
                id=assignment.id,
                teacher_id=assignment.teacher_id,
                subject_id=assignment.subject_id,
                group_id=assignment.group_id,
            )
            self.session.add(db_assignment)
            self.session.commit()
            return assignment
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def get_assignment(self, assignment_id: UUID) -> Optional[DomainSubjectAssignment]:
        """Get assignment by ID."""
        db_assignment = self.session.query(DBSubjectAssignment).filter(
            DBSubjectAssignment.id == assignment_id
        ).first()
        if not db_assignment:
            return None
        return DomainSubjectAssignment(
            id=db_assignment.id,
            teacher_id=db_assignment.teacher_id,
            subject_id=db_assignment.subject_id,
            group_id=db_assignment.group_id,
        )
    
    def list_assignments(self) -> List[DomainSubjectAssignment]:
        """List all assignments."""
        db_assignments = self.session.query(DBSubjectAssignment).all()
        return [
            DomainSubjectAssignment(
                id=a.id,
                teacher_id=a.teacher_id,
                subject_id=a.subject_id,
                group_id=a.group_id,
            )
            for a in db_assignments
        ]
    
    def update_assignment(self, assignment_id: UUID, assignment: DomainSubjectAssignment) -> DomainSubjectAssignment:
        """Update assignment."""
        db_assignment = self.session.query(DBSubjectAssignment).filter(
            DBSubjectAssignment.id == assignment_id
        ).first()
        if not db_assignment:
            raise ValueError(f"Assignment {assignment_id} not found")
        
        try:
            db_assignment.teacher_id = assignment.teacher_id
            db_assignment.subject_id = assignment.subject_id
            db_assignment.group_id = assignment.group_id
            self.session.commit()
            return assignment
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def delete_assignment(self, assignment_id: UUID) -> bool:
        """Delete assignment."""
        db_assignment = self.session.query(DBSubjectAssignment).filter(
            DBSubjectAssignment.id == assignment_id
        ).first()
        if not db_assignment:
            return False
        
        try:
            self.session.delete(db_assignment)
            self.session.commit()
            return True
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    # ========================================================================
    # SCHEDULE OPERATIONS
    # ========================================================================
    
    def save_schedule(self, schedule_id: UUID, center_name: str, academic_year: str, 
                     is_valid: bool, hard_violations: int, soft_cost: float, 
                     lessons: List[DomainLesson]) -> UUID:
        """Save a generated schedule to database."""
        try:
            # Create schedule record
            db_schedule = DBSchedule(
                id=schedule_id,
                center_name=center_name,
                academic_year=academic_year,
                is_valid=is_valid,
                hard_violations=hard_violations,
                soft_cost=soft_cost,
            )
            self.session.add(db_schedule)
            self.session.flush()  # Flush to ensure ID is available
            
            # Create lesson records
            for lesson in lessons:
                db_lesson = DBLesson(
                    id=lesson.id,
                    assignment_id=lesson.assignment.id,
                    teacher_id=lesson.assignment.teacher_id,
                    subject_id=lesson.assignment.subject_id,
                    group_id=lesson.assignment.group_id,
                    room_id=lesson.room.id,
                    time_slot_id=lesson.time_slot.id,
                    schedule_id=schedule_id,
                )
                self.session.add(db_lesson)
            
            self.session.commit()
            return schedule_id
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def get_schedule(self, schedule_id: UUID) -> Optional[dict]:
        """Get schedule with all lessons."""
        db_schedule = self.session.query(DBSchedule).filter(DBSchedule.id == schedule_id).first()
        if not db_schedule:
            return None
        
        # Get all lessons for this schedule
        db_lessons = self.session.query(DBLesson).filter(DBLesson.schedule_id == schedule_id).all()
        
        lessons = []
        for db_lesson in db_lessons:
            lesson_dict = {
                "id": db_lesson.id,
                "teacher_id": db_lesson.teacher_id,
                "subject_id": db_lesson.subject_id,
                "group_id": db_lesson.group_id,
                "room_id": db_lesson.room_id,
                "day": db_lesson.time_slot.day,
                "hour": db_lesson.time_slot.hour,
                "duration_minutes": db_lesson.time_slot.duration_minutes,
            }
            lessons.append(lesson_dict)
        
        return {
            "id": db_schedule.id,
            "center_name": db_schedule.center_name,
            "academic_year": db_schedule.academic_year,
            "is_valid": db_schedule.is_valid,
            "hard_violations": db_schedule.hard_violations,
            "soft_cost": db_schedule.soft_cost,
            "lessons": lessons,
            "created_at": db_schedule.created_at,
        }
    
    def list_schedules(self) -> List[dict]:
        """List all schedules."""
        db_schedules = self.session.query(DBSchedule).all()
        return [
            {
                "id": s.id,
                "center_name": s.center_name,
                "academic_year": s.academic_year,
                "is_valid": s.is_valid,
                "hard_violations": s.hard_violations,
                "soft_cost": s.soft_cost,
                "lesson_count": len(s.lessons),
                "created_at": s.created_at,
            }
            for s in db_schedules
        ]
    
    def delete_schedule(self, schedule_id: UUID) -> bool:
        """Delete schedule and its lessons."""
        db_schedule = self.session.query(DBSchedule).filter(DBSchedule.id == schedule_id).first()
        if not db_schedule:
            return False
        
        try:
            self.session.delete(db_schedule)
            self.session.commit()
            return True
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    # ========================================================================
    # STATISTICS
    # ========================================================================
    
    def get_summary(self) -> dict:
        """Get database statistics."""
        return {
            "teachers": self.session.query(DBTeacher).count(),
            "subjects": self.session.query(DBSubject).count(),
            "groups": self.session.query(DBGroup).count(),
            "rooms": self.session.query(DBRoom).count(),
            "time_slots": self.session.query(DBTimeSlot).count(),
            "subject_assignments": self.session.query(DBSubjectAssignment).count(),
            "total_schedules_generated": self.session.query(DBSchedule).count(),
        }
    
    # ========================================================================
    # TRANSACTION MANAGEMENT
    # ========================================================================
    
    def commit(self):
        """Manually commit transaction."""
        try:
            self.session.commit()
        except SQLAlchemyError as e:
            self.session.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    def rollback(self):
        """Rollback current transaction."""
        self.session.rollback()
    
    def close(self):
        """Close database session."""
        self.session.close()
