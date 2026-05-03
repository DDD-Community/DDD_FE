import { useEffect } from "react"
import { Button, Drawer } from "@heroui/react"
import { useForm } from "react-hook-form"

import { CreateCohortRequestDtoStatus } from "@ddd/api"

import {
  useCreateOrUpdateCohortFlow,
  useDeleteCohortFlow,
} from "@/entities/cohort"
import { useIsMobile } from "@/shared/hooks/useIsMobile"

import { CURRICULUM_WEEK_COUNT } from "../constants"
import type { SemesterRegisterForm } from "../types"

import { ApplicationFormSection } from "./ApplicationFormSection"
import { BasicInfoSection } from "./BasicInfoSection"
import { CurriculumSection } from "./CurriculumSection"
import { DeleteCohortDialog } from "./DeleteCohortDialog"
import { ProcessSection } from "./ProcessSection"

export type DrawerMode = "create" | "resume" | "edit"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: DrawerMode
  targetId: number | null
  prefill?: SemesterRegisterForm
}

const buildDefaults = (
  prefill?: SemesterRegisterForm,
): SemesterRegisterForm =>
  prefill ?? {
    cohortNumber: "",
    status: CreateCohortRequestDtoStatus.UPCOMING,
    recruitStartDate: "",
    recruitEndDate: "",
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

export function SemesterRegisterDrawer({
  isOpen,
  onOpenChange,
  mode,
  targetId,
  prefill,
}: Props) {
  const isMobile = useIsMobile()

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<SemesterRegisterForm>({
    defaultValues: buildDefaults(prefill),
  })

  // prefill / mode 변경 시 폼 리셋
  useEffect(() => {
    if (isOpen) reset(buildDefaults(prefill))
  }, [isOpen, mode, prefill, reset])

  const { submit, isPending: isMutating } = useCreateOrUpdateCohortFlow({
    mode,
    targetId,
    onSuccess: () => onOpenChange(false),
  })

  const {
    isConfirmOpen,
    openConfirm,
    closeConfirm,
    confirm: confirmDelete,
    isPending: isDeleting,
  } = useDeleteCohortFlow({
    targetId,
    onDeleted: () => onOpenChange(false),
  })

  const onSubmit = handleSubmit((values) => submit(values))

  const isBusy = isSubmitting || isMutating || isDeleting

  return (
    <>
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <Drawer.Backdrop>
          <Drawer.Content placement={isMobile ? "bottom" : "right"}>
            <Drawer.Dialog
              className={!isMobile ? "w-full max-w-1/2 bg-gray-100" : ""}
            >
              <Drawer.Header>
                <Drawer.Heading className="text-lg font-semibold">
                  {TITLE_BY_MODE[mode]}
                </Drawer.Heading>
              </Drawer.Header>

              <Drawer.Body className="flex-1 space-y-8 overflow-y-auto">
                <BasicInfoSection control={control} register={register} />
                <ProcessSection control={control} setValue={setValue} />
                <CurriculumSection control={control} register={register} />
                <ApplicationFormSection watch={watch} setValue={setValue} />
              </Drawer.Body>

              <Drawer.Footer className="gap-2">
                <Button slot="close" variant="tertiary">
                  취소
                </Button>
                {mode === "resume" && (
                  <Button
                    variant="danger"
                    isDisabled={isBusy}
                    onPress={openConfirm}
                  >
                    삭제
                  </Button>
                )}
                <Button isDisabled={isBusy} onPress={() => onSubmit()}>
                  {isMutating ? "저장 중..." : SUBMIT_LABEL_BY_MODE[mode]}
                </Button>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      <DeleteCohortDialog
        isOpen={isConfirmOpen}
        onOpenChange={(o) => !o && closeConfirm()}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}
