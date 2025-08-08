import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().max(2000).optional(),
  projectId: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["pending", "in-progress", "completed"]).optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  completedAt: z.string().datetime().nullable().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

