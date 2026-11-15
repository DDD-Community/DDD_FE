import { describe, expect, it } from "vitest"
import type { AttendanceVoteSummary } from "@ddd/api"
import {
  calculateVotePercentage,
  chooseDefaultVote,
  formatVoteDateTime,
  formatVoteTeamName,
  VOTE_CSV_LABEL,
  VOTE_STATUS_LABEL,
} from "./vote"

const vote = (
  voteId: number,
  status: AttendanceVoteSummary["status"]
): AttendanceVoteSummary => ({
  voteId,
  generationId: 1,
  title: `투표 ${voteId}`,
  status,
  templateVersion: 1,
  openedAt: null,
  closedAt: null,
  createdDate: "2026-11-07T14:03:22",
  responseCount: 0,
})

describe("vote helpers", () => {
  it("formats server-local timestamps without timezone conversion", () => {
    expect(formatVoteDateTime("2026-11-07T14:03:22")).toBe("2026-11-07 14:03")
    expect(formatVoteDateTime("2026-11-07T14:03:22.123456")).toBe(
      "2026-11-07 14:03"
    )
    expect(formatVoteDateTime(null)).toBe("-")
  })

  it("prefers an open vote, then the greatest vote ID", () => {
    expect(
      chooseDefaultVote([vote(3, "CLOSED"), vote(1, "OPEN"), vote(5, "DRAFT")])
        ?.voteId
    ).toBe(1)
    expect(
      chooseDefaultVote([vote(3, "CLOSED"), vote(5, "DRAFT")])?.voteId
    ).toBe(5)
    expect(chooseDefaultVote([])).toBeNull()
  })

  it("handles missing team names and zero response totals", () => {
    expect(formatVoteTeamName(null, 7)).toBe("#7")
    expect(formatVoteTeamName("팀", 7)).toBe("팀")
    expect(calculateVotePercentage(3, 0)).toBe(0)
    expect(calculateVotePercentage(2, 3)).toBe(67)
  })

  it("provides status and export labels", () => {
    expect(VOTE_STATUS_LABEL.OPEN).toBe("진행 중")
    expect(VOTE_CSV_LABEL.responses).toBe("개인별 응답(실명)")
  })
})
