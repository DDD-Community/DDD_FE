import { Table, Button, toast } from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"
import {
  type ApplicationDto,
  applicationKeys,
  usePatchApplicationStatus,
  type CohortDto,
} from "@ddd/api"
import { NEXT_STATUS, PART_LABEL, type ApplicationStatus } from "../constants"

type ApplicationTableProps = {
  applications: ApplicationDto[]
  cohorts: CohortDto[]
}

const formatDate = (iso?: string): string =>
  iso ? new Date(iso).toLocaleDateString("ko-KR") : "-"

export const ApplicationTable = ({ applications, cohorts }: ApplicationTableProps) => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = usePatchApplicationStatus()

  const cohortNameById = new Map(cohorts.map((c) => [c.id, c.name]))
  const allParts = cohorts.flatMap((c) => c.parts ?? []) as Array<{ id: number; name: string }>

  const handleAdvance = async (id: number, nextStatus: ApplicationStatus) => {
    try {
      await mutateAsync({
        params: { id },
        payload: { status: nextStatus as string },
      })
      queryClient.invalidateQueries({ queryKey: applicationKeys.adminLists() })
      toast.success(`상태가 ${nextStatus}(으)로 변경됐어요`)
    } catch {
      toast.error("상태 변경에 실패했어요")
    }
  }

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="지원자 목록" className="min-w-[900px]">
          <Table.Header>
            <Table.Column isRowHeader>지원자명</Table.Column>
            <Table.Column>연락처</Table.Column>
            <Table.Column>파트</Table.Column>
            <Table.Column>기수</Table.Column>
            <Table.Column>지원일</Table.Column>
            <Table.Column>상태</Table.Column>
            <Table.Column>액션</Table.Column>
          </Table.Header>
          <Table.Body>
            {applications.map((app) => {
              const next = NEXT_STATUS[app.status as keyof typeof NEXT_STATUS] ?? null
              const partName = allParts.find((p) => p.id === app.cohortPartId)?.name ?? ""
              return (
                <Table.Row key={app.id}>
                  <Table.Cell>{app.applicantName}</Table.Cell>
                  <Table.Cell>{app.applicantPhone ?? "-"}</Table.Cell>
                  <Table.Cell>{PART_LABEL[partName] ?? partName || "-"}</Table.Cell>
                  <Table.Cell>
                    {cohortNameById.get(app.cohortId) ?? "-"}
                  </Table.Cell>
                  <Table.Cell>
                    {formatDate(app.submittedAt ?? app.createdAt)}
                  </Table.Cell>
                  <Table.Cell>{app.status}</Table.Cell>
                  <Table.Cell>
                    {next ? (
                      <Button
                        size="sm"
                        isDisabled={isPending}
                        onPress={() => handleAdvance(app.id, next)}
                      >
                        다음 단계: {next}
                      </Button>
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
