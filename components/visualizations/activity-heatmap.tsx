"use client";

import { useState, useEffect } from 'react';
import { 
  startOfWeek, 
  addDays, 
  addWeeks, 
  format, 
  subWeeks, 
  isSameDay,
  parseISO,
  endOfWeek,
  startOfDay
} from 'date-fns';

type HeatmapEntry = {
  date: string;
  mood: string;
  count: number;
};

type ActivityHeatmapProps = {
  data: HeatmapEntry[];
  numWeeks?: number;
};

export function ActivityHeatmap({ data, numWeeks = 12 }: ActivityHeatmapProps) {
  const [weeks, setWeeks] = useState<Date[][]>([]);
  
  useEffect(() => {
    // Start from current date and go back
    const today = startOfDay(new Date());
    const endDate = today;
    const startDate = subWeeks(today, numWeeks - 1);
    
    // Get the start of the week for the starting date
    const firstDay = startOfWeek(startDate, { weekStartsOn: 0 });
    
    // Generate grid of weeks and days
    const weeksArray: Date[][] = [];
    
    for (let week = 0; week < numWeeks; week++) {
      const weekDays: Date[] = [];
      const currentWeekStart = addWeeks(firstDay, week);
      
      for (let day = 0; day < 7; day++) {
        weekDays.push(addDays(currentWeekStart, day));
      }
      
      weeksArray.push(weekDays);
    }
    
    setWeeks(weeksArray);
  }, [numWeeks]);
  
  // Helper function to get entry for a particular day
  const getEntryForDay = (day: Date) => {
  const dayStr = format(day, 'yyyy-MM-dd');
  return data.find(entry => {
    // Handle if entry.date is already a formatted string or a Date object
    const entryDate = typeof entry.date === 'string' 
      ? entry.date 
      : format(entry.date, 'yyyy-MM-dd');
    return entryDate === dayStr;
  });
};
  
  // Helper function to get color based on mood
  const getMoodColor = (mood: string, intensity: number = 1) => {
    const baseColors: Record<string, string> = {
      'happy': '#4ade80', // Green
      'calm': '#60a5fa', // Blue
      'neutral': '#94a3b8', // Gray
      'anxious': '#fbbf24', // Yellow
      'sad': '#f87171', // Red
      'excited': '#c084fc', // Purple
      'tired': '#a1a1aa', // Gray
    };
    
    const baseColor = baseColors[mood] || baseColors.neutral;
    
    // Return with opacity based on intensity
    return baseColor + (intensity < 1 ? '80' : '');
  };
  
  if (weeks.length === 0) return <div className="h-24 bg-gray-100 animate-pulse rounded-md"></div>;
  
  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col min-w-fit pb-2">
        <div className="flex mb-1 text-xs text-gray-500 justify-end pr-2">
          <div className="w-6"></div>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={day} className="w-5 text-center">
              {i % 2 === 0 ? day[0] : ''}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex h-5 mb-1">
            <div className="w-6 text-xs text-gray-500 pr-1 text-right">
              {weekIndex % 2 === 0 ? format(week[0], 'MMM') : ''}
            </div>
            {week.map((day, dayIndex) => {
              const entry = getEntryForDay(day);
              const hasEntry = Boolean(entry);
              const isToday = isSameDay(day, new Date());
              const isPast = day <= new Date();
              
              return (
                <div 
                  key={dayIndex} 
                  className={`w-5 h-5 mr-1 rounded-sm flex items-center justify-center text-xs ${
                    isToday ? 'ring-1 ring-blue-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: hasEntry && entry ? getMoodColor(entry.mood) : (isPast ? '#f1f5f9' : '#f8fafc'),
                    cursor: hasEntry ? 'pointer' : 'default'
                  }}
                  title={hasEntry && entry 
                    ? `${format(parseISO(entry.date), 'MMM d, yyyy')}: ${entry.mood}` 
                    : format(day, 'MMM d, yyyy')}
                >
                  {isToday && <div className="h-1 w-1 rounded-full bg-blue-500"></div>}
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Legend */}
        <div className="flex justify-end items-center mt-2 text-xs text-gray-500">
          <span className="mr-1">Less</span>
          <div className="w-3 h-3 rounded-sm bg-gray-100 mr-1"></div>
          <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: getMoodColor('neutral', 0.5) }}></div>
          <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: getMoodColor('happy', 0.5) }}></div>
          <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: getMoodColor('happy', 0.8) }}></div>
          <div className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: getMoodColor('happy', 1) }}></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}