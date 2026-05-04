import { Input, ListBox, Select } from "@heroui/react"
import { Controller, useFormContext } from "react-hook-form"

import { GridBox } from "@/shared/ui/GridBox"

import { STATUS_OPTIONS } from "../../../constants"
import type { SemesterRegisterForm } from "../../../types"

import { FormField, SectionTitle } from "./shared"

export function BasicInfoSection() {
  const { control, register } = useFormContext<SemesterRegisterForm>()
  return (
    <section className="space-y-4">
      <SectionTitle>기본 정보</SectionTitle>
      <GridBox className="grid-cols-2 gap-5">
        <FormField label="기수">
          <Input
            type="text"
            placeholder="예: 16"
            className="w-full"
            {...register("cohortNumber")}
          />
        </FormField>

        <FormField label="상태">
          <Controller
            control={control}
            name="status"
            render={({ field }) => {
              const selectedLabel =
                STATUS_OPTIONS.find((o) => o.value === field.value)?.label ??
                "선택"
              return (
                <Select className="w-full" aria-label="상태">
                  <Select.Trigger>
                    <Select.Value>{selectedLabel}</Select.Value>
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {STATUS_OPTIONS.map((opt) => (
                        <ListBox.Item
                          key={opt.value}
                          id={opt.value}
                          textValue={opt.label}
                          onClick={() => field.onChange(opt.value)}
                        >
                          {opt.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )
            }}
          />
        </FormField>
      </GridBox>
    </section>
  )
}
