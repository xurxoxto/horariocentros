import type {
  Teacher,
  Subject,
  Group,
  Room,
  TimeSlot,
  SubjectAssignment,
  Schedule,
  HealthResponse,
} from '../types';

const API_BASE_URL = '/api';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Health check (note: health endpoint is at /health, not /api/health)
export const getHealth = async (): Promise<HealthResponse> => {
  const response = await fetch('/health');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
};

// Teachers
export const getTeachers = (): Promise<Teacher[]> => fetchAPI('/teachers');
export const getTeacher = (id: string): Promise<Teacher> => fetchAPI(`/teachers/${id}`);
export const createTeacher = (teacher: Omit<Teacher, 'id' | 'created_at'>): Promise<Teacher> =>
  fetchAPI('/teachers', { method: 'POST', body: JSON.stringify(teacher) });
export const updateTeacher = (id: string, teacher: Partial<Teacher>): Promise<Teacher> =>
  fetchAPI(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(teacher) });
export const deleteTeacher = (id: string): Promise<void> =>
  fetchAPI(`/teachers/${id}`, { method: 'DELETE' });

// Subjects
export const getSubjects = (): Promise<Subject[]> => fetchAPI('/subjects');
export const getSubject = (id: string): Promise<Subject> => fetchAPI(`/subjects/${id}`);
export const createSubject = (subject: Omit<Subject, 'id' | 'created_at'>): Promise<Subject> =>
  fetchAPI('/subjects', { method: 'POST', body: JSON.stringify(subject) });
export const updateSubject = (id: string, subject: Partial<Subject>): Promise<Subject> =>
  fetchAPI(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(subject) });
export const deleteSubject = (id: string): Promise<void> =>
  fetchAPI(`/subjects/${id}`, { method: 'DELETE' });

// Groups
export const getGroups = (): Promise<Group[]> => fetchAPI('/groups');
export const getGroup = (id: string): Promise<Group> => fetchAPI(`/groups/${id}`);
export const createGroup = (group: Omit<Group, 'id' | 'created_at'>): Promise<Group> =>
  fetchAPI('/groups', { method: 'POST', body: JSON.stringify(group) });
export const updateGroup = (id: string, group: Partial<Group>): Promise<Group> =>
  fetchAPI(`/groups/${id}`, { method: 'PUT', body: JSON.stringify(group) });
export const deleteGroup = (id: string): Promise<void> =>
  fetchAPI(`/groups/${id}`, { method: 'DELETE' });

// Rooms
export const getRooms = (): Promise<Room[]> => fetchAPI('/rooms');
export const getRoom = (id: string): Promise<Room> => fetchAPI(`/rooms/${id}`);
export const createRoom = (room: Omit<Room, 'id' | 'created_at'>): Promise<Room> =>
  fetchAPI('/rooms', { method: 'POST', body: JSON.stringify(room) });
export const updateRoom = (id: string, room: Partial<Room>): Promise<Room> =>
  fetchAPI(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(room) });
export const deleteRoom = (id: string): Promise<void> =>
  fetchAPI(`/rooms/${id}`, { method: 'DELETE' });

// TimeSlots
export const getTimeSlots = (): Promise<TimeSlot[]> => fetchAPI('/time-slots');
export const getTimeSlot = (id: string): Promise<TimeSlot> => fetchAPI(`/time-slots/${id}`);
export const createTimeSlot = (timeSlot: Omit<TimeSlot, 'id' | 'created_at'>): Promise<TimeSlot> =>
  fetchAPI('/time-slots', { method: 'POST', body: JSON.stringify(timeSlot) });
export const updateTimeSlot = (id: string, timeSlot: Partial<TimeSlot>): Promise<TimeSlot> =>
  fetchAPI(`/time-slots/${id}`, { method: 'PUT', body: JSON.stringify(timeSlot) });
export const deleteTimeSlot = (id: string): Promise<void> =>
  fetchAPI(`/time-slots/${id}`, { method: 'DELETE' });

// Assignments
export const getAssignments = (): Promise<SubjectAssignment[]> => fetchAPI('/assignments');
export const getAssignment = (id: string): Promise<SubjectAssignment> => fetchAPI(`/assignments/${id}`);
export const createAssignment = (assignment: Omit<SubjectAssignment, 'id' | 'created_at'>): Promise<SubjectAssignment> =>
  fetchAPI('/assignments', { method: 'POST', body: JSON.stringify(assignment) });
export const updateAssignment = (id: string, assignment: Partial<SubjectAssignment>): Promise<SubjectAssignment> =>
  fetchAPI(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(assignment) });
export const deleteAssignment = (id: string): Promise<void> =>
  fetchAPI(`/assignments/${id}`, { method: 'DELETE' });

// Schedules
export const generateSchedule = (params: {
  center_name: string;
  academic_year: string;
  max_iterations?: number;
  time_limit_seconds?: number;
}): Promise<Schedule> =>
  fetchAPI('/schedules/generate', { method: 'POST', body: JSON.stringify(params) });

export const getSchedules = (): Promise<Schedule[]> => fetchAPI('/schedules');
export const getSchedule = (id: string): Promise<Schedule> => fetchAPI(`/schedules/${id}`);
export const deleteSchedule = (id: string): Promise<void> =>
  fetchAPI(`/schedules/${id}`, { method: 'DELETE' });
