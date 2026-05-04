import { useMemo, useState } from "react"
import { Table } from "@heroui/react"

import type { StatusFilterValue } from "../../constants"
import type { CohortRow } from "../../hooks"

import { SemesterTableRow } from "./components/SemesterTableRow"
import { SemesterTableToolbar } from "./components/SemesterTableToolbar"

interface Props {
  rows: CohortRow[]
  onEditRow: (row: CohortRow) => void
  onTransitionRow: (row: CohortRow) => void
}

export function SemesterTableSection({
  rows,
  onEditRow,
  onTransitionRow,
}: Props) {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("ALL")

  const filteredRows = useMemo(() => {
    return rows
      .filter((row) =>
        searchText === "" ? true : row.name.includes(searchText)
      )
      .filter((row) =>
        statusFilter === "ALL" ? true : row.status === statusFilter
      )
  }, [rows, searchText, statusFilter])

  return (
    <div className="space-y-5">
      <SemesterTableToolbar
        searchText={searchText}
        onSearchTextChange={setSearchText}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

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
                <SemesterTableRow
                  key={row.id}
                  row={row}
                  onEdit={() => onEditRow(row)}
                  onTransition={() => onTransitionRow(row)}
                />
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  )
}
