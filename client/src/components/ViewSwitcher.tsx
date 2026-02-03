import React from 'react';
import { Users, DoorOpen, Book, Calendar } from 'lucide-react';

export type ViewType = 'teacher' | 'class' | 'room' | 'overview';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedFilter?: {
    type: string;
    id: string;
    name: string;
  };
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
  selectedFilter,
}) => {
  const views = [
    { id: 'overview' as ViewType, label: 'Overview', icon: Calendar },
    { id: 'teacher' as ViewType, label: 'By Teacher', icon: Users },
    { id: 'class' as ViewType, label: 'By Class', icon: Users },
    { id: 'room' as ViewType, label: 'By Room', icon: DoorOpen },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
        {views.map((view) => {
          const Icon = view.icon;
          const isActive = currentView === view.id;

          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{view.label}</span>
            </button>
          );
        })}
      </div>

      {selectedFilter && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Book className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-900 dark:text-blue-100">
            Viewing: <span className="font-semibold">{selectedFilter.name}</span>
          </span>
          <button
            onClick={() => {}}
            className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
