import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Download, Share2, Users as UsersIcon } from 'lucide-react';
import { TimetableGrid } from '../components/TimetableGrid';
import { socketService } from '../services/socket';
import { useAuthStore } from '../store';

export const TimetablePage: React.FC = () => {
  const { user } = useAuthStore();
  const [slots, setSlots] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  useEffect(() => {
    // Connect to WebSocket
    socketService.connect();

    if (user) {
      socketService.joinTimetable('demo-timetable', user.id, user.name);
    }

    socketService.onActiveUsers((data) => {
      setActiveUsers(data.users);
    });

    socketService.onTimetableChanged((event) => {
      console.log('Timetable updated by:', event.userName);
      // Handle real-time updates
    });

    return () => {
      if (user) {
        socketService.leaveTimetable('demo-timetable', user.id, user.name);
      }
    };
  }, [user]);

  const handleSlotDrop = (day: string, periodId: string, item: any) => {
    const newSlot = {
      id: `slot_${Date.now()}`,
      day,
      periodId,
      subject: item.subject || 'New Subject',
      teacher: item.teacher || 'Teacher',
      room: item.room,
      color: '#3b82f6',
    };

    setSlots([...slots, newSlot]);

    if (user) {
      socketService.emitUpdate('demo-timetable', user.id, user.name, {
        type: 'add',
        slot: newSlot,
      });
    }
  };

  const handleSlotEdit = (slot: any) => {
    console.log('Edit slot:', slot);
    // Open edit modal
  };

  const handleExportPDF = () => {
    window.open('/api/export/pdf/demo-timetable', '_blank');
  };

  const handleExportICal = () => {
    window.open('/api/export/ical/demo-timetable', '_blank');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Fall 2024 Schedule
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Drag and drop to create your timetable
                </p>
              </div>

              <div className="flex items-center gap-4 mt-4 md:mt-0">
                {/* Active users indicator */}
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow">
                  <UsersIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {activeUsers.length} active
                  </span>
                </div>

                {/* Export buttons */}
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg shadow transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </button>

                <button
                  onClick={handleExportICal}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Timetable Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <TimetableGrid
              slots={slots}
              onSlotDrop={handleSlotDrop}
              onSlotEdit={handleSlotEdit}
            />
          </div>

          {/* AI Suggestions Panel */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🤖 AI Scheduling Suggestions
            </h2>
            <div className="space-y-3">
              <SuggestionCard
                suggestion="Math class for Grade 10 works best on Monday at 9:00 AM"
                score={95}
              />
              <SuggestionCard
                suggestion="Avoid scheduling Science lab on Friday afternoons"
                score={88}
              />
              <SuggestionCard
                suggestion="Teacher Maria has 3 consecutive periods on Tuesday - consider balancing"
                score={76}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

const SuggestionCard: React.FC<{ suggestion: string; score: number }> = ({
  suggestion,
  score,
}) => (
  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
    <p className="text-gray-900 dark:text-white flex-1">{suggestion}</p>
    <div className="ml-4">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
        {score}% match
      </span>
    </div>
  </div>
);
