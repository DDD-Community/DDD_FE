import { apiFetch } from "../client";
import type { PostUploadFileParams, PostUploadFileResponse } from "./types";

const STORAGE_BASE_URL = "/api/v1/storage" as const;

export const storageAPI = {
  /**
   * 파일 업로드
   *
   * @param {Object} args - 함수 인자
   * @param {PostUploadFileParams} args.params - 업로드 파라미터
   * @param {FileUploadCategory} args.params.category - 업로드 카테고리 ('project-thumbnail' | 'project-pdf' | 'blog-thumbnail')
   * @param {FormData} args.payload - 업로드할 파일 (multipart/form-data)
   *
   * @returns {Promise<PostUploadFileResponse>} 업로드된 파일 URL 응답
   *
   * @example
   * const formData = new FormData()
   * formData.append('file', file)
   * const data = await storageAPI.uploadFile({
   *   params: { category: 'project-thumbnail' },
   *   payload: formData
   * })
   */
  uploadFile: ({
    params,
    payload,
  }: {
    params: PostUploadFileParams;
    payload: FormData;
  }) => {
    const searchParams = new URLSearchParams({ category: params.category });
    return apiFetch<PostUploadFileResponse>(
      `${STORAGE_BASE_URL}/upload?${searchParams}`,
      {
        method: "POST",
        body: payload,
      }
    );
  },
};
