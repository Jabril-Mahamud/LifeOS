import { z } from "zod";

export const createHabitSchema = z.object({
  name: z.string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name must be 50 characters or less" })
    .trim(),
  description: z.string()
    .max(500, { message: "Description must be 500 characters or less" })
    .optional()
    .transform(val => val?.trim()),
  icon: z.string()
    .min(1, { message: "Icon is required" })
    .max(2, { message: "Icon must be 1-2 characters" })
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid color format (use #RRGGBB)" })
    .optional(),
});

export const updateHabitSchema = createHabitSchema.partial().extend({
  active: z.boolean().optional(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;

