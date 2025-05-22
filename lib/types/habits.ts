// types/habits.ts
export type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  frequency: string | null;
  active: boolean;
  streak: number;
  completionRate: number; // make this non-optional if HabitTracker expects number
  streakData: any; // replace with proper type if known
  createdAt: string;
  updatedAt: string;
};

export type HabitLog = {
  id: string;
  habitId: string;
  completed: boolean;
  notes: string | null;
};

export type TodayEntry = {
  id: string;
  habitLogs: HabitLog[];
};

export type Journal = {
  id: string;
  hasEntryToday: boolean;
  todayEntry?: TodayEntry;
};
