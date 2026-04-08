// 임시 타입들, API 명세 보고 수정 필요

export type ProjectStatus = "in_progress" | "completed" | "cancelled"

export type ProjectInfo = {
  id: string
  name: string
  description: string
  semester: string
  memberCount: number
  status: ProjectStatus
  createdAt: string
}
