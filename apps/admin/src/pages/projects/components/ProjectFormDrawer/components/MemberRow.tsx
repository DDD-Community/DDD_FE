import { Button, Input, ListBox, Select, TextArea } from "@heroui/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Controller, useFormContext } from "react-hook-form"

import {
  PART_LABEL,
  PART_OPTIONS,
  type ProjectFormValues,
} from "@/entities/project"
import { FormField } from "@/shared/ui/FormField"

type MemberRowProps = {
  index: number
  onRemove: () => void
}

export const MemberRow = ({ index, onRemove }: MemberRowProps) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProjectFormValues>()

  const memberErrors = errors.members?.[index]

  return (
    <div className="space-y-2 rounded-md border border-gray-200 bg-gray-100 p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField label="이름" error={memberErrors?.name?.message}>
          <Input
            {...register(`members.${index}.name`)}
            placeholder="이름"
            className="w-full"
          />
        </FormField>
        <FormField label="파트" error={memberErrors?.part?.message}>
          <Controller
            control={control}
            name={`members.${index}.part`}
            render={({ field }) => (
              <Select aria-label="파트">
                <Select.Trigger>
                  <Select.Value>
                    {field.value ? PART_LABEL[field.value] : "선택"}
                  </Select.Value>
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {PART_OPTIONS.map((p) => (
                      <ListBox.Item
                        key={p}
                        id={p}
                        textValue={PART_LABEL[p]}
                        onClick={() => field.onChange(p)}
                      >
                        {PART_LABEL[p]}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            )}
          />
        </FormField>
        <div className="flex items-end justify-end">
          <Button size="sm" variant="ghost" onPress={onRemove}>
            <HugeiconsIcon icon={Delete02Icon} className="mr-1" />
            삭제
          </Button>
        </div>
      </div>
      <FormField label="후기" error={memberErrors?.review?.message}>
        <TextArea
          {...register(`members.${index}.review`)}
          placeholder="참여 후기 (선택)"
          className="w-full"
        />
      </FormField>
    </div>
  )
}
