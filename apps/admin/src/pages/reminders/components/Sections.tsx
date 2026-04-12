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

export const CardSection = () => {
  return (
    <GridBox className="grid-cols-4 gap-5">
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">전체 신청</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">324명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-xs text-muted-foreground">누적</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">대기</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">145명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-xs text-muted-foreground">미발송</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">발송완료</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">179명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-xs text-muted-foreground">완료</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">취소</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">0명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-xs text-muted-foreground">해제</span>
        </Card.Footer>
      </Card>
    </GridBox>
  )
}
