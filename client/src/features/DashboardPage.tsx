import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Users, FileText } from 'lucide-react';
import { useAuthStore } from '../store';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Role: <span className="font-semibold capitalize">{user?.role}</span>
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            icon={<Plus className="w-8 h-8" />}
            title="Create Timetable"
            description="Start a new schedule"
            link="/timetables/new"
            color="bg-blue-500"
          />
          <DashboardCard
            icon={<Calendar className="w-8 h-8" />}
            title="View Timetables"
            description="Browse all schedules"
            link="/timetables"
            color="bg-green-500"
          />
          <DashboardCard
            icon={<Users className="w-8 h-8" />}
            title="Manage Teachers"
            description="Teacher assignments"
            link="/teachers"
            color="bg-purple-500"
          />
          <DashboardCard
            icon={<FileText className="w-8 h-8" />}
            title="Export & Reports"
            description="Generate PDFs"
            link="/reports"
            color="bg-orange-500"
          />
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Timetables
          </h2>
          <div className="space-y-4">
            <TimetableItem
              name="Fall 2024 Schedule"
              lastModified="2 hours ago"
              status="active"
            />
            <TimetableItem
              name="Spring 2024 Schedule"
              lastModified="1 day ago"
              status="draft"
            />
            <TimetableItem
              name="Winter 2023 Schedule"
              lastModified="3 days ago"
              status="archived"
            />
          </div>
        </div>

        {/* Stats */}
        {user?.role === 'admin' && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <StatCard title="Total Timetables" value="12" change="+2 this month" />
            <StatCard title="Active Teachers" value="48" change="+3 this month" />
            <StatCard title="Total Classes" value="156" change="+8 this month" />
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  color: string;
}> = ({ icon, title, description, link, color }) => (
  <Link
    to={link}
    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
  >
    <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
  </Link>
);

const TimetableItem: React.FC<{ name: string; lastModified: string; status: string }> = ({
  name,
  lastModified,
  status,
}) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">Modified {lastModified}</p>
    </div>
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        status === 'active'
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : status === 'draft'
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
      }`}
    >
      {status}
    </span>
  </div>
);

const StatCard: React.FC<{ title: string; value: string; change: string }> = ({
  title,
  value,
  change,
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</h3>
    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
    <p className="text-sm text-green-600 dark:text-green-400">{change}</p>
  </div>
);
