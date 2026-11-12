import { useState } from "react"

import type { AttendanceVoteSummary } from "@ddd/api"
import { chooseDefaultVote } from "../lib/vote"

export function useSelectedVote(votes: AttendanceVoteSummary[]) {
  const [requestedVoteId, setRequestedVoteId] = useState<number | null>(null)
  const vote =
    votes.find((item) => item.voteId === requestedVoteId) ??
    chooseDefaultVote(votes)

  return { vote, select: setRequestedVoteId }
}
