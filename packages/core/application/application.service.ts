import {
  getApplicationById,
  updateApplicationStatus,
  createMember,
} from "@ddd/db";
import { ERROR_CODE } from "../errors";

export async function passApplication(applicationId: string) {
  const application = await getApplicationById(applicationId);
  if (!application) throw new Error(ERROR_CODE.APPLICATION_NOT_FOUND);
  if (application.status === "PASSED") throw new Error(ERROR_CODE.ALREADY_PASSED);
  if (application.status === "FAILED") throw new Error(ERROR_CODE.ALREADY_FAILED);

  await updateApplicationStatus(applicationId, "PASSED");
  await createMember({
    applicationId: application.id,
    seasonId: application.seasonId,
    name: application.name,
    email: application.email,
    phone: application.phone,
  });
}

export async function failApplication(applicationId: string) {
  const application = await getApplicationById(applicationId);
  if (!application) throw new Error(ERROR_CODE.APPLICATION_NOT_FOUND);
  if (application.status === "PASSED") throw new Error(ERROR_CODE.ALREADY_PASSED);
  if (application.status === "FAILED") throw new Error(ERROR_CODE.ALREADY_FAILED);

  await updateApplicationStatus(applicationId, "FAILED");
}

export async function moveToInterview(applicationId: string) {
  const application = await getApplicationById(applicationId);
  if (!application) throw new Error(ERROR_CODE.APPLICATION_NOT_FOUND);
  if (application.status !== "RECEIVED") throw new Error(ERROR_CODE.INVALID_STATUS_TRANSITION);

  await updateApplicationStatus(applicationId, "INTERVIEW");
}
