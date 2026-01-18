import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export interface ConflictIndicatorProps {
  conflicts: Array<{
    type: 'hard' | 'soft';
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
  }>;
  warnings?: string[];
  className?: string;
}

export const ConflictIndicator: React.FC<ConflictIndicatorProps> = ({
  conflicts,
  warnings = [],
  className = '',
}) => {
  const hasHardConflicts = conflicts.some((c) => c.type === 'hard');
  const hasSoftConflicts = conflicts.some((c) => c.type === 'soft');
  const hasWarnings = warnings.length > 0;

  if (!hasHardConflicts && !hasSoftConflicts && !hasWarnings) {
    return (
      <div className={`flex items-center gap-1 text-green-600 dark:text-green-400 ${className}`}>
        <CheckCircle className="w-4 h-4" />
        <span className="text-xs">Valid</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {hasHardConflicts && (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-semibold">
            {conflicts.filter((c) => c.type === 'hard').length} Conflicts
          </span>
        </div>
      )}
      {hasSoftConflicts && (
        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs">
            {conflicts.filter((c) => c.type === 'soft').length} Issues
          </span>
        </div>
      )}
      {hasWarnings && (
        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
          <Info className="w-4 h-4" />
          <span className="text-xs">{warnings.length} Warnings</span>
        </div>
      )}
    </div>
  );
};

export interface ConflictTooltipProps {
  conflicts: Array<{
    type: 'hard' | 'soft';
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
  }>;
  warnings?: string[];
}

export const ConflictTooltip: React.FC<ConflictTooltipProps> = ({
  conflicts,
  warnings = [],
}) => {
  if (conflicts.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 min-w-[250px] max-w-[400px]">
      {conflicts.length > 0 && (
        <div className="mb-2">
          <div className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">
            Conflicts:
          </div>
          <ul className="space-y-1">
            {conflicts.map((conflict, idx) => (
              <li
                key={idx}
                className={`text-xs flex items-start gap-2 ${
                  conflict.type === 'hard'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}
              >
                {conflict.type === 'hard' ? (
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                )}
                <span>{conflict.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {warnings.length > 0 && (
        <div>
          <div className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">
            Warnings:
          </div>
          <ul className="space-y-1">
            {warnings.map((warning, idx) => (
              <li
                key={idx}
                className="text-xs flex items-start gap-2 text-yellow-600 dark:text-yellow-400"
              >
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
