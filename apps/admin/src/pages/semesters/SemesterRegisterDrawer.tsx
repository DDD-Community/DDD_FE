import { useState } from "react"
import { PlusSignIcon, X } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  Button,
  Input,
  TextArea,
  Drawer,
  Tabs,
  DatePicker,
  Calendar,
  DateField,
  Select,
  ListBox,
} from "@heroui/react"

import {
  CURRICULUM_WEEK_COUNT,
  SEMESTER_PARTS,
  STATUS_OPTIONS,
} from "./constants"
import type {
  CurriculumWeek,
  ProcessSchedule,
  SemesterPart,
  SemesterRegisterForm,
} from "./types"
import { GridBox } from "@/shared/ui/GridBox"
import { useIsMobile } from "@/shared/hooks/useIsMobile"

const createInitialForm = (): SemesterRegisterForm => ({
  cohortNumber: "",
  status: "upcoming",
  recruitStartDate: "",
  recruitEndDate: "",
  process: {
    documentAcceptDate: "",
    documentResultDate: "",
    interviewDate: "",
    finalResultDate: "",
  },
  curriculum: Array.from({ length: CURRICULUM_WEEK_COUNT }, () => ({
    date: "",
    description: "",
  })),
  applicationForms: {
    PM: [""],
    PD: [""],
    Server: [""],
    Web: [""],
    iOS: [""],
    Android: [""],
  },
})

export function SemesterRegisterDrawer() {
  const isMobile = useIsMobile()
  const [form, setForm] = useState<SemesterRegisterForm>(createInitialForm)

  const handleBasicChange = (
    field: keyof Pick<
      SemesterRegisterForm,
      "cohortNumber" | "status" | "recruitStartDate" | "recruitEndDate"
    >,
    value: string
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
    value: string
  ) => {
    setForm((prev) => {
      const next = [...prev.curriculum]
      next[weekIndex] = { ...next[weekIndex], [field]: value }
      return { ...prev, curriculum: next }
    })
  }

  const handleQuestionChange = (
    part: SemesterPart,
    questionIndex: number,
    value: string
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

  const addQuestion = (part: SemesterPart) => {
    setForm((prev) => ({
      ...prev,
      applicationForms: {
        ...prev.applicationForms,
        [part]: [...prev.applicationForms[part], ""],
      },
    }))
  }

  const removeQuestion = (part: SemesterPart, questionIndex: number) => {
    setForm((prev) => {
      const next = prev.applicationForms[part].filter(
        (_, i) => i !== questionIndex
      )
      return {
        ...prev,
        applicationForms: { ...prev.applicationForms, [part]: next },
      }
    })
  }

  const handleSubmit = () => {
    // TODO: 실제 API 연동 시 여기서 mutate 호출
    console.log("등록:", form)
  }

  return (
    <Drawer.Backdrop>
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog
          className={!isMobile ? "w-full max-w-1/2 bg-gray-100" : ""}
        >
          <Drawer.Header>
            <Drawer.Heading className="text-lg font-semibold">
              신규 기수 등록
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

          <Drawer.Footer>
            <Drawer.CloseTrigger />
            <Button onPress={handleSubmit}>등록</Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
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
    value: string
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
            value={form.status}
            onChange={(value) =>
              onChange("status", value as SemesterRegisterForm["status"])
            }
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

function ProcessSection({ process, onChange }: ProcessSectionProps) {
  return (
    <section className="space-y-4">
      <SectionTitle>프로세스 일정</SectionTitle>
      <GridBox className="grid-cols-2 gap-5">
        <FormField label="서류 접수">
          <DatePicker
            className="w-full"
            value={null}
            onChange={(date) =>
              onChange("documentAcceptDate", date?.toString() || "")
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
              <Calendar aria-label="서류 접수">
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
          <DatePicker
            className="w-full"
            value={null}
            onChange={(date) =>
              onChange("interviewDate", date?.toString() || "")
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
              <Calendar aria-label="인터뷰 날짜">
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
    value: string
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
  applicationForms: Record<SemesterPart, string[]>
  onQuestionChange: (part: SemesterPart, index: number, value: string) => void
  onAddQuestion: (part: SemesterPart) => void
  onRemoveQuestion: (part: SemesterPart, index: number) => void
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
                {part}
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
