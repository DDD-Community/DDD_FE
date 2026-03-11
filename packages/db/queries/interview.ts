import { eq } from "drizzle-orm";
import { db } from "../index";
import { interview, type NewInterview } from "../schema";

export async function getInterviewByApplicationId(applicationId: string) {
  const rows = await db
    .select()
    .from(interview)
    .where(eq(interview.applicationId, applicationId));
  return rows[0] ?? null;
}

export async function createInterview(data: NewInterview) {
  const rows = await db.insert(interview).values(data).returning();
  return rows[0];
}

export async function updateInterview(
  id: string,
  data: Partial<NewInterview>
) {
  const rows = await db
    .update(interview)
    .set(data)
    .where(eq(interview.id, id))
    .returning();
  return rows[0] ?? null;
}
