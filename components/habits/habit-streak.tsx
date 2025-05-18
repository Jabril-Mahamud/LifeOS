// components/habits/habit-streak.tsx
"use client";

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, TrendingUpIcon, AwardIcon, BarChartIcon } from "lucide-react";

type HabitStreakProps = {
  habitId: string;
  habitName: string;
  habitIcon?: string | null;
  habitColor?: string | null;
};

type HabitLogEntry = {
  date: string;
  completed: boolean;
  notes?: string | null;
};

type HabitStats = {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalDays: number;
  completedDays: number;
};

export function HabitStreak({ 
  habitId, 
  habitName, 
  habitIcon = "🎯", 
  habitColor = "#4299e1" // Default blue color as fallback
}: HabitStreakProps) {
  // Ensure habitColor is never null
  const safeColor = habitColor || "#4299e1";
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [habitLogs, setHabitLogs] = useState<HabitLogEntry[]>([]);
  const [stats, setStats] = useState<HabitStats>({
    currentStreak: 0,
    longestStreak: 0,
    completionRate: 0,
    totalDays: 0,
    completedDays: 0
  });
  const [viewMode, setViewMode] = useState<'calendar' | 'streak'>('streak');

  useEffect(() => {
    fetchHabitData();
  }, [habitId]);

  async function fetchHabitData() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/habits/${habitId}/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch habit statistics');
      }
      
      const data = await response.json();
      setHabitLogs(data.dailyLogs || []);
      setStats(data.stats || {
        currentStreak: 0,
        longestStreak: 0,
        completionRate: 0,
        totalDays: 0,
        completedDays: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching habit stats:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="py-4">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Helper function to get intensity color based on streak density
  const getIntensityColor = (streak: number, max: number) => {
    if (streak === 0) return "#f1f5f9"; // light gray for no streak
    
    // Calculate opacity based on streak (50%-100%)
    const opacity = 0.5 + (streak / max) * 0.5;
    
    // Convert hex to rgb for the safe color
    const r = parseInt(safeColor.slice(1, 3), 16);
    const g = parseInt(safeColor.slice(3, 5), 16);
    const b = parseInt(safeColor.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Generate calendar data for the monthly view
  const generateMonthlyCalendar = () => {
    const today = new Date();
    const firstDayOfMonth = startOfMonth(today);
    const lastDayOfMonth = endOfMonth(today);
    
    // Get all days in current month
    const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
    
    // Group by week (starting with Sunday)
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    daysInMonth.forEach(day => {
      if (day.getDay() === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  // Check if a day has a completed habit
  const isDayCompleted = (day: Date) => {
    const dayString = format(day, 'yyyy-MM-dd');
    const logEntry = habitLogs.find(log => log.date === dayString);
    return logEntry?.completed || false;
  };

  const months = generateMonthlyCalendar();

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        <span className="text-2xl">{habitIcon}</span>
        <CardTitle className="text-base">{habitName}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="streak" onValueChange={(value) => setViewMode(value as 'calendar' | 'streak')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="streak" className="flex items-center gap-1.5">
              <TrendingUpIcon className="h-3.5 w-3.5" />
              <span>Streak Stats</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Calendar</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="streak" className="mt-0">
            <div className="space-y-4">
              {/* Streaks Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md">
                  <div className="text-2xl font-bold" style={{ color: safeColor }}>{stats.currentStreak}</div>
                  <div className="text-xs text-gray-500 mt-1">Current Streak</div>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md">
                  <div className="text-2xl font-bold" style={{ color: safeColor }}>{stats.longestStreak}</div>
                  <div className="text-xs text-gray-500 mt-1">Longest Streak</div>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md">
                  <div className="text-2xl font-bold" style={{ color: safeColor }}>{stats.completionRate}%</div>
                  <div className="text-xs text-gray-500 mt-1">Completion Rate</div>
                </div>
              </div>
              
              {/* Streak Visualization */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">Last 30 Days</div>
                  <div className="text-xs text-gray-500">{stats.completedDays}/{stats.totalDays} days</div>
                </div>
                
                <div className="overflow-hidden rounded-md border border-gray-200">
                  <div className="flex overflow-x-auto py-2 px-1">
                    {habitLogs.slice(-30).map((log, index) => {
                      const date = new Date(log.date);
                      const dayLabel = format(date, 'd');
                      const isCurrentDay = isToday(date);
                      
                      return (
                        <div key={index} className="flex flex-col items-center min-w-[30px] px-0.5">
                          <div 
                            className={`w-7 h-7 rounded-full flex items-center justify-center ${
                              log.completed 
                                ? 'text-white' 
                                : 'bg-gray-100 text-gray-400'
                            } ${
                              isCurrentDay 
                                ? 'ring-2 ring-blue-500 ring-offset-1' 
                                : ''
                            }`}
                            style={{ 
                              backgroundColor: log.completed ? safeColor : undefined 
                            }}
                          >
                            {dayLabel}
                          </div>
                          <div className="mt-1">
                            {log.completed ? (
                              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-0">
            <div className="space-y-3">
              <div className="text-sm font-medium mb-1">
                {format(new Date(), 'MMMM yyyy')}
              </div>
              
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 bg-gray-50 border-b">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="h-7 flex items-center justify-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="bg-white">
                  {months.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7">
                      {week.map((day, dayIndex) => {
                        const completed = isDayCompleted(day);
                        const isCurrentDay = isToday(day);
                        
                        return (
                          <div 
                            key={dayIndex}
                            className={`p-1 ${isCurrentDay ? 'bg-blue-50' : ''}`}
                          >
                            <div 
                              className={`w-full aspect-square rounded-full flex items-center justify-center text-xs
                                ${completed ? 'text-white' : 'text-gray-700'}
                                ${isCurrentDay ? 'ring-1 ring-blue-500' : ''}
                              `}
                              style={{ 
                                backgroundColor: completed ? safeColor : undefined
                              }}
                            >
                              {format(day, 'd')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between pt-2 text-xs text-gray-500">
                <div>This Month: {habitLogs.filter(log => log.completed && log.date.startsWith(format(new Date(), 'yyyy-MM'))).length} days completed</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Overall Progress</span>
            <span>{stats.completionRate}% Complete</span>
          </div>
          <Progress value={stats.completionRate} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}