import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import { getAssignments, createAssignment, deleteAssignment, getTeachers, getSubjects, getGroups } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/ui';
import type { SubjectAssignment, Teacher, Subject, Group } from '../types';

export const AssignmentsPage: React.FC = () => {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTeacher, setSearchTeacher] = useState('');
  const [searchSubject, setSearchSubject] = useState('');
  const [searchGroup, setSearchGroup] = useState('');
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

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      for (const teacher_id of formData.teacher_ids) {
        await createAssignment({ teacher_id, subject_id: formData.subject_id, group_id: formData.group_id });
      }
      setShowForm(false);
      setFormData({ teacher_ids: [], subject_id: '', group_id: '' });
      setSearchTeacher(''); setSearchSubject(''); setSearchGroup('');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear asignación');
    }
  };

  const toggleTeacher = (id: string) => setFormData(f => ({
    ...f,
    teacher_ids: f.teacher_ids.includes(id) ? f.teacher_ids.filter(x => x !== id) : [...f.teacher_ids, id],
  }));

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'Eliminar asignación', message: '¿Seguro que quieres eliminar esta asignación?', confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    try { await deleteAssignment(id); loadData(); }
    catch (err) { toast(err instanceof Error ? err.message : 'Error al eliminar', 'error'); }
  };

  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || id;
  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || id;
  const getSubjectCode = (id: string) => subjects.find(s => s.id === id)?.code || '';
  const getGroupName = (id: string) => groups.find(g => g.id === id)?.name || id;

  const filteredTeachers = teachers.filter(t => t.name.toLowerCase().includes(searchTeacher.toLowerCase()));
  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchSubject.toLowerCase()) || (s.code ?? '').toLowerCase().includes(searchSubject.toLowerCase())
  );
  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchGroup.toLowerCase()) || g.level.toLowerCase().includes(searchGroup.toLowerCase())
  );

  const canSubmit = formData.teacher_ids.length > 0 && formData.subject_id && formData.group_id;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Asignaciones</h2>
          <p className="text-gray-500 text-sm">{assignments.length} asignación{assignments.length !== 1 ? 'es' : ''}</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFormData({ teacher_ids: [], subject_id: '', group_id: '' }); setSearchTeacher(''); setSearchSubject(''); setSearchGroup(''); }}
          className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all ${showForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}
        >
          {showForm ? '✕ Cancelar' : '➕ Nueva Asignación'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Nueva Asignación</h3>
            <p className="text-sm text-gray-500">Selecciona docente/s, asignatura y grupo pulsando en las etiquetas.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Professors */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  🧑‍🏫 Profesorado <span className="text-red-500">*</span>
                  {formData.teacher_ids.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-normal">
                      {formData.teacher_ids.length} seleccionado{formData.teacher_ids.length > 1 ? 's' : ''}
                      {formData.teacher_ids.length > 1 && ' · co-docencia'}
                    </span>
                  )}
                </label>
                {formData.teacher_ids.length > 0 && (
                  <button type="button" onClick={() => setFormData(f => ({ ...f, teacher_ids: [] }))} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Limpiar
                  </button>
                )}
              </div>
              {teachers.length > 6 && (
                <input
                  type="text"
                  value={searchTeacher}
                  onChange={e => setSearchTeacher(e.target.value)}
                  placeholder="Buscar docente..."
                  className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              )}
              <div className="flex flex-wrap gap-2">
                {filteredTeachers.length === 0 ? (
                  <p className="text-sm text-gray-400">No hay docentes disponibles</p>
                ) : filteredTeachers.map(t => {
                  const selected = formData.teacher_ids.includes(t.id!);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTeacher(t.id!)}
                      className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                        selected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs mr-1.5 font-bold ${selected ? 'bg-white/20' : 'bg-gray-100'}`}>
                        {t.name.charAt(0).toUpperCase()}
                      </span>
                      {t.name}
                      {selected && <span className="ml-1.5 opacity-80">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  📚 Asignatura <span className="text-red-500">*</span>
                  {formData.subject_id && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-normal">
                      {getSubjectName(formData.subject_id)}
                    </span>
                  )}
                </label>
                {formData.subject_id && (
                  <button type="button" onClick={() => setFormData(f => ({ ...f, subject_id: '' }))} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Limpiar
                  </button>
                )}
              </div>
              {subjects.length > 8 && (
                <input
                  type="text"
                  value={searchSubject}
                  onChange={e => setSearchSubject(e.target.value)}
                  placeholder="Buscar asignatura..."
                  className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              )}
              <div className="flex flex-wrap gap-2">
                {filteredSubjects.length === 0 ? (
                  <p className="text-sm text-gray-400">No hay asignaturas disponibles</p>
                ) : filteredSubjects.map(s => {
                  const selected = formData.subject_id === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFormData(f => ({ ...f, subject_id: s.id! }))}
                      className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                        selected
                          ? 'bg-green-600 text-white border-green-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      <span className={`px-1.5 py-0.5 rounded text-xs mr-1.5 font-mono ${selected ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                        {s.code}
                      </span>
                      {s.name}
                      {selected && <span className="ml-1.5 opacity-80">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  🏫 Grupo <span className="text-red-500">*</span>
                  {formData.group_id && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-normal">
                      {getGroupName(formData.group_id)}
                    </span>
                  )}
                </label>
                {formData.group_id && (
                  <button type="button" onClick={() => setFormData(f => ({ ...f, group_id: '' }))} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Limpiar
                  </button>
                )}
              </div>
              {groups.length > 8 && (
                <input
                  type="text"
                  value={searchGroup}
                  onChange={e => setSearchGroup(e.target.value)}
                  placeholder="Buscar grupo..."
                  className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              )}
              <div className="flex flex-wrap gap-2">
                {filteredGroups.length === 0 ? (
                  <p className="text-sm text-gray-400">No hay grupos disponibles</p>
                ) : filteredGroups.map(g => {
                  const selected = formData.group_id === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFormData(f => ({ ...f, group_id: g.id! }))}
                      className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                        selected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                    >
                      {g.name}
                      <span className={`ml-1.5 text-xs ${selected ? 'opacity-70' : 'text-gray-400'}`}>{g.level}</span>
                      {selected && <span className="ml-1.5 opacity-80">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary + Submit */}
            {canSubmit && (
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <div className="text-sm text-gray-700 space-y-0.5">
                  <p><span className="font-medium">Profesorado:</span> {formData.teacher_ids.map(id => getTeacherName(id)).join(', ')}</p>
                  <p><span className="font-medium">Asignatura:</span> {getSubjectName(formData.subject_id)} <span className="text-gray-400 font-mono text-xs">({getSubjectCode(formData.subject_id)})</span></p>
                  <p><span className="font-medium">Grupo:</span> {getGroupName(formData.group_id)}</p>
                </div>
                <button
                  type="submit"
                  className="ml-4 flex-shrink-0 px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-sm"
                >
                  {formData.teacher_ids.length > 1 ? `Crear ${formData.teacher_ids.length} asignaciones` : 'Crear asignación'}
                </button>
              </div>
            )}
            {!canSubmit && (
              <p className="text-sm text-gray-400 text-center py-2">
                Selecciona al menos un/a docente, una asignatura y un grupo para continuar
              </p>
            )}
          </form>
        </div>
      )}

      {/* Assignments table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {assignments.length === 0 ? (
          <div className="px-6 py-12 flex flex-col items-center text-gray-400">
            <EmptyState
              illustration="assignments"
              title="No hay asignaciones todavía"
              description="Crea la primera para relacionar el profesorado con asignaturas y grupos"
            />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Docente</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Asignatura</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Grupo</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 w-32">
                    <span className="block text-xs font-medium text-gray-900 truncate max-w-[7rem]" title={getTeacherName(a.teacher_id)}>
                      {getTeacherName(a.teacher_id)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-gray-700">
                    {getSubjectName(a.subject_id)}
                    <span className="ml-1.5 text-xs text-gray-400 font-mono">({getSubjectCode(a.subject_id)})</span>
                  </td>
                  <td className="px-3 py-2.5 text-sm font-medium text-gray-700 w-24">{getGroupName(a.group_id)}</td>
                  <td className="px-2 py-2.5 text-right w-8">
                    <button
                      onClick={() => handleDelete(a.id!)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {assignments.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <span className="font-semibold">💡 Co-docencia:</span> Selecciona varias personas del profesorado al crear una asignación y luego añade una restricción "Deben coincidir" en la sección de Restricciones.
        </div>
      )}
    </div>
  );
};

