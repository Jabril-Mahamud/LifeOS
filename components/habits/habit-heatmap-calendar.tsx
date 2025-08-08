import React, { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  subMonths,
  addMonths,
  isToday,
  startOfWeek,
  endOfWeek,
  differenceInCalendarDays,
  addDays
} from "date-fns";
import { CheckCircle2, ChevronLeft, ChevronRight, Award, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DashboardHabit } from "@/lib/types";


interface HeatmapCalendarProps {
  habits: DashboardHabit[];
  title?: string;
  className?: string;
}

export function HabitHeatmapCalendar({ 
  habits, 
  title = "Habit Consistency",
  className 
}: HeatmapCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHabit, setSelectedHabit] = useState<string | "all">("all");

  // Navigate to previous/next month
  const prevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const nextMonth = () => {
    const nextDate = addMonths(selectedDate, 1);
    if (nextDate <= new Date()) {
      setSelectedDate(nextDate);
    }
  };

  // Get all habits with streak data
  const habitsWithData = habits.filter(habit => 
    habit.streakData && habit.streakData.length > 0
  );

  // Check if there's no data available
  if (habitsWithData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>Track your habit consistency over time</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No habit tracking data available yet</p>
            <p className="text-sm mt-1">Complete habits daily to see your patterns</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get days for the calendar view
  const getDaysForDisplay = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    
    // Get the days of the month
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get the first day of the calendar grid (might be in previous month)
    const firstCalendarDay = startOfWeek(monthStart);
    const lastCalendarDay = endOfWeek(monthEnd);
    
    // Create a full calendar grid
    return eachDayOfInterval({ start: firstCalendarDay, end: lastCalendarDay });
  };

  // Get the completion status for a date and habit
  const getCompletionStatus = (date: Date, habitId?: string) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    
    // If checking a specific habit
    if (habitId) {
      const habit = habitsWithData.find(h => h.id === habitId);
      if (!habit?.streakData) return false;
      
      const entry = habit.streakData.find(d => d.date === formattedDate);
      return entry?.completed || false;
    }
    
    // If checking overall (any habit completed)
    const anyCompleted = habitsWithData.some(habit => {
      const entry = habit.streakData?.find(d => d.date === formattedDate);
      return entry?.completed;
    });
    
    return anyCompleted;
  };

  // Get completion count for a date (how many habits completed)
  const getCompletionCount = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    
    return habitsWithData.reduce((count, habit) => {
      const entry = habit.streakData?.find(d => d.date === formattedDate);
      return count + (entry?.completed ? 1 : 0);
    }, 0);
  };

  // Get completion percentage for a date
  const getCompletionPercentage = (date: Date) => {
    const completedCount = getCompletionCount(date);
    return habitsWithData.length > 0 
      ? Math.round((completedCount / habitsWithData.length) * 100)
      : 0;
  };

  // Calculate the intensity level for a date (0-4)
  const getIntensityLevel = (date: Date) => {
    if (selectedHabit === "all") {
      const percentage = getCompletionPercentage(date);
      if (percentage === 0) return 0;
      if (percentage <= 25) return 1;
      if (percentage <= 50) return 2;
      if (percentage <= 75) return 3;
      return 4;
    } else {
      return getCompletionStatus(date, selectedHabit) ? 4 : 0;
    }
  };
  
  // Get color for cell based on intensity and selected habit
  const getCellColor = (date: Date) => {
    const intensity = getIntensityLevel(date);
    if (intensity === 0) return "bg-transparent border";
    
    // If a specific habit is selected, use its color
    if (selectedHabit !== "all") {
      const habit = habitsWithData.find(h => h.id === selectedHabit);
      if (habit?.color) {
        // Create opacity levels for the habit color
        return { 
          backgroundColor: habit.color || 'hsl(var(--primary))',
                color: 'white',
          opacity: 0.25 + (intensity * 0.2) // 0.25, 0.45, 0.65, 0.85
        };
      }
    }
    
    // Default intensity classes with built-in Tailwind colors
    const intensityClasses = [
      "bg-transparent border",
      "bg-green-100 dark:bg-green-900/30",
      "bg-green-200 dark:bg-green-800/40",
      "bg-green-300 dark:bg-green-700/60",
      "bg-green-500 dark:bg-green-600/80"
    ];
    
    return intensityClasses[intensity];
  };

  // Get streak information for a habit
  const getStreakInfo = (habitId: string) => {
    const habit = habitsWithData.find(h => h.id === habitId);
    return {
      current: habit?.streak || 0,
      completion: habit?.completionRate || 0
    };
  };

  // Calculate current overall streak
  const calculateOverallStreak = () => {
    let currentDay = new Date();
    let streakCount = 0;
    
    // Count backwards from today
    while (getCompletionCount(currentDay) > 0) {
      streakCount++;
      currentDay = addDays(currentDay, -1);
    }
    
    return streakCount;
  };

  // Calendar days
  const calendarDays = getDaysForDisplay();
  const overallStreak = calculateOverallStreak();
  
  // Calculate overall completion rate
  const calculateOverallCompletionRate = () => {
    const totalPossibleEntries = habitsWithData.length * 30; // Last 30 days
    let totalCompletedEntries = 0;
    
    // Count back 30 days
    for (let i = 0; i < 30; i++) {
      const date = addDays(new Date(), -i);
      totalCompletedEntries += getCompletionCount(date);
    }
    
    return totalPossibleEntries > 0 
      ? Math.round((totalCompletedEntries / totalPossibleEntries) * 100)
      : 0;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>Track your habit consistency over time</CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium w-28 text-center">
              {format(selectedDate, "MMMM yyyy")}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextMonth}
              disabled={isSameMonth(selectedDate, new Date())}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Habit Selector */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedHabit === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedHabit("all")}
          >
            All Habits
          </Button>
          
          {habitsWithData.map(habit => (
            <Button
              key={habit.id}
              variant={selectedHabit === habit.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedHabit(habit.id)}
              style={selectedHabit === habit.id && habit.color ? 
                { backgroundColor: habit.color || 'hsl(var(--primary))',
                color: 'white', borderColor: habit.color } : 
                {}
              }
            >
              {habit.icon && <span className="mr-1">{habit.icon}</span>}
              {habit.name}
            </Button>
          ))}
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-muted/40">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Current Streak</div>
              <div className="flex items-center text-lg font-semibold">
                <Award className="h-4 w-4 mr-1 text-amber-500" />
                {selectedHabit === "all" ? overallStreak : getStreakInfo(selectedHabit).current} days
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/40">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Completion Rate</div>
              <div className="flex items-center text-lg font-semibold">
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                {selectedHabit === "all" 
                  ? calculateOverallCompletionRate() 
                  : getStreakInfo(selectedHabit).completion}%
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/40">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Total Tracked</div>
              <div className="flex items-center text-lg font-semibold">
                <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                {selectedHabit === "all" 
                  ? habitsWithData.reduce((max, habit) => 
                      Math.max(max, habit.streakData?.length || 0), 0)
                  : habitsWithData.find(h => h.id === selectedHabit)?.streakData?.length || 0} days
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/40">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Active Habits</div>
              <div className="flex items-center text-lg font-semibold">
                <Badge className="mr-1 h-5 bg-blue-500">{habitsWithData.length}</Badge>
                Habits
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Calendar Heatmap */}
        <div className="rounded-md overflow-hidden border">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-muted/50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="py-2 text-xs font-medium text-center">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-muted/20">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, selectedDate);
              const dayHasData = selectedHabit === "all" 
                ? getCompletionCount(day) > 0
                : getCompletionStatus(day, selectedHabit);
              
              // Get color or class based on intensity
              const colorStyle = getCellColor(day);
              
              return (
                <div 
                  key={index}
                  className={cn(
                    "aspect-square min-h-12 flex flex-col items-center justify-center relative p-1",
                    isCurrentMonth ? "opacity-100" : "opacity-30",
                    isToday(day) ? "ring-2 ring-primary ring-inset" : "",
                    typeof colorStyle === "string" ? colorStyle : ""
                  )}
                  style={typeof colorStyle !== "string" ? colorStyle : {}}
                >
                  <div className="text-xs font-medium">
                    {format(day, "d")}
                  </div>
                  
                  {isCurrentMonth && dayHasData && (
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {selectedHabit === "all" ? (
                        <span>{getCompletionCount(day)}/{habitsWithData.length}</span>
                      ) : dayHasData ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-transparent border rounded-sm"></div>
            <span>None</span>
          </div>
          
          {[1, 2, 3, 4].map(level => (
            <div key={level} className="flex items-center gap-1">
              <div 
                className={cn(
                  "w-3 h-3 rounded-sm",
                  selectedHabit !== "all" ? "" :
                  [
                    "bg-green-100 dark:bg-green-900/30",
                    "bg-green-200 dark:bg-green-800/40",
                    "bg-green-300 dark:bg-green-700/60",
                    "bg-green-500 dark:bg-green-600/80"
                  ][level-1]
                )}
                style={
                  selectedHabit !== "all" 
                    ? {
                        backgroundColor: habitsWithData.find(h => h.id === selectedHabit)?.color || '#10b981',
                        opacity: 0.25 + (level * 0.2)
                      }
                    : {}
                }
              ></div>
              <span>
                {selectedHabit === "all" 
                  ? `${level * 25}%` 
                  : level === 4 ? "Done" : ""}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}