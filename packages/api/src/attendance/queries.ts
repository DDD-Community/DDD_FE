import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { attendanceAPI } from "./api";
import { attendanceKeys } from "./queryKeys";
import type {
  DeleteAttendanceGenerationParams,
  DeleteAttendanceInvitationParams,
  DeleteAttendanceTeamParams,
  DeleteAttendanceVoteParams,
  CloseAttendanceVoteParams,
  GetAttendanceBoardCsvParams,
  GetAttendanceBoardParams,
  GetAttendanceInvitationsParams,
  GetAttendanceTeamsParams,
  GetAttendanceVoteCsvParams,
  GetAttendanceVoteFeedbackResultsParams,
  GetAttendanceVoteNonRespondersParams,
  GetAttendanceVoteParams,
  GetAttendanceVoteParticipationParams,
  GetAttendanceVotesParams,
  GetAttendanceVoteTeamResultsParams,
  OpenAttendanceVoteParams,
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

  /** 출석 투표 목록 조회 쿼리 - useQuery(attendanceQueries.getVotes({ params: { generationId: 1 } })) */
  getVotes: ({ params }: { params: GetAttendanceVotesParams }) =>
    queryOptions({
      queryKey: attendanceKeys.votes(params.generationId),
      queryFn: () => attendanceAPI.getVotes({ params }),
      enabled: !!params.generationId,
    }),

  /** 출석 투표 상세 조회 쿼리 - useQuery(attendanceQueries.getVote({ params: { voteId: 1 } })) */
  getVote: ({ params }: { params: GetAttendanceVoteParams }) =>
    queryOptions({
      queryKey: attendanceKeys.vote(params.voteId),
      queryFn: () => attendanceAPI.getVote({ params }),
      enabled: !!params.voteId,
    }),

  /** 출석 투표 참여 현황 조회 쿼리 */
  getVoteParticipation: ({ params }: { params: GetAttendanceVoteParticipationParams }) =>
    queryOptions({
      queryKey: attendanceKeys.voteParticipation(params.voteId),
      queryFn: () => attendanceAPI.getVoteParticipation({ params }),
      enabled: !!params.voteId,
    }),

  /** 출석 투표 미참여 명단 조회 쿼리 */
  getVoteNonResponders: ({ params }: { params: GetAttendanceVoteNonRespondersParams }) =>
    queryOptions({
      queryKey: attendanceKeys.voteNonResponders(params.voteId),
      queryFn: () => attendanceAPI.getVoteNonResponders({ params }),
      enabled: !!params.voteId,
    }),

  /** 출석 투표 팀 결과 조회 쿼리 */
  getVoteTeamResults: ({ params }: { params: GetAttendanceVoteTeamResultsParams }) =>
    queryOptions({
      queryKey: attendanceKeys.voteTeamResults(params.voteId),
      queryFn: () => attendanceAPI.getVoteTeamResults({ params }),
      enabled: !!params.voteId,
    }),

  /** 출석 투표 피드백 결과 조회 쿼리 */
  getVoteFeedbackResults: ({ params }: { params: GetAttendanceVoteFeedbackResultsParams }) =>
    queryOptions({
      queryKey: attendanceKeys.voteFeedbackResults(params.voteId),
      queryFn: () => attendanceAPI.getVoteFeedbackResults({ params }),
      enabled: !!params.voteId,
    }),

  /** 출석 투표 CSV 조회 쿼리 */
  exportVoteCsv: ({ params }: { params: GetAttendanceVoteCsvParams }) =>
    queryOptions({
      queryKey: [...attendanceKeys.vote(params.voteId), "export", params.kind] as const,
      queryFn: () => attendanceAPI.exportVoteCsv({ params }),
      enabled: !!params.voteId,
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

  /** 작성 중 출석 투표 삭제 mutation */
  deleteVote: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: DeleteAttendanceVoteParams }) =>
        attendanceAPI.deleteVote({ params }),
    }),

  /** 출석 투표 시작 mutation */
  openVote: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: OpenAttendanceVoteParams }) =>
        attendanceAPI.openVote({ params }),
    }),

  /** 출석 투표 종료 mutation */
  closeVote: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: CloseAttendanceVoteParams }) =>
        attendanceAPI.closeVote({ params }),
    }),
};
