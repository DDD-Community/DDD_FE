import { getMemberById, updateMember } from "@ddd/db";
import type { Member } from "@ddd/db";

export async function assignTeam(memberId: string, team: Member["team"]) {
  const m = await getMemberById(memberId);
  if (!m) throw new Error("MEMBER_NOT_FOUND");
  return updateMember(memberId, { team });
}

export async function deactivateMember(memberId: string) {
  const m = await getMemberById(memberId);
  if (!m) throw new Error("MEMBER_NOT_FOUND");
  if (!m.isActive) throw new Error("ALREADY_INACTIVE");
  return updateMember(memberId, { isActive: false });
}
