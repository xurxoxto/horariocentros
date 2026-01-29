import React, { useState, useEffect } from 'react';
import { getAssignments, createAssignment, deleteAssignment, getTeachers, getSubjects, getGroups } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { SubjectAssignment, Teacher, Subject, Group } from '../types';

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    teacher_ids: [] as string[],
    subject_id: '',
    group_id: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentsData, teachersData, subjectsData, groupsData] = await Promise.all([
        getAssignments(),
        getTeachers(),
        getSubjects(),
        getGroups(),
      ]);
      setAssignments(assignmentsData);
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setGroups(groupsData);
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
      // Crear una asignación por cada profesor seleccionado
      for (const teacher_id of formData.teacher_ids) {
        await createAssignment({
          teacher_id,
          subject_id: formData.subject_id,
          group_id: formData.group_id,
        });
      }
      setShowForm(false);
      setFormData({ teacher_ids: [], subject_id: '', group_id: '' });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear asignación');
    }
  };

  const toggleTeacher = (teacherId: string) => {
    setFormData({
      ...formData,
      teacher_ids: formData.teacher_ids.includes(teacherId)
        ? formData.teacher_ids.filter(id => id !== teacherId)
        : [...formData.teacher_ids, teacherId]
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta asignación?')) return;
    try {
      await deleteAssignment(id);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar asignación');
    }
  };

  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || id;
  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || id;
  const getGroupName = (id: string) => groups.find(g => g.id === id)?.name || id;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Asignaciones Profesor-Asignatura-Grupo</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? '✕ Cancelar' : '+ Nueva Asignación'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Nueva Asignación</h2>
          <p className="text-sm text-gray-500 mb-4">
            💡 Selecciona varios profesores para crear una asignación de <strong>co-docencia</strong>
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profesores <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-2">(selecciona uno o varios)</span>
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {teachers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">No hay profesores disponibles</p>
                ) : (
                  teachers.map((teacher) => (
                    <label
                      key={teacher.id}
                      className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                        formData.teacher_ids.includes(teacher.id!)
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.teacher_ids.includes(teacher.id!)}
                        onChange={() => toggleTeacher(teacher.id!)}
                        className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{teacher.name}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
              {formData.teacher_ids.length > 1 && (
                <p className="text-sm text-blue-600 mt-2">
                  ✓ {formData.teacher_ids.length} profesores seleccionados (co-docencia)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asignatura <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar asignatura...</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupo <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.group_id}
                onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar grupo...</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.level})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={formData.teacher_ids.length === 0 || !formData.subject_id || !formData.group_id}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {formData.teacher_ids.length > 1 
                ? `Crear ${formData.teacher_ids.length} Asignaciones (Co-docencia)` 
                : 'Crear Asignación'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profesor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asignatura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grupo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay asignaciones. Crea la primera para relacionar profesores con asignaturas y grupos.
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getTeacherName(assignment.teacher_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getSubjectName(assignment.subject_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getGroupName(assignment.group_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDelete(assignment.id!)}
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

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Co-docencia (varios profesores):</h4>
        <p className="text-sm text-blue-800 mb-2">
          Puedes seleccionar múltiples profesores para crear asignaciones que luego coincidan en el horario.
        </p>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Paso 1:</strong> Selecciona Juan y María como profesores</p>
          <p><strong>Paso 2:</strong> Selecciona Matemáticas como asignatura</p>
          <p><strong>Paso 3:</strong> Selecciona 6B como grupo</p>
          <p><strong>Paso 4:</strong> Esto creará 2 asignaciones separadas</p>
          <p><strong>Paso 5:</strong> Ve a "Restricciones" y crea una restricción "Deben coincidir" para forzar que ambas clases sean al mismo tiempo</p>
        </div>
      </div>
    </div>
  );
};
