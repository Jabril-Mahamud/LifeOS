import { z } from "zod";

export const habitLogSchema = z.object({
  habitId: z.string().min(1),
  completed: z.boolean().optional(),
  notes: z.string().max(300).nullable().optional(),
});

export const createJournalSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
  mood: z.string().max(20).optional(),
  habitLogs: z.array(habitLogSchema).optional().default([]),
});

export const updateJournalSchema = createJournalSchema.partial();

export type CreateJournalInput = z.infer<typeof createJournalSchema>;
export type UpdateJournalInput = z.infer<typeof updateJournalSchema>;

