import { useMemo, useState } from "react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@heroui/react"

import type { CohortDto } from "@ddd/api"

import {
  serializeCohortToForm,
  useTransitionCohortStatusFlow,
} from "@/entities/cohort"
import { FlexBox } from "@/shared/ui/FlexBox"
import { GridBox } from "@/shared/ui/GridBox"
import { StatCard } from "@/shared/ui/StatCard"
import { Description, Title } from "@/widgets/heading"

import { SemesterRegisterDrawer, SemesterTableSection } from "./components"
import {
  useSemesterRegistrationMode,
  useSemestersTableData,
  type SemestersSummary,
} from "./hooks"

/** 기수 관리 페이지 */
export default function SemestersPage() {
  const { tableRows, summary, isError, refetch } = useSemestersTableData()
  const registration = useSemesterRegistrationMode()
  const { transition } = useTransitionCohortStatusFlow()

  // 행 "수정" 클릭 시 채워지는 edit 타겟. registration 모드를 오버라이드.
  const [editTarget, setEditTarget] = useState<CohortDto | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const drawerProps = useMemo(() => {
    if (editTarget) {
      return {
        mode: "edit" as const,
        targetId: editTarget.id,
        prefill: serializeCohortToForm(editTarget),
      }
    }
    return {
      mode: registration.mode,
      targetId: registration.targetId,
      prefill: registration.prefill,
    }
  }, [editTarget, registration])

  const handleDrawerOpenChange = (open: boolean) => {
    setIsDrawerOpen(open)
    if (!open) setEditTarget(null)
  }

  if (isError) {
    return (
      <div className="w-full p-5">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-800">
            기수 목록을 불러오지 못했습니다
          </p>
          <Button className="mt-3" onPress={refetch}>
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection
        registrationLabel={registration.buttonLabel}
        onClickRegister={() => {
          setEditTarget(null)
          setIsDrawerOpen(true)
        }}
      />

      <CardSection summary={summary} />

      <SemesterRegisterDrawer
        isOpen={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
        mode={drawerProps.mode}
        targetId={drawerProps.targetId}
        prefill={drawerProps.prefill}
      />

      <div className="rounded-lg bg-white p-5 shadow">
        <SemesterTableSection
          rows={tableRows}
          onEditRow={(row) => {
            setEditTarget(row)
            setIsDrawerOpen(true)
          }}
          onTransitionRow={(row) => transition(row)}
        />
      </div>
    </div>
  )
}

// ─── 서브컴포넌트 ────────────────────────────────────────────────────────────

type TitleSectionProps = {
  registrationLabel: string
  onClickRegister: () => void
}

const TitleSection = ({
  registrationLabel,
  onClickRegister,
}: TitleSectionProps) => {
  return (
    <FlexBox className="justify-between">
      <header className="space-y-2">
        <Title title="기수 관리" />
        <Description title="DDD 활동 기수를 등록하고 상태를 관리합니다." />
      </header>
      <Button onPress={onClickRegister}>
        <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
        {registrationLabel}
      </Button>
    </FlexBox>
  )
}

type CardSectionProps = {
  summary: SemestersSummary
}

const CardSection = ({ summary }: CardSectionProps) => {
  return (
    <GridBox className="grid-cols-4 gap-5">
      <StatCard
        title="전체 기수"
        value={`${summary.totalCohorts}`}
        footer="등록된 기수 수"
      />
      <StatCard
        title="현재 상태"
        value={summary.currentStatusLabel}
        footer="가장 최신 기수"
      />
      <StatCard
        title="누적 지원자"
        value={`${summary.totalApplicants}명`}
        footer="전체 기수 합산"
      />
      <StatCard
        title="누적 활동 멤버"
        value={`${summary.totalMembers}명`}
        footer="전체 기수 합산"
      />
    </GridBox>
  )
}
