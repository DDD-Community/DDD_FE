import { Input, Select, ListBox } from "@heroui/react"
import type { CohortDto } from "@ddd/api"
import { FlexBox } from "@/shared/ui/FlexBox"
import type { ApplicationStatus } from "../constants"
import { NEXT_STATUS } from "../constants"

const ALL_STATUSES = Object.keys(NEXT_STATUS) as ApplicationStatus[]

type ApplicationFiltersProps = {
  searchText: string
  onSearchChange: (v: string) => void
  cohorts: CohortDto[]
  selectedCohortId: number | undefined
  onCohortChange: (id: number | undefined) => void
  selectedCohortPartId: number | undefined
  onCohortPartChange: (id: number | undefined) => void
  selectedStatus: ApplicationStatus | undefined
  onStatusChange: (s: ApplicationStatus | undefined) => void
}

export const ApplicationFilters = ({
  searchText,
  onSearchChange,
  cohorts,
  selectedCohortId,
  onCohortChange,
  selectedCohortPartId,
  onCohortPartChange,
  selectedStatus,
  onStatusChange,
}: ApplicationFiltersProps) => {
  const selectedCohort = cohorts.find((c) => c.id === selectedCohortId)
  const parts = (selectedCohort?.parts ?? []) as unknown as Array<{
    id: number
    name: string
  }>

  return (
    <FlexBox className="flex-wrap gap-3">
      <Input
        variant="secondary"
        placeholder="이름 또는 연락처 검색..."
        className="max-w-xs"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select variant="secondary" className="max-w-40" aria-label="기수 필터">
        <Select.Trigger>
          <Select.Value>
            {selectedCohort?.name ?? "전체 기수"}
          </Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item
              id="all"
              textValue="전체 기수"
              onClick={() => onCohortChange(undefined)}
            >
              전체 기수
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
      <Select
        variant="secondary"
        className="max-w-36"
        aria-label="파트 필터"
        isDisabled={!selectedCohortId || parts.length === 0}
      >
        <Select.Trigger>
          <Select.Value>
            {parts.find((p) => p.id === selectedCohortPartId)?.name ?? "전체 파트"}
          </Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item
              id="all-part"
              textValue="전체 파트"
              onClick={() => onCohortPartChange(undefined)}
            >
              전체 파트
            </ListBox.Item>
            {parts.map((p) => (
              <ListBox.Item
                key={p.id}
                id={String(p.id)}
                textValue={p.name}
                onClick={() => onCohortPartChange(p.id)}
              >
                {p.name}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      <Select variant="secondary" className="max-w-40" aria-label="상태 필터">
        <Select.Trigger>
          <Select.Value>{selectedStatus ?? "전체 상태"}</Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item
              id="all-status"
              textValue="전체 상태"
              onClick={() => onStatusChange(undefined)}
            >
              전체 상태
            </ListBox.Item>
            {ALL_STATUSES.map((s) => (
              <ListBox.Item
                key={s}
                id={s}
                textValue={s}
                onClick={() => onStatusChange(s)}
              >
                {s}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </FlexBox>
  )
}
