import { Calendar, DateField, DatePicker, Input } from "@heroui/react"
import { Controller, useFormContext } from "react-hook-form"

import { Section } from "@/shared/ui/Section"
import { toCalendarDate } from "@/shared/lib/toDateValue"

import { CURRICULUM_WEEK_COUNT } from "../../../constants"
import type { SemesterRegisterForm } from "../../../types"

export function CurriculumSection() {
  const { control, register } = useFormContext<SemesterRegisterForm>()
  return (
    <Section title="커리큘럼">
      <div className="space-y-3">
        {Array.from({ length: CURRICULUM_WEEK_COUNT }, (_, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-sm text-gray-500">
              {index + 1}주차
            </span>
            <Controller
              control={control}
              name={`curriculum.${index}.date`}
              render={({ field }) => (
                <DatePicker
                  aria-label={`${index + 1}주차 날짜`}
                  className="w-1/2"
                  value={toCalendarDate(field.value)}
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
                  <DatePicker.Popover placement="bottom start">
                    <Calendar aria-label={`${index + 1}주차 날짜`}>
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
            <Input
              aria-label={`${index + 1}주차 내용`}
              placeholder="내용 입력"
              className="w-full"
              {...register(`curriculum.${index}.description`)}
            />
          </div>
        ))}
      </div>
    </Section>
  )
}
