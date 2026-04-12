import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@ddd/api"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button, Input, Table, Select, ListBox } from "@heroui/react"

import { FlexBox } from "@/shared/ui/FlexBox"
import { Title, Description } from "@/widgets/heading"

import type { BlogPostInfo } from "./types"
import {
  STATUS_LABEL,
  STATUS_FILTER_OPTIONS,
  STATUS_FILTER_MAP,
} from "./constants"

const getBlogPostData = async () => {
  try {
    const data = await api.get<BlogPostInfo[]>("/blog-post")
    return data
  } catch (error) {
    console.error("Failed to fetch blog post data:", error)
  }
}

/** 블로그 관리 페이지 */
export default function BlogPostsPage() {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("전체")

  const { data: blogPosts } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: getBlogPostData,
  })

  const filteredBlogPosts = useMemo(() => {
    const source = blogPosts ?? []
    const targetStatus = STATUS_FILTER_MAP[statusFilter]
    return source
      .filter(
        (item) =>
          item.title.includes(searchText) || item.author.includes(searchText)
      )
      .filter((item) => targetStatus === null || item.status === targetStatus)
  }, [blogPosts, searchText, statusFilter])

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection />

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <FlexBox className="justify-between">
          <Input
            variant="secondary"
            placeholder="제목 또는 작성자 검색..."
            className="max-w-xs"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select variant="secondary" className="max-w-36" aria-label="상태 필터">
            <Select.Trigger>
              <Select.Value>{statusFilter}</Select.Value>
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <ListBox.Item
                    key={option}
                    id={option}
                    textValue={option}
                    onClick={() => setStatusFilter(option)}
                  >
                    {option}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </FlexBox>

        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="블로그 목록" className="min-w-[900px]">
              <Table.Header>
                <Table.Column isRowHeader>제목</Table.Column>
                <Table.Column>작성자</Table.Column>
                <Table.Column>카테고리</Table.Column>
                <Table.Column>상태</Table.Column>
                <Table.Column>게시일</Table.Column>
                <Table.Column>등록일</Table.Column>
                <Table.Column>액션</Table.Column>
              </Table.Header>

              <Table.Body>
                {filteredBlogPosts.map((blogPost) => (
                  <Table.Row key={blogPost.id}>
                    <Table.Cell>{blogPost.title}</Table.Cell>
                    <Table.Cell>{blogPost.author}</Table.Cell>
                    <Table.Cell>{blogPost.category}</Table.Cell>
                    <Table.Cell>{STATUS_LABEL[blogPost.status]}</Table.Cell>
                    <Table.Cell>
                      {new Date(blogPost.publishedAt).toLocaleDateString("ko-KR")}
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(blogPost.createdAt).toLocaleDateString("ko-KR")}
                    </Table.Cell>
                    <Table.Cell>
                      <Button size="sm" variant="outline" className="mr-2">
                        수정
                      </Button>
                      <Button size="sm" variant="danger">
                        삭제
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
    </div>
  )
}

const TitleSection = () => {
  return (
    <FlexBox className="justify-between">
      <header className="space-y-2">
        <Title title="블로그 관리" />
        <Description title="DDD 블로그 포스트를 등록하고 상태를 관리합니다." />
      </header>
      <Button size="lg">
        <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />새 포스트 등록
      </Button>
    </FlexBox>
  )
}
