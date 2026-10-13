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
};
