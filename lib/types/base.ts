// lib/types/base.ts
// Core types that match the Prisma schema

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Journal {
  id: string;
  title: string;
  content: string | null;
  mood: string | null;
  private: boolean;
  date: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  completed: boolean;
  notes: string | null;
  journalId: string;
  habitId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  completed: boolean;
  archived: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  completedAt: string | null;
  projectId: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

// Enums for better type safety
export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type JournalMood = 'happy' | 'neutral' | 'sad';

// Common loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';