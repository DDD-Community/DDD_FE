import { useEffect } from "react"
import { Button, Drawer } from "@heroui/react"
import { FormProvider, useForm } from "react-hook-form"

import { CreateCohortRequestDtoStatus } from "@ddd/api"

import { useCreateOrUpdateCohortFlow } from "@/entities/cohort"
import { useIsMobile } from "@/shared/hooks/useIsMobile"

import { CURRICULUM_WEEK_COUNT } from "../../constants"
import type { SemesterRegisterForm } from "../../types"

import { ApplicationFormSection } from "./components/ApplicationFormSection"
import { BasicInfoSection } from "./components/BasicInfoSection"
import { CurriculumSection } from "./components/CurriculumSection"
import { ProcessSection } from "./components/ProcessSection"

export type DrawerMode = "create" | "resume" | "edit"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: DrawerMode
  targetId: number | null
  prefill?: SemesterRegisterForm
}

const buildDefaults = (prefill?: SemesterRegisterForm): SemesterRegisterForm =>
  prefill ?? {
    cohortNumber: "",
    status: CreateCohortRequestDtoStatus.UPCOMING,
    process: {
      documentAcceptStartDate: "",
      documentAcceptEndDate: "",
      documentResultDate: "",
      interviewStartDate: "",
      interviewEndDate: "",
      finalResultDate: "",
    },
    curriculum: Array.from({ length: CURRICULUM_WEEK_COUNT }, () => ({
      date: "",
      description: "",
    })),
    applicationForms: {
      PM: [""],
      PD: [""],
      BE: [""],
      FE: [""],
      IOS: [""],
      AND: [""],
    },
  }

const TITLE_BY_MODE: Record<DrawerMode, string> = {
  create: "신규 기수 등록",
  resume: "기수 등록 마저하기",
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
}: Props) {
  const isMobile = useIsMobile()

  const methods = useForm<SemesterRegisterForm>({
    defaultValues: buildDefaults(prefill),
  })
  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods

  // prefill / mode 변경 시 폼 리셋
  useEffect(() => {
    if (isOpen) reset(buildDefaults(prefill))
  }, [isOpen, mode, prefill, reset])

  const { submit, isPending: isMutating } = useCreateOrUpdateCohortFlow({
    mode,
    targetId,
    onSuccess: () => onOpenChange(false),
  })

  const onSubmit = handleSubmit((values) => submit(values))

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
                <ApplicationFormSection />
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
