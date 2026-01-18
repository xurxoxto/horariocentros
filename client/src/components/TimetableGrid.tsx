import React from 'react';
import { useDrop } from 'react-dnd';
import { TimetableSlot } from './TimetableSlot';

interface TimetableGridProps {
  days?: string[];
  periods?: Array<{ id: string; name: string; startTime: string; endTime: string }>;
  slots?: any[];
  onSlotDrop?: (day: string, periodId: string, item: any) => void;
  onSlotEdit?: (slot: any) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  periods = [
    { id: 'p1', name: 'Period 1', startTime: '08:00', endTime: '09:00' },
    { id: 'p2', name: 'Period 2', startTime: '09:00', endTime: '10:00' },
    { id: 'p3', name: 'Period 3', startTime: '10:00', endTime: '11:00' },
    { id: 'p4', name: 'Period 4', startTime: '11:15', endTime: '12:15' },
    { id: 'p5', name: 'Period 5', startTime: '12:15', endTime: '13:15' },
  ],
  slots = [],
  onSlotDrop,
  onSlotEdit,
}) => {
  const GridCell: React.FC<{ day: string; periodId: string }> = ({ day, periodId }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'SLOT',
      drop: (item: any) => onSlotDrop?.(day, periodId, item),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    const slot = slots.find((s) => s.day === day && s.periodId === periodId);

    return (
      <div
        ref={drop}
        className={`min-h-[80px] border border-gray-300 dark:border-gray-600 p-1 ${
          isOver ? 'bg-primary-100 dark:bg-primary-900' : ''
        }`}
      >
        <TimetableSlot
          id={slot?.id || `${day}-${periodId}`}
          subject={slot?.subject}
          teacher={slot?.teacher}
          room={slot?.room}
          color={slot?.color}
          onEdit={() => slot && onSlotEdit?.(slot)}
        />
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-6 gap-0 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-100 dark:bg-gray-700 p-2 font-semibold text-center border-b border-r border-gray-300 dark:border-gray-600">
            Time
          </div>
          {days.map((day) => (
            <div
              key={day}
              className="bg-gray-100 dark:bg-gray-700 p-2 font-semibold text-center border-b border-r border-gray-300 dark:border-gray-600 last:border-r-0"
            >
              {day}
            </div>
          ))}

          {/* Grid rows */}
          {periods.map((period) => (
            <React.Fragment key={period.id}>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 text-sm border-r border-b border-gray-300 dark:border-gray-600 flex flex-col justify-center">
                <div className="font-semibold">{period.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {period.startTime} - {period.endTime}
                </div>
              </div>
              {days.map((day) => (
                <div
                  key={`${day}-${period.id}`}
                  className="border-r border-b border-gray-300 dark:border-gray-600 last:border-r-0"
                >
                  <GridCell day={day} periodId={period.id} />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
