import type { ReactNode } from "react"

import { cn } from "@/shared/lib/cn"

type EmptyStateProps = {
  children: ReactNode
  tone?: "default" | "danger"
}

export const EmptyState = ({
  children,
  tone = "default",
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex min-h-[160px] flex-col items-center justify-center gap-1 rounded-md bg-gray-50 px-4 py-10 text-center text-sm",
        tone === "danger" ? "text-red-600" : "text-gray-500",
      )}
      role={tone === "danger" ? "alert" : undefined}
    >
      {children}
    </div>
  )
}
