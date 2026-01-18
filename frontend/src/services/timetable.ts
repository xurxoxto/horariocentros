import api from './auth';
import {
  TimetableEntry,
  Room,
  Subject,
  Teacher,
  StudentGroup,
  TimeSlot,
  TimetableConflict,
  ApiResponse
} from '../types';

export const timetableService = {
  // Timetable entries
  async getTimetableEntries(filters?: {
    teacherId?: string;
    studentGroupId?: string;
    roomId?: string;
    date?: string;
  }): Promise<TimetableEntry[]> {
    const response = await api.get<ApiResponse<TimetableEntry[]>>('/timetable/entries', {
      params: filters,
    });
    return response.data.data || [];
  },

  async createTimetableEntry(entry: Omit<TimetableEntry, 'id'>): Promise<TimetableEntry> {
    const response = await api.post<ApiResponse<TimetableEntry>>('/timetable/entries', entry);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create entry');
  },

  async updateTimetableEntry(id: string, entry: Partial<TimetableEntry>): Promise<TimetableEntry> {
    const response = await api.put<ApiResponse<TimetableEntry>>(`/timetable/entries/${id}`, entry);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update entry');
  },

  async deleteTimetableEntry(id: string): Promise<void> {
    await api.delete(`/timetable/entries/${id}`);
  },

  // Conflict detection
  async detectConflicts(entryId?: string): Promise<TimetableConflict[]> {
    const response = await api.get<ApiResponse<TimetableConflict[]>>('/timetable/conflicts', {
      params: { entryId },
    });
    return response.data.data || [];
  },

  // Auto-scheduling
  async autoSchedule(constraints?: any): Promise<TimetableEntry[]> {
    const response = await api.post<ApiResponse<TimetableEntry[]>>('/timetable/auto-schedule', constraints);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Auto-scheduling failed');
  },

  // Rooms
  async getRooms(): Promise<Room[]> {
    const response = await api.get<ApiResponse<Room[]>>('/rooms');
    return response.data.data || [];
  },

  async createRoom(room: Omit<Room, 'id'>): Promise<Room> {
    const response = await api.post<ApiResponse<Room>>('/rooms', room);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create room');
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const response = await api.get<ApiResponse<Subject[]>>('/subjects');
    return response.data.data || [];
  },

  async createSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
    const response = await api.post<ApiResponse<Subject>>('/subjects', subject);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create subject');
  },

  // Teachers
  async getTeachers(): Promise<Teacher[]> {
    const response = await api.get<ApiResponse<Teacher[]>>('/teachers');
    return response.data.data || [];
  },

  async createTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
    const response = await api.post<ApiResponse<Teacher>>('/teachers', teacher);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create teacher');
  },

  // Student groups
  async getStudentGroups(): Promise<StudentGroup[]> {
    const response = await api.get<ApiResponse<StudentGroup[]>>('/student-groups');
    return response.data.data || [];
  },

  async createStudentGroup(group: Omit<StudentGroup, 'id'>): Promise<StudentGroup> {
    const response = await api.post<ApiResponse<StudentGroup>>('/student-groups', group);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create student group');
  },

  // Time slots
  async getTimeSlots(): Promise<TimeSlot[]> {
    const response = await api.get<ApiResponse<TimeSlot[]>>('/time-slots');
    return response.data.data || [];
  },
};
