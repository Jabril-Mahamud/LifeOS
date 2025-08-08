import { z } from "zod";

// Task enums
export const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
} as const;

export const TaskPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export const taskStatusSchema = z.enum([
  TaskStatus.PENDING,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
]);

export const taskPrioritySchema = z.enum([
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
]);

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

// Project enums
export const ProjectStatus = {
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

export const projectStatusSchema = z.enum([
  ProjectStatus.ACTIVE,
  ProjectStatus.COMPLETED,
  ProjectStatus.ARCHIVED,
]);

export type ProjectStatus = z.infer<typeof projectStatusSchema>;

// Journal enums
export const MoodType = {
  VERY_BAD: "very-bad",
  BAD: "bad",
  NEUTRAL: "neutral",
  GOOD: "good",
  VERY_GOOD: "very-good",
} as const;

export const moodTypeSchema = z.enum([
  MoodType.VERY_BAD,
  MoodType.BAD,
  MoodType.NEUTRAL,
  MoodType.GOOD,
  MoodType.VERY_GOOD,
]);

export type MoodType = z.infer<typeof moodTypeSchema>;