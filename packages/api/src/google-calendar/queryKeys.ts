export const googleCalendarKeys = {
  all: ["google-calendar"] as const,
  status: () => [...googleCalendarKeys.all, "status"] as const,
};
