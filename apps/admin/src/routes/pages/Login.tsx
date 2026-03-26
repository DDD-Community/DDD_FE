import DDDAnimated from "@/components/animated/DDDAnimated"
import { FlexBox } from "@/components/layout/FlexBox"
import GoogleButton from "@/components/ui/GoogleButton"
import { useNavigate } from "react-router"
import { paths } from "@/lib/paths"

export default function Login() {
  const navigate = useNavigate()
  return (
    <FlexBox direction="column" className="h-screen w-screen bg-black">
      <FlexBox className="w-full flex-1 justify-center">
        <DDDAnimated />
      </FlexBox>
      <footer className="w-full max-w-lg px-4 pb-10 md:pb-20">
        <GoogleButton
          className="w-full"
          onClick={() => navigate(paths.applications)}
        />
      </footer>
    </FlexBox>
  )
}
