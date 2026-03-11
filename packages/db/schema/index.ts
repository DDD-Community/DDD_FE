export * from "./auth";
export * from "./season";
export * from "./application";
export * from "./member";
export * from "./admin";
export * from "./interview";
export * from "./notice";

import { relations } from "drizzle-orm";
import { interview } from "./interview";
import { admin } from "./admin";
import { notice } from "./notice";

// interview.interviewedBy → admin (순환참조 방지를 위해 relations로만 정의)
export const interviewRelations = relations(interview, ({ one }) => ({
  interviewedBy: one(admin, {
    fields: [interview.interviewedBy],
    references: [admin.id],
  }),
}));

// notice.createdBy → admin
export const noticeRelations = relations(notice, ({ one }) => ({
  createdBy: one(admin, {
    fields: [notice.createdBy],
    references: [admin.id],
  }),
}));
