import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@ddd/api"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { FlexBox } from "@/shared/ui/FlexBox"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Select } from "@/shared/ui/Select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/ui/Table"
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
            placeholder="제목 또는 작성자 검색..."
            className="max-w-xs"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            items={STATUS_FILTER_OPTIONS}
            className="max-w-36"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </FlexBox>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>제목</TableHeaderCell>
              <TableHeaderCell>작성자</TableHeaderCell>
              <TableHeaderCell>카테고리</TableHeaderCell>
              <TableHeaderCell>상태</TableHeaderCell>
              <TableHeaderCell>게시일</TableHeaderCell>
              <TableHeaderCell>등록일</TableHeaderCell>
              <TableHeaderCell>액션</TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredBlogPosts.map((blogPost) => (
              <TableRow key={blogPost.id}>
                <TableCell>{blogPost.title}</TableCell>
                <TableCell>{blogPost.author}</TableCell>
                <TableCell>{blogPost.category}</TableCell>
                <TableCell>{STATUS_LABEL[blogPost.status]}</TableCell>
                <TableCell>
                  {new Date(blogPost.publishedAt).toLocaleDateString("ko-KR")}
                </TableCell>
                <TableCell>
                  {new Date(blogPost.createdAt).toLocaleDateString("ko-KR")}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" className="mr-2">
                    수정
                  </Button>
                  <Button size="sm" variant="destructive">
                    삭제
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
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
