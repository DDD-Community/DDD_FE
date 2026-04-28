import DDDAnimated from "@/shared/ui/DDDAnimated"
import { FlexBox } from "@/shared/ui/FlexBox"
import { GoogleButton } from "@/shared/ui/GoogleButton"

export default function LoginPage() {
  return (
    <FlexBox direction="column" className="h-screen w-screen bg-black">
      <FlexBox
        direction="column"
        className="w-full max-w-md flex-1 justify-center"
      >
        <DDDAnimated />
      </FlexBox>
      <footer className="w-full max-w-lg space-y-4 px-4 pb-12">
        <GoogleButton
          className="w-full cursor-pointer"
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/google`
          }}
        />
      </footer>
    </FlexBox>
  )
}
