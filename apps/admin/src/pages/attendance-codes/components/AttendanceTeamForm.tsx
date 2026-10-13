import { Button, Drawer, Input } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, FormProvider, useForm } from "react-hook-form"

import { FormField } from "@/shared/ui/FormField"

import { useCreateTeamFlow } from "../hooks/useCreateTeamFlow"
import {
  buildTeamFormDefaults,
  teamSchema,
  type TeamFormValues,
} from "../types"

interface Props {
  generationId: number
  onDone: () => void
}
const FORM_ID = "attendance-team-form"

export function AttendanceTeamForm({ generationId, onDone }: Props) {
  const methods = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: buildTeamFormDefaults(),
  })
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods
  const { submit, isPending } = useCreateTeamFlow({
    generationId,
    onSuccess: onDone,
  })
  const onSubmit = handleSubmit(async (values) => {
    try {
      await submit({
        name: values.name,
        ...(values.serviceName && { serviceName: values.serviceName }),
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
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <FormField label="팀 이름" error={fieldState.error?.message}>
                  <Input
                    className="w-full"
                    {...field}
                    placeholder="팀 이름을 입력하세요"
                    maxLength={30}
                  />
                </FormField>
              )}
            />
            <Controller
              control={control}
              name="serviceName"
              render={({ field, fieldState }) => (
                <FormField label="서비스명" error={fieldState.error?.message}>
                  <Input
                    className="w-full"
                    {...field}
                    placeholder="선택 입력"
                    maxLength={100}
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
