import { eq, and } from "drizzle-orm";
import { db } from "../index";
import {
  application,
  type NewApplication,
  type Application,
} from "../schema";

type ApplicationFilter = {
  seasonId?: string;
  field?: Application["field"];
  status?: Application["status"];
};

export async function getApplications(filter: ApplicationFilter = {}) {
  const conditions = [];
  if (filter.seasonId) conditions.push(eq(application.seasonId, filter.seasonId));
  if (filter.field) conditions.push(eq(application.field, filter.field));
  if (filter.status) conditions.push(eq(application.status, filter.status));

  return db
    .select()
    .from(application)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
}

export async function getApplicationById(id: string) {
  const rows = await db
    .select()
    .from(application)
    .where(eq(application.id, id));
  return rows[0] ?? null;
}

export async function createApplication(data: NewApplication) {
  const rows = await db.insert(application).values(data).returning();
  return rows[0];
}

export async function updateApplicationStatus(
  id: string,
  status: Application["status"]
) {
  const rows = await db
    .update(application)
    .set({ status })
    .where(eq(application.id, id))
    .returning();
  return rows[0] ?? null;
}
