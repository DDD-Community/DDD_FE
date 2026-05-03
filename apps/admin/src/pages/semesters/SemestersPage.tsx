import { useMemo, useState } from "react"
import { useCohorts, type CohortDto } from "@ddd/api"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button, Input, Table, Select, ListBox, Drawer } from "@heroui/react"

import { GridBox } from "@/shared/ui/GridBox"
import { FlexBox } from "@/shared/ui/FlexBox"
import { Title, Description } from "@/widgets/heading"

import {
  STATUS_LABEL,
  STATUS_FILTER_OPTIONS,
  STATUS_FILTER_MAP,
  type StatusFilterOption,
} from "./constants"
import { SemesterRegisterDrawer } from "./SemesterRegisterDrawer"

const formatRecruitmentPeriod = (cohort: CohortDto) => {
  const start = new Date(cohort.recruitStartAt).toLocaleDateString("ko-KR")
  const end = new Date(cohort.recruitEndAt).toLocaleDateString("ko-KR")
  return `${start} ~ ${end}`
}

/** 기수 관리 페이지 */
export default function SemestersPage() {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<StatusFilterOption>("전체")

  const { data: cohorts } = useCohorts()
  const cohortList = useMemo<CohortDto[]>(() => cohorts ?? [], [cohorts])

  const filteredCohorts = useMemo(() => {
    const targetStatus = STATUS_FILTER_MAP[statusFilter]
    return cohortList
      .filter((cohort) => searchText === "" || cohort.name.includes(searchText))
      .filter((cohort) => targetStatus === null || cohort.status === targetStatus)
  }, [cohortList, searchText, statusFilter])

  return (
    <div className="w-full space-y-5 p-5">
      <Drawer>
        <TitleSection />
        <CardSection cohorts={cohortList} />
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
                <Table.Column>등록일</Table.Column>
                <Table.Column>액션</Table.Column>
              </Table.Header>
              <Table.Body>
                {filteredCohorts.map((cohort) => (
                  <Table.Row key={cohort.id}>
                    <Table.Cell>{cohort.name}</Table.Cell>
                    <Table.Cell>{STATUS_LABEL[cohort.status]}</Table.Cell>
                    <Table.Cell>{formatRecruitmentPeriod(cohort)}</Table.Cell>
                    <Table.Cell>
                      {new Date(cohort.createdAt).toLocaleDateString("ko-KR")}
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

type CardSectionProps = { cohorts: CohortDto[] }

const CardSection = ({ cohorts }: CardSectionProps) => {
  const counts = useMemo(() => {
    const acc = { UPCOMING: 0, RECRUITING: 0, ACTIVE: 0, CLOSED: 0 }
    for (const cohort of cohorts) acc[cohort.status] += 1
    return acc
  }, [cohorts])

  return (
    <GridBox className="grid-cols-4 gap-5">
      <StatCard
        title="전체 기수"
        value={`${cohorts.length}`}
        hint="등록된 모든 기수"
      />
      <StatCard
        title="모집 예정"
        value={`${counts.UPCOMING}`}
        hint="UPCOMING"
      />
      <StatCard
        title="모집중"
        value={`${counts.RECRUITING}`}
        hint="RECRUITING"
      />
      <StatCard
        title="활동중"
        value={`${counts.ACTIVE}`}
        hint="ACTIVE"
      />
    </GridBox>
  )
}

type StatCardProps = { title: string; value: string; hint: string }

const StatCard = ({ title, value, hint }: StatCardProps) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{hint}</p>
    </div>
  )
}
