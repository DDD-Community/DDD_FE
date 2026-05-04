import { Button, toast } from "@heroui/react"
import { useFormContext, useWatch } from "react-hook-form"

import { useUploadFile } from "@ddd/api"

import type { ProjectFormValues } from "@/entities/project"
import { cn } from "@/shared/lib/cn"

export const ThumbnailUploader = () => {
  const { control, setValue } = useFormContext<ProjectFormValues>()
  const url = useWatch({ control, name: "thumbnailUrl" })
  const uploadFile = useUploadFile()

  const handleSelect = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadFile.mutateAsync({
        params: { category: "project-thumbnail" },
        payload: formData,
      })
      setValue("thumbnailUrl", result.url, { shouldValidate: true })
    } catch (error) {
      toast.danger("썸네일 업로드에 실패했습니다", {
        description: (error as Error).message,
      })
    }
  }

  const handleClear = () =>
    setValue("thumbnailUrl", "", { shouldValidate: true })

  const isUploading = uploadFile.isPending

  return (
    <div className="space-y-2">
      {url ? (
        <div className="relative inline-block">
          <img
            src={url}
            alt="썸네일 미리보기"
            className="h-24 w-24 rounded-md border border-gray-200 object-cover"
          />
          <Button
            size="sm"
            variant="outline"
            onPress={handleClear}
            className="ml-2"
          >
            제거
          </Button>
        </div>
      ) : (
        <label
          className={cn(
            "flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-8 text-center transition hover:border-blue-400",
            isUploading && "pointer-events-none opacity-60",
          )}
        >
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleSelect(file)
            }}
          />
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              {isUploading ? "업로드 중..." : "이미지를 클릭해서 업로드"}
            </p>
            <p className="text-xs text-gray-400">PNG, JPG (최대 5MB)</p>
          </div>
        </label>
      )}
    </div>
  )
}
