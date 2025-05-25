// lib/types/extended.ts
// Extended types with relations and computed fields

import { 
  Habit as BaseHabit, 
  HabitLog as BaseHabitLog, 
  Journal as BaseJournal,
  Project as BaseProject,
  Task as BaseTask 
} from './base';

// Habit with computed analytics
export interface HabitWithStats extends BaseHabit {
  streak?: number;
  completionRate?: number;
  streakData?: Array<{
    date: string;
    completed: boolean;
  }>;
}

// HabitLog with habit details
export interface HabitLogWithHabit extends BaseHabitLog {
  habit: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
}

// Journal with habit logs
export interface JournalWithHabits extends BaseJournal {
  habitLogs: HabitLogWithHabit[];
}

// Project with task counts
export interface ProjectWithCounts extends BaseProject {
  _count?: {
    tasks: number;
  };
}

// Task with project details
export interface TaskWithProject extends BaseTask {
  project: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
}

// Project statistics
export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  taskStatusCount: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  taskPriorityCount: {
    high: number;
    medium: number;
    low: number;
  };
  upcomingTasks: number;
}

// Habit statistics
export interface HabitStats {
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

// Daily habit log data
export interface DailyHabitLog {
  date: string;
  completed: boolean;
  notes: string | null;
}

// Journal activity for dashboard
export interface JournalActivity {
  totalEntries: number;
  hasEntryToday: boolean;
  entries: BaseJournal[];
  moodDistribution: Record<string, number>;
  recentMoods: string[];
  heatmap: Array<{
    date: string;
    mood: string;
    count: number;
  }>;
}

// Dashboard summary data
export interface DashboardData {
  habits: HabitWithStats[];
  journal: JournalActivity;
  projects: {
    list: ProjectWithCounts[];
    total: number;
  };
  tasks: {
    upcoming: TaskWithProject[];
    recentlyCompleted: TaskWithProject[];
  };
}