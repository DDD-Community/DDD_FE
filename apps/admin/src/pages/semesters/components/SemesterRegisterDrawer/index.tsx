import { useState } from "react"
import { Button, Drawer, Form } from "@heroui/react"

import { CURRICULUM_WEEK_COUNT } from "../../constants"
import type {
  CurriculumWeek,
  ProcessSchedule,
  SemesterPart,
  SemesterRegisterForm,
} from "../../types"

import { BasicInfoSection } from "./components/BasicInfoSection"
import { ProcessSection } from "./components/ProcessSection"
import { CurriculumSection } from "./components/CurriculumSection"
import { ApplicationFormSection } from "./components/ApplicationFormSection"

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
    setForm((prev: SemesterRegisterForm) => ({ ...prev, [field]: value }))
  }

  const handleProcessChange = (field: keyof ProcessSchedule, value: string) => {
    setForm((prev: SemesterRegisterForm) => ({
      ...prev,
      process: { ...prev.process, [field]: value },
    }))
  }

  const handleCurriculumChange = (
    weekIndex: number,
    field: keyof CurriculumWeek,
    value: string
  ) => {
    setForm((prev: SemesterRegisterForm) => {
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
    setForm((prev: SemesterRegisterForm) => {
      const next = [...prev.applicationForms[part]]
      next[questionIndex] = value
      return {
        ...prev,
        applicationForms: { ...prev.applicationForms, [part]: next },
      }
    })
  }

  const addQuestion = (part: SemesterPart) => {
    setForm((prev: SemesterRegisterForm) => ({
      ...prev,
      applicationForms: {
        ...prev.applicationForms,
        [part]: [...prev.applicationForms[part], ""],
      },
    }))
  }

  const removeQuestion = (part: SemesterPart, questionIndex: number) => {
    setForm((prev: SemesterRegisterForm) => {
      const next = prev.applicationForms[part].filter(
        (_: string, i: number) => i !== questionIndex
      )
      return {
        ...prev,
        applicationForms: { ...prev.applicationForms, [part]: next },
      }
    })
  }

  const handleSubmit = () => {
    console.log("등록:", form)
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog className="w-full max-w-1/2 bg-gray-100">
            <Drawer.Header>
              <Drawer.Heading>신규 기수 등록</Drawer.Heading>
            </Drawer.Header>

            <Drawer.Body className="space-y-5 overflow-y-auto pr-5">
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
              <Button type="submit" variant="primary">
                등록
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Form>
  )
}
