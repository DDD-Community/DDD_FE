import { Button, Input, ListBox, Select } from "@heroui/react"
import {
  Download04Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import type { CohortDto } from "@ddd/api"

import { FlexBox } from "@/shared/ui/FlexBox"

import {
  STATUS_FILTER_OPTIONS,
  type StatusFilterOption,
} from "../constants"

type RemindersToolbarProps = {
  searchText: string
  onSearchChange: (v: string) => void
  cohorts: CohortDto[]
  cohortId: number | null
  onCohortChange: (id: number) => void
  statusFilter: StatusFilterOption
  onStatusFilterChange: (v: StatusFilterOption) => void
  onOpenBulkSend: () => void
  isBulkSendDisabled: boolean
  onExportCsv: () => void
  isExporting: boolean
  isExportDisabled: boolean
}

export const RemindersToolbar = ({
  searchText,
  onSearchChange,
  cohorts,
  cohortId,
  onCohortChange,
  statusFilter,
  onStatusFilterChange,
  onOpenBulkSend,
  isBulkSendDisabled,
  onExportCsv,
  isExporting,
  isExportDisabled,
}: RemindersToolbarProps) => {
  const selectedCohort = cohorts.find((c) => c.id === cohortId)

  return (
    <FlexBox className="flex-wrap justify-between gap-3">
      <FlexBox className="gap-2">
        <Input
          variant="secondary"
          placeholder="이메일 검색..."
          className="max-w-xs"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Select
          variant="secondary"
          className="max-w-40"
          aria-label="기수 필터"
        >
          <Select.Trigger>
            <Select.Value>
              {selectedCohort?.name ?? "기수 선택"}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {cohorts.map((cohort) => (
                <ListBox.Item
                  key={cohort.id}
                  id={String(cohort.id)}
                  textValue={cohort.name}
                  onClick={() => onCohortChange(cohort.id)}
                >
                  {cohort.name}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <Select
          variant="secondary"
          className="max-w-36"
          aria-label="상태 필터"
        >
          <Select.Trigger>
            <Select.Value>{statusFilter}</Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <ListBox.Item
                  key={option}
                  id={option}
                  textValue={option}
                  onClick={() => onStatusFilterChange(option)}
                >
                  {option}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </FlexBox>
      <FlexBox className="gap-2">
        <Button
          size="lg"
          variant="secondary"
          onPress={onExportCsv}
          isDisabled={isExportDisabled}
        >
          <HugeiconsIcon icon={Download04Icon} className="mr-2" />
          {isExporting ? "내보내는 중..." : "CSV"}
        </Button>
        <Button
          size="lg"
          onPress={onOpenBulkSend}
          isDisabled={isBulkSendDisabled}
        >
          <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
          알림 발송
        </Button>
      </FlexBox>
    </FlexBox>
  )
}
