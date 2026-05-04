import { Skeleton, Table } from "@heroui/react"

const SKELETON_ROW_COUNT = 6

export const EarlyNotificationTableSkeleton = () => {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="사전 알림 목록 로딩 중"
          className="min-w-180"
        >
          <Table.Header>
            <Table.Column isRowHeader>이메일</Table.Column>
            <Table.Column>기수</Table.Column>
            <Table.Column>신청일</Table.Column>
            <Table.Column>상태</Table.Column>
            <Table.Column>발송 일시</Table.Column>
          </Table.Header>
          <Table.Body>
            {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <Skeleton className="h-4 w-44 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-16 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-24 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-16 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-32 rounded" />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
