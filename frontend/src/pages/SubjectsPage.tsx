import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';
import { getSubjects, createSubject, deleteSubject } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Card, Button, EmptyState } from '../components/ui';
import type { Subject } from '../types';

export const SubjectsPage: React.FC = () => {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(3);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubjects();
      setSubjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar asignaturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSubjects(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setSaving(true);
      await createSubject({ name: name.trim(), hours_per_week: hoursPerWeek, requires_lab: false, excluded_room_ids: [] });
      toast('Asignatura añadida correctamente', 'success');
      setName('');
      setHoursPerWeek(3);
      loadSubjects();
      inputRef.current?.focus();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al crear asignatura', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'Eliminar asignatura', message: '¿Seguro que quieres eliminar esta asignatura? Esta acción no se puede deshacer.', confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    try {
      await deleteSubject(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al eliminar asignatura', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadSubjects} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Asignaturas</h2>
        <p className="text-gray-500 text-sm">{subjects.length} asignatura{subjects.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Quick-add form */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Añadir asignatura</h3>
        <form onSubmit={handleSubmit} className="flex items-center gap-3 flex-wrap">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Matemáticas"
            autoFocus
            className="flex-1 min-w-[180px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          {/* Hours stepper */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5">
            <button
              type="button"
              onClick={() => setHoursPerWeek(h => Math.max(1, h - 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all font-bold"
            >−</button>
            <span className="w-16 text-center text-sm font-medium text-gray-700">
              {hoursPerWeek}h/sem
            </span>
            <button
              type="button"
              onClick={() => setHoursPerWeek(h => Math.min(10, h + 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all font-bold"
            >+</button>
          </div>
          <Button type="submit" variant="primary" icon="➕" disabled={!name.trim() || saving}>
            {saving ? 'Guardando…' : 'Añadir'}
          </Button>
        </form>
      </Card>

      {/* Subjects list */}
      {subjects.length === 0 ? (
        <Card>
          <EmptyState
            illustration="subjects"
            title="No hay asignaturas"
            description="Escribe el nombre de la primera asignatura arriba y pulsa Añadir."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map(subject => (
            <div
              key={subject.id}
              className="group flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {subject.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{subject.name}</p>
                  <p className="text-xs text-gray-400">
                    <span className="font-mono mr-2">{subject.code}</span>
                    · {subject.hours_per_week}h/sem
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(subject.id)}
                className="opacity-0 group-hover:opacity-100 ml-2 flex-shrink-0 p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                title="Eliminar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

