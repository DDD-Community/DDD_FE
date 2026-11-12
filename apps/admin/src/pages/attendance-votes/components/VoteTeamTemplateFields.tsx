import { Button, Input, Switch, TextArea } from "@heroui/react"
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form"

import { FormField } from "@/shared/ui/FormField"

import { newCategory, type VoteEditorForm } from "../lib/voteTemplate"

interface Props {
  textOnly: boolean
}

export function VoteTeamTemplateFields({ textOnly }: Props) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<VoteEditorForm>()
  const enabled = useWatch({ control, name: "teamVote.enabled" })
  const { fields, append, move, remove } = useFieldArray({
    control,
    name: "teamVote.categories",
  })

  return (
    <section className="border-default-200 space-y-4 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">팀 투표</h3>
        <Controller
          control={control}
          name="teamVote.enabled"
          render={({ field }) => (
            <Switch
              aria-label="팀 투표 사용"
              isSelected={field.value}
              isDisabled={textOnly}
              onChange={field.onChange}
            >
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <span className="text-sm">사용</span>
              </Switch.Content>
            </Switch>
          )}
        />
      </div>
      {errors.teamVote?.root?.message && (
        <p className="text-xs text-danger">{errors.teamVote.root.message}</p>
      )}
      {enabled && (
        <div className="space-y-4">
          <FormField
            label="팀 투표 화면 제목"
            error={errors.teamVote?.title?.message}
          >
            <Input
              {...register("teamVote.title")}
              aria-label="팀 투표 화면 제목"
              className="w-full"
            />
          </FormField>
          <FormField label="설명" error={errors.teamVote?.description?.message}>
            <TextArea
              {...register("teamVote.description")}
              aria-label="팀 투표 설명"
              className="w-full"
            />
          </FormField>
          <FormField label="안내문" error={errors.teamVote?.notice?.message}>
            <TextArea
              {...register("teamVote.notice")}
              aria-label="팀 투표 안내문"
              className="w-full"
            />
          </FormField>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">부문</h4>
              {!textOnly && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onPress={() => append(newCategory())}
                >
                  부문 추가
                </Button>
              )}
            </div>
            {errors.teamVote?.categories?.root?.message && (
              <p className="text-xs text-danger">
                {errors.teamVote.categories.root.message}
              </p>
            )}
            {fields.map((row, index) => (
              <CategoryFields
                key={row.id}
                index={index}
                count={fields.length}
                textOnly={textOnly}
                onMoveUp={() => move(index, index - 1)}
                onMoveDown={() => move(index, index + 1)}
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

interface CategoryProps extends Props {
  index: number
  count: number
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

function CategoryFields({
  index,
  count,
  textOnly,
  onMoveUp,
  onMoveDown,
  onRemove,
}: CategoryProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<VoteEditorForm>()
  const error = errors.teamVote?.categories?.[index]
  const ordinal = `${index + 1}번째 부문`

  return (
    <div className="border-default-200 space-y-3 rounded-lg border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h5 className="text-sm font-semibold">부문 {index + 1}</h5>
        {!textOnly && (
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              isDisabled={index === 0}
              onPress={onMoveUp}
              aria-label={`${ordinal} 위로 이동`}
            >
              위로
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              isDisabled={index === count - 1}
              onPress={onMoveDown}
              aria-label={`${ordinal} 아래로 이동`}
            >
              아래로
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              onPress={onRemove}
              aria-label={`${ordinal} 삭제`}
            >
              삭제
            </Button>
          </div>
        )}
      </div>
      <FormField label="부문 이름" error={error?.title?.message}>
        <Input
          {...register(`teamVote.categories.${index}.title`)}
          aria-label={`${ordinal} 이름`}
          className="w-full"
          placeholder="예: 기획"
        />
      </FormField>
      <p className="text-foreground-secondary text-xs">
        앱에서 &apos;1. {"{부문명}"}가 좋았던 팀을 선택해주세요.&apos;로
        보입니다. &apos;기획&apos;처럼 짧은 명사로 적어 주세요.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          label="최대 선택 팀 수"
          error={error?.maxSelectableTeams?.message}
        >
          <Controller
            control={control}
            name={`teamVote.categories.${index}.maxSelectableTeams`}
            render={({ field }) => (
              <Input
                type="number"
                min={1}
                aria-label={`${ordinal} 최대 선택 팀 수`}
                className="w-full"
                disabled={textOnly}
                value={String(field.value ?? "")}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === ""
                      ? Number.NaN
                      : Number(event.target.value)
                  )
                }
              />
            )}
          />
        </FormField>
        <Controller
          control={control}
          name={`teamVote.categories.${index}.reasonRequired`}
          render={({ field }) => (
            <Switch
              aria-label={`${ordinal} 사유 필수`}
              isSelected={Boolean(field.value)}
              isDisabled={textOnly}
              onChange={field.onChange}
            >
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <span className="text-sm">사유 필수</span>
              </Switch.Content>
            </Switch>
          )}
        />
        <FormField
          label="사유 최소 글자 수"
          error={error?.reasonMinLength?.message}
        >
          <Controller
            control={control}
            name={`teamVote.categories.${index}.reasonMinLength`}
            render={({ field }) => (
              <Input
                type="number"
                min={0}
                aria-label={`${ordinal} 사유 최소 글자 수`}
                className="w-full"
                disabled={textOnly}
                value={String(field.value ?? "")}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === ""
                      ? Number.NaN
                      : Number(event.target.value)
                  )
                }
              />
            )}
          />
        </FormField>
        <FormField
          label="사유 최대 글자 수"
          error={error?.reasonMaxLength?.message}
        >
          <Controller
            control={control}
            name={`teamVote.categories.${index}.reasonMaxLength`}
            render={({ field }) => (
              <Input
                type="number"
                min={1}
                aria-label={`${ordinal} 사유 최대 글자 수`}
                className="w-full"
                disabled={textOnly}
                value={String(field.value ?? "")}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === ""
                      ? Number.NaN
                      : Number(event.target.value)
                  )
                }
              />
            )}
          />
        </FormField>
      </div>
      <FormField label="사유 입력란 제목" error={error?.reasonLabel?.message}>
        <Input
          {...register(`teamVote.categories.${index}.reasonLabel`)}
          aria-label={`${ordinal} 사유 입력란 제목`}
          className="w-full"
        />
      </FormField>
    </div>
  )
}
