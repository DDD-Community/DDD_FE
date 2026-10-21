import { toast } from "@heroui/react"
import { useMutation } from "@tanstack/react-query"

import { applicationMutations } from "@ddd/api"

import type { TestEmailType } from "@ddd/api"

/**
 * 안내 메일 테스트 발송 흐름 훅.
 * - POST /admin/applications/test-emails
 * - 받는 사람은 서버가 로그인한 운영진 본인으로 고정한다 (화면에서 고르지 않는다)
 */
export const useSendTestEmailFlow = () => {
  const sendMutation = useMutation(applicationMutations.sendTestEmail())

  const send = async ({
    cohortId,
    type,
  }: {
    cohortId: number
    type: TestEmailType
  }) => {
    try {
      await sendMutation.mutateAsync({ payload: { cohortId, type } })
      toast.success(`${type} 안내 메일을 내 메일로 보냈습니다`)
    } catch (error) {
      toast.danger("테스트 메일 발송에 실패했습니다", {
        description: (error as Error)?.message,
      })
    }
  }

  return { send, isPending: sendMutation.isPending }
}
