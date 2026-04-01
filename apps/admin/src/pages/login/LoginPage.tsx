import DDDAnimated from "@/shared/ui/DDDAnimated"
import { FlexBox } from "@/shared/ui/FlexBox"
import { GoogleButton } from "@/shared/ui/GoogleButton"
import { useNavigate } from "react-router"
import { paths } from "@/shared/lib/paths"

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <FlexBox direction="column" className="h-screen w-screen bg-black">
      <FlexBox
        direction="column"
        className="w-full max-w-md flex-1 justify-center"
      >
        <DDDAnimated />
      </FlexBox>
      <footer className="w-full max-w-lg px-4 pb-12">
        <GoogleButton
          className="w-full cursor-pointer"
          onClick={() => navigate(paths.applications)}
        />
      </footer>
    </FlexBox>
  )
}
