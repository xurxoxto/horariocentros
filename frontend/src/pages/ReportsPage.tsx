import React, { useState, useEffect } from 'react';
import { getSchedules, getTeachers, getGroups, getRooms } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Schedule, Teacher, Group, Room } from '../types';

export const ReportsPage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [filterType, setFilterType] = useState<'teacher' | 'group' | 'room' | 'all'>('all');
  const [filterId, setFilterId] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'html'>('html');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [schedulesData, teachersData, groupsData, roomsData] = await Promise.all([
        getSchedules(),
        getTeachers(),
        getGroups(),
        getRooms(),
      ]);
      setSchedules(schedulesData);
      setTeachers(teachersData);
      setGroups(groupsData);
      setRooms(roomsData);
      if (schedulesData.length > 0) {
        setSelectedSchedule(schedulesData[0].id!);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const schedule = schedules.find(s => s.id === selectedSchedule);
  let lessons = schedule?.lessons || [];

  // Aplicar filtro
  if (filterType === 'teacher' && filterId) {
    lessons = lessons.filter(l => l.teacher_id === filterId);
  } else if (filterType === 'group' && filterId) {
    lessons = lessons.filter(l => l.group_id === filterId);
  } else if (filterType === 'room' && filterId) {
    lessons = lessons.filter(l => l.room_id === filterId);
  }

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  const generateHTML = () => {
    const title = `Horario - ${getFilterDescription()}`;
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #007bff; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .info { color: #666; font-size: 0.9em; margin-top: 10px; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="info">
        <p><strong>Generado:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <p><strong>Total de clases:</strong> ${lessons.length}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>Día</th>
                <th>Hora</th>
                <th>Asignatura</th>
                <th>Profesor</th>
                <th>Grupo</th>
                <th>Aula</th>
            </tr>
        </thead>
        <tbody>
            ${lessons
              .sort((a, b) => {
                const dayDiff = Number(a.day || 0) - Number(b.day || 0);
                if (dayDiff !== 0) return dayDiff;
                return (a.start_hour || 0) - (b.start_hour || 0);
              })
              .map(
                lesson => `
            <tr>
                <td>${days[Number(lesson.day) || 0] || 'Desconocido'}</td>
                <td>${String(lesson.start_hour || 0).padStart(2, '0')}:${String(lesson.start_minute || 0).padStart(2, '0')}</td>
                <td>${lesson.subject_name || lesson.subject_id}</td>
                <td>${lesson.teacher_name || lesson.teacher_id}</td>
                <td>${lesson.group_name || lesson.group_id}</td>
                <td>${lesson.room_name || lesson.room_id}</td>
            </tr>
            `
              )
              .join('')}
        </tbody>
    </table>
</body>
</html>
    `;
    return html;
  };

  const generateCSV = () => {
    const lines = [
      'Día,Hora,Asignatura,Profesor,Grupo,Aula',
      ...lessons.map(lesson => [
        days[Number(lesson.day) || 0] || 'Desconocido',
        `${String(lesson.start_hour || 0).padStart(2, '0')}:${String(lesson.start_minute || 0).padStart(2, '0')}`,
        lesson.subject_name || lesson.subject_id,
        lesson.teacher_name || lesson.teacher_id,
        lesson.group_name || lesson.group_id,
        lesson.room_name || lesson.room_id,
      ].map(v => `"${v}"`).join(',')),
    ];
    return lines.join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filterDesc = getFilterDescription().replace(/[^a-zA-Z0-9]/g, '_');

    if (exportFormat === 'html') {
      const html = generateHTML();
      downloadFile(html, `horario_${filterDesc}_${timestamp}.html`, 'text/html');
    } else if (exportFormat === 'csv') {
      const csv = generateCSV();
      downloadFile(csv, `horario_${filterDesc}_${timestamp}.csv`, 'text/csv');
    }
  };

  const getFilterDescription = () => {
    if (filterType === 'teacher' && filterId) {
      return `Profesor: ${teachers.find(t => t.id === filterId)?.name || filterId}`;
    } else if (filterType === 'group' && filterId) {
      return `Grupo: ${groups.find(g => g.id === filterId)?.name || filterId}`;
    } else if (filterType === 'room' && filterId) {
      return `Aula: ${rooms.find(r => r.id === filterId)?.name || filterId}`;
    }
    return 'Horario Completo';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Reportes y Exportación</h1>
      <p className="text-gray-600 mb-6">Genera reportes de horarios filtrados por profesor, grupo, aula, etc.</p>

      {error && <ErrorMessage message={error} onRetry={loadData} />}

      {schedules.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 mb-2">📋 No hay horarios generados aún</p>
          <p className="text-sm text-yellow-700">Ve a "Generar Horario" y crea un horario para poder generar reportes</p>
        </div>
      ) : (
        <>
          {/* Selección de horario */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Selecciona un Horario</h2>
            <select
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {schedules.map(s => (
                <option key={s.id} value={s.id}>
                  {s.center_name} - {s.academic_year} {s.is_valid ? '✓' : '✗'}
                </option>
              ))}
            </select>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">🔍 Filtrar por:</h3>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as any);
                  setFilterId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos (Horario completo)</option>
                <option value="teacher">Por Profesor</option>
                <option value="group">Por Grupo</option>
                <option value="room">Por Aula</option>
              </select>

              {filterType !== 'all' && (
                <select
                  value={filterId}
                  onChange={(e) => setFilterId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  {filterType === 'teacher' && teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                  {filterType === 'group' && groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                  {filterType === 'room' && rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">📥 Formato de Exportación:</h3>
              <div className="space-y-2">
                <label className="flex items-center p-2 rounded border-2 border-transparent hover:border-blue-300 cursor-pointer">
                  <input
                    type="radio"
                    value="html"
                    checked={exportFormat === 'html'}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="font-medium">HTML</span>
                  <span className="text-xs text-gray-500 ml-2">(Abrir en navegador)</span>
                </label>
                <label className="flex items-center p-2 rounded border-2 border-transparent hover:border-blue-300 cursor-pointer">
                  <input
                    type="radio"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="font-medium">CSV</span>
                  <span className="text-xs text-gray-500 ml-2">(Excel, Google Sheets)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Vista previa y botón */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-4">📋 Vista Previa ({lessons.length} clases)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Día</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Asignatura</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Profesor</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grupo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aula</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lessons.slice(0, 10).map((lesson, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{days[Number(lesson.day) || 0]}</td>
                          <td className="px-4 py-2">{String(lesson.start_hour || 0).padStart(2, '0')}:00</td>
                          <td className="px-4 py-2">{lesson.subject_name}</td>
                          <td className="px-4 py-2">{lesson.teacher_name}</td>
                          <td className="px-4 py-2">{lesson.group_name}</td>
                          <td className="px-4 py-2">{lesson.room_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {lessons.length > 10 && (
                  <p className="text-sm text-gray-500 mt-3">Mostrando 10 de {lessons.length} clases (descarga para ver todas)</p>
                )}
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6 sticky top-6">
                <h3 className="font-semibold mb-2">📊 Resumen</h3>
                <div className="space-y-3 text-sm mb-6">
                  <div>
                    <p className="text-gray-600">Horario:</p>
                    <p className="font-semibold">{schedule?.center_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Filtro:</p>
                    <p className="font-semibold">{getFilterDescription()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Clases:</p>
                    <p className="font-semibold text-lg text-blue-600">{lessons.length}</p>
                  </div>
                </div>

                <button
                  onClick={handleExport}
                  disabled={!selectedSchedule}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  ⬇️ Descargar {exportFormat.toUpperCase()}
                </button>

                <p className="text-xs text-gray-600 mt-4 text-center">
                  Puedes abrir el archivo descargado en tu navegador, Excel o editor de texto
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
