"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, AlertCircle, TrendingUp, CheckCircle2, ChevronDown } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, 
  Tooltip, LineChart, Line, CartesianGrid
} from 'recharts';
import { cn } from "@/lib/utils";

type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
};

// Consistent with the type in JournalEntry - id is optional
type HabitLogForm = {
  id?: string;
  habitId: string;
  completed: boolean;
  notes: string | null;
};

type HabitTrackerProps = {
  habitLogs?: HabitLogForm[];
  onHabitLogsChange?: (habitLogs: HabitLogForm[]) => void;
  date?: string; // Add date parameter for past entries
};

export function HabitTracker({ habitLogs = [], onHabitLogsChange, date }: HabitTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [trackedHabits, setTrackedHabits] = useState<HabitLogForm[]>(habitLogs);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);
  
  // Format date for display
  const entryDate = date ? new Date(date) : new Date();
  const formattedDate = format(entryDate, 'MMM d, yyyy');
  const isToday = isSameDay(entryDate, new Date());

  useEffect(() => {
    fetchHabits();
  }, []);

  useEffect(() => {
    // When habitLogs prop changes, update trackedHabits state
    if (habitLogs.length > 0) {
      setTrackedHabits(habitLogs);
    }
  }, [habitLogs]);

  useEffect(() => {
    if (onHabitLogsChange) {
      onHabitLogsChange(trackedHabits);
    }
  }, [trackedHabits, onHabitLogsChange]);

  async function fetchHabits() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/habits');
      
      if (!response.ok) {
        throw new Error('Failed to fetch habits');
      }
      
      const data = await response.json();
      const activeHabits = (data.habits || []).filter((h: Habit) => h.active);
      setHabits(activeHabits);
      
      // Initialize habit logs for any habits that don't have logs yet
      const currentHabitIds = trackedHabits.map(log => log.habitId);
      const newHabitLogs = [...trackedHabits];
      
      // Add any missing habits
      for (const habit of activeHabits) {
        if (!currentHabitIds.includes(habit.id)) {
          newHabitLogs.push({
            habitId: habit.id,
            completed: false,
            notes: null
          });
        }
      }
      
      // Only update tracked habits if we don't have preexisting logs from props
      if (habitLogs.length === 0) {
        setTrackedHabits(newHabitLogs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching habits:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleHabit(habitId: string) {
    setTrackedHabits(trackedHabits.map(log => {
      if (log.habitId === habitId) {
        return { ...log, completed: !log.completed };
      }
      return log;
    }));
  }

  function updateHabitNotes(habitId: string, notes: string) {
    setTrackedHabits(trackedHabits.map(log => {
      if (log.habitId === habitId) {
        return { ...log, notes };
      }
      return log;
    }));
  }

  // Toggle expanded state for a habit
  function toggleExpanded(habitId: string) {
    if (expandedHabit === habitId) {
      setExpandedHabit(null);
    } else {
      setExpandedHabit(habitId);
    }
  }

  // Custom tooltip for habit history chart
  const HabitHistoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
          <p className="font-medium">{data.formattedDate}</p>
          <p className="text-gray-600">
            {data.completed ? 'Completed' : 'Not Completed'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 text-center text-red-500 border-red-200">
        <p>{error}</p>
      </Card>
    );
  }

  if (habits.length === 0) {
    return (
      <Card className="p-6 text-center border-dashed">
        <p className="mb-4 text-gray-500">You haven't created any habits yet.</p>
        <Button asChild variant="outline">
          <Link href="/habits">
            Set Up Your Habits
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="mb-4">
      {!isToday && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <CalendarIcon className="w-4 h-4" />
          <span>Tracking habits for {formattedDate}</span>
        </div>
      )}
      
      <div className="space-y-3">
        {habits.map(habit => {
          const habitLog = trackedHabits.find(log => log.habitId === habit.id);
          if (!habitLog) return null;
          
          const isExpanded = expandedHabit === habit.id;
          const habitColor = habit.color || '#4299e1';
          
          return (
            <Card 
              key={habit.id} 
              className={cn(
                "overflow-hidden transition-shadow duration-200",
                isExpanded ? "shadow-md" : "shadow-sm",
                habitLog.completed ? "bg-white" : "bg-white"
              )}
              style={{ 
                borderLeftWidth: '4px', 
                borderLeftColor: habitColor,
                borderColor: habitLog.completed ? cn(habitColor, "40") : undefined
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-center mb-2 justify-between">
                  <div className="flex items-center">
                    <div className="relative h-5 w-5 mr-2">
                      <Checkbox
                        id={`habit-${habit.id}`}
                        checked={habitLog.completed}
                        onCheckedChange={() => toggleHabit(habit.id)}
                        className={cn(
                          "h-5 w-5",
                          habitLog.completed && "bg-[var(--color)] border-[var(--color)]"
                        )}
                        style={{ "--color": habitColor } as any}
                      />
                      {habitLog.completed && (
                        <div className="absolute inset-0 flex items-center justify-center animation-pulse">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <label 
                      htmlFor={`habit-${habit.id}`}
                      className="flex items-center cursor-pointer"
                    >
                      <span className="text-lg mr-2">{habit.icon}</span>
                      <span className={cn(
                        "font-medium transition-all duration-200",
                        habitLog.completed ? "text-gray-600" : "text-gray-800"
                      )}>
                        {habit.name}
                      </span>
                    </label>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleExpanded(habit.id)}
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded ? "rotate-180" : "rotate-0"
                    )} />
                  </Button>
                </div>
                
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      Notes
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">
                        Add notes about your habit when you mark it as completed.
                      </p>
                    </div>
                  </div>
                )}
                
                {habitLog.completed && (
                  <div className={cn(
                    "pl-7 mt-2 transition-all duration-200",
                    isExpanded ? "mt-3" : ""
                  )}>
                    <Textarea
                      placeholder="Add notes about this habit (optional)"
                      value={habitLog.notes || ''}
                      onChange={(e) => updateHabitNotes(habit.id, e.target.value)}
                      className="w-full text-sm resize-none"
                      rows={2}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Today's Progress</h4>
          <div className="text-sm font-medium">
            {trackedHabits.filter(h => h.completed).length}/{trackedHabits.length} completed
          </div>
        </div>
        
        <div className="h-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[{
                name: 'Habits',
                completed: trackedHabits.filter(h => h.completed).length,
                total: trackedHabits.length
              }]}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" hide />
              <Bar 
                dataKey="total" 
                stackId="a" 
                fill="#E5E7EB" 
                radius={[4, 4, 4, 4]}
              />
              <Bar 
                dataKey="completed" 
                stackId="a" 
                fill="#10B981" 
                radius={[4, 0, 0, 4]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {trackedHabits.some(h => h.completed) ? (
          <p className="text-xs text-gray-600 mt-2">
            Great progress! Keep up the good work.
          </p>
        ) : (
          <p className="text-xs text-gray-600 mt-2">
            Start tracking your habits for today by checking the boxes above.
          </p>
        )}
      </div>
    </div>
  );
}