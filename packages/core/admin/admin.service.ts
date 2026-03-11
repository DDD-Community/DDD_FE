import { getMemberById, createAdmin, deactivateAdmin } from "@ddd/db";
import type { Admin } from "@ddd/db";

export async function grantAdmin(memberId: string, role: Admin["role"]) {
  const m = await getMemberById(memberId);
  if (!m) throw new Error("MEMBER_NOT_FOUND");
  return createAdmin({ memberId, role });
}

export async function revokeAdmin(adminId: string) {
  const result = await deactivateAdmin(adminId);
  if (!result) throw new Error("ADMIN_NOT_FOUND");
  return result;
}
