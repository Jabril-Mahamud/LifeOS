import { z } from "zod";

export const createHabitSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().max(500).optional(),
  icon: z.string().max(16).optional(),
  color: z.string().max(32).optional(),
});

export const updateHabitSchema = createHabitSchema.partial().extend({
  active: z.boolean().optional(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;

