import { Input } from "@heroui/react"
import { useFormContext } from "react-hook-form"

import { FormField } from "@/shared/ui/FormField"

import type { VoteEditorForm } from "../lib/voteTemplate"

import { VoteFeedbackTemplateFields } from "./VoteFeedbackTemplateFields"
import { VoteTeamTemplateFields } from "./VoteTeamTemplateFields"

interface Props {
  textOnly: boolean
}

export function VoteEditorFormFields({ textOnly }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<VoteEditorForm>()

  return (
    <div className="space-y-6">
      <FormField label="투표 제목" error={errors.title?.message}>
        <Input
          {...register("title")}
          aria-label="투표 제목"
          className="w-full"
          maxLength={100}
          placeholder="투표 제목을 입력해 주세요"
        />
      </FormField>
      <VoteTeamTemplateFields textOnly={textOnly} />
      <VoteFeedbackTemplateFields textOnly={textOnly} />
    </div>
  )
}
