// DB insert/select 스키마는 @ddd/db에서 drizzle-zod로 자동 생성
export { insertApplicationSchema, selectApplicationSchema } from "@ddd/db";

import { z } from "zod";

// 비즈니스 액션 입력값 검증용 스키마
export const passApplicationSchema = z.object({
  applicationId: z.string(),
});

export const failApplicationSchema = z.object({
  applicationId: z.string(),
});

export const moveToInterviewSchema = z.object({
  applicationId: z.string(),
});

export const updateApplicationStatusSchema = z.object({
  applicationId: z.string(),
  status: z.enum(["RECEIVED", "INTERVIEW", "PASSED", "FAILED"]),
});
