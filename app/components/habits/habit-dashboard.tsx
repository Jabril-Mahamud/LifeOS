"use client";

import { useState, useEffect } from 'react';
import { HabitStreak } from './habit-streak';

type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
};

export function HabitDashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);

  useEffect(() => {
    fetchHabits();
  }, []);

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
      
      // Set the first habit as selected by default
      if (activeHabits.length > 0 && !selectedHabit) {
        setSelectedHabit(activeHabits[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching habits:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-200 rounded-md"></div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (habits.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-gray-600 mb-4">You haven't created any active habits yet.</p>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-blue-600 hover:text-blue-800"
        >
          Use the form above to create your first habit
        </button>
      </div>
    );
  }

  const selectedHabitData = habits.find(h => h.id === selectedHabit);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Habit Progress</h2>
      
      <div className="mb-6">
        <label htmlFor="habitSelect" className="block text-sm font-medium text-gray-700 mb-2">
          Select Habit
        </label>
        <select
          id="habitSelect"
          value={selectedHabit || ''}
          onChange={(e) => setSelectedHabit(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          {habits.map(habit => (
            <option key={habit.id} value={habit.id}>
              {habit.icon} {habit.name}
            </option>
          ))}
        </select>
      </div>
      
      {selectedHabitData && (
        <HabitStreak
          habitId={selectedHabitData.id}
          habitName={selectedHabitData.name}
          habitIcon={selectedHabitData.icon}
          habitColor={selectedHabitData.color}
        />
      )}
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Tips for Success</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">🎯</span>
            <span>Consistency is key - aim to complete your habits at the same time each day.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">⏱️</span>
            <span>Start with small, achievable habits to build momentum.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📈</span>
            <span>Track your progress and celebrate your streaks!</span>
          </li>
        </ul>
      </div>
    </div>
  );
}