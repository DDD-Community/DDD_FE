import { Button, Drawer, Input } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, FormProvider, useForm } from "react-hook-form"

import { FormField } from "@/shared/ui/FormField"

import { useCreateGenerationFlow } from "../hooks/useCreateGenerationFlow"
import {
  buildGenerationFormDefaults,
  generationSchema,
  type GenerationFormValues,
} from "../types"

interface Props {
  onDone: () => void
}
const FORM_ID = "attendance-generation-form"

export function AttendanceGenerationForm({ onDone }: Props) {
  const methods = useForm<GenerationFormValues>({
    resolver: zodResolver(generationSchema),
    defaultValues: buildGenerationFormDefaults(),
  })
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods
  const { submit, isPending } = useCreateGenerationFlow(onDone)
  const onSubmit = handleSubmit(async (values) => {
    try {
      await submit(values)
    } catch {
      /* flow displays toast */
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
                <FormField label="기수 이름" error={fieldState.error?.message}>
                  <Input
                    className="w-full"
                    {...field}
                    placeholder="예: 15기"
                    maxLength={5}
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
