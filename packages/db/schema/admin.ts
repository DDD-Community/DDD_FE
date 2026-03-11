import { pgEnum, pgTable, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { member } from "./member";

export const adminRoleEnum = pgEnum("admin_role", ["PRESIDENT", "STAFF"]);

export const admin = pgTable("admin", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => member.id),
  role: adminRoleEnum("role").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export type Admin = typeof admin.$inferSelect;
export type NewAdmin = typeof admin.$inferInsert;

export const insertAdminSchema = createInsertSchema(admin);
export const selectAdminSchema = createSelectSchema(admin);
