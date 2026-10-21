import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { googleCalendarAPI } from "./api";
import { googleCalendarKeys } from "./queryKeys";

export const googleCalendarQueries = {
  getStatus: () =>
    queryOptions({
      queryKey: googleCalendarKeys.status(),
      queryFn: googleCalendarAPI.getStatus,
    }),
};

export const googleCalendarMutations = {
  connect: () => mutationOptions({ mutationFn: googleCalendarAPI.connect }),
  disconnect: () => mutationOptions({ mutationFn: googleCalendarAPI.disconnect }),
};
