type TitleProps = {
  title: string
} & React.HTMLAttributes<HTMLHeadingElement>

export const Title = ({ title, ...props }: TitleProps) => {
  return (
    <h1 className="text-2xl font-bold" {...props}>
      {title}
    </h1>
  )
}

export const Description = ({ title, ...props }: TitleProps) => {
  return (
    <p className="text-sm font-medium text-gray-500" {...props}>
      {title}
    </p>
  )
}
