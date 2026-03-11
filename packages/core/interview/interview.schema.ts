// DB insert/select 스키마는 @ddd/db에서 drizzle-zod로 자동 생성
export { insertInterviewSchema, selectInterviewSchema } from "@ddd/db";

import { z } from "zod";

// 비즈니스 액션 입력값 검증용 스키마
export const scheduleInterviewSchema = z.object({
  applicationId: z.string(),
  scheduledAt: z.date(),
  interviewedBy: z.string().optional(),
});

export const recordResultSchema = z.object({
  interviewId: z.string(),
  score: z.number().int().min(0).max(100),
  memo: z.string().optional(),
  result: z.enum(["PASS", "FAIL"]),
});
