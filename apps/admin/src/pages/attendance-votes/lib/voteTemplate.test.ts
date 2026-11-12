import { describe, expect, it } from "vitest"
import type {
  AttendanceFeedbackTemplate,
  AttendanceTeamVoteTemplate,
  AttendanceVoteDetail,
} from "@ddd/api"
import {
  duplicateForm,
  emptyVoteForm,
  findAnonymousWording,
  formToRequest,
  isSameStructure,
  newFollowUp,
  newQuestion,
  voteFormSchema,
  voteToForm,
  withOriginalOrder,
} from "./voteTemplate"

function teamTpl(): AttendanceTeamVoteTemplate {
  return {
    title: "팀 투표",
    description: "설명",
    notice: "본인 팀은 선택할 수 없어요",
    categories: [
      {
        id: "PLANNING",
        order: 1,
        title: "기획 완성도",
        maxSelectableTeams: 2,
        reasonRequired: false,
        reasonMinLength: 0,
        reasonMaxLength: 500,
        reasonLabel: "이유",
      },
      {
        id: "DEV",
        order: 2,
        title: "개발 완성도",
        maxSelectableTeams: 1,
        reasonRequired: true,
        reasonMinLength: 2,
        reasonMaxLength: 100,
        reasonLabel: "이유",
      },
    ],
  }
}

function fbTpl(): AttendanceFeedbackTemplate {
  return {
    title: "피드백",
    description: null,
    questions: [
      {
        id: "BEST",
        order: 1,
        type: "MULTI_SELECT",
        title: "가장 좋았던 커리큘럼",
        helpText: "최대 2개",
        required: true,
        maxSelectableOptions: 2,
        maxLength: null,
        options: [
          { id: "OPT_A", label: "JPA 심화" },
          { id: "OPT_B", label: "테스트 코드" },
        ],
        followUp: {
          id: "BEST_WHY",
          order: 1,
          type: "LONG_TEXT",
          title: "왜요?",
          helpText: null,
          required: false,
          maxSelectableOptions: null,
          maxLength: 200,
          options: null,
          followUp: null,
        },
      },
      {
        id: "FREE",
        order: 2,
        type: "LONG_TEXT",
        title: "자유 의견",
        helpText: null,
        required: false,
        maxSelectableOptions: null,
        maxLength: 500,
        options: null,
        followUp: null,
      },
      {
        id: "RECOMMEND",
        order: 3,
        type: "BOOLEAN",
        title: "추천?",
        helpText: null,
        required: true,
        maxSelectableOptions: null,
        maxLength: null,
        options: null,
        followUp: null,
      },
    ],
  }
}

function detail(
  team: AttendanceTeamVoteTemplate | null = teamTpl(),
  feedback: AttendanceFeedbackTemplate | null = fbTpl()
): AttendanceVoteDetail {
  return {
    voteId: 1,
    generationId: 1,
    title: "DDD 13기 최종 투표",
    status: "DRAFT",
    templateVersion: 1,
    openedAt: null,
    closedAt: null,
    createdDate: "2026-11-07T14:03:22",
    responseCount: 0,
    teamVoteTemplate: team as AttendanceVoteDetail["teamVoteTemplate"],
    feedbackTemplate: feedback as AttendanceVoteDetail["feedbackTemplate"],
  }
}

function validForm() {
  return voteToForm(detail()).form
}

describe("vote template conversion", () => {
  it("round trips the app template including follow-up and IDs", () => {
    const source = detail()
    const result = voteToForm(source)
    expect(result.unsupported).toBeNull()
    expect(formToRequest(result.form)).toEqual({
      title: source.title,
      teamVoteTemplate: source.teamVoteTemplate,
      feedbackTemplate: source.feedbackTemplate,
    })
  })

  it("renumbers array order and normalizes optional strings", () => {
    const form = validForm()
    form.teamVote.categories.reverse()
    form.teamVote.description = "  "
    form.teamVote.notice = "  안내  "
    form.teamVote.categories[0].reasonLabel = " "
    form.feedback.questions.reverse()
    form.feedback.questions[0].helpText = " "
    const request = formToRequest(form)
    expect(
      request.teamVoteTemplate?.categories.map((category) => [
        category.id,
        category.order,
      ])
    ).toEqual([
      ["DEV", 1],
      ["PLANNING", 2],
    ])
    expect(
      request.feedbackTemplate?.questions.map((question) => [
        question.id,
        question.order,
      ])
    ).toEqual([
      ["RECOMMEND", 1],
      ["FREE", 2],
      ["BEST", 3],
    ])
    expect(request.teamVoteTemplate?.description).toBeNull()
    expect(request.teamVoteTemplate?.notice).toBe("안내")
    expect(request.teamVoteTemplate?.categories[0].reasonLabel).toBeNull()
    expect(request.feedbackTemplate?.questions[0].helpText).toBeNull()
  })

  it("clears fields that do not apply to a question type and fixes follow-up shape", () => {
    const form = validForm()
    const boolean = form.feedback.questions[2]
    boolean.maxLength = 10
    boolean.maxSelectableOptions = 2
    boolean.options = [{ id: "X", label: "x" }]
    const long = form.feedback.questions[1]
    long.options = [{ id: "X", label: "x" }]
    long.maxSelectableOptions = 2
    const followUp = form.feedback.questions[0].followUp!
    followUp.helpText = "  "
    const questions = formToRequest(form).feedbackTemplate!.questions
    expect(questions[2]).toMatchObject({
      options: null,
      maxSelectableOptions: null,
      maxLength: null,
      followUp: null,
    })
    expect(questions[1]).toMatchObject({
      options: null,
      maxSelectableOptions: null,
    })
    expect(questions[0].followUp).toMatchObject({
      order: 1,
      type: "LONG_TEXT",
      options: null,
      followUp: null,
      maxSelectableOptions: null,
      helpText: null,
    })
  })

  it("preserves source IDs and caps the duplicate title", () => {
    const source = detail()
    source.title = "a".repeat(100)
    const result = duplicateForm(source)
    expect(result.form.title).toHaveLength(100)
    expect(result.form.teamVote.categories[0].id).toBe("PLANNING")
    expect(result.form.feedback.questions[0].followUp?.id).toBe("BEST_WHY")
    expect(duplicateForm(detail()).form.title).toBe("DDD 13기 최종 투표 (복사)")
    const long = { ...detail(), title: "가".repeat(100) }
    const copied = duplicateForm(long).form.title
    expect(copied).toHaveLength(100)
    expect(copied.endsWith(" (복사)")).toBe(true)
  })

  it("reports unsupported follow-up shapes instead of silently dropping them", () => {
    const booleanFollowUp = fbTpl()
    booleanFollowUp.questions[2].followUp = fbTpl().questions[0].followUp
    expect(
      voteToForm(detail(teamTpl(), booleanFollowUp)).unsupported
    ).toContain("객관식 외")
    const nestedFollowUp = fbTpl()
    nestedFollowUp.questions[0].followUp!.followUp = fbTpl().questions[1]
    expect(voteToForm(detail(teamTpl(), nestedFollowUp)).unsupported).toContain(
      "지원하지 않는 후속"
    )
  })

  it("provides a blank form with generated IDs", () => {
    const form = emptyVoteForm()
    expect(form.teamVote.categories[0].id).toMatch(/^C_[\da-f]{8}$/)
    expect(form.feedback.questions[0].id).toMatch(/^Q_[\da-f]{8}$/)
    expect(newQuestion("MULTI_SELECT").options[0].id).toMatch(/^O_[\da-f]{8}$/)
    expect(newFollowUp().id).toMatch(/^F_[\da-f]{8}$/)
  })
})

describe("vote form validation", () => {
  it("accepts a filled template and ignores disabled template internals", () => {
    expect(voteFormSchema.safeParse(validForm()).success).toBe(true)
    const form = validForm()
    form.teamVote.enabled = false
    form.teamVote.title = ""
    form.teamVote.categories = []
    expect(voteFormSchema.safeParse(form).success).toBe(true)
  })

  it("requires a title and at least one enabled template", () => {
    const form = validForm()
    form.title = " "
    form.teamVote.enabled = false
    form.feedback.enabled = false
    expect(voteFormSchema.safeParse(form).success).toBe(false)
    form.title = "x".repeat(101)
    expect(voteFormSchema.safeParse(form).success).toBe(false)
  })

  it("validates active team title, category count, names, selections, and reason lengths", () => {
    const form = validForm()
    form.teamVote.title = " "
    form.teamVote.categories = []
    expect(voteFormSchema.safeParse(form).success).toBe(false)
    form.teamVote.categories = [validForm().teamVote.categories[0]]
    form.teamVote.title = "팀"
    const category = form.teamVote.categories[0]
    category.title = " "
    category.maxSelectableTeams = 0
    category.reasonMinLength = -1
    category.reasonMaxLength = 0
    expect(voteFormSchema.safeParse(form).success).toBe(false)
    category.title = "기획"
    category.maxSelectableTeams = 1.5
    category.reasonMinLength = 10
    category.reasonMaxLength = 2
    expect(voteFormSchema.safeParse(form).success).toBe(false)
  })

  it("validates question title, choices, limits, long text, and follow-up", () => {
    const form = validForm()
    form.feedback.questions = []
    form.feedback.title = " "
    expect(voteFormSchema.safeParse(form).success).toBe(false)
    form.feedback.title = "피드백"
    form.feedback.questions = [validForm().feedback.questions[0]]
    const question = form.feedback.questions[0]
    question.title = " "
    question.options = []
    question.maxSelectableOptions = 0
    question.followUp!.title = " "
    question.followUp!.maxLength = null
    expect(voteFormSchema.safeParse(form).success).toBe(false)
    question.title = "질문"
    question.options = [{ id: "X", label: " " }]
    expect(voteFormSchema.safeParse(form).success).toBe(false)
    form.feedback.questions = [newQuestion("LONG_TEXT")]
    form.feedback.questions[0].title = "질문"
    form.feedback.questions[0].maxLength = 0
    expect(voteFormSchema.safeParse(form).success).toBe(false)
    // 서버는 null 을 허용한다(앱 기본 300자)
    form.feedback.questions[0].maxLength = null
    expect(voteFormSchema.safeParse(form).success).toBe(true)
  })
})

describe("text editing structure", () => {
  it("allows wording changes but rejects every structural change", () => {
    const source = detail()
    const form = validForm()
    form.title = "새 제목"
    form.teamVote.categories[0].title = "기획"
    form.feedback.questions[0].options[0].label = "다른 문구"
    expect(isSameStructure(source, formToRequest(form))).toBe(true)
    const changed = validForm()
    changed.teamVote.categories.push({
      ...changed.teamVote.categories[0],
      id: "NEW",
    })
    expect(isSameStructure(source, formToRequest(changed))).toBe(false)
    changed.teamVote.categories.pop()
    changed.teamVote.categories.reverse()
    expect(isSameStructure(source, formToRequest(changed))).toBe(false)
    changed.teamVote.categories.reverse()
    changed.feedback.questions[0].maxSelectableOptions = 1
    expect(isSameStructure(source, formToRequest(changed))).toBe(false)
    changed.feedback.questions[0].maxSelectableOptions = 2
    changed.feedback.questions[0].options.push({
      id: "NEW",
      label: "새 선택지",
    })
    expect(isSameStructure(source, formToRequest(changed))).toBe(false)
    changed.feedback.questions[0].options.pop()
    changed.feedback.questions[0].followUp = null
    expect(isSameStructure(source, formToRequest(changed))).toBe(false)
    changed.feedback.questions[0].followUp =
      validForm().feedback.questions[0].followUp
    changed.teamVote.enabled = false
    expect(isSameStructure(source, formToRequest(changed))).toBe(false)
  })
})

it("finds anonymous wording in every text field", () => {
  const form = validForm()
  expect(findAnonymousWording(form)).toBe(false)
  form.feedback.questions[0].followUp!.helpText = "익명 응답"
  expect(findAnonymousWording(form)).toBe(true)
  form.feedback.enabled = false
  expect(findAnonymousWording(form)).toBe(true)
})

describe("review follow-ups", () => {
  it("keeps original non-sequential order in text mode so wording-only edits pass", () => {
    const team = teamTpl()
    team.categories.forEach(
      (category, index) => (category.order = (index + 1) * 10)
    )
    const feedback = fbTpl()
    feedback.questions.forEach(
      (question, index) => (question.order = (index + 1) * 10)
    )
    const source = detail(team, feedback)
    const form = voteToForm(source).form
    form.teamVote.categories[0].title = "기획!"
    expect(isSameStructure(source, formToRequest(form))).toBe(false)
    const payload = withOriginalOrder(source, formToRequest(form))
    expect(payload.teamVoteTemplate?.categories.map((c) => c.order)).toEqual(
      team.categories.map((c) => c.order)
    )
    expect(isSameStructure(source, payload)).toBe(true)
  })

  it("refuses to edit questions carrying settings that do not fit their type", () => {
    const feedback = fbTpl()
    const multi = feedback.questions.find((q) => q.type === "MULTI_SELECT")!
    multi.maxLength = 100
    expect(voteToForm(detail(teamTpl(), feedback)).unsupported).not.toBeNull()
    expect(voteToForm(detail()).unsupported).toBeNull()
  })

  it("accepts reasonMaxLength 0 like the server", () => {
    const form = validForm()
    form.teamVote.categories[0].reasonMinLength = 0
    form.teamVote.categories[0].reasonMaxLength = 0
    expect(voteFormSchema.safeParse(form).success).toBe(true)
  })
})
