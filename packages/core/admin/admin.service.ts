import { getMemberById, createAdmin, deactivateAdmin } from "@ddd/db";
import type { Admin } from "@ddd/db";
import { ERROR_CODE } from "../errors";

export async function grantAdmin(memberId: string, role: Admin["role"]) {
  const member = await getMemberById(memberId);
  if (!member) throw new Error(ERROR_CODE.MEMBER_NOT_FOUND);
  return createAdmin({ memberId, role });
}

export async function revokeAdmin(adminId: string) {
  const result = await deactivateAdmin(adminId);
  if (!result) throw new Error(ERROR_CODE.ADMIN_NOT_FOUND);
  return result;
}
