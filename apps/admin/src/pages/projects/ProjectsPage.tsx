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

import type { ProjectInfo } from "./types"
import {
  STATUS_LABEL,
  STATUS_FILTER_OPTIONS,
  STATUS_FILTER_MAP,
} from "./constants"

const getProjectData = async () => {
  try {
    const data = await api.get<ProjectInfo[]>("/project")
    return data
  } catch (error) {
    console.error("Failed to fetch project data:", error)
  }
}

/** 프로젝트 관리 페이지 */
export default function ProjectsPage() {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("전체")

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjectData,
  })

  const filteredProjects = useMemo(() => {
    const source = projects ?? []
    const targetStatus = STATUS_FILTER_MAP[statusFilter]
    return source
      .filter((item) => item.name.includes(searchText))
      .filter((item) => targetStatus === null || item.status === targetStatus)
  }, [projects, searchText, statusFilter])

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection />

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <FlexBox className="justify-between">
          <Input
            placeholder="프로젝트명 검색..."
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
              <TableHeaderCell>프로젝트명</TableHeaderCell>
              <TableHeaderCell>설명</TableHeaderCell>
              <TableHeaderCell>기수</TableHeaderCell>
              <TableHeaderCell>팀원 수</TableHeaderCell>
              <TableHeaderCell>상태</TableHeaderCell>
              <TableHeaderCell>등록일</TableHeaderCell>
              <TableHeaderCell>액션</TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.description}</TableCell>
                <TableCell>{project.semester}</TableCell>
                <TableCell>{project.memberCount}</TableCell>
                <TableCell>{STATUS_LABEL[project.status]}</TableCell>
                <TableCell>
                  {new Date(project.createdAt).toLocaleDateString("ko-KR")}
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
        <Title title="프로젝트 관리" />
        <Description title="DDD 활동 프로젝트를 등록하고 상태를 관리합니다." />
      </header>
      <Button size="lg">
        <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />새 프로젝트 등록
      </Button>
    </FlexBox>
  )
}
