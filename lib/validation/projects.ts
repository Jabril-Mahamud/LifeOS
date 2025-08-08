import { z } from "zod";
import { projectStatusSchema } from "@/lib/types/enums";

export const createProjectSchema = z.object({
  name: z.string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name must be 50 characters or less" })
    .trim(),
  description: z.string()
    .max(1000, { message: "Description must be 1000 characters or less" })
    .optional()
    .transform(val => val?.trim()),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid color format (use #RRGGBB)" })
    .optional(),
  icon: z.string()
    .min(1, { message: "Icon is required" })
    .max(2, { message: "Icon must be 1-2 characters" })
    .optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  completed: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

