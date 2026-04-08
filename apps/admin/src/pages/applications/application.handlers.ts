import { faker } from "@faker-js/faker/locale/ko"
import { http, HttpResponse } from "msw"

import type { ApplicationInfo, ApplicationRole, ApplicationStatus } from "./types"

const createApplication = (overrides?: Partial<ApplicationInfo>): ApplicationInfo => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: faker.helpers.arrayElement<ApplicationRole>(["developer", "designer", "planner"]),
  semester: `${faker.number.int({ min: 1, max: 15 })}기`,
  portfolioUrl: faker.internet.url(),
  appliedAt: faker.date.past().toISOString(),
  status: faker.helpers.arrayElement<ApplicationStatus>(["pending", "passed", "failed", "cancelled"]),
  ...overrides,
})

const createApplicationList = (count = 10): ApplicationInfo[] =>
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
