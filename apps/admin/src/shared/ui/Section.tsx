import type { ReactNode } from "react"

type SectionProps = {
  title: string
  children: ReactNode
}

export const Section = ({ title, children }: SectionProps) => (
  <section className="space-y-4">
    <h3 className="text-muted-foreground border-b border-gray-200 pb-2 text-xs font-semibold tracking-wider uppercase">
      {title}
    </h3>
    {children}
  </section>
)
