import React, { useEffect, useState } from 'react';
import { getTeachers, createTeacher, deleteTeacher } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Teacher, FreeHourPreference } from '../types';

const FREE_HOUR_PREFERENCE_LABELS: Record<FreeHourPreference, string> = {
  'no_preference': 'Sin preferencia',
  'first_hour': 'A primera hora',
  'last_hour': 'A última hora',
  'first_and_last': 'Primera y última hora',
  'middle_hours': 'Horas intermedias',
  'consecutive': 'Juntas/consecutivas',
  'specific_hours': 'Horas específicas',
};

const HOURS_OF_DAY = [1, 2, 3, 4, 5, 6, 7]; // 1ª a 7ª hora

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    max_hours_per_day: 6,
    max_hours_per_week: 25,
    prefer_consecutive_free_hours: false,
    free_hour_preference: 'no_preference' as FreeHourPreference,
    preferred_free_hours: [] as number[],
    guard_hours: 0,
    break_guard_hours: 0,
    support_hours: 0,
    coordination_hours: 0,
    management_hours: 0,
    no_coordination_next_to_free: false,
  });

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTeachers();
      setTeachers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar profesores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTeacher(formData);
      setFormData({ 
        name: '', 
        max_hours_per_day: 6, 
        max_hours_per_week: 25,
        prefer_consecutive_free_hours: false,
        free_hour_preference: 'no_preference',
        preferred_free_hours: [],
        guard_hours: 0,
        break_guard_hours: 0,
        support_hours: 0,
        coordination_hours: 0,
        management_hours: 0,
        no_coordination_next_to_free: false,
      });
      setShowForm(false);
      loadTeachers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear profesor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este profesor?')) return;
    try {
      await deleteTeacher(id);
      loadTeachers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar profesor');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadTeachers} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profesores</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Profesor'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Nuevo Profesor</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horas/día máx.</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="12"
                  value={formData.max_hours_per_day}
                  onChange={(e) => setFormData({ ...formData, max_hours_per_day: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horas/semana máx.</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="40"
                  value={formData.max_hours_per_week}
                  onChange={(e) => setFormData({ ...formData, max_hours_per_week: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Horas especiales semanales</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardias</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.guard_hours}
                    onChange={(e) => setFormData({ ...formData, guard_hours: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardias recreo</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.break_guard_hours}
                    onChange={(e) => setFormData({ ...formData, break_guard_hours: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apoyo</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.support_hours}
                    onChange={(e) => setFormData({ ...formData, support_hours: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coordinación</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.coordination_hours}
                    onChange={(e) => setFormData({ ...formData, coordination_hours: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipo directivo</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.management_hours}
                    onChange={(e) => setFormData({ ...formData, management_hours: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="prefer_consecutive"
                checked={formData.prefer_consecutive_free_hours}
                onChange={(e) => setFormData({ ...formData, prefer_consecutive_free_hours: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="prefer_consecutive" className="ml-2 block text-sm text-gray-700">
                Prefiere horas libres juntas
              </label>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Preferencias de horas libres</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">¿Cuándo prefiere las horas libres?</label>
                  <select
                    value={formData.free_hour_preference}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      free_hour_preference: e.target.value as FreeHourPreference,
                      preferred_free_hours: e.target.value === 'specific_hours' ? formData.preferred_free_hours : []
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(FREE_HOUR_PREFERENCE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                
                {formData.free_hour_preference === 'specific_hours' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar horas preferidas</label>
                    <div className="flex flex-wrap gap-2">
                      {HOURS_OF_DAY.map((hour) => (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => {
                            const newHours = formData.preferred_free_hours.includes(hour)
                              ? formData.preferred_free_hours.filter(h => h !== hour)
                              : [...formData.preferred_free_hours, hour];
                            setFormData({ ...formData, preferred_free_hours: newHours });
                          }}
                          className={`px-3 py-2 rounded-lg border ${
                            formData.preferred_free_hours.includes(hour)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                          }`}
                        >
                          {hour}ª hora
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="no_coordination_next_to_free"
                    checked={formData.no_coordination_next_to_free}
                    onChange={(e) => setFormData({ ...formData, no_coordination_next_to_free: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="no_coordination_next_to_free" className="ml-2 block text-sm text-gray-700">
                    Coordinación no puede ir junto a hora libre
                  </label>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas/día</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas/sem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardias</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">G. Recreo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Otras</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No hay profesores. Añade uno para comenzar.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                    <div className="flex flex-col text-xs text-blue-600">
                      {teacher.prefer_consecutive_free_hours && <span>🔗 Libres juntas</span>}
                      {teacher.free_hour_preference && teacher.free_hour_preference !== 'no_preference' && (
                        <span>⏰ {FREE_HOUR_PREFERENCE_LABELS[teacher.free_hour_preference]}</span>
                      )}
                      {teacher.preferred_free_hours && teacher.preferred_free_hours.length > 0 && (
                        <span>📌 Horas: {teacher.preferred_free_hours.join(', ')}</span>
                      )}
                      {teacher.no_coordination_next_to_free && <span>🚫 Coord≠Libre</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.max_hours_per_day}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.max_hours_per_week}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.guard_hours}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.break_guard_hours}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col text-xs">
                      {teacher.support_hours > 0 && <span>Apoyo: {teacher.support_hours}</span>}
                      {teacher.coordination_hours > 0 && <span>Coord: {teacher.coordination_hours}</span>}
                      {teacher.management_hours > 0 && <span>Directivo: {teacher.management_hours}</span>}
                      {teacher.support_hours === 0 && teacher.coordination_hours === 0 && teacher.management_hours === 0 && '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
