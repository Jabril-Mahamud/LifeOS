// lib/types/index.ts
// Main types export file - import from here for consolidated types

// Re-export all base types
export * from './base';
export * from './extended';
export * from './forms';
export * from './api';
export * from './components';
export * from './constants';

// Domain-specific exports for easier imports
export type {
  // User types
  User
} from './base';

export type {
  // Habit types (base)
  Habit,
  HabitLog
} from './base';

export type {
  // Habit types (extended)
  HabitWithStats,
  HabitLogWithHabit,
  HabitStats,
  DailyHabitLog
} from './extended';

export type {
  // Habit types (forms and components)
  HabitFormData,
  HabitFilters
} from './forms';

export type {
  // Habit component types
  HabitTrackerProps,
  HabitHeatmapCalendarProps,
  HabitConsistencyChartProps
} from './components';

export type {
  // Journal types (base)
  Journal,
  JournalMood
} from './base';

export type {
  // Journal types (extended)
  JournalWithHabits,
  JournalActivity
} from './extended';

export type {
  // Journal types (forms)
  JournalFormData,
  JournalFilters
} from './forms';

export type {
  // Project types (base)
  Project
} from './base';

export type {
  // Project types (extended)
  ProjectWithCounts,
  ProjectStats
} from './extended';

export type {
  // Project types (forms)
  ProjectFormData,
  ProjectFilters
} from './forms';

export type {
  // Task types (base)
  Task,
  TaskStatus,
  TaskPriority
} from './base';

export type {
  // Task types (extended)
  TaskWithProject
} from './extended';

export type {
  // Task types (forms and components)
  TaskFormData,
  TaskFilters
} from './forms';

export type {
  // Task component types
  TaskListProps
} from './components';

export type {
  // API types
  ApiResponse,
  ErrorResponse,
  DashboardResponse
} from './api';

export type {
  // Dashboard data type
  DashboardData
} from './extended';

export type {
  // Component types
  PageProps,
  PagePropsWithSearchParams,
  ConfirmDialogProps,
  FormFieldProps,
  SelectOption,
  ColorOption,
  IconOption,
  MarkdownRendererProps,
  CircularProgressProps
} from './components';

export type {
  // Common types
  LoadingState
} from './base';