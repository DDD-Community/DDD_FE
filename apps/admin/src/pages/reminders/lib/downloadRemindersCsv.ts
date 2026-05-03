import { earlyNotificationAPI } from "@ddd/api"

const BOM = "﻿"

const formatYyyyMmDd = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}${m}${day}`
}

export async function downloadRemindersCsv({
  cohortId,
  cohortName,
}: {
  cohortId: number
  cohortName: string
}): Promise<void> {
  const csv = await earlyNotificationAPI.exportAdminCsv({
    params: { cohortId },
  })

  const blob = new Blob([BOM + csv], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `사전알림_${cohortName}_${formatYyyyMmDd(new Date())}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
