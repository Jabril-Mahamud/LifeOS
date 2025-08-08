import { z } from "zod";
import { taskStatusSchema, taskPrioritySchema } from "@/lib/types/enums";

export const createTaskSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(100, { message: "Title must be 100 characters or less" }),
  description: z.string().max(2000, { message: "Description must be 2000 characters or less" }).optional(),
  projectId: z.string().uuid({ message: "Invalid project ID" }).optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  dueDate: z.string().datetime({ message: "Invalid date format" }).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  completedAt: z.string().datetime().nullable().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

