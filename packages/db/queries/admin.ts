import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { admin, type NewAdmin } from "../schema";

export async function getAdminsByMemberId(memberId: string) {
  return db
    .select()
    .from(admin)
    .where(and(eq(admin.memberId, memberId), eq(admin.isActive, true)));
}

export async function isAdmin(memberId: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(admin)
    .where(and(eq(admin.memberId, memberId), eq(admin.isActive, true)))
    .limit(1);
  return rows.length > 0;
}

export async function createAdmin(data: NewAdmin) {
  const rows = await db.insert(admin).values(data).returning();
  return rows[0];
}

export async function deactivateAdmin(id: string) {
  const rows = await db
    .update(admin)
    .set({ isActive: false })
    .where(eq(admin.id, id))
    .returning();
  return rows[0] ?? null;
}
