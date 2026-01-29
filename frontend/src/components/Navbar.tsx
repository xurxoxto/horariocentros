import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold">
            📅 HorarioCentros
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') ? 'bg-blue-700' : 'hover:bg-blue-500'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/teachers"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/teachers') ? 'bg-blue-700' : 'hover:bg-blue-500'
              }`}
            >
              Profesores
            </Link>
            <Link
              to="/subjects"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/subjects') ? 'bg-blue-700' : 'hover:bg-blue-500'
              }`}
            >
              Asignaturas
            </Link>
            <Link
              to="/groups"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/groups') ? 'bg-blue-700' : 'hover:bg-blue-500'
              }`}
            >
              Grupos
            </Link>
            <Link
              to="/rooms"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/rooms') ? 'bg-blue-700' : 'hover:bg-blue-500'
              }`}
            >
              Aulas
            </Link>
            <Link
              to="/assignments"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/assignments') ? 'bg-blue-700' : 'hover:bg-blue-500'
              }`}
            >
              Asignaciones
            </Link>
            <Link
              to="/codocencia"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/codocencia') ? 'bg-blue-700' : 'hover:bg-blue-500'
              }`}
            >
              Co-docencia
            </Link>
            <Link
              to="/constraints"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/constraints') ? 'bg-blue-700' : 'hover:bg-blue-500'
              }`}
            >
              Restricciones
            </Link>
            <Link
              to="/timetable"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/timetable') ? 'bg-blue-700' : 'hover:bg-blue-500'
              }`}
            >
              Generar Horario
            </Link>
            <Link
              to="/reports"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/reports') ? 'bg-blue-700' : 'hover:bg-blue-500'
              }`}
            >
              Reportes
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
