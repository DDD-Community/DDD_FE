import { Button, Table } from "@heroui/react"

import type { BlogPostDto } from "@ddd/api"

type BlogPostsTableProps = {
  posts: BlogPostDto[]
  onEdit: (post: BlogPostDto) => void
  onDelete: (post: BlogPostDto) => void
}

export const BlogPostsTable = ({
  posts,
  onEdit,
  onDelete,
}: BlogPostsTableProps) => {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="블로그 목록" className="min-w-225">
          <Table.Header>
            <Table.Column>썸네일</Table.Column>
            <Table.Column isRowHeader>제목</Table.Column>
            <Table.Column>본문 일부</Table.Column>
            <Table.Column>외부 링크</Table.Column>
            <Table.Column>등록일</Table.Column>
            <Table.Column>액션</Table.Column>
          </Table.Header>

          <Table.Body>
            {posts.map((post) => (
              <Table.Row key={post.id}>
                <Table.Cell>
                  <Thumbnail src={post.thumbnail} alt={`${post.title} 썸네일`} />
                </Table.Cell>
                <Table.Cell>
                  <span className="line-clamp-1 max-w-50 font-semibold">
                    {post.title}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-muted-foreground line-clamp-1 max-w-60 text-xs">
                    {post.excerpt}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <a
                    href={post.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-1 max-w-45 font-mono text-xs text-cyan-600 hover:underline"
                  >
                    {prettyHostname(post.externalUrl)}
                  </a>
                </Table.Cell>
                <Table.Cell>
                  <span className="font-mono text-xs">
                    {formatDate(post.createdAt)}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => onEdit(post)}
                    >
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onPress={() => onDelete(post)}
                    >
                      삭제
                    </Button>
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

const Thumbnail = ({ src, alt }: { src?: string; alt: string }) => {
  if (!src) {
    return (
      <div className="bg-muted flex h-10 w-10 items-center justify-center rounded text-xs text-gray-400">
        N/A
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-10 w-10 rounded object-cover"
      loading="lazy"
    />
  )
}

const prettyHostname = (url: string) => {
  try {
    const u = new URL(url)
    return `${u.hostname}${u.pathname.replace(/\/$/, "") || "/"}`
  } catch {
    return url
  }
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("ko-KR")
  } catch {
    return iso
  }
}
