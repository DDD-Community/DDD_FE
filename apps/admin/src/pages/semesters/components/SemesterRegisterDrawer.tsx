import { useEffect, useState } from "react"
import { Button, Drawer, toast } from "@heroui/react"
import { FormProvider, useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { ApiError, CreateCohortRequestDtoStatus, cohortQueries } from "@ddd/api"

import { PartsSaveAfterCreateError, useCreateOrUpdateCohortFlow } from "@/pages/semesters/hooks/useCreateOrUpdateCohortFlow"
import { SEMESTER_PARTS } from "@/pages/semesters/constants"
import {
  clearFormDraft,
  draftKeyOf,
  readFormDraft,
  saveFormDraft,
} from "@/pages/semesters/lib/formDraft"
import { buildName } from "@/pages/semesters/lib/serialize"
import { validateFormParts } from "@/pages/semesters/lib/validateParts"
import { useIsMobile } from "@/shared/hooks/useIsMobile"

import { CURRICULUM_WEEK_COUNT } from "../constants"
import type { SemesterRegisterForm } from "../types"

import { ApplicationFormSection } from "./ApplicationFormSection"
import { BasicInfoSection } from "./BasicInfoSection"
import { CurriculumSection } from "./CurriculumSection"
import { ProcessSection } from "./ProcessSection"

export type DrawerMode = "create" | "resume" | "edit"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: DrawerMode
  targetId: number | null
  prefill?: SemesterRegisterForm
  /** parts 저장 실패 시 호출 — 호출부가 mode/targetId 를 edit 으로 전환. Drawer 는 열린 채 유지. */
  onSwitchToEdit?: (newCohortId: number) => void
}

const buildDefaults = (prefill?: SemesterRegisterForm): SemesterRegisterForm =>
  prefill ?? {
    cohortNumber: "",
    status: CreateCohortRequestDtoStatus.UPCOMING,
    recruitStartDate: "",
    recruitEndDate: "",
    process: {
      documentResultDate: "",
      interviewStartDate: "",
      interviewEndDate: "",
      finalResultDate: "",
    },
    curriculum: Array.from({ length: CURRICULUM_WEEK_COUNT }, () => ({
      date: "",
      description: "",
      time: "",
    })),
    parts: Object.fromEntries(
      SEMESTER_PARTS.map((name) => [
        name,
        {
          isOpen: true,
          questions: [{ key: "", label: "", required: true }],
        },
      ])
    ) as SemesterRegisterForm["parts"],
  }

// 진입점 버튼 라벨과 동일하게 유지한다 (기수 관리 페이지 상단 / 행 "수정").
const TITLE_BY_MODE: Record<DrawerMode, string> = {
  create: "새 기수 등록",
  resume: "작성 이어하기",
  edit: "기수 수정",
}

const SUBMIT_LABEL_BY_MODE: Record<DrawerMode, string> = {
  create: "등록",
  resume: "저장",
  edit: "저장",
}

const FORM_ID = "semester-register-form"

export function SemesterRegisterDrawer({
  isOpen,
  onOpenChange,
  mode,
  targetId,
  prefill,
  onSwitchToEdit,
}: Props) {
  const isMobile = useIsMobile()

  const methods = useForm<SemesterRegisterForm>({
    defaultValues: buildDefaults(prefill),
  })
  const {
    handleSubmit,
    formState: { isSubmitting },
    getValues,
    reset,
    watch,
  } = methods

  const draftKey = draftKeyOf(targetId)

  // 임시 저장본이 있으면 그것으로, 없으면 서버 값(prefill)으로 채운다.
  useEffect(function restoreDraftOrPrefillOnOpen() {
    if (isOpen) reset(readFormDraft(draftKey) ?? buildDefaults(prefill))
  }, [isOpen, mode, prefill, reset, draftKey])

  const [invalidCells, setInvalidCells] = useState<ReadonlySet<string>>(
    () => new Set()
  )
  useEffect(function syncOnFormChange() {
    const subscription = watch((_, { name, type }) => {
      if (name?.startsWith("parts")) {
        setInvalidCells((prev) => (prev.size === 0 ? prev : new Set()))
      }
      // 사용자 입력(type === "change")만 저장한다. reset 이 발생시키는 알림까지
      // 저장하면 저장 성공 후의 초기화가 빈 draft 로 다시 기록된다.
      if (type === "change") saveFormDraft(draftKey, getValues())
    })
    return () => subscription.unsubscribe()
  }, [watch, getValues, draftKey])

  const { submit, isPending: isMutating } = useCreateOrUpdateCohortFlow({
    mode,
    targetId,
  })

  const { data: cohorts = [] } = useQuery(cohortQueries.getCohorts())

  const onSubmit = handleSubmit(async (values) => {
    const trimmedNumber = values.cohortNumber.trim()
    if (trimmedNumber === "") {
      toast.danger("기수 번호를 입력해주세요")
      return
    }
    const newName = buildName(trimmedNumber)
    const isDuplicate = cohorts.some(
      (c) => c.id !== targetId && c.name === newName,
    )
    if (isDuplicate) {
      toast.danger("이미 존재하는 기수 번호입니다", {
        description: `${newName} 은(는) 이미 등록되어 있습니다.`,
      })
      return
    }

    const validationError = validateFormParts(values)
    if (validationError) {
      toast.danger(validationError.message)
      setInvalidCells(
        new Set(validationError.invalidCells.map((c) => `${c.part}:${c.index}`))
      )
      return
    }

    try {
      const result = await submit(values)
      toast.success(
        result.createdInThisCall
          ? `기수 ${result.name}을(를) 등록했습니다`
          : "기수 정보를 저장했습니다"
      )
      clearFormDraft(draftKey)
      onOpenChange(false)
      reset(buildDefaults())
      setInvalidCells(new Set())
    } catch (error) {
      if (error instanceof PartsSaveAfterCreateError) {
        toast.danger("파트 양식 저장에 실패했습니다", {
          description:
            "수정 화면에서 다시 저장해주세요. (기수는 이미 등록되었습니다)",
        })
        // 기수는 이미 만들어졌으므로 edit 모드(새 id)로 전환된다. 입력값을 그
        // 새 id 의 draft 로 옮겨둬야 전환 직후 폼이 빈 값으로 초기화되지 않는다.
        saveFormDraft(draftKeyOf(error.newCohortId), values)
        clearFormDraft(draftKey)
        onSwitchToEdit?.(error.newCohortId)
        return
      }
      if (error instanceof ApiError && error.code === "COHORT_ALREADY_EXISTS") {
        toast.danger("이미 모집중·모집예정 기수가 있습니다", {
          description: "모집 라이프사이클 기수는 동시에 하나만 둘 수 있습니다.",
        })
        return
      }
      toast.danger(
        mode === "create" ? "기수 등록에 실패했습니다" : "저장에 실패했습니다",
        { description: error instanceof Error ? error.message : undefined }
      )
    }
  })

  const isBusy = isSubmitting || isMutating

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog
          className={!isMobile ? "w-full max-w-1/2 bg-gray-100" : ""}
        >
          <Drawer.Header>
            <Drawer.Heading className="text-lg font-semibold">
              {TITLE_BY_MODE[mode]}
            </Drawer.Heading>
          </Drawer.Header>

          <Drawer.Body className="flex-1 overflow-y-auto">
            <FormProvider {...methods}>
              <form id={FORM_ID} onSubmit={onSubmit} className="space-y-8">
                <BasicInfoSection />
                <ProcessSection />
                <CurriculumSection />
                <ApplicationFormSection invalidCells={invalidCells} />
              </form>
            </FormProvider>
          </Drawer.Body>

          <Drawer.Footer className="gap-2">
            <Button slot="close" variant="tertiary">
              취소
            </Button>
            <Button type="submit" form={FORM_ID} isDisabled={isBusy}>
              {isMutating ? "저장 중..." : SUBMIT_LABEL_BY_MODE[mode]}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
