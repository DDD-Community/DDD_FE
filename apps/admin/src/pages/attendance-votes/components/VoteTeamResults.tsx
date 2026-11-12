import { Card, Table } from "@heroui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { attendanceQueries } from "@ddd/api"
import { EmptyState } from "@/shared/ui/EmptyState"
import { formatVoteTeamName, rankVoteTeams } from "../lib/vote"

export function VoteTeamResults({ voteId }: { voteId: number }) {
  const { data } = useSuspenseQuery(
    attendanceQueries.getVoteTeamResults({ params: { voteId } })
  )

  if (data.categories.length === 0)
    return <EmptyState>팀 투표 문항이 없는 투표입니다.</EmptyState>

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        전체 응답 {data.totalResponses}건
      </p>
      {[...data.categories]
        .sort((a, b) => a.order - b.order)
        .map((category) => (
          <Card key={category.categoryId}>
            <Card.Header>
              <Card.Title>{category.title ?? "-"}</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              {rankVoteTeams(category.teams).length === 0 ? (
                <EmptyState>아직 득표가 없습니다.</EmptyState>
              ) : (
                <Table>
                  <Table.ScrollContainer>
                    <Table.Content
                      aria-label={`${category.title ?? "부문"} 순위`}
                      className="min-w-max"
                    >
                      <Table.Header>
                        <Table.Column isRowHeader>순위</Table.Column>
                        <Table.Column>팀</Table.Column>
                        <Table.Column>서비스명</Table.Column>
                        <Table.Column>득표수</Table.Column>
                      </Table.Header>
                      <Table.Body>
                        {rankVoteTeams(category.teams).map((team) => (
                          <Table.Row key={team.teamId}>
                            <Table.Cell>{team.rank}</Table.Cell>
                            <Table.Cell>
                              {formatVoteTeamName(team.name, team.teamId)}
                            </Table.Cell>
                            <Table.Cell>{team.serviceName ?? "-"}</Table.Cell>
                            <Table.Cell>{team.voteCount}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
              )}
              <div>
                <h4 className="mb-2 text-sm font-semibold">사유</h4>
                {category.reasons.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    제출된 사유가 없습니다.
                  </p>
                ) : (
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {category.reasons.map((reason, index) => (
                      <li key={`${index}-${reason}`}>{reason}</li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                득표가 없는 팀은 표시하지 않습니다.
              </p>
            </Card.Content>
          </Card>
        ))}
    </div>
  )
}
