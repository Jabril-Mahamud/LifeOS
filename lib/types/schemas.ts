// lib/types/schemas.ts

import { z } from 'zod';
import { COLOR_OPTIONS, HABIT_ICONS, MOOD_OPTIONS, PROJECT_ICONS } from './';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

export const idSchema = z.string().min(1);
export const dateSchema = z.string().datetime();
export const colorSchema = z.string().refine(
  (color) => COLOR_OPTIONS.some((option) => option.value === color),
  { message: "Invalid color" }
);

// ============================================================================
// TASK SCHEMAS
// ============================================================================

export const taskStatusSchema = z.enum(['pending', 'in-progress', 'completed']);
export const taskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const taskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  dueDate: z.string().datetime().optional(),
  projectId: z.string().optional(),
});

// ============================================================================
// PROJECT SCHEMAS
// ============================================================================

export const projectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  icon: z.string().refine(
    (icon) => PROJECT_ICONS.includes(icon),
    { message: "Invalid project icon" }
  ),
  color: colorSchema,
  completed: z.boolean().optional(),
  archived: z.boolean().optional(),
});

// ============================================================================
// HABIT SCHEMAS
// ============================================================================

export const habitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  icon: z.string().refine(
    (icon) => HABIT_ICONS.includes(icon),
    { message: "Invalid habit icon" }
  ),
  color: colorSchema,
  active: z.boolean().optional(),
});

export const habitLogSchema = z.object({
  habitId: idSchema,
  completed: z.boolean(),
  notes: z.string().max(500).optional(),
});

// ============================================================================
// JOURNAL SCHEMAS
// ============================================================================

export const moodSchema = z.enum(['happy', 'neutral', 'sad']);

export const journalSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().max(10000),
  mood: moodSchema,
  habitLogs: z.array(habitLogSchema).optional(),
});

// ============================================================================
// DERIVED TYPES
// ============================================================================

export type TaskFormSchema = z.infer<typeof taskSchema>;
export type ProjectFormSchema = z.infer<typeof projectSchema>;
export type HabitFormSchema = z.infer<typeof habitSchema>;
export type JournalFormSchema = z.infer<typeof journalSchema>;