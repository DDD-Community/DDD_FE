const BOM = "﻿"

const formatYyyyMmDd = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}${month}${day}`
}

const sanitizeFilename = (value: string): string =>
  // eslint-disable-next-line no-control-regex
  value.replace(/[\\/:*?"<>|\x00-\x1f]/g, "_")

export function triggerCsvDownload({
  csv,
  filenamePrefix,
}: {
  csv: string
  filenamePrefix: string
}): void {
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `${sanitizeFilename(filenamePrefix)}${formatYyyyMmDd(new Date())}.csv`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
