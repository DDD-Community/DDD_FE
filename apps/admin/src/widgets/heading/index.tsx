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

type TitleSectionProps = {
  title: string
  description: string
}

export const TitleSection = ({ title, description }: TitleSectionProps) => {
  return (
    <header className="space-y-2">
      <Title title={title} />
      <Description title={description} />
    </header>
  )
}
