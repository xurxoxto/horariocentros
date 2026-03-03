import React, { useState, useEffect } from 'react';
import { getTeachers, getSubjects, getGroups, getAssignments, createAssignment } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Teacher, Subject, Group, SubjectAssignment } from '../types';

export const CodocenciaPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [, setAssignments] = useState<SubjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teachersData, subjectsData, groupsData, assignmentsData] = await Promise.all([
        getTeachers(),
        getSubjects(),
        getGroups(),
        getAssignments(),
      ]);
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setGroups(groupsData);
      setAssignments(assignmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleTeacher = (teacherId: string) => {
    setSelectedTeachers(prev =>
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleCreateAssignments = async () => {
    if (selectedTeachers.length === 0 || selectedSubjects.length === 0 || selectedGroups.length === 0) {
      setError('Debes seleccionar al menos un profesor, una asignatura y un grupo');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      // Crear una asignación por cada combinación
      let count = 0;
      for (const teacherId of selectedTeachers) {
        for (const subjectId of selectedSubjects) {
          for (const groupId of selectedGroups) {
            await createAssignment({
              teacher_id: teacherId,
              subject_id: subjectId,
              group_id: groupId,
            });
            count++;
          }
        }
      }

      setSelectedTeachers([]);
      setSelectedSubjects([]);
      setSelectedGroups([]);
      await loadData();
      alert(`✅ Creadas ${count} asignaciones`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear asignaciones');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectAll = (type: 'teachers' | 'subjects' | 'groups') => {
    if (type === 'teachers') {
      setSelectedTeachers(selectedTeachers.length === teachers.length ? [] : teachers.map(t => t.id!));
    } else if (type === 'subjects') {
      setSelectedSubjects(selectedSubjects.length === subjects.length ? [] : subjects.map(s => s.id!));
    } else if (type === 'groups') {
      setSelectedGroups(selectedGroups.length === groups.length ? [] : groups.map(g => g.id!));
    }
  };

  const totalAssignmentsToCreate = selectedTeachers.length * selectedSubjects.length * selectedGroups.length;

  if (loading) return <LoadingSpinner />;
  if (error && loading) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Co-docencia</h1>
      <p className="text-gray-600 mb-6">
        Asigna múltiples profesores, asignaturas y grupos de forma simultánea
      </p>

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Profesores */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">👨‍🏫 Profesores</h3>
            <button
              onClick={() => handleSelectAll('teachers')}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              {selectedTeachers.length === teachers.length ? 'Desseleccionar' : 'Todos'}
            </button>
          </div>
          <div className="border border-gray-300 rounded p-2 max-h-64 overflow-y-auto space-y-1">
            {teachers.map(teacher => (
              <label
                key={teacher.id}
                className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                  selectedTeachers.includes(teacher.id!)
                    ? 'bg-blue-100 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTeachers.includes(teacher.id!)}
                  onChange={() => toggleTeacher(teacher.id!)}
                  className="mr-2 h-4 w-4 text-blue-600"
                />
                <span className="text-sm">{teacher.name}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">{selectedTeachers.length} seleccionados</p>
        </div>

        {/* Asignaturas */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">📚 Asignaturas</h3>
            <button
              onClick={() => handleSelectAll('subjects')}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
            >
              {selectedSubjects.length === subjects.length ? 'Desseleccionar' : 'Todas'}
            </button>
          </div>
          <div className="border border-gray-300 rounded p-2 max-h-64 overflow-y-auto space-y-1">
            {subjects.map(subject => (
              <label
                key={subject.id}
                className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                  selectedSubjects.includes(subject.id!)
                    ? 'bg-green-100 border-l-4 border-green-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject.id!)}
                  onChange={() => toggleSubject(subject.id!)}
                  className="mr-2 h-4 w-4 text-green-600"
                />
                <span className="text-sm">{subject.name} ({subject.code})</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">{selectedSubjects.length} seleccionadas</p>
        </div>

        {/* Grupos */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">👥 Grupos</h3>
            <button
              onClick={() => handleSelectAll('groups')}
              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
            >
              {selectedGroups.length === groups.length ? 'Desseleccionar' : 'Todos'}
            </button>
          </div>
          <div className="border border-gray-300 rounded p-2 max-h-64 overflow-y-auto space-y-1">
            {groups.map(group => (
              <label
                key={group.id}
                className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                  selectedGroups.includes(group.id!)
                    ? 'bg-purple-100 border-l-4 border-purple-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.id!)}
                  onChange={() => toggleGroup(group.id!)}
                  className="mr-2 h-4 w-4 text-purple-600"
                />
                <span className="text-sm">{group.name} ({group.level})</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">{selectedGroups.length} seleccionados</p>
        </div>
      </div>

      {/* Resumen y botón */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{selectedTeachers.length}</div>
            <p className="text-sm text-gray-600">Profesores</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">×</div>
            <p className="text-sm text-gray-600">Multiplicación</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{totalAssignmentsToCreate}</div>
            <p className="text-sm text-gray-600">Asignaciones totales</p>
          </div>
        </div>

        <div className="mb-4 p-3 bg-white rounded border border-gray-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Resumen:</strong> Se crearán <span className="font-bold text-lg text-blue-600">{totalAssignmentsToCreate}</span> asignaciones:
          </p>
          <ul className="text-xs text-gray-600 space-y-1 ml-4">
            {selectedTeachers.slice(0, 2).map(tId => (
              <li key={tId}>
                {teachers.find(t => t.id === tId)?.name} + {selectedSubjects.slice(0, 2).map(sId => subjects.find(s => s.id === sId)?.name).join(', ')} + {selectedGroups.slice(0, 2).map(gId => groups.find(g => g.id === gId)?.name).join(', ')} ...
              </li>
            ))}
            {selectedTeachers.length > 2 && <li>... y más combinaciones</li>}
          </ul>
        </div>

        <button
          onClick={handleCreateAssignments}
          disabled={totalAssignmentsToCreate === 0 || creating}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold text-lg"
        >
          {creating ? '⏳ Creando asignaciones...' : `✨ Crear ${totalAssignmentsToCreate} Asignaciones`}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Cómo usar:</h4>
        <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
          <li>Selecciona los profesores que impartirán las clases</li>
          <li>Selecciona las asignaturas que quieres asignar</li>
          <li>Selecciona los grupos a los que impartir</li>
          <li>El sistema crea todas las combinaciones automáticamente</li>
          <li>Si necesitas co-docencia (dos profes en la misma clase), ve a "Restricciones" → "Deben coincidir"</li>
        </ol>
      </div>
    </div>
  );
};
