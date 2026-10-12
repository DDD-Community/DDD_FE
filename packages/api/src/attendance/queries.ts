import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { attendanceAPI } from "./api";
import { attendanceKeys } from "./queryKeys";
import type {
  AttendanceGenerationParams,
  AttendanceInvitationParams,
  AttendanceTeamParams,
  CreateAttendanceGenerationRequest,
  CreateAttendanceInvitationRequest,
  CreateAttendanceTeamRequest,
} from "./types";

export const attendanceQueries = {
  /** @example useQuery(attendanceQueries.getGenerations()) */
  getGenerations: () =>
    queryOptions({
      queryKey: attendanceKeys.generations(),
      queryFn: attendanceAPI.getGenerations,
    }),

  /** @example useQuery(attendanceQueries.getTeams({ params: { generationId: 1 } })) */
  getTeams: ({ params }: { params: AttendanceGenerationParams }) =>
    queryOptions({
      queryKey: attendanceKeys.teams(params.generationId),
      queryFn: () => attendanceAPI.getTeams({ params }),
      enabled: !!params.generationId,
    }),

  /** @example useQuery(attendanceQueries.getInvitations({ params: { generationId: 1 } })) */
  getInvitations: ({ params }: { params: AttendanceGenerationParams }) =>
    queryOptions({
      queryKey: attendanceKeys.invitations(params.generationId),
      queryFn: () => attendanceAPI.getInvitations({ params }),
      enabled: !!params.generationId,
    }),

  /** @example useQuery(attendanceQueries.getBoard({ params: { generationId: 1 } })) */
  getBoard: ({ params }: { params: AttendanceGenerationParams }) =>
    queryOptions({
      queryKey: attendanceKeys.board(params.generationId),
      queryFn: () => attendanceAPI.getBoard({ params }),
      enabled: !!params.generationId,
    }),

  /** @example queryClient.fetchQuery(attendanceQueries.exportBoardCsv({ params: { generationId: 1 } })) */
  exportBoardCsv: ({ params }: { params: AttendanceGenerationParams }) =>
    queryOptions({
      queryKey: [...attendanceKeys.board(params.generationId), "export"] as const,
      queryFn: () => attendanceAPI.exportBoardCsv({ params }),
      enabled: !!params.generationId,
    }),
};

export const attendanceMutations = {
  /** @example useMutation(attendanceMutations.createGeneration()) */
  createGeneration: () =>
    mutationOptions({
      mutationFn: ({ payload }: { payload: CreateAttendanceGenerationRequest }) =>
        attendanceAPI.createGeneration({ payload }),
    }),

  /** @example useMutation(attendanceMutations.deleteGeneration()) */
  deleteGeneration: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: AttendanceGenerationParams }) =>
        attendanceAPI.deleteGeneration({ params }),
    }),

  /** @example useMutation(attendanceMutations.createTeam()) */
  createTeam: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: AttendanceGenerationParams;
        payload: CreateAttendanceTeamRequest;
      }) => attendanceAPI.createTeam({ params, payload }),
    }),

  /** @example useMutation(attendanceMutations.deleteTeam()) */
  deleteTeam: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: AttendanceTeamParams }) =>
        attendanceAPI.deleteTeam({ params }),
    }),

  /** @example useMutation(attendanceMutations.createInvitation()) */
  createInvitation: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: AttendanceGenerationParams;
        payload: CreateAttendanceInvitationRequest;
      }) => attendanceAPI.createInvitation({ params, payload }),
    }),

  /** @example useMutation(attendanceMutations.deleteInvitation()) */
  deleteInvitation: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: AttendanceInvitationParams }) =>
        attendanceAPI.deleteInvitation({ params }),
    }),
};
