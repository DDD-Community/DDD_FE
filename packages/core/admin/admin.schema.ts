// DB insert/select 스키마는 @ddd/db에서 drizzle-zod로 자동 생성
export { insertAdminSchema, selectAdminSchema } from "@ddd/db";

import { z } from "zod";

// 비즈니스 액션 입력값 검증용 스키마
export const grantAdminSchema = z.object({
  memberId: z.string(),
  role: z.enum(["PRESIDENT", "STAFF"]),
});

export const revokeAdminSchema = z.object({
  adminId: z.string(),
});
