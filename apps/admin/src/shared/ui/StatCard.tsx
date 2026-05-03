// apps/admin/src/shared/ui/StatCard.tsx
import type { ReactNode } from "react"

import { Card, Skeleton } from "@heroui/react"

type StatCardProps = {
  title: string
  value: ReactNode
  footer?: ReactNode
}

const StatCardRoot = ({ title, value, footer }: StatCardProps) => (
  <Card>
    <Card.Header>
      <Card.Title className="text-xs font-bold">{title}</Card.Title>
    </Card.Header>
    <Card.Content>
      <p className="text-xl font-semibold">{value}</p>
    </Card.Content>
    {footer && (
      <Card.Footer>
        <span className="text-muted-foreground text-xs">{footer}</span>
      </Card.Footer>
    )}
  </Card>
)

const StatCardSkeleton = () => (
  <Card>
    <Card.Header>
      <Skeleton className="h-3 w-16 rounded" />
    </Card.Header>
    <Card.Content>
      <Skeleton className="h-6 w-12 rounded" />
    </Card.Content>
    <Card.Footer>
      <Skeleton className="h-3 w-10 rounded" />
    </Card.Footer>
  </Card>
)

export const StatCard = Object.assign(StatCardRoot, {
  Skeleton: StatCardSkeleton,
})
