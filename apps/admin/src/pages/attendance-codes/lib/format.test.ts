import { describe, expect, it } from "vitest"

import { formatDateTime } from "./format"

describe("formatDateTime", () => {
  it("formats a valid ISO date as YYYY-MM-DD HH:mm", () => {
    expect(formatDateTime("2026-10-12T09:05:00")).toBe("2026-10-12 09:05")
  })

  it("returns the original value when the date is invalid", () => {
    expect(formatDateTime("invalid date")).toBe("invalid date")
  })
})
