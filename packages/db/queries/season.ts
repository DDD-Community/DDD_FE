import { eq } from "drizzle-orm";
import { db } from "../index";
import { season, type NewSeason } from "../schema";

export async function getSeasons() {
  return db.select().from(season).orderBy(season.number);
}

export async function getSeasonById(id: string) {
  const rows = await db.select().from(season).where(eq(season.id, id));
  return rows[0] ?? null;
}

export async function getActiveSeason() {
  const rows = await db
    .select()
    .from(season)
    .where(eq(season.status, "ACTIVE"));
  return rows[0] ?? null;
}

export async function createSeason(data: NewSeason) {
  const rows = await db.insert(season).values(data).returning();
  return rows[0];
}

export async function updateSeason(id: string, data: Partial<NewSeason>) {
  const rows = await db
    .update(season)
    .set(data)
    .where(eq(season.id, id))
    .returning();
  return rows[0] ?? null;
}
