import { getApiClient } from "../client";
import type { PostUploadFileParams, PostUploadFileResponse } from "./types";

const STORAGE_BASE_URL = "/api/v1/storage" as const;

export const storageAPI = {
  uploadFile: ({
    params,
    payload,
  }: {
    params: PostUploadFileParams;
    payload: FormData;
  }) => {
    const searchParams = new URLSearchParams({ category: params.category });
    return getApiClient().post<PostUploadFileResponse>(
      `${STORAGE_BASE_URL}/upload?${searchParams}`,
      payload,
    );
  },
};
