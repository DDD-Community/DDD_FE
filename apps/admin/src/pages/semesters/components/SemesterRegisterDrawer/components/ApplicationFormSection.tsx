import { PlusSignIcon, X } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button, TextArea, Tabs, Fieldset } from "@heroui/react"

import { SEMESTER_PARTS } from "../../../constants"
import type { SemesterPart } from "../../../types"

type Props = {
  applicationForms: Record<SemesterPart, string[]>
  onQuestionChange: (part: SemesterPart, index: number, value: string) => void
  onAddQuestion: (part: SemesterPart) => void
  onRemoveQuestion: (part: SemesterPart, index: number) => void
}

export function ApplicationFormSection({
  applicationForms,
  onQuestionChange,
  onAddQuestion,
  onRemoveQuestion,
}: Props) {
  return (
    <Fieldset>
      <Fieldset.Legend className="underline">
        파트별 지원서 양식
      </Fieldset.Legend>
      <Tabs defaultSelectedKey={SEMESTER_PARTS[0]} className="mt-4">
        <Tabs.ListContainer>
          <Tabs.List>
            {SEMESTER_PARTS.map((part: SemesterPart) => (
              <Tabs.Tab key={part} id={part}>
                {part}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
        {SEMESTER_PARTS.map((part: SemesterPart) => (
          <Tabs.Panel key={part} id={part} className="space-y-3">
            {applicationForms[part].map((question, qIndex) => (
              <div key={qIndex} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    질문 {qIndex + 1}
                  </label>
                  {applicationForms[part].length > 1 && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      onPress={() => onRemoveQuestion(part, qIndex)}
                    >
                      <HugeiconsIcon icon={X} />
                    </Button>
                  )}
                </div>
                <TextArea
                  placeholder="질문을 입력하세요"
                  value={question}
                  className="w-full resize-none"
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
              <HugeiconsIcon icon={PlusSignIcon} />
              질문 추가
            </Button>
          </Tabs.Panel>
        ))}
      </Tabs>
    </Fieldset>
  )
}
