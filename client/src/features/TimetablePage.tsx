import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Download, Share2, Users as UsersIcon, Undo, Redo } from 'lucide-react';
import { TimetableGrid } from '../components/TimetableGrid';
import { ResourcePanel } from '../components/ResourcePanel';
import { ViewSwitcher, ViewType } from '../components/ViewSwitcher';
import { QuickEditModal } from '../components/QuickEditModal';
import { socketService } from '../services/socket';
import { useAuthStore } from '../store';

export const TimetablePage: React.FC = () => {
  const { user } = useAuthStore();
  const [slots, setSlots] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [history, setHistory] = useState<any[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Sample data for resources
  const teachers = [
    { id: 't1', name: 'María González', type: 'teacher' as const },
    { id: 't2', name: 'Juan Pérez', type: 'teacher' as const },
    { id: 't3', name: 'Ana Martínez', type: 'teacher' as const },
  ];

  const classes = [
    { id: 'c1', name: '10A', type: 'class' as const },
    { id: 'c2', name: '10B', type: 'class' as const },
    { id: 'c3', name: '11A', type: 'class' as const },
  ];

  const rooms = [
    { id: 'r1', name: 'Room 101', type: 'room' as const },
    { id: 'r2', name: 'Lab 1', type: 'room' as const },
    { id: 'r3', name: 'Gymnasium', type: 'room' as const },
  ];

  const subjects = [
    { id: 's1', name: 'Mathematics', type: 'subject' as const },
    { id: 's2', name: 'Physics', type: 'subject' as const },
    { id: 's3', name: 'Spanish', type: 'subject' as const },
  ];

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
      if (event.data?.type === 'add' && event.data?.slot) {
        setSlots((prev) => [...prev, event.data.slot]);
        pushToHistory([...slots, event.data.slot]);
      }
    });

    return () => {
      if (user) {
        socketService.leaveTimetable('demo-timetable', user.id, user.name);
      }
    };
  }, [user]);

  const pushToHistory = (newSlots: any[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSlots);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSlots(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSlots(history[historyIndex + 1]);
    }
  };

  const handleSlotDrop = (day: string, periodId: string, item: any) => {
    // Detect conflicts
    const existingSlot = slots.find(
      (s) => s.day === day && s.periodId === periodId
    );

    const conflicts: Array<{ type: 'hard' | 'soft'; message: string }> = [];
    if (existingSlot) {
      conflicts.push({
        type: 'hard',
        message: 'Slot already occupied',
      });
    }

    const newSlot = {
      id: `slot_${Date.now()}`,
      day,
      periodId,
      subject: item.name || item.subject || 'New Subject',
      teacher: item.teacher || teachers[0]?.name || 'Teacher',
      room: item.room,
      color: '#3b82f6',
      conflicts,
      warnings: [],
    };

    const newSlots = [...slots, newSlot];
    setSlots(newSlots);
    pushToHistory(newSlots);

    if (user) {
      socketService.emitUpdate('demo-timetable', user.id, user.name, {
        type: 'add',
        slot: newSlot,
      });
    }
  };

  const handleSlotEdit = (slot: any) => {
    setEditingSlot(slot);
    setShowEditModal(true);
  };

  const handleSaveEdit = (data: any) => {
    const updatedSlots = slots.map((s) =>
      s.id === editingSlot.id ? { ...s, ...data } : s
    );
    setSlots(updatedSlots);
    pushToHistory(updatedSlots);
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
        <div className="flex">
          {/* Left Sidebar - Resource Panel */}
          <div className="w-80 hidden lg:block">
            <div className="sticky top-4 p-4">
              <ResourcePanel
                teachers={teachers}
                classes={classes}
                rooms={rooms}
                subjects={subjects}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Fall 2024 Schedule
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Drag and drop resources to create your timetable
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  {/* Undo/Redo */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUndo}
                      disabled={historyIndex === 0}
                      className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Undo (Cmd+Z)"
                    >
                      <Undo className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={historyIndex === history.length - 1}
                      className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Redo (Cmd+Shift+Z)"
                    >
                      <Redo className="w-4 h-4" />
                    </button>
                  </div>

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

              {/* View Switcher */}
              <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
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
                  suggestion="Math class for Grade 10 works best on Monday at 9:00 AM - No conflicts detected"
                  score={95}
                  type="success"
                />
                <SuggestionCard
                  suggestion="Warning: Teacher María has 4 consecutive periods on Tuesday - Consider adding a break"
                  score={72}
                  type="warning"
                />
                <SuggestionCard
                  suggestion="Lab 1 is available for Physics on Wednesday morning - Good match for practical work"
                  score={88}
                  type="info"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Edit Modal */}
      <QuickEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
        slot={editingSlot}
        teachers={teachers}
        rooms={rooms}
        subjects={subjects}
      />
    </DndProvider>
  );
};

const SuggestionCard: React.FC<{
  suggestion: string;
  score: number;
  type?: 'success' | 'warning' | 'info';
}> = ({ suggestion, score, type = 'info' }) => {
  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100';
    }
  };

  const getBadgeColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'warning':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${getColors()}`}>
      <p className="flex-1">{suggestion}</p>
      <div className="ml-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getBadgeColors()}`}>
          {score}% match
        </span>
      </div>
    </div>
  );
};
