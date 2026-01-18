import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  CalendarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Active Timetables', value: '3', icon: CalendarIcon, color: 'bg-blue-500' },
    { name: 'Student Groups', value: '24', icon: UserGroupIcon, color: 'bg-green-500' },
    { name: 'Rooms', value: '48', icon: BuildingOfficeIcon, color: 'bg-purple-500' },
    { name: 'Teachers', value: '67', icon: AcademicCapIcon, color: 'bg-orange-500' },
    { name: 'Classes Today', value: '156', icon: ClockIcon, color: 'bg-pink-500' },
    { name: 'Room Utilization', value: '87%', icon: ChartBarIcon, color: 'bg-indigo-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's an overview of your school's timetable system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white dark:bg-gray-800 pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className={`absolute ${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="relative rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Create Timetable
              </p>
            </div>
          </button>

          <button className="relative rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Manage Groups
              </p>
            </div>
          </button>

          <button className="relative rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Add Room
              </p>
            </div>
          </button>

          <button className="relative rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                View Reports
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            <li className="px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900 dark:text-white">
                  Timetable updated for Grade 10A
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
              </div>
            </li>
            <li className="px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900 dark:text-white">
                  New room added: Science Lab 3
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">5 hours ago</p>
              </div>
            </li>
            <li className="px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900 dark:text-white">
                  Teacher preferences updated
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">1 day ago</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
