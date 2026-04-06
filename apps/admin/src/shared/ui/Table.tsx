import { cn } from "../lib/cn"

type TableProps = React.HTMLAttributes<HTMLTableElement>

export const Table = ({ className, ...props }: TableProps) => {
  return (
    <table
      className={cn("min-w-full table-fixed divide-y divide-gray-200", className)}
      {...props}
    />
  )
}

export const TableHead = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => {
  return <thead className={cn("bg-gray-100", className)} {...props} />
}

type TableHeaderCellProps = React.ThHTMLAttributes<HTMLTableCellElement>
export const TableHeaderCell = ({
  scope = "col",
  className,
  ...props
}: TableHeaderCellProps) => {
  return <th scope={scope} className={cn("p-2 text-sm", className)} {...props} />
}

export const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => {
  return <tbody className={cn(className)} {...props} />
}

export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => {
  return (
    <tr
      className={cn("border-b text-center text-sm last:border-0 hover:bg-gray-50", className)}
      {...props}
    />
  )
}

export const TableCell = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => {
  return <td className={cn("p-2 text-center", className)} {...props} />
}
