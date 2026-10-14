import type { AttendanceSyncResult } from "@ddd/api"

export interface AttendanceSyncMessage {
  tone: "success" | "warning" | "danger" | null
  title: string
  description?: string
}

export function describeAttendanceSync(
  result: AttendanceSyncResult | null | undefined
): AttendanceSyncMessage {
  if (!result) return { tone: null, title: "" }

  if (result.status === "SYNCED") {
    const kept = (result.kept ?? []).map((item) => item.date)
    const skipped = (result.skipped ?? []).map((item) => item.date)
    const ignoredWeeks = result.ignoredWeeks ?? []
    const description = [
      `추가 ${result.created?.length ?? 0} · 수정 ${result.updated?.length ?? 0} · 삭제 ${result.deleted?.length ?? 0}`,
      ...(kept.length > 0
        ? [`출석 기록이 있어 지우지 않은 일정: ${kept.join(", ")}`]
        : []),
      ...(skipped.length > 0
        ? [`다른 기수가 쓰는 날짜라 건너뜀: ${skipped.join(", ")}`]
        : []),
      ...(ignoredWeeks.length > 0
        ? [
            `시각이 없거나 날짜가 겹쳐 반영하지 않은 주차(기존 일정은 유지): ${ignoredWeeks.join(", ")}주차`,
          ]
        : []),
    ].join("\n")
    const hasWarnings =
      kept.length > 0 || skipped.length > 0 || ignoredWeeks.length > 0
    return {
      tone: hasWarnings ? "warning" : "success",
      title: "출석앱 일정을 맞췄습니다",
      description,
    }
  }

  if (result.status === "SKIPPED") {
    if (result.reason === "NOT_CONFIGURED") return { tone: null, title: "" }
    return {
      tone: "warning",
      title:
        result.reason === "NAME_TOO_LONG"
          ? "기수 이름이 5자를 넘어 출석앱과 연결하지 않았습니다"
          : "시각을 입력한 주차가 없어 출석앱 일정을 맞추지 않았습니다",
    }
  }

  return {
    tone: "warning",
    title: "기수는 저장됐지만 출석앱 일정 동기화에 실패했습니다",
    description: result.message ?? undefined,
  }
}
