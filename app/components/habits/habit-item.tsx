"use client";

import { useState } from 'react';

type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
  createdAt: string;
};

type HabitItemProps = {
  habit: Habit;
  onUpdate?: (habit: Habit) => void;
  onDelete?: (id: string) => void;
};

export function HabitItem({ habit, onUpdate, onDelete }: HabitItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || '');
  const [icon, setIcon] = useState(habit.icon || '🎯');
  const [color, setColor] = useState(habit.color || '#4299e1');
  const [active, setActive] = useState(habit.active);
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

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setName(habit.name);
    setDescription(habit.description || '');
    setIcon(habit.icon || '🎯');
    setColor(habit.color || '#4299e1');
    setActive(habit.active);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (!confirm(`Are you sure you want to delete the habit "${habit.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete habit');
      }
      
      onDelete(habit.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const saveEdit = async () => {
    if (!onUpdate) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, icon, color, active }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update habit');
      }
      
      setIsEditing(false);
      onUpdate(data.habit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async () => {
    if (!onUpdate) return;
    
    try {
      const newActiveState = !active;
      setActive(newActiveState);
      
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: newActiveState }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setActive(active); // Revert on error
        throw new Error(data.error || 'Failed to update habit');
      }
      
      onUpdate(data.habit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded-lg mb-3">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Habit Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
        
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={active}
              onChange={() => setActive(!active)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={cancelEditing}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={saveEdit}
            disabled={isSubmitting || !name.trim()}
            className="px-4 py-2 bg-black text-white rounded-md text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`border border-gray-200 p-3 rounded-lg mb-3 ${active ? 'bg-white' : 'bg-gray-50 opacity-70'}`}
      style={{ borderLeftWidth: '4px', borderLeftColor: habit.color || '#4299e1' }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xl mr-3">{habit.icon}</span>
          <div>
            <h4 className="font-medium">{habit.name}</h4>
            {habit.description && (
              <p className="text-sm text-gray-600">{habit.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={toggleActive}
            className={`text-xs px-2 py-1 rounded ${
              active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {active ? 'Active' : 'Inactive'}
          </button>
          <button
            onClick={startEditing}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Edit habit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 p-1"
            aria-label="Delete habit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}