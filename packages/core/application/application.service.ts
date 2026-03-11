import {
  getApplicationById,
  updateApplicationStatus,
  createMember,
} from "@ddd/db";

export async function passApplication(applicationId: string) {
  const app = await getApplicationById(applicationId);
  if (!app) throw new Error("APPLICATION_NOT_FOUND");
  if (app.status === "PASSED") throw new Error("ALREADY_PASSED");
  if (app.status === "FAILED") throw new Error("ALREADY_FAILED");

  await updateApplicationStatus(applicationId, "PASSED");
  await createMember({
    applicationId: app.id,
    seasonId: app.seasonId,
    name: app.name,
    email: app.email,
    phone: app.phone,
  });
}

export async function failApplication(applicationId: string) {
  const app = await getApplicationById(applicationId);
  if (!app) throw new Error("APPLICATION_NOT_FOUND");
  if (app.status === "PASSED") throw new Error("ALREADY_PASSED");
  if (app.status === "FAILED") throw new Error("ALREADY_FAILED");

  await updateApplicationStatus(applicationId, "FAILED");
}

export async function moveToInterview(applicationId: string) {
  const app = await getApplicationById(applicationId);
  if (!app) throw new Error("APPLICATION_NOT_FOUND");
  if (app.status !== "RECEIVED") throw new Error("INVALID_STATUS_TRANSITION");

  await updateApplicationStatus(applicationId, "INTERVIEW");
}
