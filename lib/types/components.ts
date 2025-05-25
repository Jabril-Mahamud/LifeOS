// lib/types/components.ts
// Component prop types

import { ReactNode } from 'react';
import { HabitWithStats, TaskWithProject } from './extended';

// Habit Tracker component props
export interface HabitTrackerProps {
  habits?: HabitWithStats[];
  journalData?: {
    id: string;
    hasEntryToday: boolean;
    todayEntry?: {
      id: string;
      habitLogs: Array<{
        id: string;
        habitId: string;
        completed: boolean;
        notes: string | null;
      }>;
    };
  };
  onHabitsUpdated?: () => void;
  showTitle?: boolean;
  showVisualization?: boolean;
}

// Task List component props
export interface TaskListProps {
  tasks: TaskWithProject[];
  onTaskUpdate: () => void;
}

// Habit Heatmap Calendar props
export interface HabitHeatmapCalendarProps {
  habits: HabitWithStats[];
  title?: string;
  className?: string;
}

// Habit Consistency Chart props
export interface HabitConsistencyChartProps {
  habits: HabitWithStats[];
  daysToShow?: number;
  title?: string;
  showLegend?: boolean;
}

// Markdown Renderer props
export interface MarkdownRendererProps {
  content: string;
  className?: string;
  truncate?: boolean;
  maxLines?: number;
}

// Circular Progress props
export interface CircularProgressProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
  className?: string;
}

// Page component props (for Next.js pages)
export interface PageProps {
  params: Promise<{ id: string }>;
}

export interface PagePropsWithSearchParams extends PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Modal/Dialog props
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

// Form field props
export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: ReactNode;
}

// Select option type
export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  color?: string;
  disabled?: boolean;
}

// Color and icon options
export interface ColorOption {
  name: string;
  value: string;
}

export interface IconOption {
  value: string;
  label?: string;
}