"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
};

type HabitLog = {
  id?: string;
  habitId: string;
  completed: boolean;
  notes: string | null;
};

type HabitTrackerProps = {
  habitLogs?: HabitLog[];
  onHabitLogsChange?: (habitLogs: HabitLog[]) => void;
};

export function HabitTracker({ habitLogs = [], onHabitLogsChange }: HabitTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [trackedHabits, setTrackedHabits] = useState<HabitLog[]>(habitLogs);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      
      activeHabits.forEach((habit: Habit) => {
        if (!currentHabitIds.includes(habit.id)) {
          newHabitLogs.push({
            habitId: habit.id,
            completed: false,
            notes: null
          });
        }
      });
      
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
    return <div className="text-center py-2">Loading habits...</div>;
  }

  if (error) {
    return <div className="text-center py-2 text-red-500">{error}</div>;
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 border border-dashed border-gray-200 rounded-md">
        <p className="mb-2">You haven't created any habits yet.</p>
        <Link href="/habits" className="text-blue-500 hover:text-blue-700">
          Go to the Habits page to set up habits
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h3 className="font-medium text-gray-700 mb-2">Track Your Habits</h3>
      <div className="space-y-3">
        {habits.map(habit => {
          const habitLog = trackedHabits.find(log => log.habitId === habit.id);
          if (!habitLog) return null;
          
          return (
            <div 
              key={habit.id} 
              className="p-3 bg-white border border-gray-200 rounded-md"
              style={{ borderLeftWidth: '4px', borderLeftColor: habit.color || '#4299e1' }}
            >
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`habit-${habit.id}`}
                  checked={habitLog.completed}
                  onChange={() => toggleHabit(habit.id)}
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label 
                  htmlFor={`habit-${habit.id}`}
                  className="ml-2 flex items-center"
                >
                  <span className="text-lg mr-2">{habit.icon}</span>
                  <span className={`font-medium ${habitLog.completed ? 'line-through text-gray-500' : ''}`}>
                    {habit.name}
                  </span>
                </label>
              </div>
              
              {habitLog.completed && (
                <div className="ml-7">
                  <textarea
                    placeholder="Add notes (optional)"
                    value={habitLog.notes || ''}
                    onChange={(e) => updateHabitNotes(habit.id, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md"
                    rows={1}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}