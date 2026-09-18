import { ApiError } from "@ddd/api"

export type ProjectAssetKind = "pdf" | "thumbnail"

interface ProjectAssetRule {
  label: string
  mimeTypes: readonly string[]
  extensions: readonly string[]
  maxBytes: number
  typeMessage: string
  sizeMessage: string
}

// BE 정책(storage.type.ts 의 project-pdf / project-thumbnail)과 같은 값이다.
// 선택 단계에서 막아야 20MB 를 올린 뒤에야 400·413 을 받는 일이 없다.
export const PROJECT_ASSET_RULE: Record<ProjectAssetKind, ProjectAssetRule> = {
  pdf: {
    label: "PDF",
    mimeTypes: ["application/pdf"],
    extensions: [".pdf"],
    maxBytes: 20 * 1024 * 1024,
    typeMessage: "PDF 파일만 올릴 수 있어요",
    sizeMessage: "PDF 는 20MB 까지 올릴 수 있어요",
  },
  thumbnail: {
    label: "썸네일",
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxBytes: 5 * 1024 * 1024,
    typeMessage: "이미지(jpg, png, webp)만 올릴 수 있어요",
    sizeMessage: "썸네일은 5MB 까지 올릴 수 있어요",
  },
}

/** 통과하면 null, 막히면 사용자에게 보여줄 문구를 돌려준다. */
export function validateProjectAssetFile(
  kind: ProjectAssetKind,
  file: File
): string | null {
  const rule = PROJECT_ASSET_RULE[kind]
  const fileName = file.name.toLowerCase()
  const hasAllowedType = rule.mimeTypes.includes(file.type)
  const hasAllowedExtension = rule.extensions.some((extension) =>
    fileName.endsWith(extension)
  )

  // BE 가 MIME 과 확장자를 둘 다 검사한다(FILE_TYPE_NOT_ALLOWED).
  if (!hasAllowedType || !hasAllowedExtension) return rule.typeMessage
  if (file.size > rule.maxBytes) return rule.sizeMessage
  return null
}

const FALLBACK_UPLOAD_ERROR_MESSAGE =
  "업로드에 실패했어요. 잠시 후 다시 시도해 주세요"

export function toAssetUploadErrorMessage(
  kind: ProjectAssetKind,
  error: unknown
): string {
  if (!(error instanceof ApiError)) return FALLBACK_UPLOAD_ERROR_MESSAGE

  const rule = PROJECT_ASSET_RULE[kind]
  const messageByCode: Partial<Record<ApiError["code"], string>> = {
    FILE_NOT_PROVIDED: "파일을 선택해 주세요",
    FILE_TYPE_NOT_ALLOWED: rule.typeMessage,
    // 413 은 fetchClient 가 상태 코드만 보고 FILE_SIZE_EXCEEDED 로 통일해 던진다.
    FILE_SIZE_EXCEEDED: rule.sizeMessage,
    PAYLOAD_TOO_LARGE: rule.sizeMessage,
    PROJECT_NOT_FOUND: "프로젝트를 찾을 수 없어요. 목록을 새로고침해 주세요",
    FILE_UPLOAD_FAILED: FALLBACK_UPLOAD_ERROR_MESSAGE,
  }

  return messageByCode[error.code] ?? FALLBACK_UPLOAD_ERROR_MESSAGE
}

export function formatFileSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024)
  if (megabytes >= 1) return `${megabytes.toFixed(1)}MB`
  return `${Math.round(bytes / 1024)}KB`
}
