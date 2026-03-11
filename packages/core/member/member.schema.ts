// DB insert/select 스키마는 @ddd/db에서 drizzle-zod로 자동 생성
export { insertMemberSchema, selectMemberSchema } from "@ddd/db";

import { z } from "zod";

// 비즈니스 액션 입력값 검증용 스키마
export const updateMemberSchema = z.object({
  memberId: z.string(),
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  discordId: z.string().optional(),
});

export const assignTeamSchema = z.object({
  memberId: z.string(),
  team: z.enum(["WEB_1", "WEB_2", "ANDROID_1", "ANDROID_2", "IOS_1", "IOS_2"]),
});
