import { useCallback } from "react"
import { Button, toast } from "@heroui/react"
import { useFormContext, useWatch } from "react-hook-form"

import { validateProjectAssetFile } from "@/pages/projects/lib/projectAsset"
import type { ProjectFormValues } from "@/pages/projects/lib/projectForm"
import { cn } from "@/shared/lib/cn"

interface ThumbnailUploaderProps {
  isUploading: boolean
  errorMessage?: string
}

const PREVIEW_IMAGE_CLASS_NAME =
  "h-24 w-24 rounded-md border border-gray-200 object-cover"

const BROKEN_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#f3f4f6"/><text x="48" y="52" font-size="11" fill="#9ca3af" text-anchor="middle">이미지 오류</text></svg>'
  )

/**
 * 파일을 골라도 업로드하지 않는다. File 은 폼 state 에만 두고, 저장 시점에
 * useCreateOrUpdateProjectFlow 가 프로젝트 id 와 함께 올린다.
 */
export function ThumbnailUploader({
  isUploading,
  errorMessage,
}: ThumbnailUploaderProps) {
  const { control, setValue } = useFormContext<ProjectFormValues>()
  const savedUrl = useWatch({ control, name: "thumbnailUrl" })
  const selectedFile = useWatch({ control, name: "thumbnailFile" })

  // object URL 은 <img> 가 붙을 때 만들고 떨어질 때(파일 교체·선택 취소·업로드 완료·언마운트)
  // 해제한다. React 19 ref cleanup 이라 생성과 해제가 항상 짝을 이루고, state 를 거치지 않는다.
  const attachObjectUrlPreview = useCallback(
    function attachObjectUrlPreview(image: HTMLImageElement) {
      if (!selectedFile) return
      const objectUrl = URL.createObjectURL(selectedFile)
      image.src = objectUrl
      return () => URL.revokeObjectURL(objectUrl)
    },
    [selectedFile]
  )

  function handleSelect(file: File) {
    const validationMessage = validateProjectAssetFile("thumbnail", file)
    if (validationMessage) {
      toast.danger(validationMessage)
      return
    }
    setValue("thumbnailFile", file, { shouldDirty: true })
  }

  function handleCancelSelection() {
    setValue("thumbnailFile", null, { shouldDirty: true })
  }

  const hasPreview = Boolean(selectedFile || savedUrl)

  return (
    <div className="space-y-2">
      {hasPreview ? (
        <div className="flex items-end gap-2">
          {selectedFile ? (
            <img
              key="selected"
              ref={attachObjectUrlPreview}
              alt="선택한 썸네일 미리보기"
              className={PREVIEW_IMAGE_CLASS_NAME}
            />
          ) : (
            <img
              key="saved"
              src={savedUrl}
              alt="썸네일 미리보기"
              className={PREVIEW_IMAGE_CLASS_NAME}
              onError={(e) => {
                e.currentTarget.src = BROKEN_IMAGE_PLACEHOLDER
              }}
            />
          )}
          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-xs text-gray-500">
                {isUploading ? "업로드 중..." : "저장 시 업로드"}
              </p>
              <Button
                size="sm"
                variant="outline"
                isDisabled={isUploading}
                onPress={handleCancelSelection}
              >
                선택 취소
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <label
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 text-center transition hover:border-blue-400",
          hasPreview ? "py-3" : "py-8",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
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
            {hasPreview ? "다른 이미지로 교체" : "이미지를 클릭해서 선택"}
          </p>
          <p className="text-xs text-gray-400">JPG, PNG, WEBP (최대 5MB)</p>
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
