"use client";

import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, parseISO, startOfMonth, endOfMonth, isEqual, isSameDay } from 'date-fns';

type HabitStreakProps = {
  habitId: string;
  habitName: string;
  habitIcon?: string | null;
  habitColor?: string | null;
};

type HabitLogEntry = {
  date: string;
  completed: boolean;
};

export function HabitStreak({ habitId, habitName, habitIcon, habitColor = "#4299e1" }: HabitStreakProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [habitLogs, setHabitLogs] = useState<HabitLogEntry[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  
  // For the activity grid
  const [firstDayOfMonth, setFirstDayOfMonth] = useState<Date>(startOfMonth(new Date()));
  const [lastDayOfMonth, setLastDayOfMonth] = useState<Date>(endOfMonth(new Date()));
  const [daySquares, setDaySquares] = useState<{date: Date, active: boolean, completed: boolean}[]>([]);

  useEffect(() => {
    fetchHabitLogs();
  }, [habitId]);

  useEffect(() => {
    if (habitLogs.length > 0) {
      calculateStreaks();
      generateActivityGrid();
    }
  }, [habitLogs]);

  async function fetchHabitLogs() {
    // This would be a real API endpoint in a production app
    // For now, let's generate some mock data
    setIsLoading(true);
    
    try {
      // In a real app, you would fetch the data from an API:
      // const response = await fetch(`/api/habits/${habitId}/logs`);
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.error || 'Failed to fetch habit logs');
      // setHabitLogs(data.logs);
      
      // For now, let's generate some mock data for the last 30 days
      const mockLogs: HabitLogEntry[] = [];
      const today = new Date();
      
      for (let i = 30; i >= 0; i--) {
        const date = addDays(today, -i);
        // Randomly determine if the habit was completed on this day (more likely to be completed on recent days)
        const completed = Math.random() < (0.5 + (30 - i) * 0.01);
        mockLogs.push({
          date: date.toISOString(),
          completed
        });
      }
      
      setHabitLogs(mockLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching habit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function calculateStreaks() {
    // Sort logs by date (oldest first)
    const sortedLogs = [...habitLogs].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let currentStreakCount = 0;
    let maxStreakCount = 0;
    let completedCount = 0;
    
    // Calculate current streak (consecutive days up to today)
    for (let i = sortedLogs.length - 1; i >= 0; i--) {
      const log = sortedLogs[i];
      
      if (log.completed) {
        currentStreakCount++;
        completedCount++;
      } else {
        break; // Current streak broken
      }
    }
    
    // Calculate longest streak
    let tempStreak = 0;
    sortedLogs.forEach(log => {
      if (log.completed) {
        tempStreak++;
        maxStreakCount = Math.max(maxStreakCount, tempStreak);
      } else {
        tempStreak = 0;
      }
    });
    
    setCurrentStreak(currentStreakCount);
    setLongestStreak(maxStreakCount);
    setCompletionRate(Math.round((completedCount / sortedLogs.length) * 100));
  }

  function generateActivityGrid() {
    const firstDay = startOfMonth(new Date());
    const lastDay = endOfMonth(new Date());
    setFirstDayOfMonth(firstDay);
    setLastDayOfMonth(lastDay);
    
    const days = [];
    let currentDay = firstDay;
    
    while (currentDay <= lastDay) {
      const active = currentDay <= new Date();
      
      // Check if there's a log entry for this day
      const logEntry = habitLogs.find(log => {
        const logDate = parseISO(log.date);
        return isSameDay(logDate, currentDay);
      });
      
      days.push({
        date: new Date(currentDay),
        active,
        completed: logEntry?.completed || false
      });
      
      currentDay = addDays(currentDay, 1);
    }
    
    setDaySquares(days);
  }

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-200 rounded-md"></div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  // Make sure habitColor is a string
  const colorValue = typeof habitColor === 'string' ? habitColor : "#4299e1";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-2">{habitIcon}</span>
        <h3 className="text-lg font-medium">{habitName}</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-md">
          <div className="text-2xl font-bold" style={{ color: colorValue }}>
            {currentStreak}
          </div>
          <div className="text-xs text-gray-500">Current Streak</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-md">
          <div className="text-2xl font-bold" style={{ color: colorValue }}>
            {longestStreak}
          </div>
          <div className="text-xs text-gray-500">Longest Streak</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-md">
          <div className="text-2xl font-bold" style={{ color: colorValue }}>
            {completionRate}%
          </div>
          <div className="text-xs text-gray-500">Completion Rate</div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">
          {format(firstDayOfMonth, 'MMMM yyyy')} Activity
        </h4>
        <div className="grid grid-cols-7 gap-1">
          {Array(7).fill(0).map((_, i) => (
            <div key={`header-${i}`} className="h-6 flex justify-center items-center">
              <span className="text-xs text-gray-500">{format(addDays(startOfWeek(new Date()), i), 'EEEEE')}</span>
            </div>
          ))}
          
          {/* Fill in empty cells for days before first day of month */}
          {Array(firstDayOfMonth.getDay()).fill(0).map((_, i) => (
            <div key={`empty-start-${i}`} className="h-6"></div>
          ))}
          
          {daySquares.map((square, i) => (
            <div 
              key={`day-${i}`}
              className={`h-6 w-6 rounded-sm flex justify-center items-center ${
                !square.active 
                  ? 'bg-gray-100' 
                  : square.completed
                    ? ''
                    : 'bg-gray-200'
              }`}
              style={{ backgroundColor: square.completed ? colorValue : undefined }}
            >
              <span className={`text-xs ${square.completed ? 'text-white' : 'text-gray-700'}`}>
                {format(square.date, 'd')}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <div>Less</div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-sm bg-gray-200 mr-1"></div>
          <div className="h-3 w-3 rounded-sm mr-1" style={{ backgroundColor: `${colorValue}33` }}></div>
          <div className="h-3 w-3 rounded-sm mr-1" style={{ backgroundColor: `${colorValue}66` }}></div>
          <div className="h-3 w-3 rounded-sm mr-1" style={{ backgroundColor: `${colorValue}99` }}></div>
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: colorValue }}></div>
        </div>
        <div>More</div>
      </div>
    </div>
  );
}