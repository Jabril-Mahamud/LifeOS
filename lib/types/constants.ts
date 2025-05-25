// lib/types/constants.ts
// Common constants and utility types

import { ColorOption, IconOption, SelectOption } from './components';
import { TaskStatus, TaskPriority, JournalMood } from './base';

// Color options for habits and projects
export const COLOR_OPTIONS: ColorOption[] = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Orange", value: "#f97316" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Indigo", value: "#6366f1" },
];

// Icon options for habits
export const HABIT_ICON_OPTIONS: string[] = [
  "🏃", "💪", "🧘", "💧", "🥗", "🍎", "📚", "✍️", 
  "💭", "🛌", "⏰", "💊", "🚶", "🧠", "🌱", "🧹"
];

// Icon options for projects
export const PROJECT_ICON_OPTIONS: string[] = [
  "📚", "🏠", "💼", "🏋️", "💻", "🎨", "🎓", "🎯", 
  "🚀", "🌱", "🔍", "📝", "📊", "📈", "🧠", "⚙️"
];

// Task status options
export const TASK_STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

// Task priority options
export const TASK_PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low', color: '#3b82f6' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

// Mood options for journal
export const MOOD_OPTIONS: Array<{
  value: JournalMood;
  label: string;
  icon: string;
  color: string;
}> = [
  { value: 'happy', label: 'Happy', icon: '😊', color: '#22c55e' },
  { value: 'neutral', label: 'Neutral', icon: '😐', color: '#f59e0b' },
  { value: 'sad', label: 'Sad', icon: '😢', color: '#3b82f6' },
];

// Priority color mappings
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: 'text-red-500',
  medium: 'text-amber-500',
  low: 'text-blue-500',
};

// Status color mappings
export const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'text-muted-foreground',
  'in-progress': 'text-amber-500',
  completed: 'text-green-500',
};

// Default form values
export const DEFAULT_HABIT_FORM_VALUES = {
  name: '',
  description: '',
  icon: HABIT_ICON_OPTIONS[0],
  color: COLOR_OPTIONS[0].value,
  active: true,
};

export const DEFAULT_PROJECT_FORM_VALUES = {
  name: '',
  description: '',
  icon: PROJECT_ICON_OPTIONS[0],
  color: COLOR_OPTIONS[0].value,
  completed: false,
  archived: false,
};

export const DEFAULT_TASK_FORM_VALUES = {
  title: '',
  description: '',
  projectId: '',
  priority: 'medium' as TaskPriority,
  status: 'pending' as TaskStatus,
  dueDate: null,
};

export const DEFAULT_JOURNAL_FORM_VALUES = {
  title: `Daily Review - ${new Date().toLocaleDateString()}`,
  content: '',
  mood: 'neutral' as JournalMood,
  habitLogs: [],
};

// Utility types
export type ValueOf<T> = T[keyof T];
export type NonEmptyArray<T> = [T, ...T[]];
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

// Date utility constants
export const DATE_FORMATS = {
  DISPLAY: 'MMMM d, yyyy',
  API: 'yyyy-MM-dd',
  TIME: 'h:mm a',
  DATETIME: 'MMM d, yyyy h:mm a',
} as const;

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DASHBOARD_LIMIT: 5,
} as const;

// Loading states for better UX
export const LOADING_MESSAGES = {
  habits: 'Loading habits...',
  journal: 'Loading journal entries...',
  projects: 'Loading projects...',
  tasks: 'Loading tasks...',
  dashboard: 'Loading dashboard...',
} as const;