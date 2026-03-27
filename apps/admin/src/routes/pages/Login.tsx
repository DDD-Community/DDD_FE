import DDDAnimated from "@/components/animated/DDDAnimated"
import { FlexBox } from "@/components/layout/FlexBox"
import { GoogleButton } from "@/components/buttons/GoogleButton"
import { useNavigate } from "react-router"
import { useIsMobile } from "@/hooks/useIsMobile"
import { paths } from "@/lib/paths"

export default function Login() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  return (
    <FlexBox direction="column" className="h-screen w-screen bg-black">
      <FlexBox
        direction="column"
        className={`w-full max-w-md flex-1 justify-center ${!isMobile && "gap-y-10"}`}
      >
        <DDDAnimated />
        {!isMobile && (
          <GoogleButton
            className="w-full"
            onClick={() => navigate(paths.applications)}
          />
        )}
      </FlexBox>
      {isMobile && (
        <footer className="w-full max-w-lg px-4 pb-10">
          <GoogleButton
            className="w-full"
            onClick={() => navigate(paths.applications)}
          />
        </footer>
      )}
    </FlexBox>
  )
}
