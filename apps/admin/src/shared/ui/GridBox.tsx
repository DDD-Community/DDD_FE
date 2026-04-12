import { cn } from "../lib/cn"

interface GridBoxProps {
  children: React.ReactNode
  cols?: {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
  className?: string
}

export const GridBox = ({
  children,
  cols = { base: 1, md: 2, lg: 4 },
  gap = 5,
  className,
}: GridBoxProps) => {
  const gridColsClass = [
    cols.base ? `grid-cols-${cols.base}` : "",
    cols.sm ? `sm:grid-cols-${cols.sm}` : "",
    cols.md ? `md:grid-cols-${cols.md}` : "",
    cols.lg ? `lg:grid-cols-${cols.lg}` : "",
    cols.xl ? `xl:grid-cols-${cols.xl}` : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className={cn(`grid w-full gap-${gap}`, gridColsClass, className)}
    >
      {children}
    </div>
  )
}
