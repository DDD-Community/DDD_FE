import { toast } from "@heroui/react"

export function useCopyInvitationCodeFlow() {
  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success("코드를 복사했습니다")
    } catch (error) {
      toast.danger("코드 복사에 실패했습니다", {
        description: (error as Error).message,
      })
    }
  }

  return { copy }
}
