import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@ddd/api"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Card } from "@/shared/ui/Card"
import { GridBox } from "@/shared/ui/GridBox"
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
              <TableHeaderCell>이름</TableHeaderCell>
              <TableHeaderCell>이메일</TableHeaderCell>
              <TableHeaderCell>직군</TableHeaderCell>
              <TableHeaderCell>관심 기수</TableHeaderCell>
              <TableHeaderCell>신청일</TableHeaderCell>
              <TableHeaderCell>상태</TableHeaderCell>
              <TableHeaderCell>액션</TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredReminders.map((reminder) => (
              <TableRow key={reminder.id}>
                <TableCell>{reminder.name}</TableCell>
                <TableCell>{reminder.email}</TableCell>
                <TableCell>{ROLE_LABEL[reminder.role]}</TableCell>
                <TableCell>{reminder.semester}</TableCell>
                <TableCell>
                  {new Date(reminder.appliedAt).toLocaleDateString("ko-KR")}
                </TableCell>
                <TableCell>{STATUS_LABEL[reminder.status]}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" className="mr-2">
                    발송
                  </Button>
                  <Button size="sm" variant="destructive">
                    취소
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
    <GridBox>
      <Card
        renderTitle={() => "전체 신청"}
        renderDescription={() => `${total}명`}
        renderAdditionalInfo={() => "누적 알림 신청 수"}
      />
      <Card
        renderTitle={() => "대기"}
        renderDescription={() => "발송 예정"}
        renderAdditionalInfo={() => "알림 미발송 신청"}
      />
      <Card
        renderTitle={() => "발송 완료"}
        renderDescription={() => "알림 발송됨"}
        renderAdditionalInfo={() => "모집 시작 알림 발송"}
      />
      <Card
        renderTitle={() => "취소"}
        renderDescription={() => "신청 취소됨"}
        renderAdditionalInfo={() => "사용자 취소 건수"}
      />
    </GridBox>
  )
}
