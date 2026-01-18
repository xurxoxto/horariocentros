import React, { useState, useEffect } from 'react';
import { timetableService } from '../services/timetable';
import { TimetableEntry, TimeSlot } from '../types';
import { format, addDays, startOfWeek } from 'date-fns';

const TimetableView: React.FC = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesData, timeSlotsData] = await Promise.all([
        timetableService.getTimetableEntries(),
        timetableService.getTimeSlots(),
      ]);
      setEntries(entriesData);
      setTimeSlots(timeSlotsData);
    } catch (error) {
      console.error('Failed to load timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Weekly Timetable
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Previous Week
          </button>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next Week
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.toISOString()}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    <div>{format(day, 'EEE')}</div>
                    <div className="font-normal">{format(day, 'MMM d')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {timeSlots.map((slot) => (
                <tr key={slot.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div>{slot.startTime}</div>
                    <div className="text-gray-500 dark:text-gray-400">{slot.endTime}</div>
                  </td>
                  {weekDays.map((day, dayIndex) => {
                    const entry = entries.find(
                      (e) => e.timeSlotId === slot.id && e.date === format(day, 'yyyy-MM-dd')
                    );
                    return (
                      <td
                        key={`${slot.id}-${dayIndex}`}
                        className="px-6 py-4 text-sm"
                      >
                        {entry ? (
                          <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded border-l-4 border-indigo-600">
                            <div className="font-medium text-gray-900 dark:text-white">
                              Subject {entry.subjectId}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 text-xs">
                              Room {entry.roomId}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 dark:text-gray-600 text-center">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-indigo-100 dark:bg-indigo-900 border-l-4 border-indigo-600 mr-2"></div>
          <span>Scheduled Class</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 mr-2"></div>
          <span>Free Slot</span>
        </div>
      </div>
    </div>
  );
};

export default TimetableView;
