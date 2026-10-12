export const attendanceKeys = {
  all: ["attendance"] as const,
  generations: () => [...attendanceKeys.all, "generations"] as const,
  teams: (generationId: number) =>
    [...attendanceKeys.all, "generations", generationId, "teams"] as const,
  invitations: (generationId: number) =>
    [...attendanceKeys.all, "generations", generationId, "invitations"] as const,
  board: (generationId: number) =>
    [...attendanceKeys.all, "generations", generationId, "board"] as const,
};
