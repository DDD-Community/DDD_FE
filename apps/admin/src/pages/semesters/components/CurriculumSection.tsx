import { Input } from "@heroui/react"
import { Controller, useFormContext } from "react-hook-form"

import { Section } from "@/shared/ui/Section"

import { CURRICULUM_WEEK_COUNT } from "../constants"
import type { SemesterRegisterForm } from "../types"

export function CurriculumSection() {
  const { control, register } = useFormContext<SemesterRegisterForm>()
  return (
    <Section title="커리큘럼">
      <div className="space-y-3">
        <p className="text-sm text-gray-500">
          출석 시작 시각은 기본 14:00이며 주차별로 바꿀 수 있습니다. 시각이 있는 주차만
          출석앱 일정으로 동기화되고, 시작 후 11분까지 출석, 60분까지 지각으로 처리됩니다.
        </p>
        {Array.from({ length: CURRICULUM_WEEK_COUNT }, (_, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-sm text-gray-500">
              {index + 1}주차
            </span>
            <Controller
              control={control}
              name={`curriculum.${index}.date`}
              render={({ field }) => (
                <Input
                  type="date"
                  aria-label={`${index + 1}주차 날짜`}
                  className="w-1/2"
                  value={field.value?.slice(0, 10) ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
            <Controller
              control={control}
              name={`curriculum.${index}.time`}
              render={({ field }) => (
                <Input
                  type="time"
                  aria-label={`${index + 1}주차 출석 시작 시각`}
                  className="w-36"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
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
