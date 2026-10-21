import { Button, Chip, ListBox, Select } from "@heroui/react"
import { useQuery } from "@tanstack/react-query"
import { useFormContext, useWatch } from "react-hook-form"

import { interviewQueries } from "@ddd/api"

import { FormField } from "@/shared/ui/FormField"

import type { InterviewSlotSharedForm } from "../types"

export function InterviewSlotInterviewersField() {
  const { control, setValue } = useFormContext<InterviewSlotSharedForm>()
  const selectedIds = useWatch({ control, name: "interviewerUserIds" })
  const {
    data: candidates = [],
    isPending,
    isError,
  } = useQuery(interviewQueries.getInterviewerCandidates())
  const available = candidates.filter(
    (candidate) => !selectedIds.includes(candidate.userId)
  )
  const host = candidates.find(
    (candidate) => candidate.userId === selectedIds[0]
  )

  function update(ids: number[]) {
    setValue("interviewerUserIds", ids, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <FormField label="면접관 (선택)">
      <Select
        aria-label="면접관 추가"
        className="w-full"
        isDisabled={isPending || isError || available.length === 0}
        // 고른 사람은 아래 목록으로 옮기고 선택칸은 늘 비워 둔다. 항목 onClick 은 키보드 선택에서 불리지 않는다.
        selectedKey={null}
        onSelectionChange={(key) => {
          if (key !== null) update([...selectedIds, Number(key)])
        }}
      >
        <Select.Trigger>
          <Select.Value>
            {isPending ? "면접관을 불러오는 중" : "면접관 추가"}
          </Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {available.map((candidate) => (
              <ListBox.Item
                key={candidate.userId}
                id={String(candidate.userId)}
                textValue={`${candidate.name} ${candidate.email}`}
              >
                {candidate.name} ({candidate.email})
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      {isError && (
        <p className="mt-1 text-xs text-danger">
          면접관 목록을 불러오지 못했어요.
        </p>
      )}
      {selectedIds.length > 0 && (
        <ol className="mt-2 space-y-2">
          {selectedIds.map((id, index) => {
            const candidate = candidates.find((item) => item.userId === id)
            return (
              <li
                key={id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-2 text-sm"
              >
                <span className="min-w-0 flex-1 break-all">
                  {candidate?.name ?? `면접관 #${id}`}{" "}
                  <span className="text-foreground-secondary">
                    {candidate?.email}
                  </span>
                </span>
                {index === 0 && <Chip size="sm">주인</Chip>}
                <span className="text-foreground-secondary text-xs">
                  {candidate?.calendarConnected
                    ? "캘린더 연결됨"
                    : "캘린더 미연결"}
                </span>
                {index > 0 && (
                  <Button
                    size="sm"
                    variant="tertiary"
                    onPress={() =>
                      update([id, ...selectedIds.filter((item) => item !== id)])
                    }
                  >
                    주인으로 지정
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="tertiary"
                  onPress={() =>
                    update(selectedIds.filter((item) => item !== id))
                  }
                  aria-label={`${candidate?.name ?? id} 제거`}
                >
                  제거
                </Button>
              </li>
            )
          })}
        </ol>
      )}
      <p className="text-foreground-secondary mt-2 text-xs">
        면접관을 지정하면 첫 번째 면접관(주인)의 Google 캘린더에 Meet 회의를
        만들고 나머지 면접관을 초대합니다. 비워 두면 기존처럼 장소만 안내합니다.
      </p>
      {host && !host.calendarConnected && (
        <p className="mt-1 text-xs text-warning">
          주인 면접관이 Google 캘린더를 연결하지 않아 회의를 만들 수 없습니다.
          연결 전까지 지원자에게 이 슬롯이 보이지 않습니다.
        </p>
      )}
    </FormField>
  )
}
