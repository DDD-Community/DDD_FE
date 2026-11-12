import { Button, Chip, Table } from "@heroui/react"
import type { AttendanceVoteSummary } from "@ddd/api"
import {
  formatVoteDateTime,
  VOTE_STATUS_COLOR,
  VOTE_STATUS_LABEL,
} from "../lib/vote"

interface Props {
  votes: AttendanceVoteSummary[]
  selectedId: number | null
  onSelect: (voteId: number) => void
}

export function VoteListTable({ votes, selectedId, onSelect }: Props) {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="출석 투표 목록" className="min-w-max">
          <Table.Header>
            <Table.Column isRowHeader>제목</Table.Column>
            <Table.Column>상태</Table.Column>
            <Table.Column>시작 시각</Table.Column>
            <Table.Column>종료 시각</Table.Column>
            <Table.Column>제출 수</Table.Column>
            <Table.Column>생성일</Table.Column>
            <Table.Column>선택</Table.Column>
          </Table.Header>
          <Table.Body>
            {votes.map((vote) => (
              <Table.Row key={vote.voteId}>
                <Table.Cell>{vote.title}</Table.Cell>
                <Table.Cell>
                  <Chip color={VOTE_STATUS_COLOR[vote.status]}>
                    {VOTE_STATUS_LABEL[vote.status]}
                  </Chip>
                </Table.Cell>
                <Table.Cell>{formatVoteDateTime(vote.openedAt)}</Table.Cell>
                <Table.Cell>{formatVoteDateTime(vote.closedAt)}</Table.Cell>
                <Table.Cell>{vote.responseCount}</Table.Cell>
                <Table.Cell>{formatVoteDateTime(vote.createdDate)}</Table.Cell>
                <Table.Cell>
                  <Button
                    variant={
                      selectedId === vote.voteId ? "secondary" : "tertiary"
                    }
                    aria-label={`${vote.title} 보기`}
                    aria-current={
                      selectedId === vote.voteId ? "true" : undefined
                    }
                    onPress={() => onSelect(vote.voteId)}
                  >
                    보기
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
