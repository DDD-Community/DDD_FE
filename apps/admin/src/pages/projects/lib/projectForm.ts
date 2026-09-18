import { z } from "zod"

import type { ProjectDto } from "@ddd/api"

import { PART_OPTIONS, type ProjectPart } from "../constants"
import type { ProjectAssetKind } from "./projectAsset"

const memberSchema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요."),
  part: z.enum(PART_OPTIONS),
})

export const projectFormSchema = z.object({
  cohortId: z.number({ message: "기수를 선택해 주세요." }).int().positive(),
  platforms: z
    .array(z.enum(["IOS", "AOS", "WEB"] as const))
    .min(1, "최소 1개 플랫폼을 선택해 주세요."),
  name: z
    .string()
    .min(1, "서비스명을 입력해 주세요.")
    .max(100, "100자 이하로 입력해 주세요."),
  description: z
    .string()
    .min(1, "한줄 설명을 입력해 주세요.")
    .max(200, "200자 이하로 입력해 주세요."),
  // 서버에 이미 연결된 파일의 URL. 표시 전용이며 생성·수정 body 에 넣지 않는다.
  // 파일 연결은 저장 시 POST /admin/projects/:id/{pdf,thumbnail} 가 담당한다.
  thumbnailUrl: z.string(),
  pdfUrl: z.string(),
  // 새로 고른 파일. 저장 버튼을 누르기 전까지는 어디에도 올리지 않는다.
  thumbnailFile: z.instanceof(File).nullable(),
  pdfFile: z.instanceof(File).nullable(),
  members: z.array(memberSchema),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

export const PROJECT_ASSET_FIELD = {
  pdf: { file: "pdfFile", url: "pdfUrl" },
  thumbnail: { file: "thumbnailFile", url: "thumbnailUrl" },
} as const satisfies Record<
  ProjectAssetKind,
  { file: keyof ProjectFormValues; url: keyof ProjectFormValues }
>

export const buildProjectFormDefaults = (
  project?: ProjectDto,
): ProjectFormValues => ({
  cohortId: project?.cohortId ?? 0,
  platforms: project?.platforms ?? [],
  name: project?.name ?? "",
  description: project?.description ?? "",
  thumbnailUrl: project?.thumbnailUrl ?? "",
  pdfUrl: project?.pdfUrl ?? "",
  thumbnailFile: null,
  pdfFile: null,
  members:
    project?.members?.map((m) => ({
      name: m.name,
      part: (PART_OPTIONS.includes(m.part as ProjectPart)
        ? m.part
        : "PM") as ProjectPart,
    })) ?? [],
})
