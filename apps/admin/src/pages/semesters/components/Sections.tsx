import { Button, Card } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { FlexBox } from "@/shared/ui/FlexBox"
import { GridBox } from "@/shared/ui/GridBox"
import { Title, Description } from "@/widgets/heading"

export const TitleSection = () => {
  return (
    <FlexBox className="justify-between">
      <header className="space-y-2">
        <Title title="기수 관리" />
        <Description title="DDD 활동 기수를 등록하고 상태를 관리합니다." />
      </header>
      <Button variant="primary">
        <HugeiconsIcon icon={PlusSignIcon} />새 기수 등록
      </Button>
    </FlexBox>
  )
}

export const CardSection = () => {
  return (
    <GridBox className="grid-cols-4 gap-5">
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">전체 기수</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">14</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-xs text-muted-foreground">추가 정보 1</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">현재 상태</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">활동 중</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-xs text-muted-foreground">13기</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">누적 지원자</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">1204명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-xs text-muted-foreground">전체 기수 합산</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">누적 활동 멤버</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">520명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-xs text-muted-foreground">전체 기수 합산</span>
        </Card.Footer>
      </Card>
    </GridBox>
  )
}
