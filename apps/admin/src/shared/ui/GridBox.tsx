import { cn } from "../lib/cn"

interface GridBoxProps {
  children: React.ReactNode
  className?: string
}

export const GridBox = ({ children, className }: GridBoxProps) => {
  return <div className={cn(`grid w-full`, className)}>{children}</div>
}
