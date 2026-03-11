import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { member, type NewMember } from "../schema";

type MemberFilter = {
  seasonId?: string;
  isActive?: boolean;
};

export async function getMembers(filter: MemberFilter = {}) {
  const conditions = [];
  if (filter.seasonId) conditions.push(eq(member.seasonId, filter.seasonId));
  if (filter.isActive !== undefined)
    conditions.push(eq(member.isActive, filter.isActive));

  return db
    .select()
    .from(member)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
}

export async function getMemberById(id: string) {
  const rows = await db.select().from(member).where(eq(member.id, id));
  return rows[0] ?? null;
}

export async function getMemberByEmail(email: string) {
  const rows = await db
    .select()
    .from(member)
    .where(eq(member.email, email));
  return rows[0] ?? null;
}

export async function createMember(data: NewMember) {
  try {
    const rows = await db.insert(member).values(data).returning();
    return rows[0];
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "23505"
    ) {
      throw new Error("DUPLICATE_EMAIL");
    }
    throw e;
  }
}

export async function updateMember(id: string, data: Partial<NewMember>) {
  const rows = await db
    .update(member)
    .set(data)
    .where(eq(member.id, id))
    .returning();
  return rows[0] ?? null;
}
