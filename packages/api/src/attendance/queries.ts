import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { attendanceAPI } from "./api";
import { attendanceKeys } from "./queryKeys";
import type {
  DeleteAttendanceGenerationParams,
  DeleteAttendanceInvitationParams,
  DeleteAttendanceTeamParams,
  GetAttendanceBoardCsvParams,
  GetAttendanceBoardParams,
  GetAttendanceInvitationsParams,
  GetAttendanceTeamsParams,
  PostAttendanceGenerationRequest,
  PostAttendanceInvitationParams,
  PostAttendanceInvitationRequest,
  PostAttendanceTeamParams,
  PostAttendanceTeamRequest,
} from "./types";

export const attendanceQueries = {
  /**
   * 출석 기수 목록 조회 쿼리
   *
   * @param 없음
   * @returns 출석 기수 목록 query options
   * @example useQuery(attendanceQueries.getGenerations())
   */
  getGenerations: () =>
    queryOptions({
      queryKey: attendanceKeys.generations(),
      queryFn: attendanceAPI.getGenerations,
    }),

  /**
   * 출석 팀 목록 조회 쿼리
   *
   * @param params 기수 ID 조회 파라미터
   * @returns 출석 팀 목록 query options
   * @example useQuery(attendanceQueries.getTeams({ params: { generationId: 1 } }))
   */
  getTeams: ({ params }: { params: GetAttendanceTeamsParams }) =>
    queryOptions({
      queryKey: attendanceKeys.teams(params.generationId),
      queryFn: () => attendanceAPI.getTeams({ params }),
      enabled: !!params.generationId,
    }),

  /**
   * 출석 초대코드 목록 조회 쿼리
   *
   * @param params 기수 ID 조회 파라미터
   * @returns 출석 초대코드 목록 query options
   * @example useQuery(attendanceQueries.getInvitations({ params: { generationId: 1 } }))
   */
  getInvitations: ({ params }: { params: GetAttendanceInvitationsParams }) =>
    queryOptions({
      queryKey: attendanceKeys.invitations(params.generationId),
      queryFn: () => attendanceAPI.getInvitations({ params }),
      enabled: !!params.generationId,
    }),

  /**
   * 출석 보드 조회 쿼리
   *
   * @param params 기수 ID 조회 파라미터
   * @returns 출석 보드 query options
   * @example useQuery(attendanceQueries.getBoard({ params: { generationId: 1 } }))
   */
  getBoard: ({ params }: { params: GetAttendanceBoardParams }) =>
    queryOptions({
      queryKey: attendanceKeys.board(params.generationId),
      queryFn: () => attendanceAPI.getBoard({ params }),
      enabled: !!params.generationId,
    }),

  /**
   * 출석 보드 CSV 조회 쿼리
   *
   * @param params 기수 ID 조회 파라미터
   * @returns CSV 문자열 query options
   * @example queryClient.fetchQuery(attendanceQueries.exportBoardCsv({ params: { generationId: 1 } }))
   */
  exportBoardCsv: ({ params }: { params: GetAttendanceBoardCsvParams }) =>
    queryOptions({
      queryKey: [...attendanceKeys.board(params.generationId), "export"] as const,
      queryFn: () => attendanceAPI.exportBoardCsv({ params }),
      enabled: !!params.generationId,
    }),
};

export const attendanceMutations = {
  /**
   * 출석 기수 생성 mutation
   *
   * @param payload 출석 기수 생성 데이터
   * @returns 출석 기수 생성 mutation options
   * @example useMutation(attendanceMutations.createGeneration())
   */
  createGeneration: () =>
    mutationOptions({
      mutationFn: ({ payload }: { payload: PostAttendanceGenerationRequest }) =>
        attendanceAPI.createGeneration({ payload }),
    }),

  /**
   * 출석 기수 삭제 mutation
   *
   * @param params 삭제할 기수 ID
   * @returns 출석 기수 삭제 mutation options
   * @example useMutation(attendanceMutations.deleteGeneration())
   */
  deleteGeneration: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: DeleteAttendanceGenerationParams }) =>
        attendanceAPI.deleteGeneration({ params }),
    }),

  /**
   * 출석 팀 생성 mutation
   *
   * @param params 출석 기수 ID
   * @param payload 출석 팀 생성 데이터
   * @returns 출석 팀 생성 mutation options
   * @example useMutation(attendanceMutations.createTeam())
   */
  createTeam: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: PostAttendanceTeamParams;
        payload: PostAttendanceTeamRequest;
      }) => attendanceAPI.createTeam({ params, payload }),
    }),

  /**
   * 출석 팀 삭제 mutation
   *
   * @param params 삭제할 팀 ID
   * @returns 출석 팀 삭제 mutation options
   * @example useMutation(attendanceMutations.deleteTeam())
   */
  deleteTeam: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: DeleteAttendanceTeamParams }) =>
        attendanceAPI.deleteTeam({ params }),
    }),

  /**
   * 출석 초대코드 생성 mutation
   *
   * @param params 출석 기수 ID
   * @param payload 초대코드 생성 데이터
   * @returns 초대코드 생성 mutation options
   * @example useMutation(attendanceMutations.createInvitation())
   */
  createInvitation: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: PostAttendanceInvitationParams;
        payload: PostAttendanceInvitationRequest;
      }) => attendanceAPI.createInvitation({ params, payload }),
    }),

  /**
   * 출석 초대코드 삭제 mutation
   *
   * @param params 삭제할 초대 코드 ID
   * @returns 초대코드 삭제 mutation options
   * @example useMutation(attendanceMutations.deleteInvitation())
   */
  deleteInvitation: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: DeleteAttendanceInvitationParams }) =>
        attendanceAPI.deleteInvitation({ params }),
    }),
};
