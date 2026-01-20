/**
 * Offline-first service: uses localStorage for persistence
 * Mocks API responses for offline usage
 */

export const offlineDataService = {
  // Initialize default data in localStorage if not present
  init: () => {
    if (!localStorage.getItem('timetable_data')) {
      const defaultData = {
        timetables: [
          {
            id: '1',
            name: 'Horario Primavera 2024',
            createdAt: new Date().toISOString(),
            status: 'activo',
          },
          {
            id: '2',
            name: 'Horario Otoño 2024',
            createdAt: new Date().toISOString(),
            status: 'borrador',
          },
        ],
        teachers: [
          { id: 't1', name: 'María González', subject: 'Matemáticas' },
          { id: 't2', name: 'Juan Pérez', subject: 'Física' },
          { id: 't3', name: 'Ana Martínez', subject: 'Español' },
          { id: 't4', name: 'Carlos López', subject: 'Inglés' },
        ],
        rooms: [
          { id: 'r1', name: 'Aula 101', capacity: 30 },
          { id: 'r2', name: 'Laboratorio 1', capacity: 25 },
          { id: 'r3', name: 'Gimnasio', capacity: 50 },
          { id: 'r4', name: 'Aula 102', capacity: 28 },
        ],
        subjects: [
          { id: 's1', name: 'Matemáticas' },
          { id: 's2', name: 'Física' },
          { id: 's3', name: 'Español' },
          { id: 's4', name: 'Inglés' },
          { id: 's5', name: 'Historia' },
          { id: 's6', name: 'Educación Física' },
        ],
        studentGroups: [
          { id: 'g1', name: '10A', size: 28 },
          { id: 'g2', name: '10B', size: 30 },
          { id: 'g3', name: '11A', size: 25 },
          { id: 'g4', name: '11B', size: 27 },
        ],
        slots: [],
      };
      localStorage.setItem('timetable_data', JSON.stringify(defaultData));
    }
  },

  // Get all data
  getAllData: () => {
    const data = localStorage.getItem('timetable_data');
    return data ? JSON.parse(data) : {};
  },

  // Save all data
  saveAllData: (data: any) => {
    localStorage.setItem('timetable_data', JSON.stringify(data));
  },

  // Add a timetable slot
  addSlot: (slot: any) => {
    const data = offlineDataService.getAllData();
    data.slots = data.slots || [];
    data.slots.push({ ...slot, id: `slot_${Date.now()}` });
    offlineDataService.saveAllData(data);
    return slot;
  },

  // Get all slots
  getSlots: () => {
    const data = offlineDataService.getAllData();
    return data.slots || [];
  },

  // Update user profile
  updateUserProfile: (name: string) => {
    if (!localStorage.getItem('user_profile')) {
      localStorage.setItem('user_profile', JSON.stringify({ name, role: 'admin' }));
    }
  },

  // Get user profile
  getUserProfile: () => {
    const profile = localStorage.getItem('user_profile');
    return profile ? JSON.parse(profile) : { name: 'Invitado', role: 'admin' };
  },

  // Export data as JSON
  exportData: () => {
    const data = offlineDataService.getAllData();
    return JSON.stringify(data, null, 2);
  },

  // Import data from JSON
  importData: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      offlineDataService.saveAllData(data);
      return true;
    } catch {
      return false;
    }
  },

  // Clear all data
  clearAll: () => {
    localStorage.removeItem('timetable_data');
    localStorage.removeItem('user_profile');
  },
};

// Initialize on module load
offlineDataService.init();
