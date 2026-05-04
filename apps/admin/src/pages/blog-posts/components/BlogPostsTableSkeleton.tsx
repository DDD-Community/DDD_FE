import { Skeleton, Table } from "@heroui/react"

const SKELETON_ROW_COUNT = 8

export const BlogPostsTableSkeleton = () => {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="블로그 목록 로딩 중"
          className="min-w-225"
        >
          <Table.Header>
            <Table.Column>썸네일</Table.Column>
            <Table.Column isRowHeader>제목</Table.Column>
            <Table.Column>본문 일부</Table.Column>
            <Table.Column>외부 링크</Table.Column>
            <Table.Column>등록일</Table.Column>
            <Table.Column>액션</Table.Column>
          </Table.Header>
          <Table.Body>
            {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <Skeleton className="h-10 w-10 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-44 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-56 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-32 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-20 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    <Skeleton className="h-7 w-12 rounded" />
                    <Skeleton className="h-7 w-12 rounded" />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
