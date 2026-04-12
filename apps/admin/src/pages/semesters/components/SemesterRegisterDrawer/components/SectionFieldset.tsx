import { Fieldset } from "@heroui/react"
import { cn } from "@/shared/lib/cn"

type Props = {
  legend: string
  children: React.ReactNode
  groupClassName?: string
}

export function SectionFieldset({ legend, children, groupClassName }: Props) {
  return (
    <Fieldset>
      <Fieldset.Legend className="underline">{legend}</Fieldset.Legend>
      <Fieldset.Group
        className={cn("mt-4 grid grid-cols-2 gap-x-5", groupClassName)}
      >
        {children}
      </Fieldset.Group>
    </Fieldset>
  )
}
