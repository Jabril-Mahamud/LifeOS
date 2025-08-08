import { z } from "zod";
import { moodTypeSchema } from "@/lib/types/enums";

export const habitLogSchema = z.object({
  habitId: z.string().uuid({ message: "Invalid habit ID" }),
  completed: z.boolean().optional(),
  notes: z.string()
    .max(300, { message: "Notes must be 300 characters or less" })
    .nullable()
    .optional()
    .transform(val => val?.trim()),
});

export const createJournalSchema = z.object({
  title: z.string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title must be 100 characters or less" })
    .trim(),
  content: z.string()
    .max(10000, { message: "Content must be 10000 characters or less" })
    .optional()
    .transform(val => val?.trim()),
  mood: moodTypeSchema.optional(),
  habitLogs: z.array(habitLogSchema)
    .max(20, { message: "Maximum 20 habit logs allowed" })
    .optional()
    .default([]),
});

export const updateJournalSchema = createJournalSchema.partial();

export type CreateJournalInput = z.infer<typeof createJournalSchema>;
export type UpdateJournalInput = z.infer<typeof updateJournalSchema>;

