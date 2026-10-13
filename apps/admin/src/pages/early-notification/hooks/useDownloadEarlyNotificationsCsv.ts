import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@heroui/react"

import { earlyNotificationQueries } from "@ddd/api"

import { triggerCsvDownload } from "@/shared/lib/triggerCsvDownload"

export const useDownloadEarlyNotificationsCsv = () => {
  const queryClient = useQueryClient()
  const [isExporting, setIsExporting] = useState(false)

  const download = async ({
    cohortId,
    cohortName,
  }: {
    cohortId: number
    cohortName: string
  }) => {
    setIsExporting(true)
    try {
      const csv = await queryClient.fetchQuery({
        ...earlyNotificationQueries.getAdminEarlyNotificationsCsv({
          params: { cohortId },
        }),
        staleTime: 0,
        gcTime: 0,
      })
      triggerCsvDownload({ csv, filenamePrefix: `사전알림_${cohortName}_` })
    } catch (error) {
      toast.danger("CSV 내보내기에 실패했습니다", {
        description:
          error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return { download, isExporting }
}
