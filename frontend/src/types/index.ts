// User roles
export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  DEPARTMENT_HEAD = 'department_head'
}

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  preferences?: UserPreferences;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// Authentication context
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithSSO: (provider: 'google' | 'microsoft') => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Timetable types
export interface TimeSlot {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string;
  duration: number; // in minutes
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: 'classroom' | 'lab' | 'auditorium' | 'sports' | 'other';
  equipment: string[];
  available: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  credits: number;
  requiresLab: boolean;
  color?: string;
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  subjects: string[]; // subject IDs
  availability: TeacherAvailability[];
  preferences?: TeacherPreferences;
}

export interface TeacherAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface TeacherPreferences {
  maxConsecutiveClasses: number;
  preferredTimeSlots: string[]; // time slot IDs
  avoidTimeSlots: string[]; // time slot IDs
}

export interface StudentGroup {
  id: string;
  name: string;
  grade: string;
  stream?: string;
  studentCount: number;
  students: string[]; // student IDs
}

export interface TimetableEntry {
  id: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  timeSlotId: string;
  studentGroupId: string;
  date?: string; // optional for specific date overrides
  status: 'scheduled' | 'cancelled' | 'rescheduled';
  notes?: string;
}

export interface Constraint {
  id: string;
  type: 'hard' | 'soft';
  priority: number; // 1-10 for soft constraints
  description: string;
  rule: string; // constraint rule expression
  enabled: boolean;
}

export interface TimetableConflict {
  type: 'room' | 'teacher' | 'student' | 'resource' | 'constraint';
  severity: 'error' | 'warning' | 'info';
  description: string;
  affectedEntries: string[]; // timetable entry IDs
  suggestions?: string[];
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  terms: Term[];
  holidays: Holiday[];
}

export interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  endDate?: string; // for multi-day holidays
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
