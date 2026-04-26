import { Card } from "@heroui/react"
import { FlexBox } from "@/shared/ui/FlexBox"
import { GridBox } from "@/shared/ui/GridBox"
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

type CardSectionProps = {
  total: number
  pending: number
  notified: number
}

export const CardSection = ({ total, pending, notified }: CardSectionProps) => {
  return (
    <GridBox className="grid-cols-3 gap-5">
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">전체 신청</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">{total}명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-muted-foreground text-xs">누적</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">대기</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">{pending}명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-muted-foreground text-xs">미발송</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">발송 완료</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">{notified}명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-muted-foreground text-xs">완료</span>
        </Card.Footer>
      </Card>
    </GridBox>
  )
}
