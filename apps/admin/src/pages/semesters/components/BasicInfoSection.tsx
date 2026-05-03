import {
  Calendar,
  DateField,
  DatePicker,
  Input,
  ListBox,
  Select,
} from "@heroui/react"
import { Controller } from "react-hook-form"
import type { Control, UseFormRegister } from "react-hook-form"

import { GridBox } from "@/shared/ui/GridBox"

import { STATUS_OPTIONS } from "../constants"
import type { SemesterRegisterForm } from "../types"

import { FormField, SectionTitle } from "./shared"

interface Props {
  control: Control<SemesterRegisterForm>
  register: UseFormRegister<SemesterRegisterForm>
}

export function BasicInfoSection({ control, register }: Props) {
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

        <FormField label="모집 시작일">
          <Controller
            control={control}
            name="recruitStartDate"
            render={({ field }) => (
              <DatePicker
                className="w-full"
                value={null}
                onChange={(date) => field.onChange(date?.toString() ?? "")}
              >
                <DateField.Group fullWidth>
                  <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>
                  <DateField.Suffix>
                    <DatePicker.Trigger>
                      <DatePicker.TriggerIndicator />
                    </DatePicker.Trigger>
                  </DateField.Suffix>
                </DateField.Group>
                <DatePicker.Popover>
                  <Calendar aria-label="모집 시작일">
                    <Calendar.Header>
                      <Calendar.YearPickerTrigger>
                        <Calendar.YearPickerTriggerHeading />
                        <Calendar.YearPickerTriggerIndicator />
                      </Calendar.YearPickerTrigger>
                      <Calendar.NavButton slot="previous" />
                      <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                      <Calendar.GridHeader>
                        {(day) => (
                          <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                        )}
                      </Calendar.GridHeader>
                      <Calendar.GridBody>
                        {(date) => <Calendar.Cell date={date} />}
                      </Calendar.GridBody>
                    </Calendar.Grid>
                  </Calendar>
                </DatePicker.Popover>
              </DatePicker>
            )}
          />
        </FormField>

        <FormField label="모집 종료일">
          <Controller
            control={control}
            name="recruitEndDate"
            render={({ field }) => (
              <DatePicker
                className="w-full"
                value={null}
                onChange={(date) => field.onChange(date?.toString() ?? "")}
              >
                <DateField.Group fullWidth>
                  <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>
                  <DateField.Suffix>
                    <DatePicker.Trigger>
                      <DatePicker.TriggerIndicator />
                    </DatePicker.Trigger>
                  </DateField.Suffix>
                </DateField.Group>
                <DatePicker.Popover>
                  <Calendar aria-label="모집 종료일">
                    <Calendar.Header>
                      <Calendar.YearPickerTrigger>
                        <Calendar.YearPickerTriggerHeading />
                        <Calendar.YearPickerTriggerIndicator />
                      </Calendar.YearPickerTrigger>
                      <Calendar.NavButton slot="previous" />
                      <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                      <Calendar.GridHeader>
                        {(day) => (
                          <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                        )}
                      </Calendar.GridHeader>
                      <Calendar.GridBody>
                        {(date) => <Calendar.Cell date={date} />}
                      </Calendar.GridBody>
                    </Calendar.Grid>
                  </Calendar>
                </DatePicker.Popover>
              </DatePicker>
            )}
          />
        </FormField>
      </GridBox>
    </section>
  )
}
