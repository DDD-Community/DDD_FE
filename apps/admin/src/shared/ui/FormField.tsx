import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react"

type FormFieldProps = {
  label: string
  error?: string
  children: ReactNode
}

export const FormField = ({ label, error, children }: FormFieldProps) => {
  const labelId = useId()
  const labeledChild = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-labelledby"?: string }>, {
        "aria-labelledby": labelId,
      })
    : children

  return (
    <div className="space-y-1.5">
      <label id={labelId} className="text-xs font-medium text-gray-700">
        {label}
      </label>
      {labeledChild}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
