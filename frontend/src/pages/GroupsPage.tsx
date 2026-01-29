import React, { useEffect, useState } from 'react';
import { getGroups, createGroup, deleteGroup } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Card, Button, EmptyState, Badge } from '../components/ui';
import type { Group } from '../types';

const LEVEL_OPTIONS = [
  { value: 'ESO1', label: '1º ESO' },
  { value: 'ESO2', label: '2º ESO' },
  { value: 'ESO3', label: '3º ESO' },
  { value: 'ESO4', label: '4º ESO' },
  { value: 'BACH1', label: '1º Bachillerato' },
  { value: 'BACH2', label: '2º Bachillerato' },
  { value: 'FPB1', label: 'FP Básica 1' },
  { value: 'FPB2', label: 'FP Básica 2' },
  { value: 'CFGM', label: 'Ciclo Formativo GM' },
  { value: 'CFGS', label: 'Ciclo Formativo GS' },
];

const LEVEL_COLORS: Record<string, string> = {
  ESO1: 'from-blue-400 to-blue-500',
  ESO2: 'from-blue-500 to-blue-600',
  ESO3: 'from-blue-600 to-blue-700',
  ESO4: 'from-blue-700 to-blue-800',
  BACH1: 'from-purple-500 to-purple-600',
  BACH2: 'from-purple-600 to-purple-700',
  FPB1: 'from-amber-400 to-amber-500',
  FPB2: 'from-amber-500 to-amber-600',
  CFGM: 'from-green-500 to-green-600',
  CFGS: 'from-green-600 to-green-700',
};

export const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    level: 'ESO1',
    num_students: 25,
  });

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGroups();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar grupos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGroup(formData);
      setFormData({ name: '', level: 'ESO1', num_students: 25 });
      setShowForm(false);
      loadGroups();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear grupo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este grupo?')) return;
    try {
      await deleteGroup(id);
      loadGroups();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar grupo');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadGroups} />;

  // Agrupar por nivel
  const groupsByLevel = groups.reduce((acc, group) => {
    if (!acc[group.level]) acc[group.level] = [];
    acc[group.level].push(group);
    return acc;
  }, {} as Record<string, Group[]>);

  const totalStudents = groups.reduce((sum, g) => sum + g.num_students, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Badge variant="info" size="md">
            {groups.length} grupos
          </Badge>
          <Badge variant="success" size="md">
            👥 {totalStudents} estudiantes
          </Badge>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'primary'}
          icon={showForm ? '✕' : '➕'}
        >
          {showForm ? 'Cancelar' : 'Nuevo Grupo'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-2 border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuevo Grupo</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del grupo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ej: 1º ESO A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel *
                </label>
                <select
                  required
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nº Estudiantes
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  value={formData.num_students}
                  onChange={(e) => setFormData({ ...formData, num_students: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="success" icon="✓">
                Guardar Grupo
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Groups Display */}
      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon="👥"
            title="No hay grupos"
            description="Añade grupos de alumnos para organizar las clases del centro."
            action={
              <Button onClick={() => setShowForm(true)} icon="➕">
                Añadir primer grupo
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupsByLevel).map(([level, levelGroups]) => (
            <div key={level}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <span className={`w-3 h-3 rounded-full bg-gradient-to-br ${LEVEL_COLORS[level] || 'from-gray-400 to-gray-500'} mr-2`} />
                {LEVEL_OPTIONS.find(l => l.value === level)?.label || level}
                <span className="ml-2 text-gray-400">({levelGroups.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {levelGroups.map((group) => (
                  <Card key={group.id} padding="sm" className="hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 bg-gradient-to-br ${LEVEL_COLORS[group.level] || 'from-gray-400 to-gray-500'} rounded-lg flex items-center justify-center text-white font-bold mr-3`}>
                          {group.name.substring(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{group.name}</h4>
                          <p className="text-sm text-gray-500">{group.num_students} estudiantes</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(group.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
