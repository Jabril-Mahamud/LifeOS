// lib/types/dashboard.ts

import { DashboardHabit } from './habits';
import { DashboardJournal } from './journal';
import { DashboardProjects, DashboardTasks } from './projects';

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardData {
  habits: DashboardHabit[];
  journal: DashboardJournal;
  projects: DashboardProjects;
  tasks: DashboardTasks;
}

// Re-export dashboard-specific types for convenience
export type { DashboardHabit } from './habits';
export type { DashboardJournal } from './journal';
export type { DashboardProjects, DashboardTasks } from './projects';