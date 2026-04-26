import { faker } from "@faker-js/faker/locale/ko"
import { http, HttpResponse } from "msw"

import type {
  ApplicationCohort,
  ApplicationInfo,
  ApplicationPart,
  ApplicationStatus,
} from "./types"

const PARTS: ApplicationPart[] = ["pm", "pd", "web", "server", "ios", "android"]
const COHORTS: ApplicationCohort[] = ["12", "13", "14"]
const STATUSES: ApplicationStatus[] = [
  "doc_pending",
  "doc_passed",
  "doc_failed",
  "interview_pending",
  "interview_passed",
  "interview_failed",
  "active",
  "suspended",
  "completed",
]

const createApplication = (
  overrides?: Partial<ApplicationInfo>
): ApplicationInfo => {
  const cohort = faker.helpers.arrayElement<ApplicationCohort>(COHORTS)
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    part: faker.helpers.arrayElement<ApplicationPart>(PARTS),
    cohort,
    semester: `${cohort}기`,
    portfolioUrl: faker.internet.url(),
    appliedAt: faker.date.past().toISOString(),
    status: faker.helpers.arrayElement<ApplicationStatus>(STATUSES),
    ...overrides,
  }
}

const createApplicationList = (count = 30): ApplicationInfo[] =>
  Array.from({ length: count }, () => createApplication())

export const applicationHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/application`, () => {
    return HttpResponse.json({
      code: "SUCCESS",
      data: createApplicationList(),
      message: null,
    })
  }),
]
