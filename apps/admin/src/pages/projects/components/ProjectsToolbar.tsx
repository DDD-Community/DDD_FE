import { Input, ListBox, Select } from "@heroui/react"

import type { CohortDto, ProjectPlatform } from "@ddd/api"

import { PLATFORM_LABEL, PLATFORM_OPTIONS } from "@/entities/project"
import { FlexBox } from "@/shared/ui/FlexBox"

export type PlatformFilterValue = ProjectPlatform | "ALL"
export type CohortFilterValue = number | "ALL"

type ProjectsToolbarProps = {
  searchText: string
  onSearchTextChange: (value: string) => void
  platform: PlatformFilterValue
  onPlatformChange: (value: PlatformFilterValue) => void
  cohortId: CohortFilterValue
  onCohortChange: (value: CohortFilterValue) => void
  cohorts: CohortDto[]
}

const ALL_PLATFORM_LABEL = "전체 플랫폼"
const ALL_COHORT_LABEL = "전체 기수"

export const ProjectsToolbar = ({
  searchText,
  onSearchTextChange,
  platform,
  onPlatformChange,
  cohortId,
  onCohortChange,
  cohorts,
}: ProjectsToolbarProps) => {
  const platformLabel =
    platform === "ALL" ? ALL_PLATFORM_LABEL : PLATFORM_LABEL[platform]
  const cohortLabel =
    cohortId === "ALL"
      ? ALL_COHORT_LABEL
      : (cohorts.find((c) => c.id === cohortId)?.name ?? `${cohortId}기`)

  return (
    <FlexBox className="justify-between">
      <Input
        variant="secondary"
        placeholder="서비스명 검색..."
        className="max-w-xs"
        value={searchText}
        onChange={(e) => onSearchTextChange(e.target.value)}
      />
      <FlexBox className="gap-2">
        <Select
          variant="secondary"
          className="max-w-40"
          aria-label="플랫폼 필터"
        >
          <Select.Trigger>
            <Select.Value>{platformLabel}</Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item
                id="ALL"
                textValue={ALL_PLATFORM_LABEL}
                onClick={() => onPlatformChange("ALL")}
              >
                {ALL_PLATFORM_LABEL}
              </ListBox.Item>
              {PLATFORM_OPTIONS.map((p) => (
                <ListBox.Item
                  key={p}
                  id={p}
                  textValue={PLATFORM_LABEL[p]}
                  onClick={() => onPlatformChange(p)}
                >
                  {PLATFORM_LABEL[p]}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <Select variant="secondary" className="max-w-40" aria-label="기수 필터">
          <Select.Trigger>
            <Select.Value>{cohortLabel}</Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item
                id="ALL"
                textValue={ALL_COHORT_LABEL}
                onClick={() => onCohortChange("ALL")}
              >
                {ALL_COHORT_LABEL}
              </ListBox.Item>
              {cohorts.map((c) => (
                <ListBox.Item
                  key={c.id}
                  id={String(c.id)}
                  textValue={c.name}
                  onClick={() => onCohortChange(c.id)}
                >
                  {c.name}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </FlexBox>
    </FlexBox>
  )
}
