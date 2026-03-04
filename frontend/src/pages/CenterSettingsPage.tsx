import React, { useEffect, useState } from 'react';
import { getCenterConfig, updateCenterConfig } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Card } from '../components/ui';
import type { CenterConfig, PeriodConfig, BreakConfig } from '../types';

const SCHEDULE_TEMPLATES: Record<string, { 
  label: string; 
  description: string;
  periods_per_day: number;
  total_weekly_hours: number;
  teaching_hours_per_week: number;
  periods: PeriodConfig[];
  breaks: BreakConfig[];
}> = {
  continua_infantil_primaria: {
    label: 'Jornada continua – Infantil/Primaria',
    description: '9:00 a 14:00 · 5 sesiones de 1h · Recreo tras 3ª sesión',
    periods_per_day: 5,
    total_weekly_hours: 25,
    teaching_hours_per_week: 25,
    periods: [
      { number: 1, start_time: '09:00', end_time: '10:00', duration_minutes: 60 },
      { number: 2, start_time: '10:00', end_time: '11:00', duration_minutes: 60 },
      { number: 3, start_time: '11:00', end_time: '12:00', duration_minutes: 60 },
      { number: 4, start_time: '12:30', end_time: '13:30', duration_minutes: 60 },
      { number: 5, start_time: '13:30', end_time: '14:00', duration_minutes: 30 },
    ],
    breaks: [
      { after_period: 3, start_time: '12:00', end_time: '12:30', name: 'Recreo' },
    ],
  },
  continua_secundaria: {
    label: 'Jornada continua – Secundaria',
    description: '8:30 a 14:30 · 6 sesiones de 55min · Recreo tras 3ª sesión',
    periods_per_day: 6,
    total_weekly_hours: 30,
    teaching_hours_per_week: 25,
    periods: [
      { number: 1, start_time: '08:30', end_time: '09:25', duration_minutes: 55 },
      { number: 2, start_time: '09:25', end_time: '10:20', duration_minutes: 55 },
      { number: 3, start_time: '10:20', end_time: '11:15', duration_minutes: 55 },
      { number: 4, start_time: '11:45', end_time: '12:40', duration_minutes: 55 },
      { number: 5, start_time: '12:40', end_time: '13:35', duration_minutes: 55 },
      { number: 6, start_time: '13:35', end_time: '14:30', duration_minutes: 55 },
    ],
    breaks: [
      { after_period: 3, start_time: '11:15', end_time: '11:45', name: 'Recreo' },
    ],
  },
  continua_7sesiones: {
    label: 'Jornada continua – 7 sesiones',
    description: '8:15 a 14:45 · 7 sesiones de 50min · Recreo tras 3ª y 5ª',
    periods_per_day: 7,
    total_weekly_hours: 35,
    teaching_hours_per_week: 25,
    periods: [
      { number: 1, start_time: '08:15', end_time: '09:05', duration_minutes: 50 },
      { number: 2, start_time: '09:05', end_time: '09:55', duration_minutes: 50 },
      { number: 3, start_time: '09:55', end_time: '10:45', duration_minutes: 50 },
      { number: 4, start_time: '11:15', end_time: '12:05', duration_minutes: 50 },
      { number: 5, start_time: '12:05', end_time: '12:55', duration_minutes: 50 },
      { number: 6, start_time: '13:15', end_time: '14:05', duration_minutes: 50 },
      { number: 7, start_time: '14:05', end_time: '14:45', duration_minutes: 50 },
    ],
    breaks: [
      { after_period: 3, start_time: '10:45', end_time: '11:15', name: 'Recreo' },
      { after_period: 5, start_time: '12:55', end_time: '13:15', name: 'Descanso' },
    ],
  },
  partida: {
    label: 'Jornada partida',
    description: '9:00 a 13:00 + 15:00 a 17:00 · 6 sesiones · Recreo mañana y tarde',
    periods_per_day: 6,
    total_weekly_hours: 30,
    teaching_hours_per_week: 25,
    periods: [
      { number: 1, start_time: '09:00', end_time: '10:00', duration_minutes: 60 },
      { number: 2, start_time: '10:00', end_time: '11:00', duration_minutes: 60 },
      { number: 3, start_time: '11:30', end_time: '12:30', duration_minutes: 60 },
      { number: 4, start_time: '12:30', end_time: '13:30', duration_minutes: 60 },
      { number: 5, start_time: '15:00', end_time: '16:00', duration_minutes: 60 },
      { number: 6, start_time: '16:00', end_time: '17:00', duration_minutes: 60 },
    ],
    breaks: [
      { after_period: 2, start_time: '11:00', end_time: '11:30', name: 'Recreo mañana' },
      { after_period: 4, start_time: '13:30', end_time: '15:00', name: 'Mediodía' },
    ],
  },
};

const EDUCATION_LEVEL_OPTIONS = [
  { value: 'infantil', label: 'Educación Infantil', icon: '🧒', color: 'from-pink-400 to-pink-500' },
  { value: 'primaria', label: 'Educación Primaria', icon: '📖', color: 'from-orange-400 to-orange-500' },
  { value: 'eso', label: 'ESO', icon: '📘', color: 'from-blue-400 to-blue-500' },
  { value: 'bachillerato', label: 'Bachillerato', icon: '🎓', color: 'from-purple-400 to-purple-500' },
  { value: 'fp_basica', label: 'FP Básica', icon: '🔧', color: 'from-amber-400 to-amber-500' },
  { value: 'cfgm', label: 'Ciclos Formativos GM', icon: '⚙️', color: 'from-green-400 to-green-500' },
  { value: 'cfgs', label: 'Ciclos Formativos GS', icon: '🏗️', color: 'from-teal-400 to-teal-500' },
];

export const CenterSettingsPage: React.FC = () => {
  const [config, setConfig] = useState<CenterConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [formData, setFormData] = useState<Partial<CenterConfig>>({});

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCenterConfig();
      setConfig(data);
      setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = await updateCenterConfig(formData);
      setConfig(data);
      setFormData(data);
      setDirty(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  /** Helper to update formData and mark dirty */
  const update = (patch: Partial<CenterConfig>) => {
    setFormData(prev => ({ ...prev, ...patch }));
    setDirty(true);
  };

  /** Calcula duración en minutos entre dos cadenas HH:MM */
  const calcDuration = (start: string, end: string): number => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  };

  /** Suma minutos a una hora HH:MM */
  const addMinutes = (time: string, minutes: number): string => {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  /** Actualiza un periodo y cascadea tiempos a sesiones y recreos adyacentes */
  const updatePeriod = (index: number, field: 'start_time' | 'end_time', value: string) => {
    const newPeriods = [...(formData.periods || [])].map(p => ({ ...p }));
    const newBreaks = [...(formData.breaks || [])].map(b => ({ ...b }));

    // Actualizar el campo editado
    newPeriods[index][field] = value;

    // Recalcular duración de esta sesión
    if (newPeriods[index].start_time && newPeriods[index].end_time) {
      const d = calcDuration(newPeriods[index].start_time, newPeriods[index].end_time);
      newPeriods[index].duration_minutes = d > 0 ? d : 0;
    }

    // Cascadear hacia adelante: si cambió end_time, ajustar break/siguiente sesión
    if (field === 'end_time') {
      const currentEnd = value;
      const breakAfter = newBreaks.find(b => b.after_period === newPeriods[index].number);

      if (breakAfter) {
        // Hay recreo: mover su inicio al fin de esta sesión, mantener duración
        const breakDuration = calcDuration(breakAfter.start_time, breakAfter.end_time);
        breakAfter.start_time = currentEnd;
        breakAfter.end_time = addMinutes(currentEnd, breakDuration > 0 ? breakDuration : 30);

        // Mover la siguiente sesión al fin del recreo
        if (index + 1 < newPeriods.length) {
          const nextDur = newPeriods[index + 1].duration_minutes || 55;
          newPeriods[index + 1].start_time = breakAfter.end_time;
          newPeriods[index + 1].end_time = addMinutes(breakAfter.end_time, nextDur);
        }
      } else if (index + 1 < newPeriods.length) {
        // No hay recreo: mover la siguiente sesión directamente
        const nextDur = newPeriods[index + 1].duration_minutes || 55;
        newPeriods[index + 1].start_time = currentEnd;
        newPeriods[index + 1].end_time = addMinutes(currentEnd, nextDur);
      }

      // Seguir cascadeando hacia el resto de sesiones
      for (let i = index + 2; i < newPeriods.length; i++) {
        const prevPeriod = newPeriods[i - 1];
        const breakBetween = newBreaks.find(b => b.after_period === prevPeriod.number);
        const prevEnd = breakBetween ? breakBetween.end_time : prevPeriod.end_time;
        const dur = newPeriods[i].duration_minutes || 55;
        newPeriods[i].start_time = prevEnd;
        newPeriods[i].end_time = addMinutes(prevEnd, dur);

        // Actualizar break después de esta sesión
        const breakAfterI = newBreaks.find(b => b.after_period === newPeriods[i].number);
        if (breakAfterI) {
          const bDur = calcDuration(breakAfterI.start_time, breakAfterI.end_time);
          breakAfterI.start_time = newPeriods[i].end_time;
          breakAfterI.end_time = addMinutes(newPeriods[i].end_time, bDur > 0 ? bDur : 30);
        }
      }
    }

    // Cascadear hacia atrás: si cambió start_time, ajustar break/sesión anterior
    if (field === 'start_time') {
      const currentStart = value;
      const prevPeriod = index > 0 ? newPeriods[index - 1] : null;

      if (prevPeriod) {
        const breakBefore = newBreaks.find(b => b.after_period === prevPeriod.number);
        if (breakBefore) {
          breakBefore.end_time = currentStart;
          if (calcDuration(breakBefore.start_time, breakBefore.end_time) <= 0) {
            breakBefore.start_time = addMinutes(currentStart, -30);
          }
        } else {
          prevPeriod.end_time = currentStart;
          if (prevPeriod.start_time && prevPeriod.end_time) {
            const d = calcDuration(prevPeriod.start_time, prevPeriod.end_time);
            prevPeriod.duration_minutes = d > 0 ? d : 0;
          }
        }
      }
    }

    setFormData(prev => ({ ...prev, periods: newPeriods, breaks: newBreaks }));
    setDirty(true);
  };

  /** Actualiza un recreo */
  const updateBreak = (index: number, field: string, value: string | number) => {
    const newBreaks = [...(formData.breaks || [])];
    newBreaks[index] = { ...newBreaks[index], [field]: value };
    setFormData(prev => ({ ...prev, breaks: newBreaks }));
    setDirty(true);
  };

  /** Añadir una sesión nueva al final */
  const addPeriod = () => {
    const periods = formData.periods || [];
    const lastP = periods[periods.length - 1];
    const newNumber = (lastP?.number || 0) + 1;
    const newStart = lastP?.end_time || '09:00';
    const dur = lastP?.duration_minutes || 55;
    const newEnd = addMinutes(newStart, dur);
    update({
      periods: [...periods, { number: newNumber, start_time: newStart, end_time: newEnd, duration_minutes: dur }],
      periods_per_day: newNumber,
    });
  };

  /** Eliminar última sesión */
  const removePeriod = () => {
    const periods = formData.periods || [];
    if (periods.length <= 1) return;
    const removed = periods[periods.length - 1];
    const newBreaks = (formData.breaks || []).filter(b => b.after_period !== removed.number);
    update({
      periods: periods.slice(0, -1),
      breaks: newBreaks,
      periods_per_day: periods.length - 1,
    });
  };

  /** Añadir un recreo después de un periodo */
  const addBreak = (afterPeriod: number) => {
    const periods = formData.periods || [];
    const p = periods.find(pp => pp.number === afterPeriod);
    const nextP = periods.find(pp => pp.number === afterPeriod + 1);
    const startTime = p?.end_time || '11:00';
    const endTime = nextP?.start_time || addMinutes(startTime, 30);
    update({
      breaks: [...(formData.breaks || []), { after_period: afterPeriod, start_time: startTime, end_time: endTime, name: 'Recreo' }],
    });
  };

  /** Eliminar un recreo */
  const removeBreak = (afterPeriod: number) => {
    update({
      breaks: (formData.breaks || []).filter(b => b.after_period !== afterPeriod),
    });
  };

  const applyTemplate = (templateKey: string) => {
    const template = SCHEDULE_TEMPLATES[templateKey];
    if (!template) return;
    update({
      schedule_type: templateKey.startsWith('partida') ? 'partida' : 'continua',
      periods_per_day: template.periods_per_day,
      total_weekly_hours: template.total_weekly_hours,
      teaching_hours_per_week: template.teaching_hours_per_week,
      periods: [...template.periods],
      breaks: [...template.breaks],
    });
  };

  const toggleLevel = (level: string) => {
    const current = formData.education_levels || [];
    const updated = current.includes(level)
      ? current.filter(l => l !== level)
      : [...current, level];
    update({ education_levels: updated });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadConfig} />;
  if (!config) return null;

  const nonTeachingHours = (formData.total_weekly_hours || 0) - (formData.teaching_hours_per_week || 0);

  return (
    <div className="space-y-6">
      {/* Barra de guardar fija cuando hay cambios */}
      {dirty && (
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4 flex items-center justify-between shadow-lg animate-pulse-once">
          <div className="flex items-center space-x-3">
            <span className="text-lg">💾</span>
            <span className="font-medium">Hay cambios sin guardar</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => { setFormData(config!); setDirty(false); }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all"
            >
              Descartar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
            >
              {saving ? 'Guardando...' : '✓ Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Centro</h2>
        <p className="text-gray-500">Jornada escolar, niveles educativos y periodos lectivos. Edita cualquier campo directamente.</p>
      </div>

      {/* Datos generales */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🏫</span> Datos del Centro
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del centro</label>
            <input
              type="text"
              value={formData.center_name || ''}
              onChange={(e) => update({ center_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Curso académico</label>
            <input
              type="text"
              value={formData.academic_year || ''}
              onChange={(e) => update({ academic_year: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="2025-2026"
            />
          </div>
        </div>
      </Card>

      {/* Niveles educativos */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🎒</span> Niveles Educativos del Centro
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Selecciona los niveles educativos que se imparten en el centro. Esto determinará los grupos disponibles.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {EDUCATION_LEVEL_OPTIONS.map((level) => {
            const isActive = (formData.education_levels || []).includes(level.value);
            return (
              <button
                key={level.value}
                type="button"
                onClick={() => toggleLevel(level.value)}
                className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${level.color} rounded-lg flex items-center justify-center text-white text-lg mr-3 ${!isActive ? 'opacity-40' : ''}`}>
                  {level.icon}
                </div>
                <div className="text-left">
                  <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {level.label}
                  </p>
                </div>
                {isActive && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Jornada escolar */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⏰</span> Jornada Escolar
        </h3>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Plantillas predefinidas (selecciona una como base y luego ajusta):</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(SCHEDULE_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyTemplate(key)}
                className="text-left p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <p className="font-medium text-gray-900">{template.label}</p>
                <p className="text-sm text-gray-500">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Resumen de jornada */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{formData.periods_per_day}</p>
            <p className="text-sm text-blue-600">Sesiones/día</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{formData.days_per_week}</p>
            <p className="text-sm text-green-600">Días/semana</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-700">{formData.total_weekly_hours}</p>
            <p className="text-sm text-purple-600">Horas/semana totales</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-700">{formData.teaching_hours_per_week}</p>
            <p className="text-sm text-amber-600">Horas lectivas</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sesiones/día</label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.periods_per_day || 6}
                onChange={(e) => update({ periods_per_day: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Días/semana</label>
              <input
                type="number"
                min="1"
                max="7"
                value={formData.days_per_week || 5}
                onChange={(e) => update({ days_per_week: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Total horas/semana</label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.total_weekly_hours || 30}
                onChange={(e) => update({ total_weekly_hours: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Horas lectivas/semana</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.teaching_hours_per_week || 25}
                onChange={(e) => update({ teaching_hours_per_week: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

        {/* Distribución de horas por semana */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribución semanal del profesorado</h4>
          <div className="flex items-center space-x-1 h-8 rounded-lg overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-l-lg flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${((formData.teaching_hours_per_week || 25) / (formData.total_weekly_hours || 30)) * 100}%` }}
            >
              Lectivas: {formData.teaching_hours_per_week}h
            </div>
            <div
              className="bg-amber-500 h-full rounded-r-lg flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${(nonTeachingHours / (formData.total_weekly_hours || 30)) * 100}%` }}
            >
              Complementarias: {nonTeachingHours}h
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Las horas complementarias incluyen: guardias, apoyos, coordinación, recreos, etc.
          </p>
        </div>

        {/* Periodos */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">Sesiones del día</h4>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={removePeriod}
              disabled={(formData.periods || []).length <= 1}
              className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              − Quitar sesión
            </button>
            <button
              type="button"
              onClick={addPeriod}
              className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
            >
              + Añadir sesión
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Modifica las horas directamente. Los cambios se propagan automáticamente a las sesiones siguientes.
        </p>
        <div className="space-y-2">
          {(formData.periods || []).map((period, index) => {
            const breakAfter = (formData.breaks || []).find(b => b.after_period === period.number);
            const hasNextPeriod = index < (formData.periods || []).length - 1;
            return (
              <React.Fragment key={period.number}>
                {/* Sesión */}
                <div className="flex items-center rounded-lg p-3 bg-white border-2 border-blue-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold mr-4 flex-shrink-0">
                    {period.number}ª
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={period.start_time}
                          onChange={(e) => updatePeriod(index, 'start_time', e.target.value)}
                          className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-400 font-medium">→</span>
                        <input
                          type="time"
                          value={period.end_time}
                          onChange={(e) => updatePeriod(index, 'end_time', e.target.value)}
                          className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${period.duration_minutes > 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-600'}`}>
                        {period.duration_minutes > 0 ? `${period.duration_minutes} min` : '⚠️ horario inválido'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recreo después de esta sesión */}
                {breakAfter ? (
                  <div className="flex items-center rounded-lg p-3 ml-8 bg-amber-50 border-2 border-amber-200">
                    <span className="text-lg mr-3 flex-shrink-0">☕</span>
                    <div className="flex items-center flex-wrap gap-2 flex-1">
                      <input
                        type="text"
                        value={breakAfter.name}
                        onChange={(e) => {
                          const bi = (formData.breaks || []).findIndex(b => b.after_period === period.number);
                          if (bi >= 0) updateBreak(bi, 'name', e.target.value);
                        }}
                        className="px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-sm font-medium text-amber-900 w-28 focus:ring-2 focus:ring-amber-400"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={breakAfter.start_time}
                          onChange={(e) => {
                            const bi = (formData.breaks || []).findIndex(b => b.after_period === period.number);
                            if (bi >= 0) updateBreak(bi, 'start_time', e.target.value);
                          }}
                          className="px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
                        />
                        <span className="text-amber-400 font-medium">→</span>
                        <input
                          type="time"
                          value={breakAfter.end_time}
                          onChange={(e) => {
                            const bi = (formData.breaks || []).findIndex(b => b.after_period === period.number);
                            if (bi >= 0) updateBreak(bi, 'end_time', e.target.value);
                          }}
                          className="px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBreak(period.number)}
                        className="ml-auto px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar recreo"
                      >
                        ✕ Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  hasNextPeriod && (
                    <div className="ml-8">
                      <button
                        type="button"
                        onClick={() => addBreak(period.number)}
                        className="w-full py-1.5 text-xs text-gray-400 hover:text-amber-600 hover:bg-amber-50 border border-dashed border-gray-200 hover:border-amber-300 rounded-lg transition-all"
                      >
                        + Añadir recreo aquí
                      </button>
                    </div>
                  )
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
