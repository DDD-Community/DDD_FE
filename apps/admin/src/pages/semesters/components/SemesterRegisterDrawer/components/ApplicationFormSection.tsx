import { useId } from "react"
import { Button, Tabs, TextArea } from "@heroui/react"
import { PlusSignIcon, X } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useFormContext, useWatch } from "react-hook-form"

import type { CohortPartName } from "@ddd/api"

import { PART_LABEL, SEMESTER_PARTS } from "@/entities/cohort"
import { Section } from "@/shared/ui/Section"

import type { SemesterRegisterForm } from "../../../types"

export function ApplicationFormSection() {
  const { control, setValue } = useFormContext<SemesterRegisterForm>()
  const applicationForms = useWatch({ control, name: "applicationForms" })
  const baseLabelId = useId()

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
    <Section title="파트별 지원서 양식">
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
            {applicationForms[part].map((question, qIndex) => {
              const labelId = `${baseLabelId}-${part}-${qIndex}`
              return (
                <div key={qIndex} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      id={labelId}
                      className="text-sm font-medium text-foreground"
                    >
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
                    aria-labelledby={labelId}
                    placeholder="질문을 입력하세요"
                    className="w-full resize-none"
                    value={question}
                    onChange={(e) =>
                      updateQuestion(part, qIndex, e.target.value)
                    }
                  />
                </div>
              )
            })}
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
    </Section>
  )
}
