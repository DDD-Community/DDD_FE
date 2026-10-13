import {
  Button,
  Drawer,
  Input,
  TextArea,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, FormProvider, useForm } from "react-hook-form"

import { FormField } from "@/shared/ui/FormField"

import { useCreateInvitationFlow } from "../hooks/useCreateInvitationFlow"
import {
  buildInvitationFormDefaults,
  invitationSchema,
  type InvitationFormValues,
} from "../types"

interface Props {
  generationId: number
  onDone: () => void
}
const FORM_ID = "attendance-invitation-form"

export function AttendanceInvitationForm({ generationId, onDone }: Props) {
  const methods = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: buildInvitationFormDefaults(),
  })
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods
  const { submit, isPending } = useCreateInvitationFlow(generationId, onDone)
  const onSubmit = handleSubmit(async (values) => {
    try {
      await submit({
        type: values.type,
        ...(values.code && { code: values.code }),
        ...(values.description && { description: values.description }),
      })
    } catch {
      // flow displays toast
    }
  })

  return (
    <>
      <Drawer.Body className="flex-1 space-y-5 overflow-y-auto">
        <FormProvider {...methods}>
          <form id={FORM_ID} onSubmit={onSubmit} className="space-y-5">
            <FormField label="유형">
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <ToggleButtonGroup
                    fullWidth
                    aria-label="초대 코드 유형"
                    selectionMode="single"
                    disallowEmptySelection
                    selectedKeys={[field.value]}
                    onSelectionChange={(keys) => {
                      const [key] = keys
                      if (key === "MEMBER" || key === "MANAGER")
                        field.onChange(key)
                    }}
                  >
                    <ToggleButton id="MEMBER">회원</ToggleButton>
                    <ToggleButton id="MANAGER">운영진</ToggleButton>
                  </ToggleButtonGroup>
                )}
              />
            </FormField>
            <Controller
              control={control}
              name="code"
              render={({ field, fieldState }) => (
                <FormField label="코드" error={fieldState.error?.message}>
                  <Input
                    className="w-full"
                    {...field}
                    placeholder="비우면 자동 생성됩니다"
                    maxLength={50}
                  />
                </FormField>
              )}
            />
            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <FormField label="설명" error={fieldState.error?.message}>
                  <TextArea
                    {...field}
                    placeholder="초대 코드 설명 (선택)"
                    maxLength={255}
                    className="w-full resize-none"
                  />
                </FormField>
              )}
            />
          </form>
        </FormProvider>
      </Drawer.Body>
      <Drawer.Footer className="gap-2">
        <Drawer.CloseTrigger />
        <Button
          type="submit"
          form={FORM_ID}
          isDisabled={isPending || isSubmitting}
        >
          {isPending ? "추가 중..." : "추가"}
        </Button>
      </Drawer.Footer>
    </>
  )
}
