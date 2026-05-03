import { Button, Tabs, TextArea } from "@heroui/react"
import { PlusSignIcon, X } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { UseFormSetValue, UseFormWatch } from "react-hook-form"

import type { CohortPartName } from "@ddd/api"

import { PART_LABEL, SEMESTER_PARTS } from "@/entities/cohort"

import type { SemesterRegisterForm } from "../types"

import { SectionTitle } from "./shared"

interface Props {
  watch: UseFormWatch<SemesterRegisterForm>
  setValue: UseFormSetValue<SemesterRegisterForm>
}

export function ApplicationFormSection({ watch, setValue }: Props) {
  const applicationForms = watch("applicationForms")

  const updateQuestion = (
    part: CohortPartName,
    questionIndex: number,
    value: string,
  ) => {
    const next = [...applicationForms[part]]
    next[questionIndex] = value
    setValue(
      "applicationForms",
      { ...applicationForms, [part]: next },
      { shouldDirty: true },
    )
  }

  const addQuestion = (part: CohortPartName) => {
    setValue(
      "applicationForms",
      {
        ...applicationForms,
        [part]: [...applicationForms[part], ""],
      },
      { shouldDirty: true },
    )
  }

  const removeQuestion = (part: CohortPartName, questionIndex: number) => {
    setValue(
      "applicationForms",
      {
        ...applicationForms,
        [part]: applicationForms[part].filter((_, i) => i !== questionIndex),
      },
      { shouldDirty: true },
    )
  }

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
                      onPress={() => removeQuestion(part, qIndex)}
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
                    updateQuestion(part, qIndex, e.target.value)
                  }
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onPress={() => addQuestion(part)}
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
