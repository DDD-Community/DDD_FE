import { Input, ListBox, Select } from "@heroui/react"

import { FlexBox } from "@/shared/ui/FlexBox"

import { STATUS_FILTER_OPTIONS, type StatusFilterValue } from "../../../constants"

interface Props {
  searchText: string
  onSearchTextChange: (value: string) => void
  statusFilter: StatusFilterValue
  onStatusFilterChange: (value: StatusFilterValue) => void
}

export function SemesterTableToolbar({
  searchText,
  onSearchTextChange,
  statusFilter,
  onStatusFilterChange,
}: Props) {
  const selectedLabel = STATUS_FILTER_OPTIONS.find(
    (o) => o.value === statusFilter,
  )?.label

  return (
    <FlexBox className="justify-between">
      <Input
        variant="secondary"
        placeholder="검색..."
        className="max-w-xs"
        value={searchText}
        onChange={(e) => onSearchTextChange(e.target.value)}
      />
      <Select
        variant="secondary"
        className="max-w-36"
        aria-label="상태 필터"
      >
        <Select.Trigger>
          <Select.Value>{selectedLabel}</Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {STATUS_FILTER_OPTIONS.map((option) => (
              <ListBox.Item
                key={option.value}
                id={option.value}
                textValue={option.label}
                onClick={() => onStatusFilterChange(option.value)}
              >
                {option.label}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </FlexBox>
  )
}
