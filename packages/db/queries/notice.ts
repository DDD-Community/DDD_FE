import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { notice, type NewNotice, type Notice } from "../schema";

type NoticeFilter = {
  target?: Notice["target"];
  isPublished?: boolean;
};

export async function getNotices(filter: NoticeFilter = {}) {
  const conditions = [];
  if (filter.target) conditions.push(eq(notice.target, filter.target));
  if (filter.isPublished !== undefined)
    conditions.push(eq(notice.isPublished, filter.isPublished));

  return db
    .select()
    .from(notice)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
}

export async function getNoticeById(id: string) {
  const rows = await db.select().from(notice).where(eq(notice.id, id));
  return rows[0] ?? null;
}

export async function createNotice(data: NewNotice) {
  const rows = await db.insert(notice).values(data).returning();
  return rows[0];
}

export async function updateNotice(id: string, data: Partial<NewNotice>) {
  const rows = await db
    .update(notice)
    .set(data)
    .where(eq(notice.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteNotice(id: string) {
  const rows = await db
    .delete(notice)
    .where(eq(notice.id, id))
    .returning();
  return rows[0] ?? null;
}
