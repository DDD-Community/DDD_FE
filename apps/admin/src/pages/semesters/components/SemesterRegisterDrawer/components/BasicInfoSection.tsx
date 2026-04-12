import { Input, Select, ListBox, TextField, Label } from "@heroui/react"

import { STATUS_OPTIONS } from "../../../constants"
import type { SemesterRegisterForm } from "../../../types"

import { SectionFieldset } from "./SectionFieldset"
import { SemesterDatePicker } from "./SemesterDatePicker"

type Props = {
  form: SemesterRegisterForm
  onChange: (
    field: keyof Pick<
      SemesterRegisterForm,
      "cohortNumber" | "status" | "recruitStartDate" | "recruitEndDate"
    >,
    value: string
  ) => void
}

export function BasicInfoSection({ form, onChange }: Props) {
  return (
    <SectionFieldset legend="기본 정보">
      <TextField>
        <Label>기수</Label>
        <Input
          type="text"
          placeholder="예: 16"
          value={form.cohortNumber}
          onChange={(e) => onChange("cohortNumber", e.target.value)}
        />
      </TextField>
      <TextField>
        <Label>상태</Label>
        <Select>
          <Select.Trigger>
            <Select.Value>
              {STATUS_OPTIONS.find(
                (opt: (typeof STATUS_OPTIONS)[0]) => opt.value === form.status
              )?.label || "상태 선택"}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {STATUS_OPTIONS.map((opt: (typeof STATUS_OPTIONS)[0]) => (
                <ListBox.Item key={opt.value} textValue={opt.value}>
                  {opt.label}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </TextField>
      <SemesterDatePicker
        label="모집 시작일"
        value={form.recruitStartDate}
        onChange={(value) => onChange("recruitStartDate", value)}
      />
      <SemesterDatePicker
        label="모집 종료일"
        value={form.recruitEndDate}
        onChange={(value) => onChange("recruitEndDate", value)}
      />
    </SectionFieldset>
  )
}
