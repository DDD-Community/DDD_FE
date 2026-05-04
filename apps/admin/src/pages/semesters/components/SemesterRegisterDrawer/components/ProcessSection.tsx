import {
  Calendar,
  DateField,
  DatePicker,
  DateRangePicker,
  RangeCalendar,
} from "@heroui/react"
import { Controller, useFormContext, useWatch } from "react-hook-form"

import { toCalendarDate, toDateRangeValue } from "@/shared/lib/toDateValue"
import { GridBox } from "@/shared/ui/GridBox"

import type { SemesterRegisterForm } from "../../../types"

import { FormField, SectionTitle } from "./shared"

export function ProcessSection() {
  const { control, setValue } = useFormContext<SemesterRegisterForm>()

  const documentAcceptStart = useWatch({
    control,
    name: "process.documentAcceptStartDate",
  })
  const documentAcceptEnd = useWatch({
    control,
    name: "process.documentAcceptEndDate",
  })
  const interviewStart = useWatch({
    control,
    name: "process.interviewStartDate",
  })
  const interviewEnd = useWatch({
    control,
    name: "process.interviewEndDate",
  })

  return (
    <section className="space-y-4">
      <SectionTitle>프로세스 일정</SectionTitle>
      <GridBox className="grid-cols-2 gap-5">
        <FormField label="서류 접수">
          <DateRangePicker
            className="w-full"
            value={toDateRangeValue(documentAcceptStart, documentAcceptEnd)}
            onChange={(value) => {
              setValue(
                "process.documentAcceptStartDate",
                value?.start.toString() ?? "",
                { shouldDirty: true }
              )
              setValue(
                "process.documentAcceptEndDate",
                value?.end.toString() ?? "",
                { shouldDirty: true }
              )
            }}
          >
            <DateField.Group fullWidth>
              <DateField.Input slot="start">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateRangePicker.RangeSeparator />
              <DateField.Input slot="end">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateField.Suffix>
                <DateRangePicker.Trigger>
                  <DateRangePicker.TriggerIndicator />
                </DateRangePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DateRangePicker.Popover placement="bottom start">
              <RangeCalendar aria-label="서류 접수 기간">
                <RangeCalendar.Header>
                  <RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.YearPickerTriggerHeading />
                    <RangeCalendar.YearPickerTriggerIndicator />
                  </RangeCalendar.YearPickerTrigger>
                  <RangeCalendar.NavButton slot="previous" />
                  <RangeCalendar.NavButton slot="next" />
                </RangeCalendar.Header>
                <RangeCalendar.Grid>
                  <RangeCalendar.GridHeader>
                    {(day) => (
                      <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                    )}
                  </RangeCalendar.GridHeader>
                  <RangeCalendar.GridBody>
                    {(date) => <RangeCalendar.Cell date={date} />}
                  </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
              </RangeCalendar>
            </DateRangePicker.Popover>
          </DateRangePicker>
        </FormField>

        <FormField label="서류 발표">
          <Controller
            control={control}
            name="process.documentResultDate"
            render={({ field }) => (
              <DatePicker
                className="w-full"
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
                  <Calendar aria-label="서류 발표">
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

        <FormField label="인터뷰 날짜">
          <DateRangePicker
            className="w-full"
            value={toDateRangeValue(interviewStart, interviewEnd)}
            onChange={(value) => {
              setValue(
                "process.interviewStartDate",
                value?.start.toString() ?? "",
                { shouldDirty: true }
              )
              setValue(
                "process.interviewEndDate",
                value?.end.toString() ?? "",
                { shouldDirty: true }
              )
            }}
          >
            <DateField.Group fullWidth>
              <DateField.Input slot="start">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateRangePicker.RangeSeparator />
              <DateField.Input slot="end">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateField.Suffix>
                <DateRangePicker.Trigger>
                  <DateRangePicker.TriggerIndicator />
                </DateRangePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DateRangePicker.Popover placement="bottom start">
              <RangeCalendar aria-label="인터뷰 기간">
                <RangeCalendar.Header>
                  <RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.YearPickerTriggerHeading />
                    <RangeCalendar.YearPickerTriggerIndicator />
                  </RangeCalendar.YearPickerTrigger>
                  <RangeCalendar.NavButton slot="previous" />
                  <RangeCalendar.NavButton slot="next" />
                </RangeCalendar.Header>
                <RangeCalendar.Grid>
                  <RangeCalendar.GridHeader>
                    {(day) => (
                      <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                    )}
                  </RangeCalendar.GridHeader>
                  <RangeCalendar.GridBody>
                    {(date) => <RangeCalendar.Cell date={date} />}
                  </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
              </RangeCalendar>
            </DateRangePicker.Popover>
          </DateRangePicker>
        </FormField>

        <FormField label="최종 발표">
          <Controller
            control={control}
            name="process.finalResultDate"
            render={({ field }) => (
              <DatePicker
                className="w-full"
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
                  <Calendar aria-label="최종 발표">
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
