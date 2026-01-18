import React from 'react';
import { useDrag } from 'react-dnd';

interface TimetableSlotProps {
  id: string;
  subject?: string;
  teacher?: string;
  room?: string;
  color?: string;
  onEdit?: () => void;
}

export const TimetableSlot: React.FC<TimetableSlotProps> = ({
  id,
  subject,
  teacher,
  room,
  color = '#3b82f6',
  onEdit,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SLOT',
    item: { id, subject, teacher, room },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  if (!subject) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        Empty
      </div>
    );
  }

  return (
    <div
      ref={drag}
      onClick={onEdit}
      className={`h-full p-2 rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      style={{ backgroundColor: color }}
    >
      <div className="text-white text-sm font-semibold truncate">{subject}</div>
      {teacher && <div className="text-white text-xs truncate">{teacher}</div>}
      {room && <div className="text-white text-xs truncate">Room: {room}</div>}
    </div>
  );
};
