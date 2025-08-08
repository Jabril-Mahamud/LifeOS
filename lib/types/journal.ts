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

import { JournalFormSchema } from './schemas';

export type JournalFormData = JournalFormSchema;

// ============================================================================
// JOURNAL COMPONENT TYPES
// ============================================================================

export interface JournalListProps {
  placeholder?: string;
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