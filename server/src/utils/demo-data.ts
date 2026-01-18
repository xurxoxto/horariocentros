/**
 * Sample demo data for testing HorarioCentros
 * This file provides realistic sample data for development and testing
 */

export const demoSchool = {
  id: 'school_001',
  name: 'Instituto de Educación Secundaria',
  location: 'Galicia, España',
  academicYear: '2024-2025',
};

export const demoUsers = [
  {
    id: 'user_admin',
    email: 'admin@school.edu',
    name: 'María González',
    role: 'admin',
    password: 'demo123', // In production, this would be hashed
  },
  {
    id: 'user_teacher1',
    email: 'juan@school.edu',
    name: 'Juan Pérez',
    role: 'teacher',
    password: 'demo123',
    subjects: ['Mathematics', 'Physics'],
  },
  {
    id: 'user_teacher2',
    email: 'ana@school.edu',
    name: 'Ana Martínez',
    role: 'teacher',
    password: 'demo123',
    subjects: ['Spanish', 'Literature'],
  },
  {
    id: 'user_student',
    email: 'student@school.edu',
    name: 'Carlos López',
    role: 'student',
    password: 'demo123',
    grade: '10A',
  },
];

export const demoSubjects = [
  { id: 'sub_math', name: 'Mathematics', code: 'MATH', color: '#3b82f6' },
  { id: 'sub_phys', name: 'Physics', code: 'PHYS', color: '#10b981' },
  { id: 'sub_span', name: 'Spanish', code: 'SPAN', color: '#f59e0b' },
  { id: 'sub_lit', name: 'Literature', code: 'LIT', color: '#8b5cf6' },
  { id: 'sub_hist', name: 'History', code: 'HIST', color: '#ef4444' },
  { id: 'sub_eng', name: 'English', code: 'ENG', color: '#06b6d4' },
  { id: 'sub_bio', name: 'Biology', code: 'BIO', color: '#14b8a6' },
  { id: 'sub_chem', name: 'Chemistry', code: 'CHEM', color: '#ec4899' },
  { id: 'sub_pe', name: 'Physical Education', code: 'PE', color: '#84cc16' },
  { id: 'sub_art', name: 'Art', code: 'ART', color: '#f97316' },
];

export const demoClasses = [
  {
    id: 'class_10a',
    name: '10A',
    grade: '10',
    students: 28,
    subjects: ['sub_math', 'sub_phys', 'sub_span', 'sub_eng', 'sub_hist', 'sub_pe'],
  },
  {
    id: 'class_10b',
    name: '10B',
    grade: '10',
    students: 26,
    subjects: ['sub_math', 'sub_bio', 'sub_span', 'sub_eng', 'sub_lit', 'sub_art'],
  },
  {
    id: 'class_11a',
    name: '11A',
    grade: '11',
    students: 24,
    subjects: ['sub_math', 'sub_phys', 'sub_chem', 'sub_eng', 'sub_hist', 'sub_pe'],
  },
];

export const demoPeriods = [
  { id: 'p1', name: 'Period 1', startTime: '08:00', endTime: '08:50', order: 1 },
  { id: 'p2', name: 'Period 2', startTime: '08:50', endTime: '09:40', order: 2 },
  { id: 'p3', name: 'Period 3', startTime: '09:40', endTime: '10:30', order: 3 },
  { id: 'break1', name: 'Break', startTime: '10:30', endTime: '10:45', order: 4 },
  { id: 'p4', name: 'Period 4', startTime: '10:45', endTime: '11:35', order: 5 },
  { id: 'p5', name: 'Period 5', startTime: '11:35', endTime: '12:25', order: 6 },
  { id: 'p6', name: 'Period 6', startTime: '12:25', endTime: '13:15', order: 7 },
];

export const demoRooms = [
  { id: 'room_101', name: 'Room 101', type: 'regular', capacity: 30 },
  { id: 'room_102', name: 'Room 102', type: 'regular', capacity: 30 },
  { id: 'room_lab1', name: 'Science Lab 1', type: 'lab', capacity: 24 },
  { id: 'room_lab2', name: 'Science Lab 2', type: 'lab', capacity: 24 },
  { id: 'room_gym', name: 'Gymnasium', type: 'gym', capacity: 50 },
  { id: 'room_art', name: 'Art Studio', type: 'special', capacity: 28 },
];

export const demoConstraints = [
  {
    id: 'const_1',
    timetableId: 'demo_tt',
    type: 'max_hours_per_day',
    priority: 'required',
    config: {
      teacherId: 'user_teacher1',
      maxHours: 6,
    },
    isActive: true,
    description: 'Teachers should not have more than 6 hours per day',
  },
  {
    id: 'const_2',
    timetableId: 'demo_tt',
    type: 'preferred_time',
    priority: 'preferred',
    config: {
      subjectId: 'sub_math',
      day: 'Monday',
      periodId: 'p1',
    },
    isActive: true,
    description: 'Math is preferred in the morning',
  },
  {
    id: 'const_3',
    timetableId: 'demo_tt',
    type: 'avoid_time',
    priority: 'preferred',
    config: {
      subjectId: 'sub_pe',
      day: 'Friday',
      periodId: 'p6',
    },
    isActive: true,
    description: 'Avoid PE on Friday afternoon',
  },
  {
    id: 'const_4',
    timetableId: 'demo_tt',
    type: 'consecutive_periods',
    priority: 'required',
    config: {
      subjectId: 'sub_phys',
      minConsecutive: 2,
    },
    isActive: true,
    description: 'Physics lab needs 2 consecutive periods',
  },
];

export const demoTimetableSlots = [
  // Monday
  {
    id: 'slot_1',
    timetableId: 'demo_tt',
    day: 'Monday',
    periodId: 'p1',
    classId: 'class_10a',
    subjectId: 'sub_math',
    teacherId: 'user_teacher1',
    roomId: 'room_101',
  },
  {
    id: 'slot_2',
    timetableId: 'demo_tt',
    day: 'Monday',
    periodId: 'p2',
    classId: 'class_10a',
    subjectId: 'sub_span',
    teacherId: 'user_teacher2',
    roomId: 'room_101',
  },
  // Tuesday
  {
    id: 'slot_3',
    timetableId: 'demo_tt',
    day: 'Tuesday',
    periodId: 'p1',
    classId: 'class_10a',
    subjectId: 'sub_phys',
    teacherId: 'user_teacher1',
    roomId: 'room_lab1',
  },
  {
    id: 'slot_4',
    timetableId: 'demo_tt',
    day: 'Tuesday',
    periodId: 'p2',
    classId: 'class_10a',
    subjectId: 'sub_phys',
    teacherId: 'user_teacher1',
    roomId: 'room_lab1',
  },
];

export const demoTimetable = {
  id: 'demo_tt',
  name: 'Fall 2024 Schedule',
  schoolId: 'school_001',
  academicYear: '2024-2025',
  startDate: new Date('2024-09-01'),
  endDate: new Date('2024-12-20'),
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  periods: demoPeriods.filter(p => !p.name.includes('Break')),
  classes: demoClasses,
  slots: demoTimetableSlots,
  createdBy: 'user_admin',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-18'),
};
