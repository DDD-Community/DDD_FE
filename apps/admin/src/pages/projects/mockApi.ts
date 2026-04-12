import { faker } from "@faker-js/faker/locale/ko"
import { http, HttpResponse } from "msw"

import type { ProjectInfo, ProjectStatus } from "./types"

const createProject = (overrides?: Partial<ProjectInfo>): ProjectInfo => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.lorem.sentence(),
  semester: `${faker.number.int({ min: 1, max: 15 })}기`,
  memberCount: faker.number.int({ min: 3, max: 10 }),
  status: faker.helpers.arrayElement<ProjectStatus>(["in_progress", "completed", "cancelled"]),
  createdAt: faker.date.past().toISOString(),
  ...overrides,
})

const createProjectList = (count = 10): ProjectInfo[] =>
  Array.from({ length: count }, () => createProject())

export const projectHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/project`, () => {
    return HttpResponse.json({
      code: "SUCCESS",
      data: createProjectList(),
      message: null,
    })
  }),
]
