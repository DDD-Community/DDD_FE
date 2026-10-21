import { toast } from "@heroui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  googleCalendarKeys,
  googleCalendarMutations,
  googleCalendarQueries,
} from "@ddd/api"

export function useGoogleCalendarConnectionFlow() {
  const queryClient = useQueryClient()
  const status = useQuery(googleCalendarQueries.getStatus())
  const connectMutation = useMutation(googleCalendarMutations.connect())
  const disconnectMutation = useMutation(googleCalendarMutations.disconnect())

  async function connect() {
    try {
      const { authorizationUrl } = await connectMutation.mutateAsync()
      window.location.assign(authorizationUrl)
    } catch (error) {
      toast.danger("Google 캘린더 연결에 실패했어요", {
        description: (error as Error).message,
      })
    }
  }

  async function disconnect() {
    try {
      await disconnectMutation.mutateAsync()
      await queryClient.invalidateQueries({
        queryKey: googleCalendarKeys.status(),
      })
      toast.success("Google 캘린더 연결을 해제했어요")
    } catch (error) {
      toast.danger("Google 캘린더 연결 해제에 실패했어요", {
        description: (error as Error).message,
      })
    }
  }

  return {
    status: status.data,
    connect,
    disconnect,
    isPending: connectMutation.isPending || disconnectMutation.isPending,
  }
}
