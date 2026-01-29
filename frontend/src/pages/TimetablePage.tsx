import React, { useState } from 'react';
import { generateSchedule } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Schedule } from '../types';

export const TimetablePage: React.FC = () => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    center_name: 'Mi Centro Educativo',
    academic_year: '2025-2026',
    max_iterations: 1000,
    time_limit_seconds: 60,
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setError(null);
      setSchedule(null);
      const data = await generateSchedule(formData);
      setSchedule(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar horario');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Generar Horario</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Parámetros de Generación</h2>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Centro</label>
              <input
                type="text"
                required
                value={formData.center_name}
                onChange={(e) => setFormData({ ...formData, center_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año Académico</label>
              <input
                type="text"
                required
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Iteraciones Máximas</label>
              <input
                type="number"
                required
                min="100"
                max="10000"
                value={formData.max_iterations}
                onChange={(e) => setFormData({ ...formData, max_iterations: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo Límite (segundos)</label>
              <input
                type="number"
                required
                min="10"
                max="300"
                value={formData.time_limit_seconds}
                onChange={(e) => setFormData({ ...formData, time_limit_seconds: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={generating}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {generating ? '🔄 Generando...' : '🎯 Generar Horario'}
          </button>
        </form>
      </div>

      {generating && <LoadingSpinner message="Generando horario... Esto puede tardar unos momentos." />}
      {error && <ErrorMessage message={error} onRetry={() => handleGenerate({} as React.FormEvent)} />}

      {schedule && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Horario Generado</h2>
            <div className="mt-2 flex items-center space-x-4 text-sm">
              <span className="text-gray-600">
                <strong>Centro:</strong> {schedule.center_name}
              </span>
              <span className="text-gray-600">
                <strong>Año:</strong> {schedule.academic_year}
              </span>
              <span className={`px-2 py-1 rounded ${schedule.is_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {schedule.is_valid ? '✓ Válido' : '✗ Inválido'}
              </span>
              <span className="text-gray-600">
                <strong>Violaciones duras:</strong> {schedule.hard_violations}
              </span>
              <span className="text-gray-600">
                <strong>Coste blando:</strong> {schedule.soft_cost.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Clases ({schedule.lessons.length})</h3>
            {schedule.lessons.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No se generaron clases. Verifica que existan profesores, asignaturas, grupos, aulas y franjas horarias.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Día</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignatura</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grupo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aula</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schedule.lessons.slice(0, 20).map((lesson, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {lesson.day || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {lesson.start_hour !== undefined ? 
                            `${String(lesson.start_hour).padStart(2, '0')}:${String(lesson.start_minute || 0).padStart(2, '0')}` : 
                            '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {lesson.subject_name || lesson.subject_id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {lesson.teacher_name || lesson.teacher_id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {lesson.group_name || lesson.group_id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {lesson.room_name || lesson.room_id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {schedule.lessons.length > 20 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Mostrando 20 de {schedule.lessons.length} clases
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
