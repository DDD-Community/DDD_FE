import type { ProjectPlatform } from "@ddd/api"

export const PLATFORM_LABEL: Record<ProjectPlatform, string> = {
  IOS: "iOS",
  AOS: "AOS",
  WEB: "WEB",
}

export const PLATFORM_OPTIONS: ProjectPlatform[] = ["IOS", "AOS", "WEB"]

export const PART_OPTIONS = ["PM", "PD", "BE", "FE", "IOS", "AND"] as const
export type ProjectPart = (typeof PART_OPTIONS)[number]

export const PART_LABEL: Record<ProjectPart, string> = {
  PM: "PM",
  PD: "PD",
  BE: "Back-end",
  FE: "Front-end",
  IOS: "iOS",
  AND: "Android",
}
