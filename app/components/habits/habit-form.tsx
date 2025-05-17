"use client";

import { useState, useEffect } from 'react';

type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
  createdAt: string;
};

type HabitFormProps = {
  onHabitCreated?: (habit: Habit) => void;
};

export function HabitForm({ onHabitCreated }: HabitFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#4299e1'); // Default blue color
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available icons
  const icons = ['🎯', '💪', '📚', '🏃', '💧', '🧘', '🥗', '💤', '🌱', '📝', '❤️', '⏰'];
  
  // Available colors
  const colors = [
    '#4299e1', // blue
    '#48bb78', // green
    '#ed8936', // orange
    '#9f7aea', // purple
    '#f56565', // red
    '#38b2ac', // teal
    '#ecc94b', // yellow
    '#667eea', // indigo
    '#f687b3', // pink
    '#a0aec0', // gray
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, icon, color }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create habit');
      }
      
      setName('');
      setDescription('');
      setIcon('🎯');
      setColor('#4299e1');
      
      if (onHabitCreated) {
        onHabitCreated(data.habit);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100 mb-6">
      <h3 className="font-medium text-lg mb-4">Create New Habit</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="habitName" className="block text-sm font-medium text-gray-700 mb-1">
            Habit Name
          </label>
          <input
            type="text"
            id="habitName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Drink water, Meditate, Exercise"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this habit important to you?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={2}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {icons.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`flex items-center justify-center text-xl h-10 rounded-md ${
                    icon === emoji ? 'bg-gray-200' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`flex items-center justify-center h-10 rounded-md ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-500' : ''
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <span className="text-white">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="px-4 py-2 bg-black text-white rounded-md disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Habit'}
        </button>
      </form>
    </div>
  );
}