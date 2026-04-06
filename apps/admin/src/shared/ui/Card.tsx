type CardProps = {
  renderTitle: () => React.ReactNode
  renderDescription: () => React.ReactNode
  renderAdditionalInfo: () => React.ReactNode
}

export const Card = ({
  renderTitle,
  renderDescription,
  renderAdditionalInfo,
}: CardProps) => {
  return (
    <div className="rounded-lg border bg-white p-5 shadow">
      <h3 className="text-xs font-bold">{renderTitle()}</h3>
      <p className="text-xl font-semibold">{renderDescription()}</p>
      <span className="text-xs text-gray-500">{renderAdditionalInfo()}</span>
    </div>
  )
}
