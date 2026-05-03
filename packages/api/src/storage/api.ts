import { apiFetch } from "../mutator";
import type { PostUploadFileParams, PostUploadFileResponse } from "./types";

/**
 * @summary 파일 업로드
 * 카테고리별 파일을 업로드하고 URL을 반환합니다.
 *
 * 주의: generated storageUploadFile 은 OpenAPI 스펙에서 FormData body 를 노출하지 않으므로
 * 직접 사용하면 실제 파일 전송이 불가능합니다. URL 은 generated 와 동일한
 * /api/v1/admin/files/upload 를 사용하고, FormData body 는 apiFetch 를 통해 직접 전달합니다.
 */
export const storageApi = {
  uploadFile: ({
    params,
    payload,
  }: {
    params: PostUploadFileParams;
    payload: FormData;
  }) =>
    apiFetch<PostUploadFileResponse>({
      url: `/api/v1/admin/files/upload`,
      method: "POST",
      params: { category: params.category },
      data: payload,
    }),
};
