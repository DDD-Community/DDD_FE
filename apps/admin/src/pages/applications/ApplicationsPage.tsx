import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@ddd/api"
import { Title, Description } from "@/widgets/heading"
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

import type {
  ApplicationInfo,
  ApplicationRole,
  ApplicationStatus,
} from "./types"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"

const ROLE_LABEL: Record<ApplicationRole, string> = {
  developer: "개발자",
  designer: "디자이너",
  planner: "기획자",
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "검토 중",
  passed: "합격",
  failed: "불합격",
  cancelled: "취소",
}

const STATUS_FILTER_OPTIONS = ["전체", "검토 중", "합격", "불합격", "취소"]

const STATUS_FILTER_MAP: Record<string, ApplicationStatus | null> = {
  전체: null,
  "검토 중": "pending",
  합격: "passed",
  불합격: "failed",
  취소: "cancelled",
}

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
  const [statusFilter, setStatusFilter] = useState("전체")

  const { data: applications } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplicationData,
  })

  const filteredApplications = useMemo(() => {
    const source = applications ?? []
    const targetStatus = STATUS_FILTER_MAP[statusFilter]
    return source
      .filter(
        (item) =>
          item.name.includes(searchText) || item.email.includes(searchText)
      )
      .filter((item) => targetStatus === null || item.status === targetStatus)
  }, [applications, searchText, statusFilter])

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection />
      <CardSection total={applications?.length ?? 0} />

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
              <TableHeaderCell>지원 기수</TableHeaderCell>
              <TableHeaderCell>지원일</TableHeaderCell>
              <TableHeaderCell>상태</TableHeaderCell>
              <TableHeaderCell>액션</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>{application.name}</TableCell>
                <TableCell>{application.email}</TableCell>
                <TableCell>{ROLE_LABEL[application.role]}</TableCell>
                <TableCell>{application.semester}</TableCell>
                <TableCell>
                  {new Date(application.appliedAt).toLocaleDateString("ko-KR")}
                </TableCell>
                <TableCell>{STATUS_LABEL[application.status]}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" className="mr-2">
                    수정
                  </Button>
                  <Button size="sm">합격 처리</Button>
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
        <Title title="지원자 관리" />
        <Description title="지원서를 검토하고 상태를 변경합니다." />
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
    <GridBox className="lg:grid-cols-5">
      <Card
        renderTitle={() => "전체 지원"}
        renderDescription={() => `${total}명`}
        renderAdditionalInfo={() => "14기 기준"}
      />
      <Card
        renderTitle={() => "대기"}
        renderDescription={() => "서류 대기"}
        renderAdditionalInfo={() => "검토 필요"}
      />
      <Card
        renderTitle={() => "면접 대기"}
        renderDescription={() => "18명"}
        renderAdditionalInfo={() => "면접 대상자"}
      />
      <Card
        renderTitle={() => "면접 합격"}
        renderDescription={() => "18명"}
        renderAdditionalInfo={() => "활동 예정"}
      />
      <Card
        renderTitle={() => "활동중"}
        renderDescription={() => "0명"}
        renderAdditionalInfo={() => "현재 활동"}
      />
    </GridBox>
  )
}
