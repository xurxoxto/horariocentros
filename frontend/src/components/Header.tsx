import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const pageInfo: Record<string, { title: string; description: string; breadcrumb: string[] }> = {
  '/': { title: 'Inicio', description: 'Panel de control y estado del sistema', breadcrumb: [] },
  '/teachers': { title: 'Profesores', description: 'Gestiona el profesorado y sus disponibilidades', breadcrumb: ['Datos Base', 'Profesores'] },
  '/subjects': { title: 'Asignaturas', description: 'Define las materias y sus requisitos', breadcrumb: ['Datos Base', 'Asignaturas'] },
  '/groups': { title: 'Grupos', description: 'Configura los grupos de alumnos', breadcrumb: ['Datos Base', 'Grupos'] },
  '/rooms': { title: 'Aulas', description: 'Administra los espacios disponibles', breadcrumb: ['Datos Base', 'Aulas'] },
  '/assignments': { title: 'Asignaciones', description: 'Vincula profesores, asignaturas y grupos (incluye co-docencia)', breadcrumb: ['Configuración', 'Asignaciones'] },
  '/constraints': { title: 'Restricciones', description: 'Define reglas y limitaciones del horario', breadcrumb: ['Configuración', 'Restricciones'] },
  '/timetable': { title: 'Generar Horario', description: 'Crea y optimiza los horarios automáticamente', breadcrumb: ['Horarios', 'Generar'] },
  '/reports': { title: 'Reportes', description: 'Visualiza y exporta los horarios generados', breadcrumb: ['Horarios', 'Reportes'] },
};

export const Header: React.FC = () => {
  const location = useLocation();
  const info = pageInfo[location.pathname] || { title: 'Página', description: '', breadcrumb: [] };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-8 py-4">
        {/* Breadcrumb */}
        {info.breadcrumb.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              🏠
            </Link>
            {info.breadcrumb.map((crumb, index) => (
              <React.Fragment key={crumb}>
                <span>/</span>
                <span className={index === info.breadcrumb.length - 1 ? 'text-gray-800 font-medium' : ''}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{info.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{info.description}</p>
          </div>
          
          {/* Quick Actions - can be customized per page */}
          <div className="flex items-center space-x-3">
            {location.pathname === '/' && (
              <Link
                to="/timetable"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30"
              >
                <span className="mr-2">🎯</span>
                Generar Horario
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
