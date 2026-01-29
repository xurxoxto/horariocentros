import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHealth } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { HealthResponse } from '../types';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  entityKey: keyof HealthResponse['entities'];
  minRequired: number;
  color: string;
}

const setupSteps: SetupStep[] = [
  {
    id: 'teachers',
    title: 'Profesores',
    description: 'Añade el profesorado del centro',
    icon: '👨‍🏫',
    path: '/teachers',
    entityKey: 'teachers',
    minRequired: 1,
    color: 'blue',
  },
  {
    id: 'subjects',
    title: 'Asignaturas',
    description: 'Define las materias a impartir',
    icon: '📚',
    path: '/subjects',
    entityKey: 'subjects',
    minRequired: 1,
    color: 'green',
  },
  {
    id: 'groups',
    title: 'Grupos',
    description: 'Configura los grupos de alumnos',
    icon: '👥',
    path: '/groups',
    entityKey: 'groups',
    minRequired: 1,
    color: 'yellow',
  },
  {
    id: 'rooms',
    title: 'Aulas',
    description: 'Registra los espacios disponibles',
    icon: '🚪',
    path: '/rooms',
    entityKey: 'rooms',
    minRequired: 1,
    color: 'purple',
  },
  {
    id: 'assignments',
    title: 'Asignaciones',
    description: 'Vincula todo junto',
    icon: '📋',
    path: '/assignments',
    entityKey: 'subject_assignments',
    minRequired: 1,
    color: 'indigo',
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', gradient: 'from-green-500 to-green-600' },
    yellow: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', gradient: 'from-amber-500 to-amber-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', gradient: 'from-indigo-500 to-indigo-600' },
  };
  return colors[color] || colors.blue;
};

export const DashboardPage: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHealth();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadHealth} />;
  if (!health) return null;

  const completedSteps = setupSteps.filter(
    (step) => health.entities[step.entityKey] >= step.minRequired
  ).length;
  const progressPercent = (completedSteps / setupSteps.length) * 100;
  const isReadyToGenerate = completedSteps >= 4;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">¡Bienvenido a HorarioCentros!</h2>
            <p className="text-blue-100 text-lg max-w-xl">
              Sistema inteligente de generación automática de horarios escolares.
              Sigue los pasos para configurar tu centro.
            </p>
          </div>
          <div className="text-6xl opacity-20">📅</div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-100">Progreso de configuración</span>
            <span className="text-sm font-bold">{completedSteps} de {setupSteps.length} pasos</span>
          </div>
          <div className="h-3 bg-blue-900/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Estado del sistema</p>
              <div className="flex items-center">
                <div className={`h-2.5 w-2.5 rounded-full ${health.database_connected ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
                <span className="font-semibold text-gray-800">
                  {health.database_connected ? 'Operativo' : 'Desconectado'}
                </span>
              </div>
            </div>
            <div className="text-3xl opacity-50">🔌</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Versión</p>
              <span className="font-semibold text-gray-800">v{health.version}</span>
            </div>
            <div className="text-3xl opacity-50">📦</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total elementos</p>
              <span className="font-semibold text-gray-800">
                {Object.values(health.entities).reduce((a, b) => a + b, 0)}
              </span>
            </div>
            <div className="text-3xl opacity-50">📊</div>
          </div>
        </div>
      </div>

      {/* Setup Steps */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Configuración del Centro</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {setupSteps.map((step, index) => {
            const count = health.entities[step.entityKey];
            const isCompleted = count >= step.minRequired;
            const colors = getColorClasses(step.color);

            return (
              <Link
                key={step.id}
                to={step.path}
                className={`group relative bg-white rounded-xl p-5 border-2 transition-all duration-300 hover:shadow-lg ${
                  isCompleted ? 'border-green-200 hover:border-green-400' : `${colors.border}`
                }`}
              >
                {/* Step Number */}
                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                  isCompleted
                    ? 'bg-gradient-to-br from-green-400 to-green-500 text-white'
                    : `bg-gradient-to-br ${colors.gradient} text-white`
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-3xl mb-3">{step.icon}</div>
                    <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  
                  <div className={`text-right ${isCompleted ? 'text-green-600' : colors.text}`}>
                    <span className="text-2xl font-bold">{count}</span>
                    <p className="text-xs opacity-70">registrados</p>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className={`mt-4 h-1.5 rounded-full ${isCompleted ? 'bg-green-100' : colors.bg}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-green-500' : `bg-gradient-to-r ${colors.gradient}`
                    }`}
                    style={{ width: isCompleted ? '100%' : count > 0 ? '50%' : '0%' }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Generate Timetable CTA */}
      <div className={`rounded-2xl p-8 ${
        isReadyToGenerate
          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
          : 'bg-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className={isReadyToGenerate ? 'text-white' : 'text-gray-600'}>
            <h3 className="text-2xl font-bold mb-2">
              {isReadyToGenerate ? '¡Todo listo para generar!' : 'Completa la configuración'}
            </h3>
            <p className={isReadyToGenerate ? 'text-green-100' : 'text-gray-500'}>
              {isReadyToGenerate
                ? 'Ya tienes todos los datos necesarios para generar el horario automáticamente.'
                : 'Necesitas completar al menos los profesores, asignaturas, grupos y aulas.'}
            </p>
          </div>
          
          <Link
            to="/timetable"
            className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
              isReadyToGenerate
                ? 'bg-white text-green-600 hover:bg-green-50 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            onClick={(e) => !isReadyToGenerate && e.preventDefault()}
          >
            <span className="text-xl mr-2">🎯</span>
            Generar Horario
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-3xl mb-2">👨‍🏫</div>
          <div className="text-2xl font-bold text-gray-800">{health.entities.teachers}</div>
          <div className="text-sm text-gray-500">Profesores</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-3xl mb-2">📚</div>
          <div className="text-2xl font-bold text-gray-800">{health.entities.subjects}</div>
          <div className="text-sm text-gray-500">Asignaturas</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-gray-800">{health.entities.groups}</div>
          <div className="text-sm text-gray-500">Grupos</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-3xl mb-2">🚪</div>
          <div className="text-2xl font-bold text-gray-800">{health.entities.rooms}</div>
          <div className="text-sm text-gray-500">Aulas</div>
        </div>
      </div>
    </div>
  );
};
