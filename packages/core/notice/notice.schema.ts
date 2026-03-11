// DB insert/select 스키마는 @ddd/db에서 drizzle-zod로 자동 생성
export { insertNoticeSchema, selectNoticeSchema } from "@ddd/db";

import { z } from "zod";

// 비즈니스 액션 입력값 검증용 스키마
export const createNoticeSchema = z.object({
  seasonId: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  target: z.enum(["ALL", "MEMBER"]).default("ALL"),
  createdBy: z.string(),
});

export const updateNoticeSchema = z.object({
  noticeId: z.string(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  target: z.enum(["ALL", "MEMBER"]).optional(),
  isPublished: z.boolean().optional(),
});
