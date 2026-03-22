export const ErrorMessage = {
  INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  BAD_REQUEST: '잘못된 요청입니다.',

  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',

  COHORT_NOT_FOUND: '기수를 찾을 수 없습니다.',

  APPLICATION_FORM_NOT_FOUND: '지원서를 찾을 수 없습니다.',

  EVALUATION_NOT_FOUND: '평가 정보를 찾을 수 없습니다.',

  INTERVIEW_SLOT_NOT_FOUND: '면접 슬롯을 찾을 수 없습니다.',
  INTERVIEW_SLOT_ALREADY_RESERVED: '이미 예약된 면접 슬롯입니다.',
} as const;

export type ErrorMessageKey = keyof typeof ErrorMessage;

export class ApiError extends Error {
  readonly code: ErrorMessageKey;

  constructor(code: ErrorMessageKey, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }

  is(code: ErrorMessageKey): boolean {
    return this.code === code;
  }
}
