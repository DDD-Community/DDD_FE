import { Button, toast } from "@heroui/react"
import { useFormContext, useWatch } from "react-hook-form"

import {
  formatFileSize,
  validateProjectAssetFile,
} from "@/pages/projects/lib/projectAsset"
import type { ProjectFormValues } from "@/pages/projects/lib/projectForm"
import { cn } from "@/shared/lib/cn"

interface PdfUploaderProps {
  isUploading: boolean
  errorMessage?: string
}

/** URL 마지막 세그먼트를 파일명으로 표시 (없으면 전체 URL) */
function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname
    return decodeURIComponent(path.slice(path.lastIndexOf("/") + 1)) || url
  } catch {
    return url
  }
}

/**
 * 파일을 골라도 업로드하지 않는다. File 은 폼 state 에만 두고, 저장 시점에
 * useCreateOrUpdateProjectFlow 가 프로젝트 id 와 함께 올린다.
 */
export function PdfUploader({ isUploading, errorMessage }: PdfUploaderProps) {
  const { control, setValue } = useFormContext<ProjectFormValues>()
  const savedUrl = useWatch({ control, name: "pdfUrl" })
  const selectedFile = useWatch({ control, name: "pdfFile" })

  function handleSelect(file: File) {
    const validationMessage = validateProjectAssetFile("pdf", file)
    if (validationMessage) {
      toast.danger(validationMessage)
      return
    }
    setValue("pdfFile", file, { shouldDirty: true })
  }

  function handleCancelSelection() {
    setValue("pdfFile", null, { shouldDirty: true })
  }

  const hasFile = Boolean(selectedFile || savedUrl)

  return (
    <div className="space-y-2">
      {selectedFile ? (
        <div className="flex items-center gap-2">
          <p className="truncate text-sm text-gray-800">
            {selectedFile.name}
            <span className="ml-2 text-xs text-gray-500">
              {formatFileSize(selectedFile.size)}
            </span>
          </p>
          <span className="shrink-0 text-xs text-gray-500">
            {isUploading ? "업로드 중..." : "저장 시 업로드"}
          </span>
          <Button
            size="sm"
            variant="outline"
            isDisabled={isUploading}
            onPress={handleCancelSelection}
          >
            선택 취소
          </Button>
        </div>
      ) : savedUrl ? (
        <a
          href={savedUrl}
          target="_blank"
          rel="noreferrer"
          className="block truncate text-sm text-blue-600 underline"
        >
          {fileNameFromUrl(savedUrl)}
        </a>
      ) : null}

      <label
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 text-center transition hover:border-blue-400",
          hasFile ? "py-3" : "py-8",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleSelect(file)
            e.target.value = "" // 같은 파일 재선택 허용
          }}
        />
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            {hasFile ? "다른 PDF로 교체" : "PDF를 클릭해서 선택"}
          </p>
          <p className="text-xs text-gray-400">PDF (최대 20MB)</p>
        </div>
      </label>

      {errorMessage ? (
        <p role="alert" className="text-xs text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
