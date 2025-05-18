// components/habits/habit-tracker.tsx
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon } from "lucide-react";

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
  
  // Format date for display
  const entryDate = date ? new Date(date) : new Date();
  const formattedDate = format(entryDate, 'MMM d, yyyy');
  const isToday = format(entryDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

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
          
          return (
            <Card 
              key={habit.id} 
              className="p-3 overflow-hidden"
              style={{ borderLeftWidth: '4px', borderLeftColor: habit.color || '#4299e1' }}
            >
              <div className="flex items-center mb-2">
                <Checkbox
                  id={`habit-${habit.id}`}
                  checked={habitLog.completed}
                  onCheckedChange={() => toggleHabit(habit.id)}
                  className="h-5 w-5 mr-2"
                />
                <label 
                  htmlFor={`habit-${habit.id}`}
                  className="flex items-center cursor-pointer"
                >
                  <span className="text-lg mr-2">{habit.icon}</span>
                  <span className={`font-medium ${habitLog.completed ? 'line-through text-gray-500' : ''}`}>
                    {habit.name}
                  </span>
                </label>
              </div>
              
              {habitLog.completed && (
                <div className="pl-7">
                  <Textarea
                    placeholder="Add notes (optional)"
                    value={habitLog.notes || ''}
                    onChange={(e) => updateHabitNotes(habit.id, e.target.value)}
                    className="w-full text-sm resize-none"
                    rows={1}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}