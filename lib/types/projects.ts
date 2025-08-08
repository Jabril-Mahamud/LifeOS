// lib/types/projects.ts

import { Project, Task, TaskStatus, TaskPriority } from './database';

// ============================================================================
// PROJECT-RELATED EXTENDED TYPES
// ============================================================================

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

export interface DashboardProjects {
  list: ProjectWithTaskCount[];
  total: number;
}

export interface DashboardTasks {
  upcoming: TaskWithProject[];
  recentlyCompleted: TaskWithProject[];
}

// ============================================================================
// PROJECT STATS TYPES
// ============================================================================

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

// ============================================================================
// FORM TYPES
// ============================================================================

import { TaskFormSchema, ProjectFormSchema } from './schemas';

export type TaskFormData = TaskFormSchema;
export type ProjectFormData = ProjectFormSchema;

// ============================================================================
// COMPONENT TYPES
// ============================================================================

export interface TaskListProps {
  tasks: TaskWithProject[];
  onTaskUpdate: () => void;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface TasksResponse {
  tasks: TaskWithProject[];
}

export interface ProjectsResponse {
  projects: ProjectWithTasks[];
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
// PROJECT CONSTANTS
// ============================================================================

export const PROJECT_ICONS = [
  "📚", "🏠", "💼", "🏋️", "💻", "🎨", "🎓", "🎯", 
  "🚀", "🌱", "🔍", "📝", "📊", "📈", "🧠", "⚙️"
];