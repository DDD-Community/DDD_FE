import { useState } from "react"
import { Button, ListBox, Select } from "@heroui/react"
import { useQuery } from "@tanstack/react-query"

import { usersQueries } from "@ddd/api"

import type { TestEmailType } from "@ddd/api"

import { useSendTestEmailFlow } from "@/pages/semesters/hooks/useSendTestEmailFlow"

/** 서버 enum 값이 곧 화면 라벨이다. 메일이 나가는 순서대로 둔다 */
const TEST_EMAIL_TYPES: TestEmailType[] = [
  "지원접수",
  "서류합격",
  "서류불합격",
  "면접합격",
  "최종불합격",
]

interface Props {
  /** 저장된 기수만 보낼 수 있다. 새 기수 등록 중이면 null */
  cohortId: number | null
}

// 서버는 기수에 저장된 값으로 메일을 만든다. 폼에서 고친 값은 저장해야 반영된다.
export function TestEmailSender({ cohortId }: Props) {
  const [type, setType] = useState<TestEmailType>("면접합격")
  const { send, isPending } = useSendTestEmailFlow()
  // 받는 사람은 서버가 로그인 계정으로 고정한다. 화면은 어디로 가는지만 보여 준다.
  const { data: me } = useQuery(usersQueries.getMe())

  if (cohortId === null) {
    return (
      <p className="text-xs text-gray-500">
        기수를 등록한 뒤 안내 메일을 로그인한 계정 메일로 미리 받아 볼 수
        있습니다.
      </p>
    )
  }

  return (
    <div className="space-y-2 rounded-lg bg-white p-4">
      <p className="text-sm font-semibold text-gray-900">
        로그인한 계정 메일로 미리 받기
      </p>
      <p className="text-xs text-gray-500">
        저장된 값으로 실제 양식 그대로 {me?.email ?? "로그인한 계정 메일"}(으)로
        보냅니다. 방금 고친 값은 먼저 저장해 주세요.
      </p>
      <div className="flex items-center gap-2">
        <Select
          variant="secondary"
          className="w-40"
          aria-label="미리 받을 메일 종류"
        >
          <Select.Trigger>
            <Select.Value>{type}</Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {TEST_EMAIL_TYPES.map((option) => (
                <ListBox.Item
                  key={option}
                  id={option}
                  textValue={option}
                  onClick={() => setType(option)}
                >
                  {option}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <Button
          variant="secondary"
          isDisabled={isPending}
          onPress={() => send({ cohortId, type, to: me?.email })}
        >
          {isPending ? "보내는 중..." : "보내기"}
        </Button>
      </div>
    </div>
  )
}
