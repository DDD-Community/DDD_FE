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

import type { SemesterInfo, SemesterStatus } from "./types"

const STATUS_LABEL: Record<SemesterStatus, string> = {
  active: "활동중",
  inactive: "활동종료",
  upcoming: "모집 예정",
  recruiting: "모집중",
}

const STATUS_FILTER_OPTIONS = [
  "전체",
  "활동중",
  "활동종료",
  "모집 예정",
  "모집중",
]

const STATUS_FILTER_MAP: Record<string, SemesterStatus | null> = {
  전체: null,
  "모집 예정": "upcoming",
  모집중: "recruiting",
  활동중: "active",
  활동종료: "inactive",
}

const getSemesterData = async () => {
  try {
    return await api.get<SemesterInfo[]>("/semester")
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
      <TitleSection />
      <CardSection />

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <FlexBox className="justify-between">
          <Input
            placeholder="검색..."
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
              <TableHeaderCell>기수</TableHeaderCell>
              <TableHeaderCell>상태</TableHeaderCell>
              <TableHeaderCell>모집 기간</TableHeaderCell>
              <TableHeaderCell>지원자 수</TableHeaderCell>
              <TableHeaderCell>멤버 수</TableHeaderCell>
              <TableHeaderCell>등록일</TableHeaderCell>
              <TableHeaderCell>액션</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSemesters.map((semester) => (
              <TableRow key={semester.semester}>
                <TableCell>{semester.semester}</TableCell>
                <TableCell>{STATUS_LABEL[semester.status]}</TableCell>
                <TableCell>{semester.recruitmentPeriod}</TableCell>
                <TableCell>{semester.applicants}</TableCell>
                <TableCell>{semester.members}</TableCell>
                <TableCell>
                  {new Date(semester.createdAt).toLocaleDateString("ko-KR")}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" className="mr-2">
                    수정
                  </Button>
                  <Button size="sm">모집중 전환</Button>
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
        <Title title="기수 관리" />
        <Description title="DDD 활동 기수를 등록하고 상태를 관리합니다." />
      </header>
      <Button size="lg">
        <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />새 기수 등록
      </Button>
    </FlexBox>
  )
}

const CardSection = () => {
  return (
    <GridBox>
      <Card
        renderTitle={() => "전체 기수"}
        renderDescription={() => "14"}
        renderAdditionalInfo={() => "추가 정보 1"}
      />
      <Card
        renderTitle={() => "현재 상태"}
        renderDescription={() => "활동 중"}
        renderAdditionalInfo={() => "13기"}
      />
      <Card
        renderTitle={() => "누적 지원자"}
        renderDescription={() => "1204명"}
        renderAdditionalInfo={() => "전체 기수 합산"}
      />
      <Card
        renderTitle={() => "누적 활동 멤버"}
        renderDescription={() => "520명"}
        renderAdditionalInfo={() => "전체 기수 합산"}
      />
    </GridBox>
  )
}
