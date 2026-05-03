import { useMemo, useState } from "react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button, Input, ListBox, Select, Table } from "@heroui/react"

import type { CohortDto } from "@ddd/api"

import {
  STATUS_LABEL,
  NEXT_STATUS_BUTTON_LABEL,
  nextStatus,
  serializeCohortToForm,
  useTransitionCohortStatusFlow,
} from "@/entities/cohort"
import { FlexBox } from "@/shared/ui/FlexBox"
import { GridBox } from "@/shared/ui/GridBox"
import { Description, Title } from "@/widgets/heading"

import { SemesterRegisterDrawer } from "./components"
import {
  STATUS_FILTER_OPTIONS,
  type StatusFilterValue,
} from "./constants"
import {
  useSemesterRegistrationMode,
  useSemestersTableData,
  type CohortRow,
  type SemestersSummary,
} from "./hooks"

/** 기수 관리 페이지 */
export default function SemestersPage() {
  const { tableRows, summary, isError, refetch } = useSemestersTableData()
  const registration = useSemesterRegistrationMode()
  const { transition } = useTransitionCohortStatusFlow()

  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("ALL")

  // 행 "수정" 클릭 시 채워지는 edit 타겟. registration 모드를 오버라이드.
  const [editTarget, setEditTarget] = useState<CohortDto | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const drawerProps = useMemo(() => {
    if (editTarget) {
      return {
        mode: "edit" as const,
        targetId: editTarget.id,
        prefill: serializeCohortToForm(editTarget),
      }
    }
    return {
      mode: registration.mode,
      targetId: registration.targetId,
      prefill: registration.prefill,
    }
  }, [editTarget, registration])

  const handleDrawerOpenChange = (open: boolean) => {
    setIsDrawerOpen(open)
    if (!open) setEditTarget(null)
  }

  const filteredRows = useMemo(() => {
    return tableRows
      .filter((row) =>
        searchText === "" ? true : row.name.includes(searchText),
      )
      .filter((row) =>
        statusFilter === "ALL" ? true : row.status === statusFilter,
      )
  }, [tableRows, searchText, statusFilter])

  if (isError) {
    return (
      <div className="w-full p-5">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-800">
            기수 목록을 불러오지 못했습니다
          </p>
          <Button className="mt-3" onPress={refetch}>
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection
        registrationLabel={registration.buttonLabel}
        onClickRegister={() => {
          setEditTarget(null)
          setIsDrawerOpen(true)
        }}
      />

      <CardSection summary={summary} />

      <SemesterRegisterDrawer
        isOpen={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
        mode={drawerProps.mode}
        targetId={drawerProps.targetId}
        prefill={drawerProps.prefill}
      />

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
            selectedKey={statusFilter}
            onSelectionChange={(key) =>
              setStatusFilter(String(key) as StatusFilterValue)
            }
          >
            <Select.Trigger>
              <Select.Value>
                {
                  STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)
                    ?.label
                }
              </Select.Value>
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <ListBox.Item
                    key={option.value}
                    id={option.value}
                    textValue={option.label}
                  >
                    {option.label}
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
                {filteredRows.map((row) => (
                  <SemesterRow
                    key={row.id}
                    row={row}
                    onEdit={() => {
                      setEditTarget(row)
                      setIsDrawerOpen(true)
                    }}
                    onTransition={() => transition(row)}
                  />
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
    </div>
  )
}

// ─── 서브컴포넌트 ────────────────────────────────────────────────────────────

type TitleSectionProps = {
  registrationLabel: string
  onClickRegister: () => void
}

const TitleSection = ({
  registrationLabel,
  onClickRegister,
}: TitleSectionProps) => {
  return (
    <FlexBox className="justify-between">
      <header className="space-y-2">
        <Title title="기수 관리" />
        <Description title="DDD 활동 기수를 등록하고 상태를 관리합니다." />
      </header>
      <Button onPress={onClickRegister}>
        <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
        {registrationLabel}
      </Button>
    </FlexBox>
  )
}

type CardSectionProps = {
  summary: SemestersSummary
}

const CardSection = ({ summary }: CardSectionProps) => {
  return (
    <GridBox className="grid-cols-4 gap-5">
      <SummaryCard
        title="전체 기수"
        value={`${summary.totalCohorts}`}
        sub="등록된 기수 수"
      />
      <SummaryCard
        title="현재 상태"
        value={summary.currentStatusLabel}
        sub="가장 최신 기수"
      />
      <SummaryCard
        title="누적 지원자"
        value={`${summary.totalApplicants}명`}
        sub="전체 기수 합산"
      />
      <SummaryCard
        title="누적 활동 멤버"
        value={`${summary.totalMembers}명`}
        sub="전체 기수 합산"
      />
    </GridBox>
  )
}

const SummaryCard = ({
  title,
  value,
  sub,
}: {
  title: string
  value: string
  sub: string
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
    <h3 className="font-semibold text-gray-700">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-gray-500">{sub}</p>
  </div>
)

type SemesterRowProps = {
  row: CohortRow
  onEdit: () => void
  onTransition: () => void
}

const SemesterRow = ({ row, onEdit, onTransition }: SemesterRowProps) => {
  const transitionLabel = NEXT_STATUS_BUTTON_LABEL[row.status]
  const canTransition = nextStatus(row.status) !== null

  return (
    <Table.Row>
      <Table.Cell>{row.name}</Table.Cell>
      <Table.Cell>{STATUS_LABEL[row.status]}</Table.Cell>
      <Table.Cell>
        {formatPeriod(row.recruitStartAt, row.recruitEndAt)}
      </Table.Cell>
      <Table.Cell>{row.applicantsCount ?? "-"}</Table.Cell>
      <Table.Cell>{row.membersCount ?? "-"}</Table.Cell>
      <Table.Cell>
        {new Date(row.createdAt).toLocaleDateString("ko-KR")}
      </Table.Cell>
      <Table.Cell>
        <Button size="sm" variant="outline" className="mr-2" onPress={onEdit}>
          수정
        </Button>
        {canTransition && transitionLabel && (
          <Button size="sm" onPress={onTransition}>
            {transitionLabel}
          </Button>
        )}
      </Table.Cell>
    </Table.Row>
  )
}

const formatPeriod = (start: string, end: string): string => {
  if (!start && !end) return "-"
  const left = start ? start.slice(0, 10) : "?"
  const right = end ? end.slice(0, 10) : "?"
  return `${left} ~ ${right}`
}
