import { pgEnum, pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { application } from "./application";

export const interviewResultEnum = pgEnum("interview_result", [
  "PENDING",
  "PASS",
  "FAIL",
]);

export const interview = pgTable("interview", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .unique()
    .references(() => application.id),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  googleEventId: text("google_event_id"),
  score: integer("score"),
  memo: text("memo"),
  result: interviewResultEnum("result").notNull().default("PENDING"),
  // interviewedBy references admin.id — defined in index.ts via relations to avoid circular deps
  interviewedBy: uuid("interviewed_by"),
});

export type Interview = typeof interview.$inferSelect;
export type NewInterview = typeof interview.$inferInsert;

export const insertInterviewSchema = createInsertSchema(interview, {
  score: z.number().int().min(0).max(100).optional(),
});
export const selectInterviewSchema = createSelectSchema(interview);
