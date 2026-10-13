import { useState } from "react"

import type { AttendanceGeneration } from "@ddd/api"

export function useSelectedAttendanceGeneration(
  generations: AttendanceGeneration[]
) {
  const [requestedId, setRequestedId] = useState<number | null>(null)
  const generation =
    generations.find((item) => item.id === requestedId) ??
    generations.reduce<AttendanceGeneration | null>(
      (largest, item) =>
        largest === null || item.id > largest.id ? item : largest,
      null
    )

  return { generation, select: setRequestedId }
}
