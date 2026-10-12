import { useState } from "react"
import { Button, Table, toast } from "@heroui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { attendanceQueries } from "@ddd/api"
import type { AttendanceGeneration } from "@ddd/api"

import { EmptyState } from "@/shared/ui/EmptyState"

import { AttendanceDeleteDialog } from "./AttendanceDeleteDialog"
import { AttendanceInvitationDrawer } from "./AttendanceInvitationDrawer"
import { AttendanceTeamDrawer } from "./AttendanceTeamDrawer"
import { useDeleteInvitationFlow } from "../hooks/useDeleteInvitationFlow"
import { useDeleteTeamFlow } from "../hooks/useDeleteTeamFlow"

interface Props {
  generation: AttendanceGeneration
}

type DeleteTarget =
  | { kind: "team"; id: number; label: string }
  | { kind: "invitation"; id: number; label: string }
  | null

export function AttendanceGenerationDetails({ generation }: Props) {
  const { data: teams } = useSuspenseQuery(
    attendanceQueries.getTeams({ params: { generationId: generation.id } })
  )
  const { data: invitations } = useSuspenseQuery(
    attendanceQueries.getInvitations({
      params: { generationId: generation.id },
    })
  )
  const [isTeamDrawerOpen, setIsTeamDrawerOpen] = useState(false)
  const [isInvitationDrawerOpen, setIsInvitationDrawerOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)
  const deleteTeam = useDeleteTeamFlow(generation.id, () =>
    setDeleteTarget(null)
  )
  const deleteInvitation = useDeleteInvitationFlow(generation.id, () =>
    setDeleteTarget(null)
  )
  const isPending =
    deleteTarget?.kind === "team"
      ? deleteTeam.isPending
      : deleteInvitation.isPending

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success("코드를 복사했습니다")
    } catch (error) {
      toast.danger("코드 복사에 실패했습니다", {
        description: (error as Error).message,
      })
    }
  }

  const handleDelete = () => {
    if (deleteTarget?.kind === "team") void deleteTeam.remove(deleteTarget.id)
    if (deleteTarget?.kind === "invitation")
      void deleteInvitation.remove(deleteTarget.id)
  }

  return (
    <div className="space-y-7">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">팀</h3>
          <Button size="sm" onPress={() => setIsTeamDrawerOpen(true)}>
            <HugeiconsIcon icon={PlusSignIcon} className="mr-1" />팀 추가
          </Button>
        </div>
        {teams.length === 0 ? (
          <EmptyState>등록된 팀이 없습니다.</EmptyState>
        ) : (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="출석앱 팀 목록">
                <Table.Header>
                  <Table.Column isRowHeader>팀 이름</Table.Column>
                  <Table.Column>서비스명</Table.Column>
                  <Table.Column>회원 수</Table.Column>
                  <Table.Column>액션</Table.Column>
                </Table.Header>
                <Table.Body>
                  {teams.map((team) => (
                    <Table.Row key={team.id}>
                      <Table.Cell>{team.name}</Table.Cell>
                      <Table.Cell>{team.serviceName ?? "-"}</Table.Cell>
                      <Table.Cell>{team.memberCount}명</Table.Cell>
                      <Table.Cell>
                        <Button
                          size="sm"
                          variant="danger"
                          onPress={() =>
                            setDeleteTarget({
                              kind: "team",
                              id: team.id,
                              label: team.name,
                            })
                          }
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="mr-1" />
                          삭제
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">초대 코드</h3>
          <Button size="sm" onPress={() => setIsInvitationDrawerOpen(true)}>
            <HugeiconsIcon icon={PlusSignIcon} className="mr-1" />
            초대코드 추가
          </Button>
        </div>
        {invitations.length === 0 ? (
          <EmptyState>등록된 초대 코드가 없습니다.</EmptyState>
        ) : (
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="출석앱 초대 코드 목록">
                <Table.Header>
                  <Table.Column isRowHeader>코드</Table.Column>
                  <Table.Column>유형</Table.Column>
                  <Table.Column>설명</Table.Column>
                  <Table.Column>가입자 수</Table.Column>
                  <Table.Column>생성일</Table.Column>
                  <Table.Column>액션</Table.Column>
                </Table.Header>
                <Table.Body>
                  {invitations.map((invitation) => (
                    <Table.Row key={invitation.id}>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <code>{invitation.code}</code>
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => void handleCopy(invitation.code)}
                          >
                            복사
                          </Button>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {invitation.type === "MEMBER" ? "회원" : "운영진"}
                      </Table.Cell>
                      <Table.Cell>{invitation.description ?? "-"}</Table.Cell>
                      <Table.Cell>{invitation.registeredCount}명</Table.Cell>
                      <Table.Cell>
                        {formatCreatedAt(invitation.createdAt)}
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          size="sm"
                          variant="danger"
                          onPress={() =>
                            setDeleteTarget({
                              kind: "invitation",
                              id: invitation.id,
                              label: invitation.code,
                            })
                          }
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="mr-1" />
                          삭제
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        )}
      </section>

      <AttendanceTeamDrawer
        generationId={generation.id}
        isOpen={isTeamDrawerOpen}
        onOpenChange={setIsTeamDrawerOpen}
      />
      <AttendanceInvitationDrawer
        generationId={generation.id}
        isOpen={isInvitationDrawerOpen}
        onOpenChange={setIsInvitationDrawerOpen}
      />
      <AttendanceDeleteDialog
        isOpen={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={
          deleteTarget?.kind === "team"
            ? "팀을 삭제하시겠습니까?"
            : "초대 코드를 삭제하시겠습니까?"
        }
        description={
          deleteTarget?.kind === "invitation"
            ? `초대 코드 ${deleteTarget.label}을 삭제합니다. 이미 가입한 회원에는 영향이 없습니다.`
            : `팀 ${deleteTarget?.label ?? ""}을 삭제합니다. 회원이 소속된 팀은 삭제할 수 없습니다.`
        }
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function formatCreatedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}
