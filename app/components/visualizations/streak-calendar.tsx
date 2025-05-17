"use client";

import { useState, useEffect } from 'react';
import { format, parseISO, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

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
  
  useEffect(() => {
    // Generate the last N days
    const today = new Date();
    const startDate = subDays(today, days - 1);
    
    // Get all days in the interval
    const daysArray = eachDayOfInterval({
      start: startDate,
      end: today
    });
    
    setCalendarDays(daysArray);
  }, [days]);
  
  // Get completion status for a day
  const getCompletionForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const entry = data.find(item => item.date === dayStr);
    return entry?.completed || false;
  };
  
  if (calendarDays.length === 0) {
    return <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>;
  }
  
  // Calculate current streak
  let currentStreak = 0;
  for (let i = calendarDays.length - 1; i >= 0; i--) {
    const day = calendarDays[i];
    if (getCompletionForDay(day)) {
      currentStreak++;
    } else {
      break; // Streak broken
    }
  }
  
  // Find longest streak
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
    <div>
      <div className="flex justify-between mb-2">
        <div className="text-sm text-gray-600">
          Current streak: <span className="font-semibold">{currentStreak} days</span>
        </div>
        <div className="text-sm text-gray-600">
          Longest streak: <span className="font-semibold">{longestStreak} days</span>
        </div>
      </div>
      
      <div className="flex overflow-x-auto pb-2">
        <div className="grid grid-flow-col gap-1 auto-cols-min">
          {calendarDays.map((day, index) => {
            const isCompleted = getCompletionForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={index}
                className={`w-8 h-8 flex flex-col items-center justify-center rounded-md text-xs ${
                  isToday ? 'ring-1 ring-gray-400' : ''
                }`}
                style={{ 
                  backgroundColor: isCompleted ? (color || '#4299e1') : '#f1f5f9',
                  color: isCompleted ? 'white' : '#64748b'
                }}
                title={`${format(day, 'MMM d, yyyy')}: ${isCompleted ? 'Completed' : 'Not completed'}`}
              >
                <div className="font-medium">{format(day, 'd')}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}