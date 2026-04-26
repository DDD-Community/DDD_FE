import { Button } from "@heroui/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { FlexBox } from "@/shared/ui/FlexBox"
import { Title, Description } from "@/widgets/heading"

/** 블로그 관리 페이지 */
export default function BlogPostsPage() {
  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection />
      <div className="rounded-lg bg-white p-5 shadow" />
    </div>
  )
}

const TitleSection = () => {
  return (
    <FlexBox className="justify-between">
      <header className="space-y-2">
        <Title title="블로그 관리" />
        <Description title="홈페이지에 노출되는 블로그 포스트를 등록하고 관리합니다." />
      </header>
      <Button size="lg">
        <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
        블로그 등록
      </Button>
    </FlexBox>
  )
}
