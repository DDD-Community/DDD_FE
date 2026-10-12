import { z } from "zod"

export const generationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "기수 이름을 입력해 주세요.")
    .max(5, "기수 이름은 5자 이하로 입력해 주세요."),
})

export const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "팀 이름을 입력해 주세요.")
    .max(30, "팀 이름은 30자 이하로 입력해 주세요."),
  serviceName: z
    .string()
    .trim()
    .max(100, "서비스명은 100자 이하로 입력해 주세요."),
})

export const invitationSchema = z.object({
  type: z.enum(["MEMBER", "MANAGER"]),
  code: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[A-Za-z0-9_-]{4,50}$/.test(value),
      "코드는 영문, 숫자, 밑줄, 하이픈으로 4~50자 입력해 주세요."
    ),
  description: z.string().trim().max(255, "설명은 255자 이하로 입력해 주세요."),
})

export type GenerationFormValues = z.infer<typeof generationSchema>
export type TeamFormValues = z.infer<typeof teamSchema>
export type InvitationFormValues = z.infer<typeof invitationSchema>

export const buildGenerationFormDefaults = (): GenerationFormValues => ({
  name: "",
})
export const buildTeamFormDefaults = (): TeamFormValues => ({
  name: "",
  serviceName: "",
})
export const buildInvitationFormDefaults = (): InvitationFormValues => ({
  type: "MEMBER",
  code: "",
  description: "",
})
