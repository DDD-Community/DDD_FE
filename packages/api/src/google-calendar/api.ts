import { api } from "../fetchClient";
import type {
  GoogleCalendarAuthorizationResponseDto,
  GoogleCalendarStatusResponseDto,
} from "./types";

export const googleCalendarAPI = {
  getStatus: () =>
    api.get(
      "/api/v1/admin/google-calendar/status",
    ) as unknown as Promise<GoogleCalendarStatusResponseDto>,
  connect: () =>
    api.post(
      "/api/v1/admin/google-calendar/connect",
    ) as unknown as Promise<GoogleCalendarAuthorizationResponseDto>,
  disconnect: () =>
    api.delete("/api/v1/admin/google-calendar/connection") as unknown as Promise<void>,
};
