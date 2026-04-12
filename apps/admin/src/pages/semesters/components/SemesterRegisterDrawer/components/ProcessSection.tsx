import type { ProcessSchedule } from "../../../types"

import { SectionFieldset } from "./SectionFieldset"
import { SemesterDatePicker } from "./SemesterDatePicker"

type Props = {
  process: ProcessSchedule
  onChange: (field: keyof ProcessSchedule, value: string) => void
}

export function ProcessSection({ process, onChange }: Props) {
  return (
    <SectionFieldset legend="프로세스 일정">
      <SemesterDatePicker
        label="서류 접수"
        value={process.documentAcceptDate}
        onChange={(value) => onChange("documentAcceptDate", value)}
      />
      <SemesterDatePicker
        label="서류 발표"
        value={process.documentResultDate}
        onChange={(value) => onChange("documentResultDate", value)}
      />
      <SemesterDatePicker
        label="인터뷰 날짜"
        value={process.interviewDate}
        onChange={(value) => onChange("interviewDate", value)}
      />
      <SemesterDatePicker
        label="최종 발표"
        value={process.finalResultDate}
        onChange={(value) => onChange("finalResultDate", value)}
      />
    </SectionFieldset>
  )
}
