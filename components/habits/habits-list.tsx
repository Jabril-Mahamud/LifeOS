// components/habits/habits-list.tsx
"use client";

import { useState, useEffect } from 'react';
import { HabitForm } from './habit-form';
import { HabitItem } from './habit-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
  createdAt: string;
};

export function HabitsList() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeHabits, setActiveHabits] = useState<Habit[]>([]);
  const [inactiveHabits, setInactiveHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchHabits();
  }, []);

  useEffect(() => {
    // Filter habits into active and inactive
    setActiveHabits(habits.filter(habit => habit.active));
    setInactiveHabits(habits.filter(habit => !habit.active));
  }, [habits]);

  async function fetchHabits() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/habits');
      
      if (!response.ok) {
        throw new Error('Failed to fetch habits');
      }
      
      const data = await response.json();
      setHabits(data.habits || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching habits:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleHabitCreated(habit: Habit) {
    setHabits([...habits, habit]);
    setShowAddForm(false);
  }

  function handleHabitUpdated(updatedHabit: Habit) {
    setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
  }

  function handleHabitDeleted(id: string) {
    setHabits(habits.filter(h => h.id !== id));
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading habits...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Journal Habits</CardTitle>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1 bg-card text-white rounded-md text-sm"
          >
            {showAddForm ? 'Cancel' : '+ New Habit'}
          </button>
        </div>
        <CardDescription>
          Create and manage habits to track in your daily journal entries
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <HabitForm onHabitCreated={handleHabitCreated} />
        )}
        
        {activeHabits.length > 0 ? (
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Active Habits</h3>
            {activeHabits.map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onUpdate={handleHabitUpdated}
                onDelete={handleHabitDeleted}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 mb-6">
            <p>You don't have any active habits.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-blue-500 hover:text-blue-700"
            >
              Create your first habit
            </button>
          </div>
        )}
        
        {inactiveHabits.length > 0 && (
          <div>
            <button
              onClick={() => setShowInactive(!showInactive)}
              className="flex items-center text-sm text-gray-600 mb-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 mr-1 transition-transform ${showInactive ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {inactiveHabits.length} Inactive Habits
            </button>
            
            {showInactive && (
              <div className="opacity-75">
                {inactiveHabits.map(habit => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    onUpdate={handleHabitUpdated}
                    onDelete={handleHabitDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Information panel about habits and journaling */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">About Journal Habits</h3>
          <p className="text-sm text-gray-600 mb-3">
            Habits created here will appear in your daily journal entries, allowing you to track your progress consistently. 
            Creating a habit here makes it available for tracking, but you'll check it off each day in your journal.
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">🎯</span>
              <span>Create habits that align with your goals and values</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔄</span>
              <span>Track habits daily in your journal to build consistency</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📊</span>
              <span>Review your habit progress on the dashboard to stay motivated</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}