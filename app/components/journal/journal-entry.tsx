"use client";

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

type JournalEntryProps = {
  id: string;
  title: string;
  content: string | null;
  mood?: string;
  createdAt: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, title: string, content: string, mood: string) => void;
};

export function JournalEntry({ 
  id, 
  title, 
  content, 
  mood = 'neutral',
  createdAt, 
  onDelete,
  onEdit
}: JournalEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content || '');
  const [editMood, setEditMood] = useState(mood);

  const date = new Date(createdAt);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });

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
      onEdit(id, editTitle, editContent, editMood);
    }
    setIsEditing(false);
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
    <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm mb-4 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg flex items-center gap-2">
            {title}
            <span className="text-base">{getMoodEmoji(mood)}</span>
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
      
      {isExpanded && content && (
        <div className="mt-3 text-gray-600 whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
}