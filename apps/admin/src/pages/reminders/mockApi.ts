import { faker } from "@faker-js/faker/locale/ko"
import { http, HttpResponse } from "msw"

import type { ReminderInfo, ReminderRole, ReminderStatus } from "./types"

const createReminder = (overrides?: Partial<ReminderInfo>): ReminderInfo => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: faker.helpers.arrayElement<ReminderRole>([
    "developer",
    "designer",
    "planner",
  ]),
  semester: `${faker.number.int({ min: 1, max: 15 })}기`,
  appliedAt: faker.date.past().toISOString(),
  status: faker.helpers.arrayElement<ReminderStatus>(["pending", "notified"]),
  ...overrides,
})

const createReminderList = (count = 10): ReminderInfo[] =>
  Array.from({ length: count }, () => createReminder())

export const reminderHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/reminder`, () => {
    return HttpResponse.json({
      code: "SUCCESS",
      data: createReminderList(),
      message: null,
    })
  }),
]
