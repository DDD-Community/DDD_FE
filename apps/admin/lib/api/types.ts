import type { ErrorMessageKey } from './errors';

type ResponseCode = ErrorMessageKey | 'SUCCESS';

interface ResponseMeta {
  requestId?: string;
}

export interface ApiResponse<T> {
  code: ResponseCode;
  message: string;
  data: T | null;
  meta?: ResponseMeta;
}
