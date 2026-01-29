import React, { useState, useEffect } from 'react';
import { getTeachers, getGroups, getRooms, getSubjects, getAssignments } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Teacher, Group, Room, Subject, SubjectAssignment } from '../types';

interface Constraint {
  id: string;
  type: 'unavailable' | 'must_coincide' | 'same_day' | 'only_at_hours' | 'not_consecutive' | 'break_guard_restriction';
  description: string;
  entity_id?: string;
  entity_type?: 'teacher' | 'group' | 'room';
  day?: number;
  hour?: number;
  related_assignment_id?: string;
  allowed_hours?: number[];
}

export const ConstraintsPage: React.FC = () => {
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    type: Constraint['type'];
    entity_type: 'teacher' | 'group' | 'room';
    entity_id: string;
    day: number;
    hour: number;
    assignment_id: string;
    related_assignment_id: string;
    allowed_hours: number[];
  }>({
    type: 'unavailable',
    entity_type: 'teacher',
    entity_id: '',
    day: 0,
    hour: 8,
    assignment_id: '',
    related_assignment_id: '',
    allowed_hours: [],
  });

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const hours = Array.from({ length: 8 }, (_, i) => i + 8); // 8:00 - 15:00

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teachersData, groupsData, roomsData, subjectsData, assignmentsData] = await Promise.all([
        getTeachers(),
        getGroups(),
        getRooms(),
        getSubjects(),
        getAssignments(),
      ]);
      setTeachers(teachersData);
      setGroups(groupsData);
      setRooms(roomsData);
      setSubjects(subjectsData);
      setAssignments(assignmentsData);
      setConstraints([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let description = '';
    const entityName = getEntityName(formData.entity_id, formData.entity_type);
    
    if (formData.type === 'unavailable') {
      description = `${formData.entity_type === 'teacher' ? 'Profesor' : formData.entity_type === 'group' ? 'Grupo' : 'Aula'} ${entityName} no disponible ${days[formData.day]} a las ${formData.hour}:00`;
    } else if (formData.type === 'must_coincide') {
      const assignment1 = getAssignmentDescription(formData.assignment_id);
      const assignment2 = getAssignmentDescription(formData.related_assignment_id);
      description = `"${assignment1}" DEBE coincidir con "${assignment2}" (mismo día y hora)`;
    } else if (formData.type === 'same_day') {
      const assignment1 = getAssignmentDescription(formData.assignment_id);
      const assignment2 = getAssignmentDescription(formData.related_assignment_id);
      description = `"${assignment1}" y "${assignment2}" deben ser el mismo día`;
    } else if (formData.type === 'only_at_hours') {
      const assignment = getAssignmentDescription(formData.assignment_id);
      const hoursStr = formData.allowed_hours.sort((a, b) => a - b).map(h => `${h}:00`).join(', ');
      description = `"${assignment}" solo puede ser a las horas: ${hoursStr}`;
    } else if (formData.type === 'not_consecutive') {
      const assignment1 = getAssignmentDescription(formData.assignment_id);
      const assignment2 = getAssignmentDescription(formData.related_assignment_id);
      description = `"${assignment1}" y "${assignment2}" NO pueden ser consecutivas`;
    } else if (formData.type === 'break_guard_restriction') {
      const teacherName = getEntityName(formData.entity_id, 'teacher');
      description = `Guardia de recreo de ${teacherName}: NO puede ser un día con 5 clases completas`;
    }

    const newConstraint: Constraint = {
      id: Date.now().toString(),
      type: formData.type,
      description,
      entity_id: formData.entity_id,
      entity_type: formData.entity_type,
      day: formData.day,
      hour: formData.hour,
      related_assignment_id: formData.related_assignment_id,
      allowed_hours: [...formData.allowed_hours],
    };

    setConstraints([...constraints, newConstraint]);
    setShowForm(false);
    setFormData({
      type: 'unavailable',
      entity_type: 'teacher',
      entity_id: '',
      day: 0,
      hour: 8,
      assignment_id: '',
      related_assignment_id: '',
      allowed_hours: [],
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta restricción?')) return;
    setConstraints(constraints.filter(c => c.id !== id));
  };

  const getEntityName = (id: string, type: string) => {
    if (type === 'teacher') {
      return teachers.find(t => t.id === id)?.name || id;
    } else if (type === 'group') {
      return groups.find(g => g.id === id)?.name || id;
    } else if (type === 'room') {
      return rooms.find(r => r.id === id)?.name || id;
    }
    return id;
  };

  const getAssignmentDescription = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return assignmentId;
    const teacher = teachers.find(t => t.id === assignment.teacher_id)?.name || assignment.teacher_id;
    const subject = subjects.find(s => s.id === assignment.subject_id)?.name || assignment.subject_id;
    const group = groups.find(g => g.id === assignment.group_id)?.name || assignment.group_id;
    return `${teacher} - ${subject} - ${group}`;
  };

  const toggleHour = (hour: number) => {
    const newHours = formData.allowed_hours.includes(hour)
      ? formData.allowed_hours.filter(h => h !== hour)
      : [...formData.allowed_hours, hour];
    setFormData({ ...formData, allowed_hours: newHours });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restricciones</h1>
          <p className="text-gray-600 mt-1">Define reglas que el generador de horarios debe respetar</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? '✕ Cancelar' : '+ Nueva Restricción'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Nueva Restricción</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Restricción <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  type: e.target.value as any,
                  entity_id: '',
                  assignment_id: '',
                  related_assignment_id: '',
                  allowed_hours: [],
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="unavailable">🚫 No disponible (profesor/grupo/aula)</option>
                <option value="must_coincide">🔗 Deben coincidir (mismo día y hora)</option>
                <option value="same_day">📅 Mismo día (diferente hora)</option>
                <option value="only_at_hours">⏰ Solo en horas específicas</option>
                <option value="not_consecutive">⛔ No consecutivas</option>
                <option value="break_guard_restriction">☕ Guardia de recreo (no día completo)</option>
              </select>
            </div>

            {formData.type === 'unavailable' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entidad <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.entity_type}
                    onChange={(e) => setFormData({ ...formData, entity_type: e.target.value as any, entity_id: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="teacher">Profesor</option>
                    <option value="group">Grupo</option>
                    <option value="room">Aula</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seleccionar {formData.entity_type === 'teacher' ? 'Profesor' : formData.entity_type === 'group' ? 'Grupo' : 'Aula'}
                    {' '}<span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.entity_id}
                    onChange={(e) => setFormData({ ...formData, entity_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {formData.entity_type === 'teacher' && teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                    {formData.entity_type === 'group' && groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                    {formData.entity_type === 'room' && rooms.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Día <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {days.map((day, index) => (
                        <option key={index} value={index}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.hour}
                      onChange={(e) => setFormData({ ...formData, hour: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>{hour}:00</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {formData.type === 'break_guard_restriction' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profesor <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.entity_id}
                    onChange={(e) => setFormData({ ...formData, entity_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar profesor...</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Esta restricción asegura que el profesor NO tendrá guardia de recreo los días que tenga las 5 horas de clase completas (sin huecos).
                  </p>
                </div>
              </>
            )}

            {(formData.type === 'must_coincide' || formData.type === 'same_day' || formData.type === 'not_consecutive') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primera Asignación <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.assignment_id}
                    onChange={(e) => setFormData({ ...formData, assignment_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar asignación...</option>
                    {assignments.map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>
                        {getAssignmentDescription(assignment.id!)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segunda Asignación <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.related_assignment_id}
                    onChange={(e) => setFormData({ ...formData, related_assignment_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar asignación...</option>
                    {assignments.filter(a => a.id !== formData.assignment_id).map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>
                        {getAssignmentDescription(assignment.id!)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {formData.type === 'only_at_hours' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asignación <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.assignment_id}
                    onChange={(e) => setFormData({ ...formData, assignment_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar asignación...</option>
                    {assignments.map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>
                        {getAssignmentDescription(assignment.id!)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horas permitidas (selecciona múltiples) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {hours.map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => toggleHour(hour)}
                        className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                          formData.allowed_hours.includes(hour)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {hour}:00
                      </button>
                    ))}
                  </div>
                  {formData.allowed_hours.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">Debes seleccionar al menos una hora</p>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={
                (formData.type === 'only_at_hours' && formData.allowed_hours.length === 0) ||
                (!formData.entity_id && (formData.type === 'unavailable' || formData.type === 'break_guard_restriction')) ||
                (!formData.assignment_id && formData.type !== 'unavailable' && formData.type !== 'break_guard_restriction')
              }
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Crear Restricción
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Restricciones Activas ({constraints.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {constraints.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <p className="text-lg mb-2">📋 No hay restricciones definidas</p>
              <p className="text-sm">Las restricciones permiten al algoritmo evitar asignar clases en momentos no disponibles</p>
            </div>
          ) : (
            constraints.map((constraint) => (
              <div key={constraint.id} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {constraint.type.includes('teacher') && '👨‍🏫'}
                      {constraint.type.includes('group') && '👥'}
                      {constraint.type.includes('room') && '🏫'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{constraint.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tipo: {constraint.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(constraint.id)}
                  className="ml-4 text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3">💡 Tipos de restricciones disponibles:</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start">
            <span className="mr-2">🚫</span>
            <div>
              <strong>No disponible:</strong> Marca que un profesor, grupo o aula no está disponible en un día/hora específico.
              <br /><em className="text-xs text-blue-700">Ejemplo: Profesor no viene los lunes a 1ª hora</em>
            </div>
          </div>
          <div className="flex items-start">
            <span className="mr-2">🔗</span>
            <div>
              <strong>Deben coincidir:</strong> Dos asignaciones deben ser al mismo día y misma hora.
              <br /><em className="text-xs text-blue-700">Ejemplo: Dos grupos tienen Educación Física juntos</em>
            </div>
          </div>
          <div className="flex items-start">
            <span className="mr-2">📅</span>
            <div>
              <strong>Mismo día:</strong> Dos asignaciones deben ser el mismo día (pero diferente hora).
              <br /><em className="text-xs text-blue-700">Ejemplo: Teoría y práctica de laboratorio el mismo día</em>
            </div>
          </div>
          <div className="flex items-start">
            <span className="mr-2">⏰</span>
            <div>
              <strong>Solo en horas específicas:</strong> Una asignación solo puede asignarse en ciertas horas.
              <br /><em className="text-xs text-blue-700">Ejemplo: Educación Física solo de 12:00 a 14:00</em>
            </div>
          </div>
          <div className="flex items-start">
            <span className="mr-2">⛔</span>
            <div>
              <strong>No consecutivas:</strong> Dos asignaciones no deben ser una después de la otra.
              <br /><em className="text-xs text-blue-700">Ejemplo: Matemáticas y Física no consecutivas para el mismo grupo</em>
            </div>
          </div>
          <div className="flex items-start">
            <span className="mr-2">☕</span>
            <div>
              <strong>Guardia de recreo:</strong> Un profesor no tendrá guardia de recreo los días que tenga 5 clases completas.
              <br /><em className="text-xs text-blue-700">Ejemplo: Profesor con jornada completa de 8:00 a 14:00 sin huecos</em>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
