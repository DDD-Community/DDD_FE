import { pgEnum, pgTable, uuid, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const seasonStatusEnum = pgEnum("season_status", [
  "RECRUITING",
  "ACTIVE",
  "CLOSED",
]);

export const season = pgTable("season", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: integer("number").notNull().unique(),
  recruitStart: date("recruit_start").notNull(),
  recruitEnd: date("recruit_end").notNull(),
  activityStart: date("activity_start").notNull(),
  activityEnd: date("activity_end").notNull(),
  status: seasonStatusEnum("status").notNull().default("RECRUITING"),
});

export type Season = typeof season.$inferSelect;
export type NewSeason = typeof season.$inferInsert;

export const insertSeasonSchema = createInsertSchema(season);
export const selectSeasonSchema = createSelectSchema(season);
