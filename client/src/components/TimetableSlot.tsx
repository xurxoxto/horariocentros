import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface TimetableSlotProps {
  id: string;
  subject?: string;
  teacher?: string;
  room?: string;
  color?: string;
  conflicts?: Array<{ type: 'hard' | 'soft'; message: string }>;
  warnings?: string[];
  onEdit?: () => void;
  onDoubleClick?: () => void;
}

export const TimetableSlot: React.FC<TimetableSlotProps> = ({
  id,
  subject,
  teacher,
  room,
  color = '#3b82f6',
  conflicts = [],
  warnings = [],
  onEdit,
  onDoubleClick,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SLOT',
    item: { id, subject, teacher, room },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const hasHardConflicts = conflicts.some((c) => c.type === 'hard');
  const hasSoftConflicts = conflicts.some((c) => c.type === 'soft');
  const hasWarnings = warnings.length > 0;
  const hasIssues = hasHardConflicts || hasSoftConflicts || hasWarnings;

  const getBorderColor = () => {
    if (hasHardConflicts) return 'border-2 border-red-500';
    if (hasSoftConflicts) return 'border-2 border-orange-500';
    if (hasWarnings) return 'border-2 border-yellow-500';
    return 'border-2 border-green-500';
  };

  if (!subject) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        Empty
      </div>
    );
  }

  return (
    <div
      ref={drag}
      onClick={onEdit}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`h-full p-2 rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md relative ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${getBorderColor()}`}
      style={{ backgroundColor: color }}
    >
      {/* Status indicator */}
      <div className="absolute top-1 right-1">
        {hasHardConflicts && <AlertCircle className="w-3 h-3 text-red-200" />}
        {!hasHardConflicts && hasSoftConflicts && <AlertTriangle className="w-3 h-3 text-orange-200" />}
        {!hasIssues && <CheckCircle className="w-3 h-3 text-green-200" />}
      </div>

      <div className="text-white text-sm font-semibold truncate pr-4">{subject}</div>
      {teacher && <div className="text-white text-xs truncate">{teacher}</div>}
      {room && <div className="text-white text-xs truncate">Room: {room}</div>}

      {/* Tooltip */}
      {showTooltip && hasIssues && (
        <div className="absolute z-50 left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 min-w-[200px] max-w-[300px]">
          {conflicts.length > 0 && (
            <div className="mb-1">
              <div className="font-semibold text-xs mb-1 text-gray-900 dark:text-white">
                Conflicts:
              </div>
              <ul className="space-y-0.5">
                {conflicts.map((conflict, idx) => (
                  <li
                    key={idx}
                    className={`text-xs ${
                      conflict.type === 'hard'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    • {conflict.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {warnings.length > 0 && (
            <div>
              <div className="font-semibold text-xs mb-1 text-gray-900 dark:text-white">
                Warnings:
              </div>
              <ul className="space-y-0.5">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="text-xs text-yellow-600 dark:text-yellow-400">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
