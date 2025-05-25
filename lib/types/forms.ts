// lib/types/forms.ts
// Form data types for user input

import { TaskStatus, TaskPriority, JournalMood } from './base';

// Habit form data
export interface HabitFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  active?: boolean;
}

// Journal form data
export interface JournalFormData {
  title: string;
  content: string;
  mood: JournalMood;
  habitLogs?: Array<{
    habitId: string;
    completed: boolean;
    notes?: string;
  }>;
}

// Project form data
export interface ProjectFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  completed?: boolean;
  archived?: boolean;
}

// Task form data
export interface TaskFormData {
  title: string;
  description: string;
  projectId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
}

// Habit log update data
export interface HabitLogUpdateData {
  completed: boolean;
  notes?: string | null;
}

// Search and filter types
export interface TaskFilters {
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

export interface HabitFilters {
  active?: boolean;
  search?: string;
}

export interface JournalFilters {
  mood?: JournalMood;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ProjectFilters {
  archived?: boolean;
  completed?: boolean;
  search?: string;
}