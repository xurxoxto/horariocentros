import React, { useEffect, useState } from 'react';
import { getTeachers, createTeacher, deleteTeacher, updateTeacher, getCenterConfig } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Card, Button, EmptyState, Badge } from '../components/ui';
import type { Teacher, FreeHourPreference, CenterConfig } from '../types';

const FREE_HOUR_PREFERENCE_LABELS: Record<FreeHourPreference, string> = {
  'no_preference': 'Sin preferencia',
  'first_hour': 'A primera hora',
  'last_hour': 'A última hora',
  'first_and_last': 'Primera y última',
  'middle_hours': 'Horas intermedias',
  'consecutive': 'Consecutivas',
  'specific_hours': 'Horas específicas',
};

const HOURS_OF_DAY = [1, 2, 3, 4, 5, 6, 7];

const HOUR_TYPES = [
  { key: 'guard_hours', label: 'Guardias', icon: '🛡️', color: 'bg-sky-500', lightColor: 'bg-sky-100 text-sky-800', max: 10 },
  { key: 'break_guard_hours', label: 'Guardias recreo', icon: '☕', color: 'bg-amber-500', lightColor: 'bg-amber-100 text-amber-800', max: 5 },
  { key: 'support_hours', label: 'Apoyo', icon: '🤝', color: 'bg-emerald-500', lightColor: 'bg-emerald-100 text-emerald-800', max: 10 },
  { key: 'coordination_hours', label: 'Coordinación', icon: '📋', color: 'bg-violet-500', lightColor: 'bg-violet-100 text-violet-800', max: 10 },
  { key: 'management_hours', label: 'Eq. Directivo', icon: '👔', color: 'bg-rose-500', lightColor: 'bg-rose-100 text-rose-800', max: 20 },
];

const initialFormData = {
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
};

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState<'basic' | 'hours' | 'preferences'>('basic');
  const [centerConfig, setCenterConfig] = useState<CenterConfig | null>(null);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, config] = await Promise.all([getTeachers(), getCenterConfig().catch(() => null)]);
      setTeachers(data);
      setCenterConfig(config);
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
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, formData);
      } else {
        await createTeacher(formData);
      }
      setFormData(initialFormData);
      setShowForm(false);
      setEditingTeacher(null);
      setActiveTab('basic');
      loadTeachers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar profesor');
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setFormData({
      name: teacher.name,
      max_hours_per_day: teacher.max_hours_per_day,
      max_hours_per_week: teacher.max_hours_per_week,
      prefer_consecutive_free_hours: teacher.prefer_consecutive_free_hours,
      free_hour_preference: teacher.free_hour_preference,
      preferred_free_hours: teacher.preferred_free_hours || [],
      guard_hours: teacher.guard_hours,
      break_guard_hours: teacher.break_guard_hours,
      support_hours: teacher.support_hours,
      coordination_hours: teacher.coordination_hours,
      management_hours: teacher.management_hours,
      no_coordination_next_to_free: teacher.no_coordination_next_to_free,
    });
    setEditingTeacher(teacher);
    setShowForm(true);
    setActiveTab('basic');
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

  const closeForm = () => {
    setShowForm(false);
    setEditingTeacher(null);
    setFormData(initialFormData);
    setActiveTab('basic');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadTeachers} />;

  const tabs = [
    { id: 'basic', label: 'Datos básicos', icon: '👤' },
    { id: 'hours', label: 'Distribución de horas', icon: '⏰' },
    { id: 'preferences', label: 'Preferencias', icon: '⚙️' },
  ];

  const totalNonTeaching = formData.guard_hours + formData.break_guard_hours + formData.support_hours + formData.coordination_hours + formData.management_hours;
  const totalHoursLabel = centerConfig ? `${centerConfig.total_weekly_hours}h semanales (jornada del centro)` : `${formData.max_hours_per_week}h semanales`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500">
            {teachers.length} profesor{teachers.length !== 1 ? 'es' : ''} registrado{teachers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => { setShowForm(!showForm); setEditingTeacher(null); setFormData(initialFormData); }}
          variant={showForm ? 'secondary' : 'primary'}
          icon={showForm ? '✕' : '➕'}
        >
          {showForm ? 'Cancelar' : 'Nuevo Profesor'}
        </Button>
      </div>

      {/* Center config info banner */}
      {centerConfig && !showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center">
          <span className="text-xl mr-3">🏫</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              Jornada del centro: {centerConfig.periods_per_day} sesiones/día · {centerConfig.total_weekly_hours}h semanales · {centerConfig.teaching_hours_per_week}h lectivas
            </p>
            <p className="text-xs text-blue-600">
              {centerConfig.total_weekly_hours - centerConfig.teaching_hours_per_week}h complementarias disponibles por profesor (guardias, apoyos, coordinación...)
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card className="border-2 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingTeacher ? `✏️ Editar: ${editingTeacher.name}` : '👤 Nuevo Profesor'}
            </h3>
            {centerConfig && (
              <Badge variant="info" size="md">
                🏫 Jornada: {centerConfig.total_weekly_hours}h/sem
              </Badge>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Basic */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Ej: María García López"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horas/día máximo
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="12"
                      value={formData.max_hours_per_day}
                      onChange={(e) => setFormData({ ...formData, max_hours_per_day: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horas lectivas/semana
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="40"
                      value={formData.max_hours_per_week}
                      onChange={(e) => setFormData({ ...formData, max_hours_per_week: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    {centerConfig && (
                      <p className="text-xs text-gray-400 mt-1">
                        Jornada del centro: {centerConfig.teaching_hours_per_week}h lectivas de {centerConfig.total_weekly_hours}h totales
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Hours Distribution */}
            {activeTab === 'hours' && (
              <div className="space-y-4">
                {/* Summary bar */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Distribución de horas semanales</h4>
                    <span className="text-sm text-gray-500">{totalHoursLabel}</span>
                  </div>
                  
                  {/* Visual bar */}
                  <div className="flex items-center h-10 rounded-lg overflow-hidden mb-3">
                    <div
                      className="bg-blue-500 h-full flex items-center justify-center text-white text-xs font-medium transition-all"
                      style={{ width: `${Math.max(5, (formData.max_hours_per_week / (centerConfig?.total_weekly_hours || formData.max_hours_per_week + totalNonTeaching)) * 100)}%` }}
                    >
                      📚 {formData.max_hours_per_week}h lectivas
                    </div>
                    {HOUR_TYPES.map(ht => {
                      const val = formData[ht.key as keyof typeof formData] as number;
                      if (val <= 0) return null;
                      return (
                        <div
                          key={ht.key}
                          className={`${ht.color} h-full flex items-center justify-center text-white text-xs font-medium transition-all`}
                          style={{ width: `${Math.max(3, (val / (centerConfig?.total_weekly_hours || formData.max_hours_per_week + totalNonTeaching)) * 100)}%` }}
                          title={`${ht.label}: ${val}h`}
                        >
                          {val > 0 && `${ht.icon}${val}`}
                        </div>
                      );
                    })}
                    {(() => {
                      const total = centerConfig?.total_weekly_hours || (formData.max_hours_per_week + totalNonTeaching);
                      const used = formData.max_hours_per_week + totalNonTeaching;
                      const free = Math.max(0, total - used);
                      if (free <= 0) return null;
                      return (
                        <div
                          className="bg-gray-300 h-full flex items-center justify-center text-gray-600 text-xs font-medium"
                          style={{ width: `${(free / total) * 100}%` }}
                        >
                          {free}h libres
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full">📚 Lectivas: {formData.max_hours_per_week}h</span>
                    {HOUR_TYPES.map(ht => {
                      const val = formData[ht.key as keyof typeof formData] as number;
                      if (val <= 0) return null;
                      return (
                        <span key={ht.key} className={`inline-flex items-center px-2 py-1 ${ht.lightColor} rounded-full`}>
                          {ht.icon} {ht.label}: {val}h
                        </span>
                      );
                    })}
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-semibold">
                      Total: {formData.max_hours_per_week + totalNonTeaching}h{centerConfig ? ` / ${centerConfig.total_weekly_hours}h` : ''}
                    </span>
                  </div>
                </div>

                {/* Info banner about provisional hours */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start">
                  <span className="text-lg mr-3 mt-0.5">💡</span>
                  <div>
                    <p className="text-sm font-medium text-amber-900">Las guardias y apoyos son provisionales</p>
                    <p className="text-xs text-amber-700 mt-1">
                      No es necesario definirlos ahora. Puedes dejarlos a 0 y modificarlos más adelante en cualquier momento 
                      pulsando el botón de editar en la ficha del profesor.
                    </p>
                  </div>
                </div>

                {/* All hours together */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {HOUR_TYPES.map((field) => (
                    <div key={field.key} className="bg-gray-50 rounded-lg p-4">
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <span className="mr-2">{field.icon}</span>
                        {field.label}
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            const current = formData[field.key as keyof typeof formData] as number;
                            if (current > 0) setFormData({ ...formData, [field.key]: current - 1 });
                          }}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          max={field.max}
                          value={formData[field.key as keyof typeof formData] as number}
                          onChange={(e) => setFormData({ ...formData, [field.key]: parseInt(e.target.value) || 0 })}
                          className="w-16 px-3 py-2 bg-white border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const current = formData[field.key as keyof typeof formData] as number;
                            if (current < field.max) setFormData({ ...formData, [field.key]: current + 1 });
                          }}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">h/semana</p>
                    </div>
                  ))}

                  {/* Quick "set all to 0" button */}
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        guard_hours: 0,
                        break_guard_hours: 0,
                        support_hours: 0,
                        coordination_hours: 0,
                        management_hours: 0,
                      })}
                      className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      🔄 Resetear todas a 0
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                      Se podrán modificar después
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Preferences */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferencia de horas libres
                  </label>
                  <select
                    value={formData.free_hour_preference}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      free_hour_preference: e.target.value as FreeHourPreference,
                      preferred_free_hours: e.target.value === 'specific_hours' ? formData.preferred_free_hours : []
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    {Object.entries(FREE_HOUR_PREFERENCE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {formData.free_hour_preference === 'specific_hours' && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-blue-800 mb-3">
                      Selecciona las horas preferidas
                    </label>
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
                          className={`w-12 h-12 rounded-lg font-medium transition-all ${
                            formData.preferred_free_hours.includes(hour)
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400'
                          }`}
                        >
                          {hour}ª
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.prefer_consecutive_free_hours}
                      onChange={(e) => setFormData({ ...formData, prefer_consecutive_free_hours: e.target.checked })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                      🔗 Prefiere horas libres consecutivas
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.no_coordination_next_to_free}
                      onChange={(e) => setFormData({ ...formData, no_coordination_next_to_free: e.target.checked })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                      🚫 Coordinación no puede ir junto a hora libre
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <div className="flex space-x-2">
                {activeTab !== 'basic' && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setActiveTab(activeTab === 'preferences' ? 'hours' : 'basic')}
                  >
                    ← Anterior
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="secondary" onClick={closeForm}>
                  Cancelar
                </Button>
                {activeTab !== 'preferences' ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setActiveTab(activeTab === 'basic' ? 'hours' : 'preferences')}
                  >
                    Siguiente →
                  </Button>
                ) : (
                  <Button type="submit" variant="success" icon="✓">
                    {editingTeacher ? 'Actualizar Profesor' : 'Guardar Profesor'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Teachers Grid */}
      {teachers.length === 0 ? (
        <Card>
          <EmptyState
            icon="👨‍🏫"
            title="No hay profesores"
            description="Añade profesores para comenzar a configurar los horarios del centro."
            action={
              <Button onClick={() => setShowForm(true)} icon="➕">
                Añadir primer profesor
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => {
            const totalNT = teacher.guard_hours + teacher.break_guard_hours + teacher.support_hours + teacher.coordination_hours + teacher.management_hours;
            const totalAll = teacher.max_hours_per_week + totalNT;
            const hasProvisional = (teacher.guard_hours === 0 && teacher.support_hours === 0);

            return (
            <Card key={teacher.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {teacher.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-500">
                      {teacher.max_hours_per_day}h/día · {teacher.max_hours_per_week}h lectivas · {totalAll}h total
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(teacher)}
                    className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hours Distribution Mini Bar */}
              <div className="flex h-3 rounded-full overflow-hidden mb-3">
                <div className="bg-blue-500" style={{ width: `${(teacher.max_hours_per_week / Math.max(totalAll, 1)) * 100}%` }} title={`Lectivas: ${teacher.max_hours_per_week}h`} />
                {teacher.guard_hours > 0 && <div className="bg-sky-400" style={{ width: `${(teacher.guard_hours / Math.max(totalAll, 1)) * 100}%` }} title={`Guardias: ${teacher.guard_hours}h`} />}
                {teacher.break_guard_hours > 0 && <div className="bg-amber-400" style={{ width: `${(teacher.break_guard_hours / Math.max(totalAll, 1)) * 100}%` }} title={`G. Recreo: ${teacher.break_guard_hours}h`} />}
                {teacher.support_hours > 0 && <div className="bg-emerald-400" style={{ width: `${(teacher.support_hours / Math.max(totalAll, 1)) * 100}%` }} title={`Apoyo: ${teacher.support_hours}h`} />}
                {teacher.coordination_hours > 0 && <div className="bg-violet-400" style={{ width: `${(teacher.coordination_hours / Math.max(totalAll, 1)) * 100}%` }} title={`Coord: ${teacher.coordination_hours}h`} />}
                {teacher.management_hours > 0 && <div className="bg-rose-400" style={{ width: `${(teacher.management_hours / Math.max(totalAll, 1)) * 100}%` }} title={`Directivo: ${teacher.management_hours}h`} />}
              </div>

              {/* Special Hours */}
              <div className="flex flex-wrap gap-1 mb-3">
                {teacher.guard_hours > 0 && (
                  <Badge variant="info">🛡️ {teacher.guard_hours} guardias</Badge>
                )}
                {teacher.break_guard_hours > 0 && (
                  <Badge variant="warning">☕ {teacher.break_guard_hours} recreo</Badge>
                )}
                {teacher.support_hours > 0 && (
                  <Badge>🤝 {teacher.support_hours} apoyo</Badge>
                )}
                {teacher.coordination_hours > 0 && (
                  <Badge variant="success">📋 {teacher.coordination_hours} coord</Badge>
                )}
                {teacher.management_hours > 0 && (
                  <Badge variant="danger">👔 {teacher.management_hours} directivo</Badge>
                )}
                {hasProvisional && (
                  <Badge variant="warning">⏳ Guardias/apoyos por definir</Badge>
                )}
              </div>

              {/* Preferences */}
              <div className="text-xs text-gray-500 space-y-1 pt-3 border-t">
                {teacher.free_hour_preference && teacher.free_hour_preference !== 'no_preference' && (
                  <div className="flex items-center">
                    <span className="mr-1">⏰</span>
                    Libres: {FREE_HOUR_PREFERENCE_LABELS[teacher.free_hour_preference]}
                    {teacher.preferred_free_hours && teacher.preferred_free_hours.length > 0 && (
                      <span className="ml-1">({teacher.preferred_free_hours.join(', ')}ª)</span>
                    )}
                  </div>
                )}
                {teacher.prefer_consecutive_free_hours && (
                  <div className="flex items-center">
                    <span className="mr-1">🔗</span>
                    Prefiere libres consecutivas
                  </div>
                )}
                {teacher.no_coordination_next_to_free && (
                  <div className="flex items-center text-amber-600">
                    <span className="mr-1">🚫</span>
                    Coord. no junto a libre
                  </div>
                )}
              </div>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
