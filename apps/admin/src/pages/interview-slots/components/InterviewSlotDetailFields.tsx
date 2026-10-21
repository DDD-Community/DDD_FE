import { Input, TextArea } from "@heroui/react"
import { Controller, useFormContext, useWatch } from "react-hook-form"

import { FormField } from "@/shared/ui/FormField"

import type { InterviewSlotSharedForm } from "../types"
import { InterviewSlotInterviewersField } from "./InterviewSlotInterviewersField"

/** 단건·반복 등록이 공유하는 수용 인원 / 장소 / 설명 */
export function InterviewSlotDetailFields() {
  const { control } = useFormContext<InterviewSlotSharedForm>()
  const interviewerUserIds = useWatch({ control, name: "interviewerUserIds" })

  return (
    <>
      <FormField label="수용 인원">
        <Controller
          control={control}
          name="capacity"
          render={({ field, fieldState }) => (
            <>
              <Input
                type="number"
                min={1}
                aria-label="수용 인원"
                value={String(field.value)}
                onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                className="w-full"
              />
              {fieldState.error && (
                <p className="mt-1 text-xs text-danger">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </FormField>

      <InterviewSlotInterviewersField />

      <FormField label={interviewerUserIds.length > 0 ? "장소 (선택)" : "장소"}>
        <Controller
          control={control}
          name="location"
          render={({ field, fieldState }) => (
            <>
              <Input
                aria-label="장소"
                placeholder="강남구청 회의실 / Google Meet"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="w-full"
              />
              {fieldState.error && (
                <p className="mt-1 text-xs text-danger">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
        {interviewerUserIds.length > 0 && (
          <p className="mt-1 text-xs text-muted">
            지원자에게는 회의 주소 대신 시작 10분 전부터 열리는 입장 링크가
            메일로 갑니다.
          </p>
        )}
      </FormField>

      <FormField label="설명 (선택)">
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextArea
              aria-label="설명"
              placeholder="추가 안내 사항"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              className="w-full"
            />
          )}
        />
      </FormField>
    </>
  )
}
