import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@ddd/api"
import { Button, Input, Table, Select, ListBox } from "@heroui/react"

import { Title, Description } from "@/widgets/heading"
import { GridBox } from "@/shared/ui/GridBox"
import { FlexBox } from "@/shared/ui/FlexBox"

import type { ApplicationInfo } from "./types"
import {
  PART_LABEL,
  STATUS_LABEL,
  COHORT_FILTER_OPTIONS,
  COHORT_FILTER_MAP,
  PART_FILTER_OPTIONS,
  PART_FILTER_MAP,
  STATUS_FILTER_OPTIONS,
  STATUS_FILTER_MAP,
} from "./constants"

const getApplicationData = async () => {
  try {
    const data = await api.get<ApplicationInfo[]>("/application")
    return data
  } catch (error) {
    console.error("Failed to fetch application data:", error)
  }
}

/** 지원자 관리 페이지 */
export default function ApplicationsPage() {
  const [searchText, setSearchText] = useState("")
  const [cohortFilter, setCohortFilter] = useState<string>("전체 기수")
  const [partFilter, setPartFilter] = useState<string>("전체 파트")
  const [statusFilter, setStatusFilter] = useState<string>("전체 상태")

  const { data: applications } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplicationData,
  })

  const filteredApplications = useMemo(() => {
    const source = applications ?? []
    const targetCohort = COHORT_FILTER_MAP[cohortFilter]
    const targetPart = PART_FILTER_MAP[partFilter]
    const targetStatus = STATUS_FILTER_MAP[statusFilter]

    return source
      .filter(
        (item) =>
          item.name.includes(searchText) || item.email.includes(searchText)
      )
      .filter((item) => targetCohort === null || item.cohort === targetCohort)
      .filter((item) => targetPart === null || item.part === targetPart)
      .filter((item) => targetStatus === null || item.status === targetStatus)
  }, [applications, searchText, cohortFilter, partFilter, statusFilter])

  return (
    <div className="w-full space-y-5 p-5">
      <header className="space-y-2">
        <Title title="지원자 관리" />
        <Description title="지원서를 검토하고 상태를 변경합니다." />
      </header>
      <CardSection total={applications?.length ?? 0} />

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <FlexBox className="justify-between">
          <Input
            variant="secondary"
            placeholder="이름 또는 이메일 검색..."
            className="max-w-xs"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <FlexBox className="gap-2">
            <Select
              variant="secondary"
              className="max-w-36"
              aria-label="기수 필터"
            >
              <Select.Trigger>
                <Select.Value>{cohortFilter}</Select.Value>
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {COHORT_FILTER_OPTIONS.map((option) => (
                    <ListBox.Item
                      key={option}
                      id={option}
                      textValue={option}
                      onClick={() => setCohortFilter(option)}
                    >
                      {option}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            <Select
              variant="secondary"
              className="max-w-36"
              aria-label="파트 필터"
            >
              <Select.Trigger>
                <Select.Value>{partFilter}</Select.Value>
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {PART_FILTER_OPTIONS.map((option) => (
                    <ListBox.Item
                      key={option}
                      id={option}
                      textValue={option}
                      onClick={() => setPartFilter(option)}
                    >
                      {option}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
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
        </FlexBox>

        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="지원자 목록" className="min-w-[800px]">
              <Table.Header>
                <Table.Column isRowHeader>이름</Table.Column>
                <Table.Column>이메일</Table.Column>
                <Table.Column>파트</Table.Column>
                <Table.Column>지원 기수</Table.Column>
                <Table.Column>지원일</Table.Column>
                <Table.Column>상태</Table.Column>
                <Table.Column>액션</Table.Column>
              </Table.Header>
              <Table.Body>
                {filteredApplications.map((application) => (
                  <Table.Row key={application.id}>
                    <Table.Cell>{application.name}</Table.Cell>
                    <Table.Cell>{application.email}</Table.Cell>
                    <Table.Cell>{PART_LABEL[application.part]}</Table.Cell>
                    <Table.Cell>{application.semester}</Table.Cell>
                    <Table.Cell>
                      {new Date(application.appliedAt).toLocaleDateString(
                        "ko-KR"
                      )}
                    </Table.Cell>
                    <Table.Cell>{STATUS_LABEL[application.status]}</Table.Cell>
                    <Table.Cell>
                      <Button size="sm" variant="outline" className="mr-2">
                        수정
                      </Button>
                      <Button size="sm">합격 처리</Button>
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

type CardSectionProps = { total: number }

const CardSection = ({ total }: CardSectionProps) => {
  return (
    <GridBox className="grid-cols-5 gap-5">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="font-semibold text-gray-700">전체 지원</h3>
        <p className="text-2xl font-bold">{total}명</p>
        <p className="text-sm text-gray-500">14기 기준</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="font-semibold text-gray-700">대기</h3>
        <p className="text-2xl font-bold">서류 대기</p>
        <p className="text-sm text-gray-500">검토 필요</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="font-semibold text-gray-700">면접 대기</h3>
        <p className="text-2xl font-bold">18명</p>
        <p className="text-sm text-gray-500">면접 대상자</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="font-semibold text-gray-700">면접 합격</h3>
        <p className="text-2xl font-bold">18명</p>
        <p className="text-sm text-gray-500">활동 예정</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="font-semibold text-gray-700">활동중</h3>
        <p className="text-2xl font-bold">0명</p>
        <p className="text-sm text-gray-500">현재 활동</p>
      </div>
    </GridBox>
  )
}
