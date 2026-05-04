import { Skeleton, Table } from "@heroui/react"

const SKELETON_ROW_COUNT = 6

export const ProjectsTableSkeleton = () => {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="프로젝트 목록 로딩 중"
          className="min-w-[900px]"
        >
          <Table.Header>
            <Table.Column>썸네일</Table.Column>
            <Table.Column isRowHeader>서비스명</Table.Column>
            <Table.Column>플랫폼</Table.Column>
            <Table.Column>기수</Table.Column>
            <Table.Column>한줄 설명</Table.Column>
            <Table.Column>참여자</Table.Column>
            <Table.Column>액션</Table.Column>
          </Table.Header>
          <Table.Body>
            {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <Skeleton className="h-10 w-10 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-32 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-20 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-12 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-44 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-12 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-20 rounded" />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
