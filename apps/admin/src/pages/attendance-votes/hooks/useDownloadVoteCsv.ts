import { useState } from "react"
import { toast } from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"
import { attendanceQueries } from "@ddd/api"
import type { AttendanceVoteExportKind } from "@ddd/api"
import { triggerCsvDownload } from "@/shared/lib/triggerCsvDownload"
import { VOTE_CSV_LABEL } from "../lib/vote"

export function useDownloadVoteCsv() {
  const queryClient = useQueryClient()
  const [isExporting, setIsExporting] = useState(false)

  const download = async ({
    voteId,
    title,
    kind,
  }: {
    voteId: number
    title: string
    kind: AttendanceVoteExportKind
  }) => {
    setIsExporting(true)
    try {
      const csv = await queryClient.fetchQuery({
        ...attendanceQueries.exportVoteCsv({ params: { voteId, kind } }),
        staleTime: 0,
        gcTime: 0,
      })
      triggerCsvDownload({
        csv,
        filenamePrefix: `출석투표_${title}_${VOTE_CSV_LABEL[kind]}_`,
      })
    } catch (error) {
      toast.danger("투표 CSV 다운로드에 실패했습니다", {
        description:
          error instanceof Error
            ? error.message
            : "잠시 후 다시 시도해 주세요.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return { download, isExporting }
}
