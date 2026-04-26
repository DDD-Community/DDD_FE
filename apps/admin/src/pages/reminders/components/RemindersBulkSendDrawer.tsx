import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Drawer, Input, TextArea, toast } from "@heroui/react"

import {
  earlyNotificationKeys,
  useSendBulkEarlyNotification,
} from "@ddd/api"

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

type RemindersBulkSendDrawerProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  cohortId: number
  cohortName: string
}

export const RemindersBulkSendDrawer = ({
  isOpen,
  onOpenChange,
  cohortId,
  cohortName,
}: RemindersBulkSendDrawerProps) => {
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
      toast.error("발송에 실패했습니다", {
        description: (error as Error).message ?? "잠시 후 다시 시도해 주세요.",
      })
    }
  })

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement={isMobile ? "bottom" : "right"}
      size={isMobile ? "full" : "md"}
    >
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>사전 알림 발송</Drawer.Title>
          <Drawer.Description>
            {cohortName}에 등록된 모든 신청자에게 일괄 발송됩니다.
          </Drawer.Description>
        </Drawer.Header>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col">
          <Drawer.Body className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">제목</label>
              <Input
                {...register("subject")}
                placeholder="예: 14기 모집이 시작되었습니다"
                isInvalid={!!errors.subject}
              />
              {errors.subject && (
                <p className="text-xs text-red-500">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">본문</label>
              <TextArea
                {...register("message")}
                rows={8}
                placeholder="신청자에게 안내할 내용을 입력하세요. 줄바꿈은 그대로 적용됩니다."
                isInvalid={!!errors.message}
              />
              {errors.message && (
                <p className="text-xs text-red-500">{errors.message.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">버튼 라벨</label>
              <Input
                {...register("ctaLabel")}
                placeholder="지원하기"
                isInvalid={!!errors.ctaLabel}
              />
              {errors.ctaLabel && (
                <p className="text-xs text-red-500">
                  {errors.ctaLabel.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">버튼 링크 (URL)</label>
              <Input
                {...register("ctaUrl")}
                placeholder="https://dddstudy.com/recruit"
                isInvalid={!!errors.ctaUrl}
              />
              {errors.ctaUrl && (
                <p className="text-xs text-red-500">{errors.ctaUrl.message}</p>
              )}
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button
              variant="ghost"
              onPress={() => onOpenChange(false)}
              isDisabled={isSubmitting || isPending}
            >
              취소
            </Button>
            <Button
              type="submit"
              isDisabled={isSubmitting || isPending}
              isLoading={isSubmitting || isPending}
            >
              발송
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}
