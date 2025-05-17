"use client";

import { useState, useEffect } from 'react';
import { formatDistanceToNow, format, isSameDay } from 'date-fns';
import { HabitTracker } from '../habits/habit-tracker';

// Use the same HabitLog type as in journal-entry.tsx
type Habit = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

type HabitLog = {
  id: string;
  habitId: string;
  completed: boolean;
  notes: string | null;
  habit: Habit;
};

// Type for the local habit log state used in the form
type HabitLogForm = {
  id?: string;
  habitId: string;
  completed: boolean;
  notes: string | null;
};

type JournalEntryProps = {
  id: string;
  title: string;
  content: string | null;
  mood?: string;
  date: string;
  createdAt: string;
  habitLogs?: HabitLog[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string, title: string, content: string, mood: string, habitLogs: HabitLogForm[]) => void;
};

export function JournalEntry({ 
  id, 
  title, 
  content, 
  mood = 'neutral',
  date,
  createdAt, 
  habitLogs = [],
  onDelete,
  onEdit
}: JournalEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content || '');
  const [editMood, setEditMood] = useState(mood);
  const [editHabitLogs, setEditHabitLogs] = useState<HabitLogForm[]>([]);

  const entryDate = new Date(date);
  const formattedDate = format(entryDate, 'EEEE, MMMM d, yyyy');
  const isToday = isSameDay(entryDate, new Date());
  
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  useEffect(() => {
    // Convert the habitLogs to a format suitable for the HabitTracker component
    if (habitLogs) {
      const formattedLogs = habitLogs.map(log => ({
        id: log.id,
        habitId: log.habitId,
        completed: log.completed,
        notes: log.notes
      }));
      setEditHabitLogs(formattedLogs);
    }
  }, [habitLogs]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditTitle(title);
    setEditContent(content || '');
    setEditMood(mood);
  };

  const saveEdit = () => {
    if (onEdit) {
      onEdit(id, editTitle, editContent, editMood, editHabitLogs);
    }
    setIsEditing(false);
  };

  const handleHabitLogsChange = (newHabitLogs: HabitLogForm[]) => {
    setEditHabitLogs(newHabitLogs);
  };

  // Render different mood emojis based on the mood
  const getMoodEmoji = (mood: string) => {
    switch(mood.toLowerCase()) {
      case 'happy': return '😊';
      case 'sad': return '😔';
      case 'angry': return '😠';
      case 'anxious': return '😰';
      case 'calm': return '😌';
      case 'excited': return '🤩';
      case 'tired': return '😴';
      default: return '😐';
    }
  };

  // Count completed habits
  const completedHabits = habitLogs.filter(log => log.completed).length;
  const totalHabits = habitLogs.length;

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm mb-4">
        <div className="mb-3">
          <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="editTitle"
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="editContent" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="editContent"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={6}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="editMood" className="block text-sm font-medium text-gray-700 mb-1">
            How are you feeling?
          </label>
          <select
            id="editMood"
            value={editMood}
            onChange={(e) => setEditMood(e.target.value)}
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
        
        {/* Habit Tracker for editing */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Track Your Habits
          </label>
          <HabitTracker
            habitLogs={editHabitLogs}
            onHabitLogsChange={handleHabitLogsChange}
          />
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
            className="px-4 py-2 bg-black text-white rounded-md text-sm"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 p-4 rounded-lg shadow-sm mb-4 transition-all ${isToday ? 'border-blue-400' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg flex items-center gap-2">
            {title}
            <span className="text-base">{getMoodEmoji(mood)}</span>
            {isToday && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Today</span>
            )}
          </h3>
          <div className="text-xs text-gray-500 mt-1">
            {formattedDate} · {timeAgo}
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={startEditing}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Edit entry"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          {onDelete && (
            <button 
              onClick={() => onDelete(id)}
              className="text-gray-400 hover:text-red-600 p-1"
              aria-label="Delete entry"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button 
            onClick={toggleExpand}
            className="text-gray-400 hover:text-gray-600 p-1 ml-1"
            aria-label={isExpanded ? "Collapse entry" : "Expand entry"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Habit Tracking Summary */}
      {habitLogs.length > 0 && (
        <div className="mt-3 flex items-center">
          <div className="mr-2 text-xs font-medium text-gray-500">Habits:</div>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="ml-2 text-xs text-gray-600">
            {completedHabits}/{totalHabits}
          </div>
        </div>
      )}
      
      {isExpanded && (
        <div className="mt-4">
          {content && (
            <div className="text-gray-600 whitespace-pre-wrap mb-4">
              {content}
            </div>
          )}
          
          {/* Tracked Habits Details */}
          {habitLogs.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Habits Tracked</h4>
              <div className="space-y-2">
                {habitLogs.map(log => (
                  <div 
                    key={log.id} 
                    className="flex items-center p-2 bg-gray-50 rounded-md"
                    style={{ borderLeft: `3px solid ${log.habit.color || '#4299e1'}` }}
                  >
                    <div className={`mr-2 ${log.completed ? 'text-green-500' : 'text-gray-400'}`}>
                      {log.completed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{log.habit.icon}</span>
                        <span className={`font-medium ${log.completed ? 'text-gray-800' : 'text-gray-500'}`}>
                          {log.habit.name}
                        </span>
                      </div>
                      {log.notes && (
                        <div className="mt-1 text-sm text-gray-600">
                          {log.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}