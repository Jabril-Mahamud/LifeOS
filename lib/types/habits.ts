// lib/types/habits.ts

import { Habit, HabitLog } from './database';

// ============================================================================
// HABIT-RELATED EXTENDED TYPES
// ============================================================================

export interface HabitWithStats extends Habit {
  streak?: number;
  completionRate?: number;
  streakData?: Array<{
    date: string;
    completed: boolean;
  }>;
}

export interface HabitStats {
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

export interface DailyLog {
  date: string;
  completed: boolean;
  notes: string | null;
}

export interface HabitStatsResponse {
  habit: Habit;
  stats: HabitStats;
  dailyLogs: DailyLog[];
}

// ============================================================================
// HABIT FORM TYPES
// ============================================================================

export interface HabitFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  active?: boolean;
}

// ============================================================================
// HABIT COMPONENT TYPES
// ============================================================================

export interface HabitTrackerJournal {
  id: string;
  hasEntryToday: boolean;
  todayEntry?: {
    id: string;
    habitLogs: HabitLog[];
  };
}

export interface HabitTrackerProps {
  habits?: HabitWithStats[];
  journalData?: HabitTrackerJournal;
  onHabitsUpdated?: () => void;
  showTitle?: boolean;
  showVisualization?: boolean;
}

export interface DashboardHabit {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  streak: number;
  completionRate: number;
  streakData: Array<{
    date: string;
    completed: boolean;
  }>;
}

// ============================================================================
// HABIT API TYPES
// ============================================================================

export interface HabitsResponse {
  habits: Habit[];
}

export interface SingleHabitResponse {
  habit: Habit;
  todayEntry?: {
    id: string;
    hasHabitLog: boolean;
    completed: boolean;
  } | null;
}

// ============================================================================
// HABIT PAGE TYPES
// ============================================================================

export type HabitsPageLoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface HabitsPageState {
  habits: HabitWithStats[];
  inactiveHabits: HabitWithStats[];
  journalData: HabitTrackerJournal | null;
  loadingState: HabitsPageLoadingState;
  error: string | null;
}

// ============================================================================
// HABIT CONSTANTS
// ============================================================================

export const HABIT_ICONS = [
  "🏃", "💪", "🧘", "💧", "🥗", "🍎", "📚", "✍️", 
  "💭", "🛌", "⏰", "💊", "🚶", "🧠", "🌱", "🧹"
];