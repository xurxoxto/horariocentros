import React, { useState } from 'react';
import { Plus, Trash2, Edit, Check, X, AlertCircle } from 'lucide-react';

// Tipos de restricciones disponibles
const CONSTRAINT_TYPES = [
  { value: 'teacher_max_hours_daily', label: 'Profesor: Máximo horas diarias', category: 'Profesores' },
  { value: 'teacher_max_hours_continuously', label: 'Profesor: Máximo horas consecutivas', category: 'Profesores' },
  { value: 'teacher_min_hours_daily', label: 'Profesor: Mínimo horas diarias', category: 'Profesores' },
  { value: 'teacher_max_gaps_per_day', label: 'Profesor: Máximo huecos por día', category: 'Profesores' },
  { value: 'teacher_not_available_times', label: 'Profesor: Horarios no disponibles', category: 'Profesores' },
  
  { value: 'students_max_hours_daily', label: 'Estudiantes: Máximo horas diarias', category: 'Estudiantes' },
  { value: 'students_max_hours_continuously', label: 'Estudiantes: Máximo horas consecutivas', category: 'Estudiantes' },
  { value: 'students_min_hours_daily', label: 'Estudiantes: Mínimo horas diarias', category: 'Estudiantes' },
  { value: 'students_max_gaps_per_day', label: 'Estudiantes: Máximo huecos por día', category: 'Estudiantes' },
  { value: 'students_early_max', label: 'Estudiantes: Hora máxima inicio', category: 'Estudiantes' },
  
  { value: 'activity_preferred_days', label: 'Actividad: Días preferidos', category: 'Actividades' },
  { value: 'activity_preferred_starting_times', label: 'Actividad: Horarios preferidos', category: 'Actividades' },
  { value: 'activities_same_starting_time', label: 'Actividades: Mismo horario', category: 'Actividades' },
  { value: 'activities_consecutive', label: 'Actividades: Consecutivas', category: 'Actividades' },
  
  { value: 'room_not_available_times', label: 'Aula: Horarios no disponibles', category: 'Aulas' },
  { value: 'activity_preferred_room', label: 'Actividad: Aula preferida', category: 'Aulas' },
  
  { value: 'break_times', label: 'Recreos/Descansos', category: 'Tiempo' },
];

const CONSTRAINT_LEVELS = [
  { value: 'required', label: 'Obligatoria', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'important', label: 'Importante', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'preferred', label: 'Preferida', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'optional', label: 'Opcional', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
];

export const ConstraintsPage: React.FC = () => {
  const [constraints, setConstraints] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConstraint, setEditingConstraint] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(CONSTRAINT_TYPES.map(t => t.category)))];

  const filteredConstraintTypes = selectedCategory === 'all'
    ? CONSTRAINT_TYPES
    : CONSTRAINT_TYPES.filter(t => t.category === selectedCategory);

  const handleAddConstraint = (newConstraint: any) => {
    setConstraints([...constraints, { ...newConstraint, id: `const_${Date.now()}` }]);
    setShowAddModal(false);
  };

  const handleDeleteConstraint = (id: string) => {
    setConstraints(constraints.filter(c => c.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setConstraints(constraints.map(c => 
      c.id === id ? { ...c, active: !c.active } : c
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Restricciones
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Sistema completo de restricciones compatible con FET
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Restricción
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Restricciones"
            value={constraints.length}
            color="bg-blue-500"
          />
          <StatCard
            label="Obligatorias"
            value={constraints.filter(c => c.level === 'required').length}
            color="bg-red-500"
          />
          <StatCard
            label="Activas"
            value={constraints.filter(c => c.active).length}
            color="bg-green-500"
          />
          <StatCard
            label="Desactivadas"
            value={constraints.filter(c => !c.active).length}
            color="bg-gray-500"
          />
        </div>

        {/* Constraints List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {constraints.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay restricciones
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comienza añadiendo tu primera restricción para el horario
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Añadir Restricción
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {constraints.map((constraint) => (
                <ConstraintItem
                  key={constraint.id}
                  constraint={constraint}
                  onToggle={() => handleToggleActive(constraint.id)}
                  onEdit={() => setEditingConstraint(constraint)}
                  onDelete={() => handleDeleteConstraint(constraint.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || editingConstraint) && (
          <ConstraintModal
            constraint={editingConstraint}
            types={filteredConstraintTypes}
            onSave={(constraint) => {
              if (editingConstraint) {
                setConstraints(constraints.map(c => 
                  c.id === editingConstraint.id ? { ...constraint, id: c.id } : c
                ));
                setEditingConstraint(null);
              } else {
                handleAddConstraint(constraint);
              }
            }}
            onClose={() => {
              setShowAddModal(false);
              setEditingConstraint(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl font-bold mb-3`}>
      {value}
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
  </div>
);

const ConstraintItem: React.FC<{
  constraint: any;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ constraint, onToggle, onEdit, onDelete }) => {
  const level = CONSTRAINT_LEVELS.find(l => l.value === constraint.level);
  
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {constraint.name}
            </h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${level?.color}`}>
              {level?.label}
            </span>
            {!constraint.active && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                Desactivada
              </span>
            )}
          </div>
          {constraint.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {constraint.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Tipo: {CONSTRAINT_TYPES.find(t => t.value === constraint.type)?.label}</span>
            <span>Peso: {constraint.weight}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-colors ${
              constraint.active
                ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
            title={constraint.active ? 'Desactivar' : 'Activar'}
          >
            {constraint.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
          <button
            onClick={onEdit}
            className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ConstraintModal: React.FC<{
  constraint?: any;
  types: typeof CONSTRAINT_TYPES;
  onSave: (constraint: any) => void;
  onClose: () => void;
}> = ({ constraint, types, onSave, onClose }) => {
  const [formData, setFormData] = useState(constraint || {
    type: types[0]?.value || '',
    name: '',
    description: '',
    level: 'required',
    weight: 100,
    active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {constraint ? 'Editar Restricción' : 'Nueva Restricción'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Restricción
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 dark:bg-gray-700 dark:text-white"
                required
              >
                {types.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 dark:bg-gray-700 dark:text-white"
                required
                placeholder="Ej: Máximo 6 horas diarias para profesores"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Descripción adicional de la restricción..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nivel
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 dark:bg-gray-700 dark:text-white"
                  required
                >
                  {CONSTRAINT_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Peso (0-100%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Restricción activa
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                {constraint ? 'Guardar Cambios' : 'Crear Restricción'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
