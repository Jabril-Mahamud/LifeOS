// lib/types/api.ts
// API response types

import {
  Habit,
  Journal,
  Project,
  Task,
  User,
  LoadingState
} from './base';

import {
  HabitWithStats,
  JournalWithHabits,
  ProjectWithCounts,
  TaskWithProject,
  ProjectStats,
  HabitStats,
  DailyHabitLog,
  DashboardData
} from './extended';

// Standard API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Specific API response types
export interface HabitsResponse {
  habits: Habit[];
}

export interface HabitWithStatsResponse {
  habit: Habit;
  stats: HabitStats;
  dailyLogs: DailyHabitLog[];
}

export interface HabitLogResponse {
  habit: Habit;
  todayEntry: {
    id: string;
    hasHabitLog: boolean;
    completed: boolean;
  } | null;
}

export interface JournalsResponse {
  user: User;
  entries: Journal[];
  todayEntry: JournalWithHabits | null;
  habits: Habit[];
}

export interface JournalResponse {
  entry: JournalWithHabits;
}

export interface ProjectsResponse {
  projects: ProjectWithCounts[];
}

export interface ProjectWithStatsResponse {
  project: Project;
  tasks: TaskWithProject[];
  stats: ProjectStats;
}

export interface TasksResponse {
  tasks: TaskWithProject[];
}

export interface TaskResponse {
  task: TaskWithProject;
}

export interface DashboardResponse extends DashboardData {}

// Error response type
export interface ErrorResponse {
  error: string;
  details?: string;
  code?: number;
}

// Loading states for different resources
export interface ResourceLoadingState {
  habits: LoadingState;
  journal: LoadingState;
  projects: LoadingState;
  tasks: LoadingState;
  dashboard: LoadingState;
}