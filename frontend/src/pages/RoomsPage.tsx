import React, { useEffect, useState } from 'react';
import { getRooms, createRoom, deleteRoom } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Card, Button, EmptyState, Badge } from '../components/ui';
import type { Room } from '../types';

const ROOM_TYPES = [
  { value: 'classroom', label: 'Aula', icon: '🏫', color: 'blue' },
  { value: 'lab', label: 'Laboratorio', icon: '🔬', color: 'green' },
  { value: 'gym', label: 'Gimnasio', icon: '🏃', color: 'orange' },
  { value: 'workshop', label: 'Taller', icon: '🔧', color: 'purple' },
  { value: 'music', label: 'Música', icon: '🎵', color: 'pink' },
  { value: 'computer', label: 'Informática', icon: '💻', color: 'indigo' },
  { value: 'library', label: 'Biblioteca', icon: '📚', color: 'amber' },
];

const TYPE_COLORS: Record<string, string> = {
  classroom: 'from-blue-400 to-blue-500',
  lab: 'from-green-400 to-green-500',
  gym: 'from-orange-400 to-orange-500',
  workshop: 'from-purple-400 to-purple-500',
  music: 'from-pink-400 to-pink-500',
  computer: 'from-indigo-400 to-indigo-500',
  library: 'from-amber-400 to-amber-500',
};

export const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 30,
    room_type: 'classroom',
  });

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar aulas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRoom(formData);
      setFormData({ name: '', capacity: 30, room_type: 'classroom' });
      setShowForm(false);
      loadRooms();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear aula');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta aula?')) return;
    try {
      await deleteRoom(id);
      loadRooms();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar aula');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadRooms} />;

  // Agrupar por tipo
  const roomsByType = rooms.reduce((acc, room) => {
    if (!acc[room.room_type]) acc[room.room_type] = [];
    acc[room.room_type].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Badge variant="info" size="md">
            🚪 {rooms.length} espacios
          </Badge>
          <Badge variant="success" size="md">
            👥 {totalCapacity} plazas totales
          </Badge>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'primary'}
          icon={showForm ? '✕' : '➕'}
        >
          {showForm ? 'Cancelar' : 'Nueva Aula'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-2 border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Aula</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ej: Aula 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de espacio *
                </label>
                <select
                  required
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {ROOM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidad
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="200"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="success" icon="✓">
                Guardar Aula
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Rooms Display */}
      {rooms.length === 0 ? (
        <Card>
          <EmptyState
            icon="🚪"
            title="No hay aulas"
            description="Añade aulas y espacios disponibles en el centro educativo."
            action={
              <Button onClick={() => setShowForm(true)} icon="➕">
                Añadir primera aula
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(roomsByType).map(([type, typeRooms]) => {
            const typeInfo = ROOM_TYPES.find(t => t.value === type);
            return (
              <div key={type}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                  <span className="text-lg mr-2">{typeInfo?.icon || '🏫'}</span>
                  {typeInfo?.label || type}
                  <span className="ml-2 text-gray-400">({typeRooms.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {typeRooms.map((room) => (
                    <Card key={room.id} padding="sm" className="hover:shadow-md transition-all group text-center">
                      <div className={`w-12 h-12 mx-auto bg-gradient-to-br ${TYPE_COLORS[room.room_type] || 'from-gray-400 to-gray-500'} rounded-xl flex items-center justify-center text-white text-xl mb-2`}>
                        {typeInfo?.icon || '🏫'}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">{room.name}</h4>
                      <p className="text-xs text-gray-500">{room.capacity} plazas</p>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="mt-2 opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 transition-all"
                      >
                        Eliminar
                      </button>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
