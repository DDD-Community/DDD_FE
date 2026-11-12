import { Card } from "@heroui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { attendanceQueries } from "@ddd/api"
import { EmptyState } from "@/shared/ui/EmptyState"
import { calculateVotePercentage } from "../lib/vote"

export function VoteFeedbackResults({ voteId }: { voteId: number }) {
  const { data } = useSuspenseQuery(
    attendanceQueries.getVoteFeedbackResults({ params: { voteId } })
  )

  if (data.questions.length === 0)
    return <EmptyState>피드백 문항이 없는 투표입니다.</EmptyState>

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        전체 응답 {data.totalResponses}건
      </p>
      {data.questions.map((question) => (
        <Card key={question.questionId}>
          <Card.Header>
            <Card.Title>{question.title ?? "-"}</Card.Title>
          </Card.Header>
          <Card.Content>
            {question.type === "MULTI_SELECT" && (
              <div className="space-y-3">
                {(question.options ?? []).map((option) => {
                  const percentage = calculateVotePercentage(
                    option.count,
                    data.totalResponses
                  )
                  return (
                    <div key={option.optionId}>
                      <div className="mb-1 flex justify-between gap-3 text-sm">
                        <span>{option.label}</span>
                        <span>
                          {option.count}명 · 응답자 {data.totalResponses}명 중{" "}
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                <p className="text-muted-foreground text-sm">
                  복수 선택 질문은 합계가 100%를 넘을 수 있습니다.
                </p>
              </div>
            )}
            {question.type === "BOOLEAN" && (
              <div className="flex gap-6 text-sm">
                <span>예 {question.trueCount ?? 0}명</span>
                <span>아니오 {question.falseCount ?? 0}명</span>
              </div>
            )}
            {question.type === "LONG_TEXT" &&
              ((question.textAnswers ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  제출된 답변이 없습니다.
                </p>
              ) : (
                <ul className="list-disc space-y-2 pl-5 text-sm">
                  {question.textAnswers?.map((answer, index) => (
                    <li key={`${index}-${answer}`}>{answer}</li>
                  ))}
                </ul>
              ))}
          </Card.Content>
        </Card>
      ))}
    </div>
  )
}
