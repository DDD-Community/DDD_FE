import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@ddd/api"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button, Input, Table, Select, ListBox } from "@heroui/react"

import { FlexBox } from "@/shared/ui/FlexBox"
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
            variant="secondary"
            placeholder="프로젝트명 검색..."
            className="max-w-xs"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select variant="secondary" className="max-w-36">
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
            <Table.Content aria-label="프로젝트 목록" className="min-w-[900px]">
              <Table.Header>
                <Table.Column isRowHeader>프로젝트명</Table.Column>
                <Table.Column>설명</Table.Column>
                <Table.Column>기수</Table.Column>
                <Table.Column>팀원 수</Table.Column>
                <Table.Column>상태</Table.Column>
                <Table.Column>등록일</Table.Column>
                <Table.Column>액션</Table.Column>
              </Table.Header>

              <Table.Body>
                {filteredProjects.map((project) => (
                  <Table.Row key={project.id}>
                    <Table.Cell>{project.name}</Table.Cell>
                    <Table.Cell>{project.description}</Table.Cell>
                    <Table.Cell>{project.semester}</Table.Cell>
                    <Table.Cell>{project.memberCount}</Table.Cell>
                    <Table.Cell>{STATUS_LABEL[project.status]}</Table.Cell>
                    <Table.Cell>
                      {new Date(project.createdAt).toLocaleDateString("ko-KR")}
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
        <Title title="프로젝트 관리" />
        <Description title="DDD 활동 프로젝트를 등록하고 상태를 관리합니다." />
      </header>
      <Button size="lg">
        <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />새 프로젝트 등록
      </Button>
    </FlexBox>
  )
}
