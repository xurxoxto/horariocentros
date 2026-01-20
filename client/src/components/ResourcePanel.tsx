import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Users, Book, DoorOpen, Search, ChevronDown, ChevronRight } from 'lucide-react';

interface ResourceItem {
  id: string;
  name: string;
  type: 'teacher' | 'class' | 'room' | 'subject';
  metadata?: any;
}

interface ResourcePanelProps {
  teachers?: ResourceItem[];
  classes?: ResourceItem[];
  rooms?: ResourceItem[];
  subjects?: ResourceItem[];
  onResourceSelect?: (resource: ResourceItem) => void;
}

const DraggableResource: React.FC<{ resource: ResourceItem }> = ({ resource }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'RESOURCE',
    item: resource,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getIcon = () => {
    switch (resource.type) {
      case 'teacher':
        return <Users className="w-4 h-4" />;
      case 'class':
        return <Users className="w-4 h-4" />;
      case 'room':
        return <DoorOpen className="w-4 h-4" />;
      case 'subject':
        return <Book className="w-4 h-4" />;
    }
  };

  const getColor = () => {
    switch (resource.type) {
      case 'teacher':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'class':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'room':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'subject':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
    }
  };

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 p-2 rounded-md cursor-move hover:shadow-md transition-all ${getColor()} ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {getIcon()}
      <span className="text-sm font-medium truncate">{resource.name}</span>
    </div>
  );
};

const ResourceSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  resources: ResourceItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
}> = ({ title, icon, resources, searchValue, onSearchChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredResources = resources.filter((r) =>
    r.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {title} ({filteredResources.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          <div className="relative px-2">
            <Search className="absolute left-4 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          <div className="px-2 space-y-1 max-h-48 overflow-y-auto">
            {filteredResources.length === 0 ? (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                No {title.toLowerCase()} found
              </div>
            ) : (
              filteredResources.map((resource) => (
                <DraggableResource key={resource.id} resource={resource} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ResourcePanel: React.FC<ResourcePanelProps> = ({
  teachers = [],
  classes = [],
  rooms = [],
  subjects = [],
  onResourceSelect: _onResourceSelect,
}) => {
  const [teacherSearch, setTeacherSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-full overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Resources</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Drag resources to the timetable
        </p>
      </div>

      <div className="space-y-3">
        <ResourceSection
          title="Teachers"
          icon={<Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          resources={teachers}
          searchValue={teacherSearch}
          onSearchChange={setTeacherSearch}
        />

        <ResourceSection
          title="Classes"
          icon={<Users className="w-4 h-4 text-green-600 dark:text-green-400" />}
          resources={classes}
          searchValue={classSearch}
          onSearchChange={setClassSearch}
        />

        <ResourceSection
          title="Rooms"
          icon={<DoorOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
          resources={rooms}
          searchValue={roomSearch}
          onSearchChange={setRoomSearch}
        />

        <ResourceSection
          title="Subjects"
          icon={<Book className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
          resources={subjects}
          searchValue={subjectSearch}
          onSearchChange={setSubjectSearch}
        />
      </div>
    </div>
  );
};
