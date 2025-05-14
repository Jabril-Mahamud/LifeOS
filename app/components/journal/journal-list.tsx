"use client";

import { useState, useEffect } from 'react';
import { JournalEntry } from './journal-entry';

type JournalEntry = {
  id: string;
  title: string;
  content: string | null;
  mood?: string;
  published: boolean;
  createdAt: string;
};

export function JournalList() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterMood, setFilterMood] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEntries() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/journal');
        
        if (!response.ok) {
          throw new Error('Failed to fetch journal entries');
        }
        
        const data = await response.json();
        setEntries(data.entries || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching journal entries:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntries();
  }, []);

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
        body: JSON.stringify({ title, content, mood }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create journal entry');
      }
      
      const { entry } = await response.json();
      setEntries([entry, ...entries]);
      setTitle('');
      setContent('');
      setMood('neutral');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete journal entry');
      }
      
      setEntries(entries.filter(entry => entry.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  async function handleEdit(id: string, newTitle: string, newContent: string, newMood: string) {
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: newTitle, 
          content: newContent,
          mood: newMood
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update journal entry');
      }
      
      const { entry } = await response.json();
      setEntries(entries.map(e => e.id === id ? entry : e));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  // Filter entries based on mood if a filter is selected
  const filteredEntries = filterMood 
    ? entries.filter(entry => entry.mood === filterMood)
    : entries;

  if (isLoading) {
    return <div className="p-4 text-center">Loading journal entries...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">My Journal</h2>
      
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
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
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="px-4 py-2 bg-black text-white rounded-md disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Entry'}
        </button>
      </form>
      
      {entries.length > 0 && (
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
            {filteredEntries.map((entry) => (
              <JournalEntry 
                key={entry.id} 
                id={entry.id}
                title={entry.title}
                content={entry.content}
                mood={entry.mood}
                createdAt={entry.createdAt}
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
    </div>
  );
}