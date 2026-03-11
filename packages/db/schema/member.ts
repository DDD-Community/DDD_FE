import { pgEnum, pgTable, uuid, text, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { season } from "./season";
import { application } from "./application";

export const memberTeamEnum = pgEnum("member_team", [
  "WEB_1",
  "WEB_2",
  "ANDROID_1",
  "ANDROID_2",
  "IOS_1",
  "IOS_2",
]);

export const member = pgTable("member", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .unique()
    .references(() => application.id),
  seasonId: uuid("season_id")
    .notNull()
    .references(() => season.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  team: memberTeamEnum("team"),
  isActive: boolean("is_active").notNull().default(true),
  discordId: text("discord_id"),
});

export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;

export const insertMemberSchema = createInsertSchema(member);
export const selectMemberSchema = createSelectSchema(member);
