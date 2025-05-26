// lib/types/index.ts

// ============================================================================
// BASE DATABASE MODELS (from Prisma schema)
// ============================================================================

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

export interface Post {
  id: string;
  title: string;
  content: string | null;
  published: boolean;
  authorId: string;
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
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  projectId: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  clerkId: string;
  name: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export type MoodType = "happy" | "neutral" | "sad";

export type TaskStatus = "pending" | "in-progress" | "completed";

export type TaskPriority = "low" | "medium" | "high";

// ============================================================================
// EXTENDED TYPES WITH RELATIONS
// ============================================================================

export interface JournalWithHabitLogs extends Journal {
  habitLogs: Array<HabitLog & {
    habit: Habit;
  }>;
}

export interface HabitWithStats extends Habit {
  streak?: number;
  completionRate?: number;
  streakData?: Array<{
    date: string;
    completed: boolean;
  }>;
}

export interface TaskWithProject extends Task {
  project: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
}

export interface ProjectWithTasks extends Project {
  tasks: Task[];
}

export interface ProjectWithTaskCount extends Project {
  _count: {
    tasks: number;
  };
}

// ============================================================================
// COMPONENT-SPECIFIC TYPES
// ============================================================================

// Habit Tracker Types
export interface HabitTrackerJournal {
  id: string;
  hasEntryToday: boolean;
  todayEntry?: {
    id: string;
    habitLogs: HabitLog[];
  };
}

// Dashboard Types
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

export interface DashboardProjects {
  list: ProjectWithTaskCount[];
  total: number;
}

export interface DashboardTasks {
  upcoming: TaskWithProject[];
  recentlyCompleted: TaskWithProject[];
}

export interface DashboardData {
  habits: DashboardHabit[];
  journal: DashboardJournal;
  projects: DashboardProjects;
  tasks: DashboardTasks;
}

// Project Stats
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

// Habit Stats
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
// FORM TYPES
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

export interface HabitFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  active?: boolean;
}

export interface TaskFormData {
  title: string;
  description: string;
  projectId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
}

export interface ProjectFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  completed?: boolean;
  archived?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

export interface HabitsResponse {
  habits: Habit[];
}

export interface JournalResponse {
  user: User;
  entries: JournalWithHabitLogs[];
  todayEntry: JournalWithHabitLogs | null;
  habits: Habit[];
}

export interface TasksResponse {
  tasks: TaskWithProject[];
}

export interface ProjectsResponse {
  projects: ProjectWithTasks[];
}

export interface SingleJournalResponse {
  entry: JournalWithHabitLogs;
}

export interface SingleHabitResponse {
  habit: Habit;
  todayEntry?: {
    id: string;
    hasHabitLog: boolean;
    completed: boolean;
  } | null;
}

export interface SingleTaskResponse {
  task: TaskWithProject;
}

export interface SingleProjectResponse {
  project: ProjectWithTasks;
}

export interface ProjectStatsResponse {
  project: Project;
  tasks: TaskWithProject[];
  stats: ProjectStats;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface HabitTrackerProps {
  habits?: HabitWithStats[];
  journalData?: HabitTrackerJournal;
  onHabitsUpdated?: () => void;
  showTitle?: boolean;
  showVisualization?: boolean;
}

export interface TaskListProps {
  tasks: TaskWithProject[];
  onTaskUpdate: () => void;
}

export interface JournalListProps {
  // No specific props needed as it manages its own state
}

// ============================================================================
// PAGE-SPECIFIC TYPES (for complex pages with local state)
// ============================================================================

// Types used in habits page
export type HabitsPageLoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface HabitsPageState {
  habits: HabitWithStats[];
  inactiveHabits: HabitWithStats[];
  journalData: HabitTrackerJournal | null;
  loadingState: HabitsPageLoadingState;
  error: string | null;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption {
  value: string;
  label: string;
}

export interface ColorOption {
  name: string;
  value: string;
}

// Color and Icon options for projects and habits
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

export const HABIT_ICONS = [
  "🏃", "💪", "🧘", "💧", "🥗", "🍎", "📚", "✍️", 
  "💭", "🛌", "⏰", "💊", "🚶", "🧠", "🌱", "🧹"
];

export const PROJECT_ICONS = [
  "📚", "🏠", "💼", "🏋️", "💻", "🎨", "🎓", "🎯", 
  "🚀", "🌱", "🔍", "📝", "📊", "📈", "🧠", "⚙️"
];

export const MOOD_OPTIONS = [
  { value: "happy" as MoodType, label: "Happy", icon: "😊" },
  { value: "neutral" as MoodType, label: "Neutral", icon: "😐" },
  { value: "sad" as MoodType, label: "Sad", icon: "😢" },
];