import { Tabs } from "@heroui/react"
import { useQuery } from "@tanstack/react-query"
import { useFormContext, useWatch } from "react-hook-form"
import { attendanceQueries } from "@ddd/api"
import type { VoteEditorForm } from "../lib/voteTemplate"

export function VotePreviewPhone({ generationId }: { generationId: number }) {
  const { control } = useFormContext<VoteEditorForm>()
  const form = useWatch({ control }) as VoteEditorForm
  const { data, isError } = useQuery(
    attendanceQueries.getTeams({ params: { generationId } })
  )
  // 실제 팀이 없으면 예시 팀으로 그리되, 실제 팀으로 오해하지 않게 이름과 안내로 구분한다.
  const teams = data?.length
    ? data
    : [
        { id: -1, name: "예시 팀 A", serviceName: null },
        { id: -2, name: "예시 팀 B", serviceName: null },
      ]
  const teamNotice = data?.length
    ? null
    : isError
      ? "팀 목록을 불러오지 못해 예시 팀으로 보여 줍니다."
      : data
        ? "이 기수에 등록된 팀이 없어 예시 팀으로 보여 줍니다."
        : "팀 목록을 불러오는 중이라 예시 팀으로 보여 줍니다."
  const steps = Number(form.teamVote.enabled) + Number(form.feedback.enabled)
  return (
    <div aria-label="앱 화면 미리보기" className="mx-auto w-full max-w-[360px]">
      <Tabs>
        <Tabs.ListContainer>
          <Tabs.List aria-label="미리보기 단계">
            <Tabs.Tab id="team">
              1단계 팀 투표
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="feedback">
              2단계 피드백
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="team">
          <Phone step={1} total={steps || 1}>
            {!form.teamVote.enabled ? (
              <p>사용 안 함</p>
            ) : (
              <>
                <h3 className="text-2xl font-bold">{form.teamVote.title}</h3>
                {form.teamVote.description && (
                  <p className="text-[#C6C6C6]">{form.teamVote.description}</p>
                )}
                {form.teamVote.notice && (
                  <p className="text-[#C6C6C6]">{form.teamVote.notice}</p>
                )}
                {form.teamVote.categories.map((category, i) => (
                  <section key={category.id} className="space-y-3">
                    <h4 className="font-bold">
                      {i + 1}. {category.title}가 좋았던 팀을 선택해주세요.
                    </h4>
                    <div className="flex justify-between text-sm">
                      <span>
                        각 부문 최대 {category.maxSelectableTeams}팀 선택
                      </span>
                      <span className="text-[#0D82F9]">
                        0 / {category.maxSelectableTeams}
                      </span>
                    </div>
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between border-b border-[#323537] py-2"
                      >
                        <div>
                          {team.name}
                          <p className="text-sm text-[#EAEAEA]">
                            {team.serviceName}
                          </p>
                        </div>
                        <span className="h-5 w-5 rounded-md border border-[#C6C6C6]" />
                      </div>
                    ))}
                    {category.reasonLabel && <p>{category.reasonLabel}</p>}
                    <TextBox
                      placeholder="해당 팀을 선택하신 이유를 적어주세요."
                      max={category.reasonMaxLength}
                      min={category.reasonMinLength}
                    />
                  </section>
                ))}
                <PreviewButton>다음</PreviewButton>
              </>
            )}
          </Phone>
        </Tabs.Panel>
        <Tabs.Panel id="feedback">
          <Phone step={form.teamVote.enabled ? 2 : 1} total={steps || 1}>
            {!form.feedback.enabled ? (
              <p>사용 안 함</p>
            ) : (
              <>
                <h3 className="text-2xl font-bold">{form.feedback.title}</h3>
                {form.feedback.description && (
                  <p className="text-[#EAEAEA]">{form.feedback.description}</p>
                )}
                {form.feedback.questions.map((question, i) => (
                  <section key={question.id} className="space-y-3">
                    <h4 className="font-bold">
                      {i + 1}. {question.title}
                    </h4>
                    {question.helpText && (
                      <p className="text-sm text-[#EAEAEA]">
                        {question.helpText}
                      </p>
                    )}
                    {question.type === "MULTI_SELECT" && (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {question.options.map((option) => (
                            <span
                              key={option.id}
                              className="rounded-full border border-[#C6C6C6] px-3 py-2 text-sm text-[#EAEAEA]"
                            >
                              {option.label}
                            </span>
                          ))}
                        </div>
                        {question.followUp && (
                          <>
                            <p>{question.followUp.title}</p>
                            <TextBox
                              placeholder="자유롭게 의견을 남겨주세요."
                              max={question.followUp.maxLength ?? 300}
                            />
                            {question.followUp.helpText && (
                              <p className="text-sm text-[#EAEAEA]">
                                {question.followUp.helpText}
                              </p>
                            )}
                          </>
                        )}
                      </>
                    )}
                    {question.type === "LONG_TEXT" && (
                      <TextBox
                        placeholder="자유롭게 의견을 남겨주세요."
                        max={question.maxLength ?? 300}
                      />
                    )}
                    {question.type === "BOOLEAN" && (
                      <div className="grid grid-cols-2 gap-2">
                        {["예", "아니오"].map((label) => (
                          <span
                            key={label}
                            className="rounded-xl border border-[#C6C6C6] p-3 text-center"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
                <PreviewButton>제출하기</PreviewButton>
              </>
            )}
          </Phone>
        </Tabs.Panel>
      </Tabs>
      {teamNotice && (
        <p role="status" className="mt-2 text-xs text-warning">
          {teamNotice}
        </p>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Android 앱 화면을 근사한 미리보기입니다. iOS 는 부문 제목을 입력한
        그대로 보여 줍니다.
      </p>
    </div>
  )
}
function Phone({
  step,
  total,
  children,
}: {
  step: number
  total: number
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6 rounded-[28px] bg-[#0C0E0F] p-6 text-white">
      <div className="font-bold">← 투표</div>
      <div>
        <div className="text-xs font-bold text-[#0D82F9]">
          STEP {step} / {total}
        </div>
        <div className="mt-2 h-1 rounded bg-[#323537]">
          <div
            className="h-1 rounded bg-[#0D82F9]"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
      </div>
      {children}
    </div>
  )
}
function TextBox({
  placeholder,
  max,
  min = 0,
}: {
  placeholder: string
  max: number
  min?: number
}) {
  return (
    <div>
      <div className="min-h-24 rounded-xl border border-[#C6C6C6] bg-[#202325] p-3 text-sm text-[#C6C6C6]">
        {placeholder}
      </div>
      <div className="mt-1 flex justify-between text-xs text-[#C6C6C6]">
        <span>{min > 0 ? `최소 ${min}자 이상 입력해주세요.` : ""}</span>
        <span>0 / {max}</span>
      </div>
    </div>
  )
}
function PreviewButton({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#0D82F9] p-3 text-center font-bold">
      {children}
    </div>
  )
}
