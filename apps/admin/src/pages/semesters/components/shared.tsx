import type { ReactNode } from "react"

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="border-b pb-2 text-sm font-semibold text-foreground">
      {children}
    </h3>
  )
}

type FormFieldProps = {
  label: string
  children: ReactNode
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="flex flex-col items-start gap-1">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      {children}
    </label>
  )
}
