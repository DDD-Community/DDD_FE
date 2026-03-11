import { pgEnum, pgTable, uuid, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { season } from "./season";

export const applicationFieldEnum = pgEnum("application_field", [
  "FRONTEND",
  "BACKEND",
  "ANDROID",
  "IOS",
  "DESIGN",
  "PM",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "RECEIVED",
  "INTERVIEW",
  "PASSED",
  "FAILED",
]);

export const application = pgTable("application", {
  id: uuid("id").primaryKey().defaultRandom(),
  seasonId: uuid("season_id")
    .notNull()
    .references(() => season.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  field: applicationFieldEnum("field").notNull(),
  status: applicationStatusEnum("status").notNull().default("RECEIVED"),
  answers: jsonb("answers").default(sql`'[]'::jsonb`),
  portfolioFileUrl: text("portfolio_file_url"),
  referenceUrls: text("reference_urls")
    .array()
    .default(sql`'{}'::text[]`),
});

export type Application = typeof application.$inferSelect;
export type NewApplication = typeof application.$inferInsert;

export const insertApplicationSchema = createInsertSchema(application, {
  email: z.string().email(),
  phone: z.string().min(1),
  referenceUrls: z.array(z.string().url()).max(5).optional(),
});
export const selectApplicationSchema = createSelectSchema(application);
