// apps/admin/src/pages/applications/components/Sections.tsx
import { GridBox } from "@/shared/ui/GridBox"
import { StatCard } from "@/shared/ui/StatCard"

import type { ApplicationStatus } from "../constants"

type CardSectionProps = {
  total: number
  counts: Partial<Record<ApplicationStatus, number>>
  contextLabel: string
}

export const CardSection = ({
  total,
  counts,
  contextLabel,
}: CardSectionProps) => {
  const cards: { title: string; key: ApplicationStatus | "total" }[] = [
    { title: "전체 지원", key: "total" },
    { title: "서류심사대기", key: "서류심사대기" },
    { title: "서류합격", key: "서류합격" },
    { title: "최종합격", key: "최종합격" },
    { title: "활동중", key: "활동중" },
  ]

  return (
    <GridBox className="grid-cols-5 gap-5">
      {cards.map(({ title, key }) => (
        <StatCard
          key={title}
          title={title}
          value={`${
            key === "total" ? total : (counts[key as ApplicationStatus] ?? 0)
          }명`}
          footer={contextLabel}
        />
      ))}
    </GridBox>
  )
}
