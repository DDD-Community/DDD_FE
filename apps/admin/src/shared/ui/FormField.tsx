import type { ReactNode } from "react"

type FormFieldProps = {
  label: string
  error?: string
  children: ReactNode
}

export const FormField = ({ label, error, children }: FormFieldProps) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-gray-700">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)
