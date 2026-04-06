import { faker } from "@faker-js/faker/locale/ko"
import { http, HttpResponse } from "msw"

type SemesterStatus = "active" | "inactive" | "upcoming"
type SemesterInfo = {
  semester: string
  status: SemesterStatus
  recruitmentPeriod: string
  applicants: number
  members: number
  createdAt: string
}

const createSemester = (overrides?: Partial<SemesterInfo>): SemesterInfo => ({
  semester: `${faker.number.int({ min: 1, max: 15 })}기`,
  status: faker.helpers.arrayElement<SemesterStatus>(["active", "inactive", "upcoming"]),
  recruitmentPeriod: `${faker.date.past().toLocaleDateString("ko-KR")} ~ ${faker.date.future().toLocaleDateString("ko-KR")}`,
  applicants: faker.number.int({ min: 10, max: 200 }),
  members: faker.number.int({ min: 5, max: 50 }),
  createdAt: faker.date.past().toISOString(),
  ...overrides,
})

const createSemesterList = (count = 8): SemesterInfo[] =>
  Array.from({ length: count }, (_, index) =>
    createSemester({ semester: `${index + 1}기` }),
  )

export const semesterHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/semester`, () => {
    return HttpResponse.json({
      code: "SUCCESS",
      data: createSemesterList(),
      message: null,
    })
  }),
]
