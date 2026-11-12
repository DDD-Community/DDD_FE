import { Button, Input, ListBox, Select, Switch, TextArea } from "@heroui/react"
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form"

import { FormField } from "@/shared/ui/FormField"

import {
  newFollowUp,
  newOption,
  newQuestion,
  type VoteEditorForm,
} from "../lib/voteTemplate"

interface Props {
  textOnly: boolean
}

const TYPE_LABEL = {
  MULTI_SELECT: "복수 선택",
  LONG_TEXT: "긴 글",
  BOOLEAN: "예 / 아니오",
} as const

export function VoteFeedbackTemplateFields({ textOnly }: Props) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<VoteEditorForm>()
  const enabled = useWatch({ control, name: "feedback.enabled" })
  const { fields, append, move, remove } = useFieldArray({
    control,
    name: "feedback.questions",
  })

  return (
    <section className="border-default-200 space-y-4 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">피드백</h3>
        <Controller
          control={control}
          name="feedback.enabled"
          render={({ field }) => (
            <Switch
              aria-label="피드백 사용"
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
      {errors.feedback?.root?.message && (
        <p className="text-xs text-danger">{errors.feedback.root.message}</p>
      )}
      {enabled && (
        <div className="space-y-4">
          <FormField
            label="피드백 화면 제목"
            error={errors.feedback?.title?.message}
          >
            <Input
              {...register("feedback.title")}
              aria-label="피드백 화면 제목"
              className="w-full"
            />
          </FormField>
          <FormField label="설명" error={errors.feedback?.description?.message}>
            <TextArea
              {...register("feedback.description")}
              aria-label="피드백 설명"
              className="w-full"
            />
          </FormField>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">질문</h4>
              {!textOnly && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onPress={() => append(newQuestion("LONG_TEXT"))}
                >
                  질문 추가
                </Button>
              )}
            </div>
            {errors.feedback?.questions?.root?.message && (
              <p className="text-xs text-danger">
                {errors.feedback.questions.root.message}
              </p>
            )}
            {fields.map((row, index) => (
              <QuestionFields
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

interface QuestionProps extends Props {
  index: number
  count: number
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

function QuestionFields({
  index,
  count,
  textOnly,
  onMoveUp,
  onMoveDown,
  onRemove,
}: QuestionProps) {
  const {
    control,
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<VoteEditorForm>()
  const type = useWatch({ control, name: `feedback.questions.${index}.type` })
  const followUp = useWatch({
    control,
    name: `feedback.questions.${index}.followUp`,
  })
  const {
    fields: options,
    append,
    move,
    remove,
  } = useFieldArray({ control, name: `feedback.questions.${index}.options` })
  const error = errors.feedback?.questions?.[index]
  const ordinal = `${index + 1}번째 질문`

  function changeType(
    next: VoteEditorForm["feedback"]["questions"][number]["type"]
  ) {
    if (next === type) return
    setValue(`feedback.questions.${index}.type`, next, {
      shouldDirty: true,
      shouldValidate: true,
    })
    setValue(
      `feedback.questions.${index}.options`,
      next === "MULTI_SELECT"
        ? getValues(`feedback.questions.${index}.options`).length
          ? getValues(`feedback.questions.${index}.options`)
          : [newOption()]
        : [],
      { shouldDirty: true }
    )
    setValue(`feedback.questions.${index}.followUp`, null, {
      shouldDirty: true,
    })
    setValue(`feedback.questions.${index}.maxSelectableOptions`, null, {
      shouldDirty: true,
    })
    setValue(
      `feedback.questions.${index}.maxLength`,
      next === "LONG_TEXT" ? 300 : null,
      { shouldDirty: true }
    )
  }

  return (
    <div className="border-default-200 space-y-3 rounded-lg border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h5 className="text-sm font-semibold">질문 {index + 1}</h5>
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
      <FormField label="질문 유형" error={error?.type?.message}>
        <Select
          aria-label={`${ordinal} 유형`}
          isDisabled={textOnly}
          selectedKey={type}
          onSelectionChange={(key) => {
            if (key !== null) changeType(String(key) as typeof type)
          }}
        >
          <Select.Trigger>
            <Select.Value>{TYPE_LABEL[type]}</Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {Object.entries(TYPE_LABEL).map(([value, label]) => (
                <ListBox.Item key={value} id={value} textValue={label}>
                  {label}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </FormField>
      <FormField label="질문 제목" error={error?.title?.message}>
        <Input
          {...register(`feedback.questions.${index}.title`)}
          aria-label={`${ordinal} 제목`}
          className="w-full"
        />
      </FormField>
      <FormField label="도움말" error={error?.helpText?.message}>
        <TextArea
          {...register(`feedback.questions.${index}.helpText`)}
          aria-label={`${ordinal} 도움말`}
          className="w-full"
        />
      </FormField>
      <Controller
        control={control}
        name={`feedback.questions.${index}.required`}
        render={({ field }) => (
          <Switch
            aria-label={`${ordinal} 응답 필수`}
            isSelected={Boolean(field.value)}
            isDisabled={textOnly}
            onChange={field.onChange}
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <span className="text-sm">응답 필수</span>
            </Switch.Content>
          </Switch>
        )}
      />
      {type === "MULTI_SELECT" && (
        <div className="space-y-3">
          <FormField
            label="최대 선택 개수 (빈 값은 제한 없음)"
            error={error?.maxSelectableOptions?.message}
          >
            <Controller
              control={control}
              name={`feedback.questions.${index}.maxSelectableOptions`}
              render={({ field }) => (
                <Input
                  type="number"
                  min={1}
                  aria-label={`${ordinal} 최대 선택 개수`}
                  className="w-full"
                  disabled={textOnly}
                  value={String(field.value ?? "")}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === ""
                        ? null
                        : Number(event.target.value)
                    )
                  }
                />
              )}
            />
          </FormField>
          <div className="flex items-center justify-between">
            <h6 className="text-sm font-medium">선택지</h6>
            {!textOnly && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onPress={() => append(newOption())}
              >
                선택지 추가
              </Button>
            )}
          </div>
          {error?.options?.root?.message && (
            <p className="text-xs text-danger">{error.options.root.message}</p>
          )}
          {options.map((option, optionIndex) => (
            <div key={option.id} className="flex flex-wrap items-end gap-2">
              <div className="min-w-40 flex-1">
                <FormField
                  label={`선택지 ${optionIndex + 1}`}
                  error={error?.options?.[optionIndex]?.label?.message}
                >
                  <Input
                    {...register(
                      `feedback.questions.${index}.options.${optionIndex}.label`
                    )}
                    aria-label={`${ordinal} ${optionIndex + 1}번째 선택지 문구`}
                    className="w-full"
                  />
                </FormField>
              </div>
              {!textOnly && (
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    isDisabled={optionIndex === 0}
                    onPress={() => move(optionIndex, optionIndex - 1)}
                    aria-label={`${ordinal} ${optionIndex + 1}번째 선택지 위로 이동`}
                  >
                    위로
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    isDisabled={optionIndex === options.length - 1}
                    onPress={() => move(optionIndex, optionIndex + 1)}
                    aria-label={`${ordinal} ${optionIndex + 1}번째 선택지 아래로 이동`}
                  >
                    아래로
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onPress={() => remove(optionIndex)}
                    aria-label={`${ordinal} ${optionIndex + 1}번째 선택지 삭제`}
                  >
                    삭제
                  </Button>
                </div>
              )}
            </div>
          ))}
          <Switch
            aria-label={`${ordinal} 후속 질문 사용`}
            isSelected={followUp !== null}
            isDisabled={textOnly}
            onChange={(selected) =>
              setValue(
                `feedback.questions.${index}.followUp`,
                selected ? newFollowUp() : null,
                { shouldDirty: true, shouldValidate: true }
              )
            }
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <span className="text-sm">후속 질문 사용</span>
            </Switch.Content>
          </Switch>
          {followUp && <FollowUpFields index={index} textOnly={textOnly} />}
        </div>
      )}
      {type === "LONG_TEXT" && (
        <FormField
          label="최대 글자 수 (빈 값은 앱 기본 300자)"
          error={error?.maxLength?.message}
        >
          <Controller
            control={control}
            name={`feedback.questions.${index}.maxLength`}
            render={({ field }) => (
              <Input
                type="number"
                min={1}
                aria-label={`${ordinal} 최대 글자 수`}
                className="w-full"
                disabled={textOnly}
                value={String(field.value ?? "")}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === ""
                      ? null
                      : Number(event.target.value)
                  )
                }
              />
            )}
          />
        </FormField>
      )}
    </div>
  )
}

function FollowUpFields({
  index,
  textOnly,
}: {
  index: number
  textOnly: boolean
}) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<VoteEditorForm>()
  const error = errors.feedback?.questions?.[index]?.followUp
  const ordinal = `${index + 1}번째 질문의 후속 질문`
  return (
    <div className="border-default-200 space-y-3 rounded-lg border p-3">
      <h6 className="text-sm font-semibold">후속 질문 (긴 글)</h6>
      <FormField label="후속 질문 제목" error={error?.title?.message}>
        <Input
          {...register(`feedback.questions.${index}.followUp.title`)}
          aria-label={`${ordinal} 제목`}
          className="w-full"
        />
      </FormField>
      <FormField label="후속 질문 도움말" error={error?.helpText?.message}>
        <TextArea
          {...register(`feedback.questions.${index}.followUp.helpText`)}
          aria-label={`${ordinal} 도움말`}
          className="w-full"
        />
      </FormField>
      <Controller
        control={control}
        name={`feedback.questions.${index}.followUp.required`}
        render={({ field }) => (
          <Switch
            aria-label={`${ordinal} 응답 필수`}
            isSelected={Boolean(field.value)}
            isDisabled={textOnly}
            onChange={field.onChange}
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <span className="text-sm">응답 필수</span>
            </Switch.Content>
          </Switch>
        )}
      />
      <FormField
        label="최대 글자 수 (빈 값은 앱 기본 300자)"
        error={error?.maxLength?.message}
      >
        <Controller
          control={control}
          name={`feedback.questions.${index}.followUp.maxLength`}
          render={({ field }) => (
            <Input
              type="number"
              min={1}
              aria-label={`${ordinal} 최대 글자 수`}
              className="w-full"
              disabled={textOnly}
              value={String(field.value ?? "")}
              onChange={(event) =>
                field.onChange(
                  event.target.value === "" ? null : Number(event.target.value)
                )
              }
            />
          )}
        />
      </FormField>
    </div>
  )
}
