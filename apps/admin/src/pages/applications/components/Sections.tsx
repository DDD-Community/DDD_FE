import { Button, Card } from "@heroui/react"
import { FlexBox } from "@/shared/ui/FlexBox"
import { GridBox } from "@/shared/ui/GridBox"
import { Title, Description } from "@/widgets/heading"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"

export const TitleSection = () => {
  return (
    <FlexBox className="justify-between">
      <header className="space-y-2">
        <Title title="지원자 관리" />
        <Description title="지원서를 검토하고 상태를 변경합니다." />
      </header>
      <Button variant="primary" size="lg">
        <HugeiconsIcon icon={PlusSignIcon} />
        알림 발송
      </Button>
    </FlexBox>
  )
}

type CardSectionProps = { total: number }

export const CardSection = ({ total }: CardSectionProps) => {
  return (
    <GridBox className="grid-cols-5 gap-5">
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">전체 지원</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">{total}명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-muted-foreground text-xs">14기 기준</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">대기</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">서류 대기</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-muted-foreground text-xs">검토 필요</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">면접 대기</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">18명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-muted-foreground text-xs">면접 대상자</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">면접 합격</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">18명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-muted-foreground text-xs">활동 예정</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">활동중</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">0명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-muted-foreground text-xs">현재 활동</span>
        </Card.Footer>
      </Card>
    </GridBox>
  )
}
