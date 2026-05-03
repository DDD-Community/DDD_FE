import { useEffect, useState } from "react"
import { PlusSignIcon, X } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  AlertDialog,
  Button,
  Calendar,
  DateField,
  DatePicker,
  DateRangePicker,
  Drawer,
  Input,
  ListBox,
  RangeCalendar,
  Select,
  Tabs,
  TextArea,
} from "@heroui/react"

import { CohortPartConfigDtoName, CreateCohortRequestDtoStatus } from "@ddd/api"

import type { CohortPartName } from "@ddd/api"

import {
  PART_LABEL,
  SEMESTER_PARTS,
  useCreateOrUpdateCohortFlow,
  useDeleteCohortFlow,
} from "@/entities/cohort"
import { useIsMobile } from "@/shared/hooks/useIsMobile"
import { GridBox } from "@/shared/ui/GridBox"

import { CURRICULUM_WEEK_COUNT, STATUS_OPTIONS } from "./constants"
import type {
  CurriculumWeek,
  ProcessSchedule,
  SemesterRegisterForm,
} from "./types"

type DrawerMode = "create" | "resume" | "edit"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: DrawerMode
  targetId: number | null
  prefill?: SemesterRegisterForm
}

const createInitialForm = (): SemesterRegisterForm => ({
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
    [CohortPartConfigDtoName.PM]: [""],
    [CohortPartConfigDtoName.PD]: [""],
    [CohortPartConfigDtoName.BE]: [""],
    [CohortPartConfigDtoName.FE]: [""],
    [CohortPartConfigDtoName.IOS]: [""],
    [CohortPartConfigDtoName.AND]: [""],
  },
})

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
  const [form, setForm] = useState<SemesterRegisterForm>(
    () => prefill ?? createInitialForm(),
  )

  // prefill / mode 가 바뀌면 폼 갱신 (다른 cohort 선택 시 등)
  useEffect(() => {
    setForm(prefill ?? createInitialForm())
  }, [prefill, mode])

  const { submit, isPending: isSubmitting } = useCreateOrUpdateCohortFlow({
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

  const handleBasicChange = (
    field: keyof Pick<
      SemesterRegisterForm,
      "cohortNumber" | "status" | "recruitStartDate" | "recruitEndDate"
    >,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleProcessChange = (field: keyof ProcessSchedule, value: string) => {
    setForm((prev) => ({
      ...prev,
      process: { ...prev.process, [field]: value },
    }))
  }

  const handleCurriculumChange = (
    weekIndex: number,
    field: keyof CurriculumWeek,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.curriculum]
      next[weekIndex] = { ...next[weekIndex], [field]: value }
      return { ...prev, curriculum: next }
    })
  }

  const handleQuestionChange = (
    part: CohortPartName,
    questionIndex: number,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.applicationForms[part]]
      next[questionIndex] = value
      return {
        ...prev,
        applicationForms: { ...prev.applicationForms, [part]: next },
      }
    })
  }

  const addQuestion = (part: CohortPartName) => {
    setForm((prev) => ({
      ...prev,
      applicationForms: {
        ...prev.applicationForms,
        [part]: [...prev.applicationForms[part], ""],
      },
    }))
  }

  const removeQuestion = (part: CohortPartName, questionIndex: number) => {
    setForm((prev) => {
      const next = prev.applicationForms[part].filter(
        (_, i) => i !== questionIndex,
      )
      return {
        ...prev,
        applicationForms: { ...prev.applicationForms, [part]: next },
      }
    })
  }

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
                <BasicInfoSection form={form} onChange={handleBasicChange} />
                <ProcessSection
                  process={form.process}
                  onChange={handleProcessChange}
                />
                <CurriculumSection
                  curriculum={form.curriculum}
                  onChange={handleCurriculumChange}
                />
                <ApplicationFormSection
                  applicationForms={form.applicationForms}
                  onQuestionChange={handleQuestionChange}
                  onAddQuestion={addQuestion}
                  onRemoveQuestion={removeQuestion}
                />
              </Drawer.Body>

              <Drawer.Footer className="gap-2">
                <Button slot="close" variant="tertiary">
                  취소
                </Button>
                {mode === "resume" && (
                  <Button
                    variant="danger"
                    isDisabled={isDeleting || isSubmitting}
                    onPress={openConfirm}
                  >
                    삭제
                  </Button>
                )}
                <Button
                  isDisabled={isSubmitting || isDeleting}
                  onPress={() => submit(form)}
                >
                  {isSubmitting ? "저장 중..." : SUBMIT_LABEL_BY_MODE[mode]}
                </Button>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      <AlertDialog.Backdrop isOpen={isConfirmOpen} onOpenChange={(o) => !o && closeConfirm()}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>기수를 삭제하시겠습니까?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                작성 중인 모든 정보가 사라지며, 이 작업은 되돌릴 수 없습니다.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                취소
              </Button>
              <Button
                variant="danger"
                isDisabled={isDeleting}
                onPress={confirmDelete}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  )
}

// ─── 섹션 서브컴포넌트 ────────────────────────────────────────────────────────

type BasicInfoSectionProps = {
  form: SemesterRegisterForm
  onChange: (
    field: keyof Pick<
      SemesterRegisterForm,
      "cohortNumber" | "status" | "recruitStartDate" | "recruitEndDate"
    >,
    value: string,
  ) => void
}

function BasicInfoSection({ form, onChange }: BasicInfoSectionProps) {
  return (
    <section className="space-y-4">
      <SectionTitle>기본 정보</SectionTitle>
      <GridBox className="grid-cols-2 gap-5">
        <FormField label="기수">
          <Input
            type="text"
            placeholder="예: 16"
            value={form.cohortNumber}
            onChange={(e) => onChange("cohortNumber", e.target.value)}
            className="w-full"
          />
        </FormField>
        <FormField label="상태">
          <Select
            className="w-full"
            selectedKey={form.status}
            onSelectionChange={(key) => onChange("status", String(key))}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {STATUS_OPTIONS.map((opt) => (
                  <ListBox.Item
                    key={opt.value}
                    id={opt.value}
                    textValue={opt.label}
                  >
                    {opt.label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </FormField>
        <FormField label="모집 시작일">
          <DatePicker
            className="w-full"
            value={null}
            onChange={(date) =>
              onChange("recruitStartDate", date?.toString() || "")
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
              <Calendar aria-label="모집 시작일">
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
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>
                    {(date) => <Calendar.Cell date={date} />}
                  </Calendar.GridBody>
                </Calendar.Grid>
              </Calendar>
            </DatePicker.Popover>
          </DatePicker>
        </FormField>
        <FormField label="모집 종료일">
          <DatePicker
            className="w-full"
            value={null}
            onChange={(date) =>
              onChange("recruitEndDate", date?.toString() || "")
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
              <Calendar aria-label="모집 종료일">
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
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>
                    {(date) => <Calendar.Cell date={date} />}
                  </Calendar.GridBody>
                </Calendar.Grid>
              </Calendar>
            </DatePicker.Popover>
          </DatePicker>
        </FormField>
      </GridBox>
    </section>
  )
}

type ProcessSectionProps = {
  process: ProcessSchedule
  onChange: (field: keyof ProcessSchedule, value: string) => void
}

function ProcessSection({ onChange }: ProcessSectionProps) {
  return (
    <section className="space-y-4">
      <SectionTitle>프로세스 일정</SectionTitle>
      <GridBox className="grid-cols-2 gap-5">
        <FormField label="서류 접수">
          <DateRangePicker
            className="w-full"
            value={null}
            onChange={(value) => {
              onChange(
                "documentAcceptStartDate",
                value?.start.toString() || "",
              )
              onChange("documentAcceptEndDate", value?.end.toString() || "")
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
            <DateRangePicker.Popover>
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
          <DatePicker
            className="w-full"
            value={null}
            onChange={(date) =>
              onChange("documentResultDate", date?.toString() || "")
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
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>
                    {(date) => <Calendar.Cell date={date} />}
                  </Calendar.GridBody>
                </Calendar.Grid>
              </Calendar>
            </DatePicker.Popover>
          </DatePicker>
        </FormField>
        <FormField label="인터뷰 날짜">
          <DateRangePicker
            className="w-full"
            value={null}
            onChange={(value) => {
              onChange("interviewStartDate", value?.start.toString() || "")
              onChange("interviewEndDate", value?.end.toString() || "")
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
            <DateRangePicker.Popover>
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
          <DatePicker
            className="w-full"
            value={null}
            onChange={(date) =>
              onChange("finalResultDate", date?.toString() || "")
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
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>
                    {(date) => <Calendar.Cell date={date} />}
                  </Calendar.GridBody>
                </Calendar.Grid>
              </Calendar>
            </DatePicker.Popover>
          </DatePicker>
        </FormField>
      </GridBox>
    </section>
  )
}

type CurriculumSectionProps = {
  curriculum: CurriculumWeek[]
  onChange: (
    weekIndex: number,
    field: keyof CurriculumWeek,
    value: string,
  ) => void
}

function CurriculumSection({ curriculum, onChange }: CurriculumSectionProps) {
  return (
    <section className="space-y-4">
      <SectionTitle>커리큘럼</SectionTitle>
      <div className="space-y-3">
        {curriculum.map((week, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-sm text-gray-500">
              {index + 1}주차
            </span>
            <DatePicker
              className="w-1/2"
              value={null}
              onChange={(date) =>
                onChange(index, "date", date?.toString() || "")
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
                <Calendar aria-label={`${index + 1}주차 날짜`}>
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
            <Input
              placeholder="내용 입력"
              value={week.description}
              onChange={(e) => onChange(index, "description", e.target.value)}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

type ApplicationFormSectionProps = {
  applicationForms: SemesterRegisterForm["applicationForms"]
  onQuestionChange: (
    part: CohortPartName,
    index: number,
    value: string,
  ) => void
  onAddQuestion: (part: CohortPartName) => void
  onRemoveQuestion: (part: CohortPartName, index: number) => void
}

function ApplicationFormSection({
  applicationForms,
  onQuestionChange,
  onAddQuestion,
  onRemoveQuestion,
}: ApplicationFormSectionProps) {
  return (
    <section className="space-y-4">
      <SectionTitle>파트별 지원서 양식</SectionTitle>
      <Tabs>
        <Tabs.ListContainer>
          <Tabs.List aria-label="파트별 지원서">
            {SEMESTER_PARTS.map((part) => (
              <Tabs.Tab key={part} id={part}>
                {PART_LABEL[part]}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>

        {SEMESTER_PARTS.map((part) => (
          <Tabs.Panel key={part} id={part} className="space-y-3 py-4">
            {applicationForms[part].map((question, qIndex) => (
              <div key={qIndex} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    질문 {qIndex + 1}
                  </label>
                  {applicationForms[part].length > 1 && (
                    <Button
                      isIconOnly
                      variant="outline"
                      size="sm"
                      onPress={() => onRemoveQuestion(part, qIndex)}
                    >
                      <HugeiconsIcon icon={X} />
                    </Button>
                  )}
                </div>
                <TextArea
                  placeholder="질문을 입력하세요"
                  className="w-full resize-none"
                  value={question}
                  onChange={(e) =>
                    onQuestionChange(part, qIndex, e.target.value)
                  }
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onPress={() => onAddQuestion(part)}
            >
              <HugeiconsIcon icon={PlusSignIcon} className="mr-1" />
              질문 추가
            </Button>
          </Tabs.Panel>
        ))}
      </Tabs>
    </section>
  )
}

// ─── 공통 UI ─────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b pb-2 text-sm font-semibold text-foreground">
      {children}
    </h3>
  )
}

type FormFieldProps = {
  label: string
  children: React.ReactNode
}

function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="flex flex-col items-start gap-1">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      {children}
    </label>
  )
}
