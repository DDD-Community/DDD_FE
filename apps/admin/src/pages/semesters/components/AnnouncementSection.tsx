import { Input } from "@heroui/react"
import { useFormContext } from "react-hook-form"

import { FormField } from "@/shared/ui/FormField"
import { GridBox } from "@/shared/ui/GridBox"
import { Section } from "@/shared/ui/Section"

import type { SemesterRegisterForm } from "../types"

import { TestEmailSender } from "./TestEmailSender"

interface Props {
  /** 저장된 기수 id. 새 기수 등록 중이면 null */
  cohortId: number | null
}

// 비운 칸은 메일에서 그 줄이 통째로 빠진다. 값을 지어내 넣지 않으므로 아는 값만 채우면 된다.
export function AnnouncementSection({ cohortId }: Props) {
  const { register } = useFormContext<SemesterRegisterForm>()
  return (
    <Section title="안내 메일 정보">
      <p className="text-xs text-gray-500">
        지원자에게 나가는 메일에 들어가는 값입니다. 비워 둔 항목은 메일에서 해당
        줄이 빠집니다.
      </p>

      <h4 className="text-sm font-semibold text-gray-900">
        면접 일정 확정 메일
      </h4>
      <GridBox className="grid-cols-2 gap-5">
        <FormField label="면접 예상 소요 시간 (분)">
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="비우면 슬롯 길이로 안내"
            className="w-full"
            {...register("announcement.interviewDurationMinutes")}
          />
        </FormField>
        <FormField label="일정 조정 회신 기한">
          <Input
            type="text"
            placeholder="예: 2026-10-16 23:59"
            className="w-full"
            {...register("announcement.interviewRescheduleDeadline")}
          />
        </FormField>
      </GridBox>

      <h4 className="text-sm font-semibold text-gray-900">최종 합격 메일</h4>
      <GridBox className="grid-cols-2 gap-5">
        <FormField label="참가비 (원)">
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="예: 160000"
            className="w-full"
            {...register("announcement.participationFee")}
          />
        </FormField>
        <FormField label="참가비 구성">
          <Input
            type="text"
            placeholder="예: 운영비 8만원 + 노쇼비 8만원"
            className="w-full"
            {...register("announcement.participationFeeDetail")}
          />
        </FormField>
        <FormField label="입금 계좌">
          <Input
            type="text"
            placeholder="예: 토스뱅크 1000-0000-0000"
            className="w-full"
            {...register("announcement.bankAccount")}
          />
        </FormField>
        <FormField label="예금주">
          <Input
            type="text"
            placeholder="예: 홍길동"
            className="w-full"
            {...register("announcement.accountHolder")}
          />
        </FormField>
        <FormField label="입금 기한">
          <Input
            type="text"
            placeholder="예: 메일 수신 기준으로 다음날 오후 12시"
            className="w-full"
            {...register("announcement.participationConfirmDeadline")}
          />
        </FormField>
      </GridBox>
      <TestEmailSender cohortId={cohortId} />
    </Section>
  )
}
