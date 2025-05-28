// lib/types/journal.ts

import { Journal, HabitLog, Habit, User, MoodType } from './database';

// ============================================================================
// JOURNAL-RELATED EXTENDED TYPES
// ============================================================================

export interface JournalWithHabitLogs extends Journal {
  habitLogs: Array<HabitLog & {
    habit: Habit;
  }>;
}

export interface DashboardJournal {
  totalEntries: number;
  hasEntryToday: boolean;
  entries: Journal[];
  moodDistribution: Record<string, number>;
  recentMoods: string[];
  heatmap: Array<{
    date: string;
    mood: string;
    count: number;
  }>;
}

// ============================================================================
// JOURNAL FORM TYPES
// ============================================================================

export interface JournalFormData {
  title: string;
  content: string;
  mood: MoodType;
  habitLogs?: Array<{
    habitId: string;
    completed: boolean;
    notes?: string | null;
  }>;
}

// ============================================================================
// JOURNAL COMPONENT TYPES
// ============================================================================

export interface JournalListProps {
  // No specific props needed as it manages its own state
}

// ============================================================================
// JOURNAL API TYPES
// ============================================================================

export interface JournalResponse {
  user: User;
  entries: JournalWithHabitLogs[];
  todayEntry: JournalWithHabitLogs | null;
  habits: Habit[];
}

export interface SingleJournalResponse {
  entry: JournalWithHabitLogs;
}

// ============================================================================
// JOURNAL CONSTANTS
// ============================================================================

export const MOOD_OPTIONS = [
  { value: "happy" as MoodType, label: "Happy", icon: "😊" },
  { value: "neutral" as MoodType, label: "Neutral", icon: "😐" },
  { value: "sad" as MoodType, label: "Sad", icon: "😢" },
];