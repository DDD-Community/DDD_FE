import { useState } from "react"
import { toast } from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"

import { attendanceQueries } from "@ddd/api"

import { triggerCsvDownload } from "@/shared/lib/triggerCsvDownload"

export function useDownloadAttendanceCsv() {
  const queryClient = useQueryClient()
  const [isExporting, setIsExporting] = useState(false)

  const download = async ({
    generationId,
    generationName,
  }: {
    generationId: number
    generationName: string
  }) => {
    setIsExporting(true)
    try {
      const csv = await queryClient.fetchQuery({
        ...attendanceQueries.exportBoardCsv({ params: { generationId } }),
        staleTime: 0,
        gcTime: 0,
      })
      triggerCsvDownload({ csv, filenamePrefix: `출석현황_${generationName}_` })
    } catch (error) {
      toast.danger("출석 현황 CSV 다운로드에 실패했습니다", {
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
