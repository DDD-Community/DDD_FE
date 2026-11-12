import type {
  AttendanceFeedbackQuestion,
  AttendanceFeedbackQuestionType,
  AttendanceFeedbackTemplate,
  AttendanceTeamVoteTemplate,
  AttendanceVoteDetail,
  UpsertAttendanceVoteRequest,
} from "@ddd/api"
import { z } from "zod"

export type CategoryForm = {
  id: string
  title: string
  maxSelectableTeams: number
  reasonRequired: boolean
  reasonMinLength: number
  reasonMaxLength: number
  reasonLabel: string
}
export type FollowUpForm = {
  id: string
  title: string
  helpText: string
  required: boolean
  maxLength: number | null
}
export type QuestionForm = {
  id: string
  type: AttendanceFeedbackQuestionType
  title: string
  helpText: string
  required: boolean
  maxSelectableOptions: number | null
  maxLength: number | null
  options: { id: string; label: string }[]
  followUp: FollowUpForm | null
}
export type VoteEditorForm = {
  title: string
  teamVote: {
    enabled: boolean
    title: string
    description: string
    notice: string
    categories: CategoryForm[]
  }
  feedback: {
    enabled: boolean
    title: string
    description: string
    questions: QuestionForm[]
  }
}

function id(prefix: "C" | "Q" | "O" | "F"): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}
export function newCategory(): CategoryForm {
  return {
    id: id("C"),
    title: "",
    maxSelectableTeams: 1,
    reasonRequired: false,
    reasonMinLength: 0,
    reasonMaxLength: 300,
    reasonLabel: "",
  }
}
export function newOption(): QuestionForm["options"][number] {
  return { id: id("O"), label: "" }
}
export function newFollowUp(): FollowUpForm {
  return {
    id: id("F"),
    title: "",
    helpText: "",
    required: false,
    maxLength: 300,
  }
}
export function newQuestion(
  type: AttendanceFeedbackQuestionType
): QuestionForm {
  return {
    id: id("Q"),
    type,
    title: "",
    helpText: "",
    required: false,
    maxSelectableOptions: null,
    maxLength: type === "LONG_TEXT" ? 300 : null,
    options: type === "MULTI_SELECT" ? [newOption()] : [],
    followUp: null,
  }
}
export function emptyVoteForm(): VoteEditorForm {
  return {
    title: "",
    teamVote: {
      enabled: true,
      title: "",
      description: "",
      notice: "",
      categories: [newCategory()],
    },
    feedback: {
      enabled: true,
      title: "",
      description: "",
      questions: [newQuestion("LONG_TEXT")],
    },
  }
}
function optional(value: string): string | null {
  return value.trim() || null
}

function unsupportedQuestion(
  question: AttendanceFeedbackQuestion
): string | null {
  if (!["MULTI_SELECT", "LONG_TEXT", "BOOLEAN"].includes(question.type))
    return "지원하지 않는 질문 유형이 있습니다."
  if (question.followUp && question.type !== "MULTI_SELECT")
    return "객관식 외 질문에 후속 질문이 있어 편집할 수 없습니다."
  // 직렬화 때 유형에 안 맞는 값은 null 로 정리하므로, 그런 값이 있으면 조용히 지우지 않고 막는다.
  if (
    (question.type !== "MULTI_SELECT" &&
      (question.maxSelectableOptions !== null ||
        (question.options?.length ?? 0) > 0)) ||
    (question.type !== "LONG_TEXT" && question.maxLength !== null)
  )
    return "질문 유형에 맞지 않는 설정이 있어 편집할 수 없습니다."
  const followUp = question.followUp
  if (
    followUp &&
    (followUp.type !== "LONG_TEXT" ||
      followUp.order !== 1 ||
      followUp.options !== null ||
      followUp.followUp !== null ||
      followUp.maxSelectableOptions !== null)
  )
    return "지원하지 않는 후속 질문 구조가 있어 편집할 수 없습니다."
  return null
}

export function voteToForm(detail: AttendanceVoteDetail): {
  form: VoteEditorForm
  unsupported: string | null
} {
  const team = detail.teamVoteTemplate as AttendanceTeamVoteTemplate | null
  const feedback = detail.feedbackTemplate as AttendanceFeedbackTemplate | null
  const form = emptyVoteForm()
  form.title = detail.title
  if (team)
    form.teamVote = {
      enabled: true,
      title: team.title ?? "",
      description: team.description ?? "",
      notice: team.notice ?? "",
      categories: team.categories.map((category) => ({
        id: category.id,
        title: category.title ?? "",
        maxSelectableTeams: category.maxSelectableTeams,
        reasonRequired: category.reasonRequired,
        reasonMinLength: category.reasonMinLength,
        reasonMaxLength: category.reasonMaxLength,
        reasonLabel: category.reasonLabel ?? "",
      })),
    }
  else form.teamVote.enabled = false
  if (feedback)
    form.feedback = {
      enabled: true,
      title: feedback.title ?? "",
      description: feedback.description ?? "",
      questions: feedback.questions.map((question) => ({
        id: question.id,
        type: question.type,
        title: question.title ?? "",
        helpText: question.helpText ?? "",
        required: question.required,
        maxSelectableOptions: question.maxSelectableOptions,
        maxLength: question.maxLength,
        options: (question.options ?? []).map((option) => ({ ...option })),
        followUp: question.followUp
          ? {
              id: question.followUp.id,
              title: question.followUp.title ?? "",
              helpText: question.followUp.helpText ?? "",
              required: question.followUp.required,
              maxLength: question.followUp.maxLength,
            }
          : null,
      })),
    }
  else form.feedback.enabled = false
  return {
    form,
    unsupported:
      feedback?.questions.map(unsupportedQuestion).find(Boolean) ?? null,
  }
}
const COPY_SUFFIX = " (복사)"

export function duplicateForm(detail: AttendanceVoteDetail): {
  form: VoteEditorForm
  unsupported: string | null
} {
  const result = voteToForm(detail)
  // 100자 제한에 걸리면 원본 쪽을 줄여 복제 표시가 남게 한다.
  result.form.title = `${detail.title.slice(0, 100 - COPY_SUFFIX.length)}${COPY_SUFFIX}`
  return result
}

function serializeQuestion(
  question: QuestionForm,
  index: number
): AttendanceFeedbackQuestion {
  return {
    id: question.id,
    order: index + 1,
    type: question.type,
    title: question.title.trim(),
    helpText: optional(question.helpText),
    required: question.required,
    maxSelectableOptions:
      question.type === "MULTI_SELECT" ? question.maxSelectableOptions : null,
    maxLength: question.type === "LONG_TEXT" ? question.maxLength : null,
    options:
      question.type === "MULTI_SELECT"
        ? question.options.map((option) => ({
            id: option.id,
            label: option.label.trim(),
          }))
        : null,
    followUp:
      question.type === "MULTI_SELECT" && question.followUp
        ? {
            id: question.followUp.id,
            order: 1,
            type: "LONG_TEXT",
            title: question.followUp.title.trim(),
            helpText: optional(question.followUp.helpText),
            required: question.followUp.required,
            maxSelectableOptions: null,
            maxLength: question.followUp.maxLength,
            options: null,
            followUp: null,
          }
        : null,
  }
}
export function formToRequest(
  form: VoteEditorForm
): UpsertAttendanceVoteRequest {
  return {
    title: form.title.trim(),
    teamVoteTemplate: form.teamVote.enabled
      ? {
          title: form.teamVote.title.trim(),
          description: optional(form.teamVote.description),
          notice: optional(form.teamVote.notice),
          categories: form.teamVote.categories.map((category, index) => ({
            id: category.id,
            order: index + 1,
            title: category.title.trim(),
            maxSelectableTeams: category.maxSelectableTeams,
            reasonRequired: category.reasonRequired,
            reasonMinLength: category.reasonMinLength,
            reasonMaxLength: category.reasonMaxLength,
            reasonLabel: optional(category.reasonLabel),
          })),
        }
      : null,
    feedbackTemplate: form.feedback.enabled
      ? {
          title: form.feedback.title.trim(),
          description: optional(form.feedback.description),
          questions: form.feedback.questions.map(serializeQuestion),
        }
      : null,
  }
}

// 서버는 null 을 허용한다(앱은 300자로 그린다). 기존 투표의 null 이 글자 수정 모드에서 막히지 않게 한다.
function isNullOrPositiveInteger(value: number | null): boolean {
  return value === null || (Number.isInteger(value) && value >= 1)
}

const text = z.string()
const categorySchema = z.object({
  id: text,
  title: text,
  maxSelectableTeams: z.number(),
  reasonRequired: z.boolean(),
  reasonMinLength: z.number(),
  reasonMaxLength: z.number(),
  reasonLabel: text,
})
const followUpSchema = z.object({
  id: text,
  title: text,
  helpText: text,
  required: z.boolean(),
  maxLength: z.number().nullable(),
})
const questionSchema = z.object({
  id: text,
  type: z.enum(["MULTI_SELECT", "LONG_TEXT", "BOOLEAN"]),
  title: text,
  helpText: text,
  required: z.boolean(),
  maxSelectableOptions: z.number().nullable(),
  maxLength: z.number().nullable(),
  options: z.array(z.object({ id: text, label: text })),
  followUp: followUpSchema.nullable(),
})
function issue(
  ctx: z.RefinementCtx,
  path: (string | number)[],
  message: string
): void {
  ctx.addIssue({ code: "custom", path, message })
}
export const voteFormSchema = z
  .object({
    title: text,
    teamVote: z.object({
      enabled: z.boolean(),
      title: text,
      description: text,
      notice: text,
      categories: z.array(categorySchema),
    }),
    feedback: z.object({
      enabled: z.boolean(),
      title: text,
      description: text,
      questions: z.array(questionSchema),
    }),
  })
  .superRefine(function validate(form, ctx) {
    if (!form.title.trim() || form.title.trim().length > 100)
      issue(ctx, ["title"], "투표 제목은 1~100자로 입력해 주세요.")
    if (!form.teamVote.enabled && !form.feedback.enabled)
      issue(
        ctx,
        ["teamVote", "enabled"],
        "팀 투표와 피드백 중 하나 이상 사용해야 합니다."
      )
    if (form.teamVote.enabled) {
      if (!form.teamVote.title.trim())
        issue(ctx, ["teamVote", "title"], "팀 투표 제목을 입력해 주세요.")
      if (!form.teamVote.categories.length)
        issue(
          ctx,
          ["teamVote", "categories"],
          "부문을 하나 이상 추가해 주세요."
        )
      form.teamVote.categories.forEach((category, index) => {
        const base = ["teamVote", "categories", index]
        if (!category.title.trim())
          issue(ctx, [...base, "title"], "부문 이름을 입력해 주세요.")
        if (
          !Number.isInteger(category.maxSelectableTeams) ||
          category.maxSelectableTeams < 1
        )
          issue(
            ctx,
            [...base, "maxSelectableTeams"],
            "선택 가능 팀 수는 1 이상의 정수여야 합니다."
          )
        if (
          !Number.isInteger(category.reasonMinLength) ||
          category.reasonMinLength < 0
        )
          issue(
            ctx,
            [...base, "reasonMinLength"],
            "최소 글자 수는 0 이상의 정수여야 합니다."
          )
        if (
          !Number.isInteger(category.reasonMaxLength) ||
          category.reasonMaxLength < 0
        )
          issue(
            ctx,
            [...base, "reasonMaxLength"],
            "최대 글자 수는 0 이상의 정수여야 합니다."
          )
        if (category.reasonMinLength > category.reasonMaxLength)
          issue(
            ctx,
            [...base, "reasonMinLength"],
            "최소 글자 수는 최대 글자 수보다 클 수 없습니다."
          )
      })
    }
    if (form.feedback.enabled) {
      if (!form.feedback.title.trim())
        issue(ctx, ["feedback", "title"], "피드백 제목을 입력해 주세요.")
      if (!form.feedback.questions.length)
        issue(ctx, ["feedback", "questions"], "질문을 하나 이상 추가해 주세요.")
      form.feedback.questions.forEach((question, index) => {
        const base = ["feedback", "questions", index]
        if (!question.title.trim())
          issue(ctx, [...base, "title"], "질문을 입력해 주세요.")
        if (question.type === "MULTI_SELECT") {
          if (!question.options.length)
            issue(
              ctx,
              [...base, "options"],
              "선택지를 하나 이상 추가해 주세요."
            )
          question.options.forEach((option, optionIndex) => {
            if (!option.label.trim())
              issue(
                ctx,
                [...base, "options", optionIndex, "label"],
                "선택지 문구를 입력해 주세요."
              )
          })
          if (
            question.maxSelectableOptions !== null &&
            (!Number.isInteger(question.maxSelectableOptions) ||
              question.maxSelectableOptions < 1)
          )
            issue(
              ctx,
              [...base, "maxSelectableOptions"],
              "선택 가능 개수는 1 이상의 정수여야 합니다."
            )
          if (question.followUp) {
            if (!question.followUp.title.trim())
              issue(
                ctx,
                [...base, "followUp", "title"],
                "후속 질문을 입력해 주세요."
              )
            if (!isNullOrPositiveInteger(question.followUp.maxLength))
              issue(
                ctx,
                [...base, "followUp", "maxLength"],
                "최대 글자 수는 비우거나 1 이상의 정수여야 합니다."
              )
          }
        }
        if (
          question.type === "LONG_TEXT" &&
          !isNullOrPositiveInteger(question.maxLength)
        )
          issue(
            ctx,
            [...base, "maxLength"],
            "최대 글자 수는 비우거나 1 이상의 정수여야 합니다."
          )
      })
    }
  })

function sameQuestion(
  a: AttendanceFeedbackQuestion,
  b: AttendanceFeedbackQuestion
): boolean {
  return (
    a.id === b.id &&
    a.order === b.order &&
    a.type === b.type &&
    a.required === b.required &&
    a.maxSelectableOptions === b.maxSelectableOptions &&
    a.maxLength === b.maxLength &&
    ((a.options === null && b.options === null) ||
      (a.options !== null &&
        b.options !== null &&
        a.options.length === b.options.length &&
        a.options.every(
          (option, index) => option.id === b.options?.[index]?.id
        ))) &&
    ((a.followUp === null && b.followUp === null) ||
      (a.followUp !== null &&
        b.followUp !== null &&
        sameQuestion(a.followUp, b.followUp)))
  )
}
export function isSameStructure(
  original: Pick<AttendanceVoteDetail, "teamVoteTemplate" | "feedbackTemplate">,
  next: UpsertAttendanceVoteRequest
): boolean {
  const oldTeam = original.teamVoteTemplate as AttendanceTeamVoteTemplate | null
  const oldFeedback =
    original.feedbackTemplate as AttendanceFeedbackTemplate | null
  const team = next.teamVoteTemplate
  const feedback = next.feedbackTemplate
  if (
    (oldTeam === null) !== (team === null) ||
    (oldFeedback === null) !== (feedback === null)
  )
    return false
  if (
    oldTeam &&
    team &&
    (oldTeam.categories.length !== team.categories.length ||
      !oldTeam.categories.every((category, index) => {
        const other = team.categories[index]
        return (
          category.id === other.id &&
          category.order === other.order &&
          category.maxSelectableTeams === other.maxSelectableTeams &&
          category.reasonRequired === other.reasonRequired &&
          category.reasonMinLength === other.reasonMinLength &&
          category.reasonMaxLength === other.reasonMaxLength
        )
      }))
  )
    return false
  if (
    oldFeedback &&
    feedback &&
    (oldFeedback.questions.length !== feedback.questions.length ||
      !oldFeedback.questions.every((question, index) =>
        sameQuestion(question, feedback.questions[index])
      ))
  )
    return false
  return true
}
export function findAnonymousWording(form: VoteEditorForm): boolean {
  const fields = [form.title]
  {
    fields.push(
      form.teamVote.title,
      form.teamVote.description,
      form.teamVote.notice
    )
    form.teamVote.categories.forEach((category) =>
      fields.push(category.title, category.reasonLabel)
    )
  }
  {
    fields.push(form.feedback.title, form.feedback.description)
    form.feedback.questions.forEach((question) => {
      fields.push(question.title, question.helpText)
      question.options.forEach((option) => fields.push(option.label))
      if (question.followUp)
        fields.push(question.followUp.title, question.followUp.helpText)
    })
  }
  return fields.some((field) => field.includes("익명"))
}

// 글자 수정은 항목 수·순서가 잠겨 있으므로, 1부터 다시 매긴 order 대신 원래 order 를 그대로 보낸다.
export function withOriginalOrder(
  original: Pick<AttendanceVoteDetail, "teamVoteTemplate" | "feedbackTemplate">,
  next: UpsertAttendanceVoteRequest
): UpsertAttendanceVoteRequest {
  const oldTeam = original.teamVoteTemplate as AttendanceTeamVoteTemplate | null
  const oldFeedback =
    original.feedbackTemplate as AttendanceFeedbackTemplate | null
  return {
    ...next,
    teamVoteTemplate: next.teamVoteTemplate && {
      ...next.teamVoteTemplate,
      categories: next.teamVoteTemplate.categories.map((category, index) => ({
        ...category,
        order: oldTeam?.categories[index]?.order ?? category.order,
      })),
    },
    feedbackTemplate: next.feedbackTemplate && {
      ...next.feedbackTemplate,
      questions: next.feedbackTemplate.questions.map((question, index) => ({
        ...question,
        order: oldFeedback?.questions[index]?.order ?? question.order,
      })),
    },
  }
}
