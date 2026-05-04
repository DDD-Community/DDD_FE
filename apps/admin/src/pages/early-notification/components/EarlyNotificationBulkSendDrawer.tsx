import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Drawer, Input, TextArea, toast } from "@heroui/react"

import { earlyNotificationKeys, useSendBulkEarlyNotification } from "@ddd/api"

import { useIsMobile } from "@/shared/hooks/useIsMobile"

import { buildEmailTemplate } from "../lib/buildEmailTemplate"

const bulkSendSchema = z.object({
  subject: z
    .string()
    .min(1, "제목을 입력해 주세요.")
    .max(200, "200자 이하로 입력해 주세요."),
  message: z
    .string()
    .min(1, "본문을 입력해 주세요.")
    .max(5000, "5000자 이하로 입력해 주세요."),
  ctaLabel: z
    .string()
    .min(1, "버튼 라벨을 입력해 주세요.")
    .max(30, "30자 이하로 입력해 주세요."),
  ctaUrl: z
    .string()
    .url("URL 형식이 아닙니다.")
    .refine((u) => /^https?:\/\//i.test(u), {
      message: "http(s) URL만 사용해 주세요.",
    }),
})

type BulkSendFormValues = z.infer<typeof bulkSendSchema>

const DEFAULT_VALUES: BulkSendFormValues = {
  subject: "",
  message: "",
  ctaLabel: "지원하기",
  ctaUrl: "",
}

type EarlyNotificationBulkSendDrawerProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  cohortId: number
  cohortName: string
}

export const EarlyNotificationBulkSendDrawer = ({
  isOpen,
  onOpenChange,
  cohortId,
  cohortName,
}: EarlyNotificationBulkSendDrawerProps) => {
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useSendBulkEarlyNotification()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BulkSendFormValues>({
    resolver: zodResolver(bulkSendSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!isOpen) {
      reset(DEFAULT_VALUES)
    }
  }, [isOpen, reset])

  const onSubmit = handleSubmit(async (values) => {
    const { html, text } = buildEmailTemplate({
      message: values.message,
      ctaLabel: values.ctaLabel,
      ctaUrl: values.ctaUrl,
    })

    try {
      await mutateAsync({
        payload: {
          cohortId,
          subject: values.subject,
          html,
          text,
        },
      })
      queryClient.invalidateQueries({
        queryKey: earlyNotificationKeys.adminLists(),
      })
      toast.success("알림 발송이 완료되었습니다", {
        description: `${cohortName}에 등록된 신청자에게 발송했습니다.`,
      })
      onOpenChange(false)
    } catch (error) {
      toast.danger("발송에 실패했습니다", {
        description: (error as Error).message ?? "잠시 후 다시 시도해 주세요.",
      })
    }
  })

  const isBusy = isSubmitting || isPending

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog
          className={!isMobile ? "w-full max-w-1/2 bg-gray-50" : ""}
        >
          <Drawer.Header>
            <Drawer.Heading className="text-lg font-semibold">
              사전 알림 발송
            </Drawer.Heading>
            <p className="text-muted-foreground text-sm">
              {cohortName}에 등록된 모든 신청자에게 일괄 발송됩니다.
            </p>
          </Drawer.Header>

          <Drawer.Body className="flex-1 space-y-6 overflow-y-auto">
            <FormField label="제목" error={errors.subject?.message}>
              <Input
                {...register("subject")}
                placeholder="예: 14기 모집이 시작되었습니다"
                className="w-full"
              />
            </FormField>

            <FormField label="본문" error={errors.message?.message}>
              <TextArea
                {...register("message")}
                rows={8}
                placeholder="신청자에게 안내할 내용을 입력하세요. 줄바꿈은 그대로 적용됩니다."
                className="min-h-40 w-full resize-none"
              />
            </FormField>

            <FormField label="버튼 라벨" error={errors.ctaLabel?.message}>
              <Input
                {...register("ctaLabel")}
                placeholder="지원하기"
                className="w-full"
              />
            </FormField>

            <FormField label="버튼 링크 (URL)" error={errors.ctaUrl?.message}>
              <Input
                {...register("ctaUrl")}
                placeholder="https://dddstudy.com/recruit"
                className="w-full"
              />
            </FormField>
          </Drawer.Body>

          <Drawer.Footer className="gap-2">
            <Drawer.CloseTrigger />
            <Button onPress={() => onSubmit()} isDisabled={isBusy}>
              {isBusy ? "발송 중..." : "발송"}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}

const FormField = ({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-gray-700">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)
