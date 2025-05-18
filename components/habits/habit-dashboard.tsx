// components/habits/habit-dashboard.tsx
"use client";

import { useState, useEffect } from 'react';
import { HabitStreak } from './habit-streak';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';

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
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (habits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Habits</CardTitle>
          <CardDescription>
            You haven't created any active habits yet
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <p className="text-gray-600 mb-4">
            Create habits to track your progress and build consistency in your daily journal entries.
          </p>
          <Button asChild>
            <Link href="/habits">Create Your First Habit</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const selectedHabitData = habits.find(h => h.id === selectedHabit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit Progress</CardTitle>
        <CardDescription>View your streaks and consistency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="habitSelect" className="block text-sm font-medium text-gray-700 mb-2">
            Select Habit
          </label>
          <Select 
            value={selectedHabit || ''} 
            onValueChange={(value) => setSelectedHabit(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a habit" />
            </SelectTrigger>
            <SelectContent>
              {habits.map(habit => (
                <SelectItem key={habit.id} value={habit.id}>
                  <div className="flex items-center">
                    <span className="mr-2">{habit.icon || '🎯'}</span>
                    <span>{habit.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedHabitData && (
          <HabitStreak
            habitId={selectedHabitData.id}
            habitName={selectedHabitData.name}
            habitIcon={selectedHabitData.icon}
            habitColor={selectedHabitData.color}
          />
        )}
        
        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-medium mb-2">Tips for Success</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>Consistency is more important than perfection. Try to maintain your streak even with minimal effort on tough days.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>Don't break the chain! Each day you complete your habit, the stronger the neural pathway becomes.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>If you miss a day, don't worry - just start again tomorrow. What matters is the overall trend.</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}