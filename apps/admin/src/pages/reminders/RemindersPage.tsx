import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@ddd/api"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button, Input, Table } from "@heroui/react"

import { GridBox } from "@/shared/ui/GridBox"
import { FlexBox } from "@/shared/ui/FlexBox"
import { Title, Description } from "@/widgets/heading"

import type { ReminderInfo } from "./types"
import {
  ROLE_LABEL,
  STATUS_LABEL,
  STATUS_FILTER_OPTIONS,
  STATUS_FILTER_MAP,
} from "./constants"

const getReminderData = async () => {
  try {
    const data = await api.get<ReminderInfo[]>("/reminder")
    return data
  } catch (error) {
    console.error("Failed to fetch reminder data:", error)
  }
}

/** 사전 알림 신청 페이지 */
export default function RemindersPage() {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("전체")

  const { data: reminders } = useQuery({
    queryKey: ["reminders"],
    queryFn: getReminderData,
  })

  const filteredReminders = useMemo(() => {
    const source = reminders ?? []
    const targetStatus = STATUS_FILTER_MAP[statusFilter]
    return source
      .filter(
        (item) =>
          item.name.includes(searchText) || item.email.includes(searchText)
      )
      .filter((item) => targetStatus === null || item.status === targetStatus)
  }, [reminders, searchText, statusFilter])

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection />
      <CardSection total={reminders?.length ?? 0} />

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <FlexBox className="justify-between">
          <Input
            placeholder="이름 또는 이메일 검색..."
            className="max-w-xs"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="max-w-36 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FlexBox>

        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="알림 신청 목록"
              className="min-w-[800px]"
            >
              <Table.Header>
                <Table.Column isRowHeader>이름</Table.Column>
                <Table.Column>이메일</Table.Column>
                <Table.Column>직군</Table.Column>
                <Table.Column>관심 기수</Table.Column>
                <Table.Column>신청일</Table.Column>
                <Table.Column>상태</Table.Column>
                <Table.Column>액션</Table.Column>
              </Table.Header>

              <Table.Body>
                {filteredReminders.map((reminder) => (
                  <Table.Row key={reminder.id}>
                    <Table.Cell>{reminder.name}</Table.Cell>
                    <Table.Cell>{reminder.email}</Table.Cell>
                    <Table.Cell>{ROLE_LABEL[reminder.role]}</Table.Cell>
                    <Table.Cell>{reminder.semester}</Table.Cell>
                    <Table.Cell>
                      {new Date(reminder.appliedAt).toLocaleDateString("ko-KR")}
                    </Table.Cell>
                    <Table.Cell>{STATUS_LABEL[reminder.status]}</Table.Cell>
                    <Table.Cell>
                      <Button size="sm" variant="outline" className="mr-2">
                        발송
                      </Button>
                      <Button size="sm" variant="danger">
                        취소
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
        <Title title="사전 알림 신청" />
        <Description title="모집 시작 전 알림을 신청한 사용자 목록을 관리합니다." />
      </header>
      <Button size="lg">
        <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
        알림 발송
      </Button>
    </FlexBox>
  )
}

type CardSectionProps = { total: number }

const CardSection = ({ total }: CardSectionProps) => {
  return (
    <GridBox className="grid-cols-4 gap-5">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="font-semibold text-gray-700">전체 신청</h3>
        <p className="text-2xl font-bold">{total}명</p>
        <p className="text-sm text-gray-500">누적 알림 신청 수</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="font-semibold text-gray-700">대기</h3>
        <p className="text-2xl font-bold">발송 예정</p>
        <p className="text-sm text-gray-500">알림 미발송 신청</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="font-semibold text-gray-700">발송 완료</h3>
        <p className="text-2xl font-bold">알림 발송됨</p>
        <p className="text-sm text-gray-500">모집 시작 알림 발송</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h3 className="font-semibold text-gray-700">취소</h3>
        <p className="text-2xl font-bold">신청 취소됨</p>
        <p className="text-sm text-gray-500">사용자 취소 건수</p>
      </div>
    </GridBox>
  )
}
