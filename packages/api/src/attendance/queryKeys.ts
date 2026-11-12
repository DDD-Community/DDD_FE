export const attendanceKeys = {
  /** 출석 도메인 base key */
  all: ["attendance"] as const,

  /** 출석 기수 목록 key */
  generations: () => [...attendanceKeys.all, "generations"] as const,

  /** 출석 기수 팀 목록 key */
  teams: (generationId: number) =>
    [...attendanceKeys.all, "generations", generationId, "teams"] as const,

  /** 출석 기수 초대코드 목록 key */
  invitations: (generationId: number) =>
    [...attendanceKeys.all, "generations", generationId, "invitations"] as const,

  /** 출석 기수 보드 key */
  board: (generationId: number) =>
    [...attendanceKeys.all, "generations", generationId, "board"] as const,

  /** 출석 기수 투표 목록 key */
  votes: (generationId: number) =>
    [...attendanceKeys.all, "generations", generationId, "votes"] as const,

  /** 출석 투표 상세 key */
  vote: (voteId: number) => [...attendanceKeys.all, "votes", voteId] as const,

  /** 출석 투표 참여 현황 key */
  voteParticipation: (voteId: number) => [...attendanceKeys.vote(voteId), "participation"] as const,

  /** 출석 투표 미참여 명단 key */
  voteNonResponders: (voteId: number) =>
    [...attendanceKeys.vote(voteId), "non-responders"] as const,

  /** 출석 투표 팀 결과 key */
  voteTeamResults: (voteId: number) =>
    [...attendanceKeys.vote(voteId), "team-vote-results"] as const,

  /** 출석 투표 피드백 결과 key */
  voteFeedbackResults: (voteId: number) =>
    [...attendanceKeys.vote(voteId), "feedback-results"] as const,
};
