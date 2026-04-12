import { useState } from "react"
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"

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
    <DrawerContent className="min-w-full md:min-w-1/2">
      <DrawerHeader>
        <DrawerTitle>신규 기수 등록</DrawerTitle>
      </DrawerHeader>

      <div className="flex-1 space-y-8 overflow-y-auto px-4 pb-4">
        <BasicInfoSection form={form} onChange={handleBasicChange} />
        <ProcessSection process={form.process} onChange={handleProcessChange} />
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
      </div>

      <DrawerFooter className="flex-row justify-end gap-2">
        <DrawerClose>취소</DrawerClose>
        <Button onClick={handleSubmit}>등록</Button>
      </DrawerFooter>
    </DrawerContent>
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
      <GridBox cols={{ base: 2, md: 2 }}>
        <FormField label="기수">
          <Input
            type="text"
            placeholder="예: 16"
            value={form.cohortNumber}
            onChange={(e) => onChange("cohortNumber", e.target.value)}
          />
        </FormField>
        <FormField label="상태">
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            value={form.status}
            onChange={(e) =>
              onChange(
                "status",
                e.target.value as SemesterRegisterForm["status"]
              )
            }
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="모집 시작일">
          <Input
            type="date"
            onPointerDown={(e) => e.stopPropagation()}
            value={form.recruitStartDate}
            onChange={(e) => onChange("recruitStartDate", e.target.value)}
          />
        </FormField>
        <FormField label="모집 종료일">
          <Input
            type="date"
            value={form.recruitEndDate}
            onChange={(e) => onChange("recruitEndDate", e.target.value)}
          />
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
      <GridBox cols={{ base: 2, md: 2 }}>
        <FormField label="서류 접수">
          <Input
            type="date"
            value={process.documentAcceptDate}
            onChange={(e) => onChange("documentAcceptDate", e.target.value)}
          />
        </FormField>
        <FormField label="서류 발표">
          <Input
            type="date"
            value={process.documentResultDate}
            onChange={(e) => onChange("documentResultDate", e.target.value)}
          />
        </FormField>
        <FormField label="인터뷰 날짜">
          <Input
            type="date"
            value={process.interviewDate}
            onChange={(e) => onChange("interviewDate", e.target.value)}
          />
        </FormField>
        <FormField label="최종 발표">
          <Input
            type="date"
            value={process.finalResultDate}
            onChange={(e) => onChange("finalResultDate", e.target.value)}
          />
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
            <span className="w-12 shrink-0 text-sm text-muted-foreground">
              {index + 1}주차
            </span>
            <Input
              type="date"
              className="max-w-40 shrink-0"
              value={week.date}
              onChange={(e) => onChange(index, "date", e.target.value)}
            />
            <Input
              placeholder="내용 입력"
              value={week.description}
              onChange={(e) => onChange(index, "description", e.target.value)}
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
      <Tabs defaultValue={SEMESTER_PARTS[0]}>
        <TabsList className="h-auto flex-wrap gap-1">
          {SEMESTER_PARTS.map((part) => (
            <TabsTrigger key={part} value={part}>
              {part}
            </TabsTrigger>
          ))}
        </TabsList>
        {SEMESTER_PARTS.map((part) => (
          <TabsContent key={part} value={part} className="space-y-3">
            {applicationForms[part].map((question, qIndex) => (
              <div key={qIndex} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    질문 {qIndex + 1}
                  </label>
                  {applicationForms[part].length > 1 && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onRemoveQuestion(part, qIndex)}
                    >
                      <HugeiconsIcon icon={MinusSignIcon} />
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="질문을 입력하세요"
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
              onClick={() => onAddQuestion(part)}
            >
              <HugeiconsIcon icon={PlusSignIcon} className="mr-1" />
              질문 추가
            </Button>
          </TabsContent>
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
