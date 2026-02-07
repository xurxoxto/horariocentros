import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

interface NavSection {
  title: string;
  icon: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: 'Datos Base',
    icon: '🏫',
    items: [
      { name: 'Profesores', path: '/teachers', icon: '👨‍🏫' },
      { name: 'Asignaturas', path: '/subjects', icon: '📚' },
      { name: 'Grupos', path: '/groups', icon: '👥' },
      { name: 'Aulas', path: '/rooms', icon: '🚪' },
    ],
  },
  {
    title: 'Configuración',
    icon: '⚙️',
    items: [
      { name: 'Asignaciones', path: '/assignments', icon: '📋' },
      { name: 'Restricciones', path: '/constraints', icon: '🚫' },
    ],
  },
  {
    title: 'Horarios',
    icon: '📅',
    items: [
      { name: 'Generar', path: '/timetable', icon: '🎯' },
      { name: 'Reportes', path: '/reports', icon: '📊' },
    ],
  },
  {
    title: 'Integracións',
    icon: '🔗',
    items: [
      { name: 'XADE', path: '/xade', icon: '🏛️' },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(
    navigation.map((section) => section.title)
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isSectionActive = (section: NavSection) =>
    section.items.some((item) => location.pathname === item.path);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-3">
          <span className="text-2xl">📅</span>
          <span className="text-xl font-bold text-gray-800">HorarioCentros</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {/* Dashboard Link */}
        <Link
          to="/"
          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
            location.pathname === '/'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="text-xl mr-3">🏠</span>
          <span className="font-medium">Inicio</span>
        </Link>

        {/* Sections */}
        {navigation.map((section) => (
          <div key={section.title} className="pt-4">
            <button
              onClick={() => toggleSection(section.title)}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm font-semibold uppercase tracking-wider ${
                isSectionActive(section) ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2">{section.icon}</span>
                {section.title}
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${
                  expandedSections.includes(section.title) ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedSections.includes(section.title) && (
              <div className="mt-2 space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">💡</span>
            <span className="font-medium text-gray-800">Consejo</span>
          </div>
          <p className="text-xs text-gray-600">
            Completa primero los datos base antes de configurar asignaciones.
          </p>
        </div>
      </div>
    </aside>
  );
};
