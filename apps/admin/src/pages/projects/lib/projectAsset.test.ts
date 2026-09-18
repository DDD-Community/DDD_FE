import { describe, expect, it } from "vitest"

import { ApiError } from "@ddd/api"

import {
  formatFileSize,
  toAssetUploadErrorMessage,
  validateProjectAssetFile,
} from "./projectAsset"

const MEGABYTE = 1024 * 1024

function createFile(name: string, type: string, size: number): File {
  const file = new File([""], name, { type })
  Object.defineProperty(file, "size", { value: size })
  return file
}

describe("validateProjectAssetFile", () => {
  it("20MB 이하 PDF 는 통과한다", () => {
    const file = createFile("final.pdf", "application/pdf", 20 * MEGABYTE)
    expect(validateProjectAssetFile("pdf", file)).toBeNull()
  })

  it("21MB PDF 는 용량 초과로 막는다", () => {
    const file = createFile("final.pdf", "application/pdf", 21 * MEGABYTE)
    expect(validateProjectAssetFile("pdf", file)).toBe(
      "PDF 는 20MB 까지 올릴 수 있어요"
    )
  })

  it("PDF 자리에 .txt 를 고르면 타입으로 막는다", () => {
    const file = createFile("memo.txt", "text/plain", 10)
    expect(validateProjectAssetFile("pdf", file)).toBe(
      "PDF 파일만 올릴 수 있어요"
    )
  })

  it("MIME 은 pdf 인데 확장자가 다르면 막는다", () => {
    const file = createFile("final.txt", "application/pdf", 10)
    expect(validateProjectAssetFile("pdf", file)).toBe(
      "PDF 파일만 올릴 수 있어요"
    )
  })

  it.each([
    ["cover.jpg", "image/jpeg"],
    ["cover.jpeg", "image/jpeg"],
    ["cover.PNG", "image/png"],
    ["cover.webp", "image/webp"],
  ])("썸네일 %s (%s) 는 통과한다", (name, type) => {
    expect(
      validateProjectAssetFile("thumbnail", createFile(name, type, 5 * MEGABYTE))
    ).toBeNull()
  })

  it("6MB 이미지는 용량 초과로 막는다", () => {
    const file = createFile("cover.png", "image/png", 6 * MEGABYTE)
    expect(validateProjectAssetFile("thumbnail", file)).toBe(
      "썸네일은 5MB 까지 올릴 수 있어요"
    )
  })

  it("썸네일 자리에 gif 를 고르면 타입으로 막는다", () => {
    const file = createFile("cover.gif", "image/gif", 10)
    expect(validateProjectAssetFile("thumbnail", file)).toBe(
      "이미지(jpg, png, webp)만 올릴 수 있어요"
    )
  })
})

describe("toAssetUploadErrorMessage", () => {
  it("용량 초과는 종류별 상한 문구로 바꾼다", () => {
    const error = new ApiError("FILE_SIZE_EXCEEDED", "파일 용량은 최대 20MB 입니다.")
    expect(toAssetUploadErrorMessage("thumbnail", error)).toBe(
      "썸네일은 5MB 까지 올릴 수 있어요"
    )
  })

  it("타입 불일치는 종류별 허용 타입 문구로 바꾼다", () => {
    const error = new ApiError("FILE_TYPE_NOT_ALLOWED", "PDF 파일만 업로드할 수 있습니다.")
    expect(toAssetUploadErrorMessage("thumbnail", error)).toBe(
      "이미지(jpg, png, webp)만 올릴 수 있어요"
    )
  })

  it("프로젝트가 없으면 새로고침을 안내한다", () => {
    const error = new ApiError("PROJECT_NOT_FOUND", "프로젝트를 찾을 수 없습니다.")
    expect(toAssetUploadErrorMessage("pdf", error)).toBe(
      "프로젝트를 찾을 수 없어요. 목록을 새로고침해 주세요"
    )
  })

  it("네트워크 오류처럼 ApiError 가 아니면 재시도를 안내한다", () => {
    expect(toAssetUploadErrorMessage("pdf", new TypeError("Failed to fetch"))).toBe(
      "업로드에 실패했어요. 잠시 후 다시 시도해 주세요"
    )
  })
})

describe("formatFileSize", () => {
  it("1MB 미만은 KB 로 표기한다", () => {
    expect(formatFileSize(512 * 1024)).toBe("512KB")
  })

  it("1MB 이상은 소수 첫째 자리 MB 로 표기한다", () => {
    expect(formatFileSize(12.34 * MEGABYTE)).toBe("12.3MB")
  })
})
