import type {
  AttendanceVoteExportKind,
  AttendanceVoteStatus,
  AttendanceVoteSummary,
  AttendanceVoteTeamResults,
} from "@ddd/api"

export const VOTE_STATUS_LABEL: Record<AttendanceVoteStatus, string> = {
  DRAFT: "작성 중",
  OPEN: "진행 중",
  CLOSED: "종료",
}

export const VOTE_STATUS_COLOR = {
  DRAFT: "default",
  OPEN: "success",
  CLOSED: "accent",
} as const

export const VOTE_CSV_LABEL: Record<AttendanceVoteExportKind, string> = {
  "team-vote": "팀 투표 결과",
  feedback: "피드백 결과",
  responses: "개인별 응답(실명)",
  "non-responders": "미참여 명단",
}

export function formatVoteDateTime(value: string | null): string {
  if (!value) return "-"
  return `${value.slice(0, 10)} ${value.slice(11, 16)}`
}

export function formatVoteTeamName(
  name: string | null,
  teamId: number
): string {
  return name ?? `#${teamId}`
}

export function calculateVotePercentage(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0
}

type VoteTeam = AttendanceVoteTeamResults["categories"][number]["teams"][number]

export function rankVoteTeams(teams: VoteTeam[]): VoteTeam[] {
  const sorted = teams
    .filter((team) => team.voteCount > 0)
    .sort((a, b) => b.voteCount - a.voteCount)

  return sorted.map((team) => ({
    ...team,
    rank: sorted.findIndex((other) => other.voteCount === team.voteCount) + 1,
  }))
}

export function chooseDefaultVote(
  votes: AttendanceVoteSummary[]
): AttendanceVoteSummary | null {
  return (
    votes.find((vote) => vote.status === "OPEN") ??
    votes.reduce<AttendanceVoteSummary | null>(
      (latest, vote) =>
        latest === null || vote.voteId > latest.voteId ? vote : latest,
      null
    )
  )
}
