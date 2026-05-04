// apps/admin/src/pages/reminders/components/Sections.tsx
import { FlexBox } from "@/shared/ui/FlexBox"
import { Title, Description } from "@/widgets/heading"

export const TitleSection = () => {
  return (
    <FlexBox className="justify-between">
      <header className="space-y-2">
        <Title title="사전 알림 신청" />
        <Description title="기수 모집 공지 신청자를 관리합니다." />
      </header>
    </FlexBox>
  )
}
