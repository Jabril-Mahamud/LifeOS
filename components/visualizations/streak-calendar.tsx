"use client";

import { useState, useEffect } from 'react';
import { format, parseISO, eachDayOfInterval, subDays, isSameDay, startOfDay, isFirstDayOfMonth } from 'date-fns';

type StreakEntry = {
  date: string;
  completed: boolean;
};

type StreakCalendarProps = {
  data: StreakEntry[];
  color?: string | null;
  days?: number;
};

export function StreakCalendar({ data, color = '#4299e1', days = 30 }: StreakCalendarProps) {
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const safeColor = color || '#4299e1';
  
  useEffect(() => {
    const today = startOfDay(new Date());
    const startDate = subDays(today, days - 1);
    const daysArray = eachDayOfInterval({ start: startDate, end: today });
    setCalendarDays(daysArray);
  }, [days]);
  
  const getCompletionForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const entry = data.find(item => item.date === dayStr);
    return entry?.completed || false;
  };
  
  if (calendarDays.length === 0) {
    return <div className="h-10 bg-gray-50 animate-pulse rounded"></div>;
  }
  
  // Calculate streaks
  let currentStreak = 0;
  for (let i = calendarDays.length - 1; i >= 0; i--) {
    if (getCompletionForDay(calendarDays[i])) currentStreak++;
    else break;
  }
  
  let longestStreak = 0;
  let tempStreak = 0;
  for (const day of calendarDays) {
    if (getCompletionForDay(day)) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  return (
    <div className="space-y-3">
      {/* Streak Stats */}
      <div className="flex justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span>Current: <span className="font-medium text-gray-700">{currentStreak}</span></span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <span>Best: <span className="font-medium text-gray-700">{longestStreak}</span></span>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="relative pt-1">
        <div className="flex flex-wrap">
          {calendarDays.map((day, index) => {
            const isCompleted = getCompletionForDay(day);
            const isToday = isSameDay(day, new Date());
            const isFirstOfMonth = isFirstDayOfMonth(day);
            
            return (
              <div key={index} className="relative group">
                {/* Month marker */}
                {isFirstOfMonth && (
                  <div className="absolute -top-4 left-0 text-[10px] font-medium text-gray-400">
                    {format(day, 'MMM')}
                  </div>
                )}
                
                <div
                  className={`
                    m-0.5 w-6 h-6 flex items-center justify-center text-xs
                    rounded-sm transition-all duration-200
                    ${isToday ? 'ring-1 ring-gray-300' : ''}
                    ${isCompleted 
                      ? 'bg-opacity-90 hover:bg-opacity-100' 
                      : 'bg-gray-50 hover:bg-gray-100'
                    }
                  `}
                  style={{ 
                    backgroundColor: isCompleted ? safeColor : undefined,
                    color: isCompleted ? 'white' : '#64748b' 
                  }}
                >
                  {format(day, 'd')}
                  
                  {/* Tooltip */}
                  <div className="absolute z-10 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap">
                    <div className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-sm">
                      {format(day, 'E, MMM d')}: {isCompleted ? 'Done ✓' : 'Missed ✗'}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}