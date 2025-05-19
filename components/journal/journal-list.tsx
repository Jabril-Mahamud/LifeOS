// components/journal/journal-list.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { JournalEntry } from '@/components/journal/journal-entry';
import { HabitTracker } from '@/components/habits/habit-tracker';
import { format, isToday, parseISO, startOfDay, isSameDay } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define consistent HabitLog types
type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
};

// Type for HabitLog in API responses
type HabitLogResponse = {
  id: string;
  habitId: string;
  completed: boolean;
  notes: string | null;
  habit: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
};

// Type for HabitLog in form state
type HabitLogForm = {
  id?: string;
  habitId: string;
  completed: boolean;
  notes: string | null;
};

type JournalEntry = {
  id: string;
  title: string;
  content: string | null;
  mood?: string;
  date: string;
  private: boolean;
  createdAt: string;
  habitLogs: HabitLogResponse[];
};

export function JournalList() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New entry form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [habitLogs, setHabitLogs] = useState<HabitLogForm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [filterMood, setFilterMood] = useState<string | null>(null);
  const [showTodaySection, setShowTodaySection] = useState(true);
  const [activeTab, setActiveTab] = useState('journal');

  useEffect(() => {
    fetchJournalData();
  }, []);

  async function fetchJournalData() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/journal');
      
      if (!response.ok) {
        throw new Error('Failed to fetch journal entries');
      }
      
      const data = await response.json();
      setEntries(data.entries || []);
      setHabits(data.habits || []);
      setTodayEntry(data.todayEntry || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching journal entries:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, mood, habitLogs }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.entry) {
          // Entry for today already exists
          setTodayEntry(data.entry);
          setError('You already have a journal entry for today. You can edit it below.');
        } else {
          throw new Error(data.error || 'Failed to create journal entry');
        }
        return;
      }
      
      setTodayEntry(data.entry);
      setEntries([data.entry, ...entries]);
      setTitle('');
      setContent('');
      setMood('neutral');
      setHabitLogs([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete journal entry');
      }
      
      // Check if we're deleting the today entry
      if (todayEntry && todayEntry.id === id) {
        setTodayEntry(null);
      }
      
      setEntries(entries.filter(entry => entry.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  async function handleEdit(
    id: string, 
    newTitle: string, 
    newContent: string, 
    newMood: string,
    newHabitLogs: HabitLogForm[] = []
  ) {
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: newTitle, 
          content: newContent,
          mood: newMood,
          habitLogs: newHabitLogs
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update journal entry');
      }
      
      const { entry } = await response.json();
      
      // Update both entries and todayEntry if needed
      setEntries(entries.map(e => e.id === id ? entry : e));
      if (todayEntry && todayEntry.id === id) {
        setTodayEntry(entry);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  function handleHabitLogsChange(newHabitLogs: HabitLogForm[]) {
    setHabitLogs(newHabitLogs);
  }

  // Filter entries based on mood if a filter is selected
  const filteredEntries = filterMood 
    ? entries.filter(entry => entry.mood === filterMood)
    : entries;

  // Filter entries to exclude today's entry
  const pastEntries = filteredEntries.filter(entry => {
    if (!todayEntry) return true;
    return entry.id !== todayEntry.id;
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading journal entries...</div>;
  }

  if (error && !todayEntry && habitLogs.length === 0) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <div className="p-4 text-center text-red-500 mb-4">{error}</div>
        {renderJournalContent()}
      </div>
    );
  }

  function renderJournalContent() {
    return (
      <>
        <Tabs defaultValue="journal" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="journal">Journal & Habits</TabsTrigger>
            <TabsTrigger value="habits-config">Manage Habits</TabsTrigger>
          </TabsList>
          
          <TabsContent value="journal" className="mt-4">
            {/* Today's Journal Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  Today's Journal
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </span>
                </h3>
                <button 
                  onClick={() => setShowTodaySection(!showTodaySection)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${showTodaySection ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {showTodaySection && (
                <>
                  {todayEntry ? (
                    <JournalEntry 
                      key={todayEntry.id} 
                      id={todayEntry.id}
                      title={todayEntry.title}
                      content={todayEntry.content}
                      mood={todayEntry.mood}
                      date={todayEntry.date}
                      createdAt={todayEntry.createdAt}
                      habitLogs={todayEntry.habitLogs}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ) : (
                    <form onSubmit={handleSubmit} className="bg-card p-4 rounded-lg border border-blue-200 shadow-sm">
                      <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Entry Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="What's on your mind today?"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                          Your Thoughts
                        </label>
                        <textarea
                          id="content"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Write freely about your day, thoughts, ideas, or feelings..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows={5}
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-1">
                          How are you feeling?
                        </label>
                        <select
                          id="mood"
                          value={mood}
                          onChange={(e) => setMood(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="neutral">Neutral 😐</option>
                          <option value="happy">Happy 😊</option>
                          <option value="sad">Sad 😔</option>
                          <option value="angry">Angry 😠</option>
                          <option value="anxious">Anxious 😰</option>
                          <option value="calm">Calm 😌</option>
                          <option value="excited">Excited 🤩</option>
                          <option value="tired">Tired 😴</option>
                        </select>
                      </div>
                      
                      {/* Habit Tracker Section - Now more prominent in the form */}
                      <div className="mb-4 border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-800 mb-3">Track Today's Habits</h4>
                        <HabitTracker
                          habitLogs={habitLogs}
                          onHabitLogsChange={handleHabitLogsChange}
                        />
                        
                        <div className="mt-2 text-sm text-gray-500 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Tracking your habits daily helps build consistency and maintain streaks</span>
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting || !title.trim()}
                        className="px-4 py-2 bg-card text-white rounded-md disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Today\'s Entry'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
            
            {/* Past Entries Section */}
            {pastEntries.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Past Entries</h3>
                  <div className="flex items-center">
                    <label htmlFor="filterMood" className="text-sm text-gray-600 mr-2">
                      Filter by mood:
                    </label>
                    <select
                      id="filterMood"
                      value={filterMood || ''}
                      onChange={(e) => setFilterMood(e.target.value || null)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="">All moods</option>
                      <option value="neutral">Neutral 😐</option>
                      <option value="happy">Happy 😊</option>
                      <option value="sad">Sad 😔</option>
                      <option value="angry">Angry 😠</option>
                      <option value="anxious">Anxious 😰</option>
                      <option value="calm">Calm 😌</option>
                      <option value="excited">Excited 🤩</option>
                      <option value="tired">Tired 😴</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {pastEntries.map((entry) => (
                    <JournalEntry 
                      key={entry.id} 
                      id={entry.id}
                      title={entry.title}
                      content={entry.content}
                      mood={entry.mood}
                      date={entry.date}
                      createdAt={entry.createdAt}
                      habitLogs={entry.habitLogs}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {entries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">Your journal is empty.</p>
                <p>Create your first entry above to start your journaling practice!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="habits-config" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Your Habits</CardTitle>
                <CardDescription>
                  Configure the habits you want to track in your daily journal entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  You can create, edit or delete habits here. These habits will be available to track in your daily journal entries.
                </p>
                
                {habits.length > 0 ? (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">You have {habits.length} habits configured</p>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-2">You haven't created any habits yet</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/habits">Go to Habit Management</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Quick tips section */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Journal & Habit Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">📝</span>
                <span>Journal consistently to track your progress and mood patterns over time</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⏱️</span>
                <span>Build a habit of journaling at the same time each day</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🏆</span>
                <span>Track your habits daily to maintain streaks and build consistency</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">My Journal</h2>
      {renderJournalContent()}
    </div>
  );
}