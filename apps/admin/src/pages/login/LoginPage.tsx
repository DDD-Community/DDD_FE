import DDDAnimated from "@/shared/ui/DDDAnimated"
import { FlexBox } from "@/shared/ui/FlexBox"
import { GoogleButton } from "@/shared/ui/GoogleButton"
import { Link, useNavigate } from "react-router"
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
      <footer className="w-full max-w-lg space-y-4 px-4 pb-12">
        <GoogleButton
          className="w-full cursor-pointer"
          onClick={() => navigate(paths.applications)}
        />
        <Link
          to={paths.register}
          className="block text-center text-sm text-gray-300 underline hover:font-semibold"
        >
          운영진이신가요? 회원가입하기
        </Link>
      </footer>
    </FlexBox>
  )
}
