import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().max(1000).optional(),
  color: z.string().max(32).optional(),
  icon: z.string().max(16).optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  completed: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

