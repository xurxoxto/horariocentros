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
  | 'preferred_time'
  | 'avoid_time'
  | 'consecutive_periods'
  | 'balanced_distribution'
  | 'teacher_availability'
  | 'room_availability'
  | 'break_after_periods';

export interface ConstraintConfig {
  teacherId?: string;
  classId?: string;
  subjectId?: string;
  day?: string;
  periodId?: string;
  maxHours?: number;
  minHours?: number;
  consecutiveCount?: number;
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
  action: 'join' | 'leave' | 'edit' | 'create' | 'delete';
  timetableId: string;
  timestamp: Date;
  data?: any;
}
