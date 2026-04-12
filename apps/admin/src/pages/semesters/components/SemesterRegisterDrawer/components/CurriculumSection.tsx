import type { DateValue } from "@internationalized/date"
import { parseDate } from "@internationalized/date"
import { Input, Fieldset, Calendar, DateField, DatePicker } from "@heroui/react"

import type { CurriculumWeek } from "../../../types"

type Props = {
  curriculum: CurriculumWeek[]
  onChange: (
    weekIndex: number,
    field: keyof CurriculumWeek,
    value: string
  ) => void
}

export function CurriculumSection({ curriculum, onChange }: Props) {
  return (
    <Fieldset>
      <Fieldset.Legend className="underline">커리큘럼</Fieldset.Legend>
      <div className="mt-4 space-y-3">
        {curriculum.map((week, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-sm text-gray-600">
              {index + 1}주차
            </span>
            <DatePicker
              className="w-1/2"
              value={week.date ? parseDate(week.date) : null}
              onChange={(val: DateValue | null) =>
                onChange(index, "date", val?.toString() ?? "")
              }
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
                <Calendar aria-label={`${index + 1}주차 날짜 선택`}>
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
                  <Calendar.YearPickerGrid>
                    <Calendar.YearPickerGridBody>
                      {({ year }) => <Calendar.YearPickerCell year={year} />}
                    </Calendar.YearPickerGridBody>
                  </Calendar.YearPickerGrid>
                </Calendar>
              </DatePicker.Popover>
            </DatePicker>
            <Input
              placeholder="내용 입력"
              value={week.description}
              onChange={(e) => onChange(index, "description", e.target.value)}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </Fieldset>
  )
}
