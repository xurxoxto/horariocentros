export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timetable {
  id: string;
  name: string;
  schoolId: string;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  days: string[];
  periods: Period[];
  classes: Class[];
  slots: TimetableSlot[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Period {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  order: number;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  hoursPerWeek: number;
  color?: string;
}

export interface TimetableSlot {
  id: string;
  timetableId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  day: string;
  periodId: string;
  room?: string;
}

export interface Constraint {
  id: string;
  timetableId: string;
  type: ConstraintType;
  priority: 'required' | 'preferred' | 'avoid';
  config: ConstraintConfig;
  isActive: boolean;
}

export type ConstraintType =
  | 'no_conflicts'
  | 'max_hours_per_day'
  | 'min_hours_per_day'
  | 'max_consecutive_hours'
  | 'mandatory_break'
  | 'preferred_time'
  | 'avoid_time'
  | 'consecutive_periods'
  | 'balanced_distribution'
  | 'teacher_availability'
  | 'room_availability'
  | 'break_after_periods'
  | 'avoid_gaps'
  | 'shared_subject'
  | 'group_split'
  | 'special_room_required'
  | 'max_daily_students'
  | 'pedagogical_continuity';

export interface ConstraintConfig {
  teacherId?: string;
  classId?: string;
  subjectId?: string;
  roomId?: string;
  day?: string;
  periodId?: string;
  maxHours?: number;
  minHours?: number;
  maxConsecutive?: number;
  consecutiveCount?: number;
  breakDuration?: number;
  groupIds?: string[];
  requiresSpecialRoom?: boolean;
  roomType?: string;
  maxDailyStudents?: number;
  avoidGaps?: boolean;
  pedagogicalSequence?: string[];
  [key: string]: any;
}

export interface SchedulingSuggestion {
  slot: TimetableSlot;
  score: number;
  reasons: string[];
  conflicts: string[];
}

export interface CollaborationEvent {
  userId: string;
  userName: string;
  action: 'join' | 'leave' | 'edit' | 'create' | 'delete' | 'undo' | 'redo';
  timetableId: string;
  timestamp: Date;
  data?: any;
}

export interface Room {
  id: string;
  name: string;
  type: 'regular' | 'lab' | 'gym' | 'special';
  capacity: number;
  equipment?: string[];
  available?: boolean;
}

export interface GroupSplit {
  id: string;
  baseClassId: string;
  subGroups: string[];
  subjectId: string;
  splitType: 'option' | 'level' | 'half';
}

export interface ValidationResult {
  isValid: boolean;
  conflicts: ConflictDetail[];
  warnings: string[];
  score: number;
}

export interface ConflictDetail {
  type: 'hard' | 'soft';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  affectedSlots: string[];
  constraintId?: string;
}

export interface TimetableHistory {
  id: string;
  timetableId: string;
  snapshot: Timetable;
  timestamp: Date;
  userId: string;
  action: string;
}

export interface ViewFilter {
  type: 'teacher' | 'class' | 'room' | 'subject';
  id: string;
  name: string;
}
