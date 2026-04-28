import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getApiClient } from "@ddd/api"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button, Input, Table, Select, ListBox, Drawer } from "@heroui/react"

import { GridBox } from "@/shared/ui/GridBox"
import { FlexBox } from "@/shared/ui/FlexBox"
import { Title, Description } from "@/widgets/heading"

import type { SemesterInfo } from "./types"
import {
  STATUS_LABEL,
  STATUS_FILTER_OPTIONS,
  STATUS_FILTER_MAP,
} from "./constants"
import { SemesterRegisterDrawer } from "./SemesterRegisterDrawer"

const getSemesterData = async () => {
  try {
    return await getApiClient().get<SemesterInfo[]>("/semester")
  } catch (error) {
    console.error("Failed to fetch semester data:", error)
  }
}

/** 기수 관리 페이지 */
export default function SemestersPage() {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("전체")

  const { data: semesters } = useQuery({
    queryKey: ["semesters"],
    queryFn: getSemesterData,
  })

  const filteredSemesters = useMemo(() => {
    const source = semesters ?? []
    const targetStatus = STATUS_FILTER_MAP[statusFilter]
    return source
      .filter((item) => searchText === "" || item.semester.includes(searchText))
      .filter((item) => targetStatus === null || item.status === targetStatus)
  }, [semesters, searchText, statusFilter])

  return (
    <div className="w-full space-y-5 p-5">
      <Drawer>
        <TitleSection />
        <CardSection />
        <SemesterRegisterDrawer />
      </Drawer>

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <FlexBox className="justify-between">
          <Input
            variant="secondary"
            placeholder="검색..."
            className="max-w-xs"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            variant="secondary"
            className="max-w-36"
            aria-label="상태 필터"
          >
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
            <Table.Content aria-label="기수 목록">
              <Table.Header>
                <Table.Column isRowHeader>기수</Table.Column>
                <Table.Column>상태</Table.Column>
                <Table.Column>모집 기간</Table.Column>
                <Table.Column>지원자 수</Table.Column>
                <Table.Column>멤버 수</Table.Column>
                <Table.Column>등록일</Table.Column>
                <Table.Column>액션</Table.Column>
              </Table.Header>
              <Table.Body>
                {filteredSemesters.map((semester) => (
                  <Table.Row key={semester.semester}>
                    <Table.Cell>{semester.semester}</Table.Cell>
                    <Table.Cell>{STATUS_LABEL[semester.status]}</Table.Cell>
                    <Table.Cell>{semester.recruitmentPeriod}</Table.Cell>
                    <Table.Cell>{semester.applicants}</Table.Cell>
                    <Table.Cell>{semester.members}</Table.Cell>
                    <Table.Cell>
                      {new Date(semester.createdAt).toLocaleDateString("ko-KR")}
                    </Table.Cell>
                    <Table.Cell>
                      <Button size="sm" variant="outline" className="mr-2">
                        수정
                      </Button>
                      <Button size="sm">모집중 전환</Button>
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
        <Title title="기수 관리" />
        <Description title="DDD 활동 기수를 등록하고 상태를 관리합니다." />
      </header>
      <Button>
        <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />새 기수 등록
      </Button>
    </FlexBox>
  )
}

const CardSection = () => {
  return (
    <GridBox className="grid-cols-4 gap-5">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="font-semibold text-gray-700">전체 기수</h3>
        <p className="text-2xl font-bold">14</p>
        <p className="text-sm text-gray-500">추가 정보 1</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="font-semibold text-gray-700">현재 상태</h3>
        <p className="text-2xl font-bold">활동 중</p>
        <p className="text-sm text-gray-500">13기</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="font-semibold text-gray-700">누적 지원자</h3>
        <p className="text-2xl font-bold">1204명</p>
        <p className="text-sm text-gray-500">전체 기수 합산</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="font-semibold text-gray-700">누적 활동 멤버</h3>
        <p className="text-2xl font-bold">520명</p>
        <p className="text-sm text-gray-500">전체 기수 합산</p>
      </div>
    </GridBox>
  )
}
