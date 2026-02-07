export type FreeHourPreference = 
  | 'no_preference'
  | 'first_hour'
  | 'last_hour'
  | 'first_and_last'
  | 'middle_hours'
  | 'consecutive'
  | 'specific_hours';

export interface Teacher {
  id: string;
  name: string;
  max_hours_per_day: number;
  max_hours_per_week: number;
  prefer_consecutive_free_hours: boolean;
  free_hour_preference: FreeHourPreference;
  preferred_free_hours: number[];
  guard_hours: number;
  break_guard_hours: number;
  support_hours: number;
  coordination_hours: number;
  management_hours: number;
  no_coordination_next_to_free: boolean;
  created_at?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  hours_per_week: number;
  requires_lab: boolean;
  excluded_room_ids: string[];
  created_at?: string;
}

export interface Group {
  id: string;
  name: string;
  level: string;
  num_students: number;
  created_at?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  room_type: string;
  created_at?: string;
}

export interface TimeSlot {
  id: string;
  day: number; // 0-6 (Monday-Sunday)
  start_hour: number;
  start_minute: number;
  duration_minutes: number;
  created_at?: string;
}

export interface SubjectAssignment {
  id: string;
  teacher_id: string;
  subject_id: string;
  group_id: string;
  created_at?: string;
}

export interface Lesson {
  id: string;
  teacher_id: string;
  subject_id: string;
  group_id: string;
  room_id: string;
  time_slot_id: string;
  teacher_name?: string;
  subject_name?: string;
  group_name?: string;
  room_name?: string;
  day?: string;
  start_hour?: number;
  start_minute?: number;
}

export interface Schedule {
  id: string;
  center_name: string;
  academic_year: string;
  is_valid: boolean;
  hard_violations: number;
  soft_cost: number;
  lessons: Lesson[];
  created_at?: string;
}

export interface EntityCounts {
  teachers: number;
  subjects: number;
  groups: number;
  rooms: number;
  time_slots: number;
  subject_assignments: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  database_connected: boolean;
  entities: EntityCounts;
}

// XADE Integration Types
export interface XadeImportPreview {
  status: string;
  data: {
    teachers: XadeTeacherData[];
    subjects: XadeSubjectData[];
    groups: XadeGroupData[];
    rooms: XadeRoomData[];
    courses: XadeCourseData[];
    time_slots: XadeTimeSlotData[];
    assignments: XadeAssignmentData[];
  };
  summary: Record<string, number>;
  files_processed: string[];
  warnings: string[];
  errors: string[];
}

export interface XadeTeacherData {
  xade_code: string;
  name: string;
  department: string;
}

export interface XadeSubjectData {
  xade_code: string;
  name: string;
  hours_per_week: number;
  course: string;
}

export interface XadeGroupData {
  xade_code: string;
  name: string;
  course: string;
  level: string;
  num_students: number;
  shift: string;
}

export interface XadeRoomData {
  xade_code: string;
  name: string;
  capacity: number;
  room_type: string;
}

export interface XadeCourseData {
  xade_code: string;
  name: string;
  level: string;
}

export interface XadeTimeSlotData {
  day: number;
  day_name: string;
  start_hour: number;
  start_minute: number;
  duration_minutes: number;
  session_name: string;
}

export interface XadeAssignmentData {
  teacher_name: string;
  subject_name: string;
  group_name: string;
}

export interface XadeImportConfirmResult {
  status: string;
  created: Record<string, number>;
  skipped: Record<string, number>;
  warnings: string[];
  errors: string[];
  summary: {
    total_created: number;
    total_skipped: number;
  };
}

export interface XadeExportPreview {
  status: string;
  message?: string;
  schedule_id?: string;
  total_lessons?: number;
  groups?: string[];
  lessons_per_group?: Record<string, number>;
  entities?: Record<string, number>;
}

export interface XadeInfo {
  name: string;
  description: string;
  workflow: string[];
  import_formats: Record<string, unknown>;
  export_formats: Record<string, string>;
}
