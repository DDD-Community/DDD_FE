import React, { type JSX } from "react"
import { cn } from "@/lib/utils/cn"

type Props = JSX.IntrinsicElements["div"] & {
  children: React.ReactNode
  direction?: "row" | "column"
  className?: string
}

export const FlexBox = ({
  children,
  direction = "row",
  className = "",
  ...props
}: Props) => {
  return (
    <div
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        "items-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
