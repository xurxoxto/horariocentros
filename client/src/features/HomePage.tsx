import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Zap, Globe, Shield, TrendingUp } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Gestión Moderna de Horarios
            <span className="block text-primary-600 dark:text-primary-400">Escolares</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Crea mejores horarios escolares con programación inteligente, colaboración en tiempo real
            e interfaz intuitiva de arrastrar y soltar. Una alternativa moderna a FET.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Comenzar Gratis
            </Link>
            <Link
              to="/login"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-primary-600 dark:hover:border-primary-400 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          ¿Por qué elegir HorarioCentros?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Calendar className="w-10 h-10" />}
            title="Interfaz Arrastrar y Soltar"
            description="Programación visual intuitiva con arrastrar y soltar hace la creación de horarios sin esfuerzo"
          />
          <FeatureCard
            icon={<Users className="w-10 h-10" />}
            title="Colaboración en Tiempo Real"
            description="Múltiples usuarios pueden trabajar en horarios simultáneamente con actualizaciones en vivo"
          />
          <FeatureCard
            icon={<Zap className="w-10 h-10" />}
            title="Programación IA"
            description="Sugerencias inteligentes y resolución automática de conflictos con IA"
          />
          <FeatureCard
            icon={<Globe className="w-10 h-10" />}
            title="Responsive Móvil"
            description="Accede y gestiona horarios desde cualquier dispositivo, en cualquier lugar"
          />
          <FeatureCard
            icon={<Shield className="w-10 h-10" />}
            title="Restricciones Avanzadas"
            description="Sistema de restricciones tipo Xade para requisitos de programación complejos"
          />
          <FeatureCard
            icon={<TrendingUp className="w-10 h-10" />}
            title="Paneles por Rol"
            description="Vistas personalizadas para administradores, profesores y estudiantes"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-primary-600 dark:bg-primary-700 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para transformar tu programación?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Únete a los centros que ya usan HorarioCentros
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors inline-block"
          >
            Comenzar Prueba Gratuita
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
    <div className="text-primary-600 dark:text-primary-400 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);
