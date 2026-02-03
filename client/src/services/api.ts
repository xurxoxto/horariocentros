import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data: { email: string; password: string; name: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
};

export const timetableService = {
  getAll: () => api.get('/timetables'),
  getById: (id: string) => api.get(`/timetables/${id}`),
  create: (data: any) => api.post('/timetables', data),
  update: (id: string, data: any) => api.put(`/timetables/${id}`, data),
  delete: (id: string) => api.delete(`/timetables/${id}`),
};

export const constraintService = {
  getAll: (timetableId?: string) =>
    api.get('/constraints', { params: { timetableId } }),
  create: (data: any) => api.post('/constraints', data),
  update: (id: string, data: any) => api.put(`/constraints/${id}`, data),
  delete: (id: string) => api.delete(`/constraints/${id}`),
};

export const exportService = {
  getPDF: (id: string) => api.get(`/export/pdf/${id}`, { responseType: 'blob' }),
  getICal: (id: string) => api.get(`/export/ical/${id}`, { responseType: 'blob' }),
};

export default api;
