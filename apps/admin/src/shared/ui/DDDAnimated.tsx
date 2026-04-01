type DProps = {
  className?: string
  strokeColor?: string
} & React.SVGProps<SVGSVGElement>

const D = ({ className, strokeColor = "#ffffff", ...props }: DProps) => {
  return (
    <svg
      width="128"
      height="108"
      viewBox="0 0 64 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M 12 8 L 48 8 L 48 42 L 12 42"
        stroke={strokeColor}
        strokeWidth="17"
        strokeLinecap="square"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export const DDDAnimated = () => {
  return (
    <div className="relative flex h-27 w-32 items-center justify-center">
      {/* 1번 D (오른쪽) */}
      <D
        className="absolute top-0 left-0 z-20 h-27 w-32 translate-x-4 drop-shadow-[3px_3px_6px_rgba(0,0,0,0.4)]"
        strokeColor="#9ca3af"
      />
      <D
        className="absolute top-0 left-0 z-20 h-27 w-32 translate-x-2.5 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.25)]"
        strokeColor="#ffffff"
      />
    </div>
  )
}

export default DDDAnimated
