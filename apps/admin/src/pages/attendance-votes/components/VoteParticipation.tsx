import { Table } from "@heroui/react"
import { useSuspenseQueries } from "@tanstack/react-query"
import { attendanceQueries } from "@ddd/api"
import type { AttendanceVoteStatus } from "@ddd/api"
import { EmptyState } from "@/shared/ui/EmptyState"
import { StatCard } from "@/shared/ui/StatCard"

const ATTENDANCE_LABEL = {
  ATTENDED: "출석",
  LATE: "지각",
  ABSENT: "결석",
  NONE: "기록 없음",
} as const

export function VoteParticipation({
  voteId,
  status,
}: {
  voteId: number
  status: AttendanceVoteStatus
}) {
  const [{ data: participation }, { data: nonResponders }] = useSuspenseQueries(
    {
      queries: [
        attendanceQueries.getVoteParticipation({ params: { voteId } }),
        attendanceQueries.getVoteNonResponders({ params: { voteId } }),
      ],
    }
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard title="전체 인원" value={`${participation.totalMembers}명`} />
        <StatCard
          title="응답 멤버"
          value={`${participation.respondedMembers}명`}
        />
        <StatCard
          title="참여율"
          value={`${participation.participationRate}%`}
        />
      </div>
      <h3 className="font-semibold">
        미참여 명단 ({nonResponders.totalCount}명)
      </h3>
      {nonResponders.members.length === 0 ? (
        <EmptyState>모든 멤버가 응답했습니다.</EmptyState>
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="투표 미참여 명단" className="min-w-max">
              <Table.Header>
                <Table.Column isRowHeader>이름</Table.Column>
                <Table.Column>팀</Table.Column>
                {status === "OPEN" && (
                  <Table.Column>오늘 출석(조회일 기준)</Table.Column>
                )}
              </Table.Header>
              <Table.Body>
                {nonResponders.members.map((member) => (
                  <Table.Row key={member.memberId}>
                    <Table.Cell>{member.name ?? "-"}</Table.Cell>
                    <Table.Cell>{member.teamName ?? "-"}</Table.Cell>
                    {status === "OPEN" && (
                      <Table.Cell>
                        {ATTENDANCE_LABEL[member.todayAttendanceStatus]}
                      </Table.Cell>
                    )}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
    </div>
  )
}
