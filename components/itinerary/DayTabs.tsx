'use client';

import { useState } from 'react';

interface Day {
  id: number;
  dayNumber: number;
  title: string;
}

interface DayTabsProps {
  days: Day[];
  currentDay: number;
  onDayChange: (dayNumber: number) => void;
  onAddDay?: () => void;
  onRemoveDay?: (dayNumber: number) => void;
  showControls?: boolean;
}

export default function DayTabs({
  days,
  currentDay,
  onDayChange,
  onAddDay,
  onRemoveDay,
  showControls = true,
}: DayTabsProps) {
  const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {/* Day Tabs */}
        {sortedDays.map((day) => (
          <button
            key={day.id}
            onClick={() => onDayChange(day.dayNumber)}
            className={`
              px-6 py-3 font-medium whitespace-nowrap transition-all
              border-b-2 relative group
              ${
                currentDay === day.dayNumber
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span>Day {day.dayNumber}</span>

              {/* Remove button (show on hover for non-active tabs) */}
              {showControls && onRemoveDay && days.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveDay(day.dayNumber);
                  }}
                  className={`
                    ml-1 text-red-500 hover:text-red-700 transition-opacity
                    ${currentDay === day.dayNumber ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}
                  title="Remove day"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </button>
        ))}

        {/* Add Day Button */}
        {showControls && onAddDay && (
          <button
            onClick={onAddDay}
            className="px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Add Day</span>
          </button>
        )}
      </div>
    </div>
  );
}
