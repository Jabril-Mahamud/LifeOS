"use client";

import { useState, useEffect } from 'react';
import { 
  format, 
  parseISO, 
  eachDayOfInterval, 
  subDays, 
  isSameDay, 
  startOfDay, 
  isFirstDayOfMonth,
  differenceInDays,
  addDays,
  min,
  max
} from 'date-fns';

type StreakEntry = {
  date: string;
  completed: boolean;
};

type StreakCalendarProps = {
  data: StreakEntry[];
  color?: string | null;
  days?: number;
  maxDisplay?: number; // Maximum number of days to display
};

export function StreakCalendar({ 
  data, 
  color = '#4299e1', 
  days = 30,
  maxDisplay = 60  // Default to showing max 60 days
}: StreakCalendarProps) {
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const safeColor = color || '#4299e1';
  
  useEffect(() => {
    if (data.length === 0) {
      // If no data, show default last X days
      const today = startOfDay(new Date());
      const startDate = subDays(today, days - 1);
      const daysArray = eachDayOfInterval({ start: startDate, end: today });
      setCalendarDays(daysArray);
      return;
    }

    // Find the earliest date with tracking data
    const sortedDates = [...data]
      .map(entry => parseISO(entry.date))
      .sort((a, b) => a.getTime() - b.getTime());
    
    const earliestTrackedDate = sortedDates[0];
    const today = startOfDay(new Date());
    
    // Calculate how many days to show
    const totalDaysAvailable = differenceInDays(today, earliestTrackedDate) + 1;
    const daysToShow = Math.min(totalDaysAvailable, maxDisplay);
    
    // If we have more days than we want to display, start from a more recent date
    const startDate = daysToShow < totalDaysAvailable 
      ? subDays(today, daysToShow - 1) 
      : earliestTrackedDate;
    
    const daysArray = eachDayOfInterval({ start: startDate, end: today });
    setCalendarDays(daysArray);
  }, [data, days, maxDisplay]);
  
  const getCompletionForDay = (day: Date): { tracked: boolean; completed: boolean } => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const entry = data.find(item => item.date === dayStr);
    
    if (entry === undefined) {
      return { tracked: false, completed: false };
    }
    
    return { tracked: true, completed: entry.completed };
  };
  
  if (calendarDays.length === 0) {
    return <div className="h-10 bg-gray-50 animate-pulse rounded"></div>;
  }
  
  // Calculate streaks
  let currentStreak = 0;
  for (let i = calendarDays.length - 1; i >= 0; i--) {
    const { tracked, completed } = getCompletionForDay(calendarDays[i]);
    if (tracked && completed) currentStreak++;
    else break;
  }
  
  let longestStreak = 0;
  let tempStreak = 0;
  let streaks: { start: number; length: number }[] = [];
  
  // Calculate all streaks for visualization
  for (let i = 0; i < calendarDays.length; i++) {
    const { tracked, completed } = getCompletionForDay(calendarDays[i]);
    
    if (tracked && completed) {
      if (tempStreak === 0) {
        // Start of a new streak
        streaks.push({ start: i, length: 1 });
      } else {
        // Continue existing streak
        streaks[streaks.length - 1].length++;
      }
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  return (
    <div className="space-y-3">
      {/* Streak Stats with improved styling */}
      <div className="flex justify-between text-xs">
        <div className="flex items-center space-x-2 bg-green-50 px-2 py-1 rounded-md">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span className="text-green-700">Current: <span className="font-medium">{currentStreak}</span></span>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-2 py-1 rounded-md">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <span className="text-blue-700">Best: <span className="font-medium">{longestStreak}</span></span>
        </div>
      </div>
      
      {/* Calendar Grid with improved visualization */}
      <div className="relative pt-1">
        <div className="flex flex-wrap">
          {calendarDays.map((day, index) => {
            const { tracked, completed } = getCompletionForDay(day);
            const isToday = isSameDay(day, new Date());
            const isFirstOfMonth = isFirstDayOfMonth(day);
            
            // Find if this day is part of a streak
            const streakInfo = streaks.find(s => 
              index >= s.start && index < s.start + s.length
            );
            
            // Apply special styling for streak days
            const isStreakStart = streakInfo && index === streakInfo.start;
            const isStreakEnd = streakInfo && index === streakInfo.start + streakInfo.length - 1;
            const isStreakMiddle = streakInfo && !isStreakStart && !isStreakEnd;
            
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
                    ${completed 
                      ? 'bg-opacity-90 hover:bg-opacity-100' 
                      : tracked ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 hover:bg-gray-100 text-gray-300'
                    }
                  `}
                  style={{ 
                    backgroundColor: completed ? safeColor : undefined,
                    color: completed ? 'white' : tracked ? '#64748b' : '#94a3b8',
                    // Connect streak days with a line
                    borderTopLeftRadius: isStreakStart ? '4px' : isStreakMiddle ? '0px' : undefined,
                    borderBottomLeftRadius: isStreakStart ? '4px' : isStreakMiddle ? '0px' : undefined,
                    borderTopRightRadius: isStreakEnd ? '4px' : isStreakMiddle ? '0px' : undefined,
                    borderBottomRightRadius: isStreakEnd ? '4px' : isStreakMiddle ? '0px' : undefined,
                    boxShadow: streakInfo ? `0 0 0 1px ${safeColor}40` : undefined,
                  }}
                >
                  {format(day, 'd')}
                  
                  {/* Improved Tooltip */}
                  <div className="absolute z-10 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap">
                    <div className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-sm">
                      {format(day, 'E, MMM d')}: {
                        !tracked ? 'Not tracked' :
                        completed ? 'Completed ✓' : 'Missed ✗'
                      }
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center items-center mt-2 text-xs text-gray-500 gap-2">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: safeColor }}></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-gray-100 mr-1"></div>
          <span>Missed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-gray-50 mr-1"></div>
          <span>Not tracked</span>
        </div>
      </div>
    </div>
  );
}