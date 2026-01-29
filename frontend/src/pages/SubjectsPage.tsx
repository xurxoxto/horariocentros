import React, { useEffect, useState } from 'react';
import { getSubjects, createSubject, deleteSubject, getRooms } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Subject, Room } from '../types';

export const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hours_per_week: 3,
    requires_lab: false,
    excluded_room_ids: [] as string[],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subjectsData, roomsData] = await Promise.all([
        getSubjects(),
        getRooms(),
      ]);
      setSubjects(subjectsData);
      setRooms(roomsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubject(formData);
      setFormData({ name: '', code: '', hours_per_week: 3, requires_lab: false, excluded_room_ids: [] });
      setShowForm(false);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear asignatura');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta asignatura?')) return;
    try {
      await deleteSubject(id);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar asignatura');
    }
  };

  const toggleExcludedRoom = (roomId: string) => {
    const newExcluded = formData.excluded_room_ids.includes(roomId)
      ? formData.excluded_room_ids.filter(id => id !== roomId)
      : [...formData.excluded_room_ids, roomId];
    setFormData({ ...formData, excluded_room_ids: newExcluded });
  };

  const getRoomName = (roomId: string) => {
    return rooms.find(r => r.id === roomId)?.name || roomId;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Asignaturas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nueva Asignatura'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Nueva Asignatura</h2>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas por semana</label>
              <input
                type="number"
                required
                min="1"
                max="10"
                value={formData.hours_per_week}
                onChange={(e) => setFormData({ ...formData, hours_per_week: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requires_lab"
                checked={formData.requires_lab}
                onChange={(e) => setFormData({ ...formData, requires_lab: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requires_lab" className="ml-2 block text-sm text-gray-700">
                Requiere laboratorio
              </label>
            </div>
            
            {rooms.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aulas donde NO puede impartirse (restricción de aula)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => toggleExcludedRoom(room.id)}
                      className={`px-3 py-2 rounded-lg border-2 text-sm transition-colors ${
                        formData.excluded_room_ids.includes(room.id)
                          ? 'bg-red-100 text-red-700 border-red-400'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {formData.excluded_room_ids.includes(room.id) ? '🚫 ' : ''}{room.name}
                    </button>
                  ))}
                </div>
                {formData.excluded_room_ids.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Esta asignatura no podrá impartirse en {formData.excluded_room_ids.length} aula(s)
                  </p>
                )}
              </div>
            )}
            
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas/sem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Laboratorio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aulas excluidas</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No hay asignaturas. Añade una para comenzar.
                </td>
              </tr>
            ) : (
              subjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.hours_per_week}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.requires_lab ? '✅ Sí' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.excluded_room_ids && subject.excluded_room_ids.length > 0 ? (
                      <span className="text-red-600">
                        🚫 {subject.excluded_room_ids.map(id => getRoomName(id)).join(', ')}
                      </span>
                    ) : (
                      <span className="text-green-600">Todas permitidas</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(subject.id)}
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
