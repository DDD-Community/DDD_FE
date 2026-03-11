import { pgEnum, pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { season } from "./season";

export const noticeTargetEnum = pgEnum("notice_target", ["ALL", "MEMBER"]);

export const notice = pgTable("notice", {
  id: uuid("id").primaryKey().defaultRandom(),
  seasonId: uuid("season_id").references(() => season.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  target: noticeTargetEnum("target").notNull().default("ALL"),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  // createdBy references admin.id — defined in index.ts via relations to avoid circular deps
  createdBy: uuid("created_by").notNull(),
});

export type Notice = typeof notice.$inferSelect;
export type NewNotice = typeof notice.$inferInsert;

export const insertNoticeSchema = createInsertSchema(notice);
export const selectNoticeSchema = createSelectSchema(notice);
