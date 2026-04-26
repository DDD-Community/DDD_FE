import { mutationOptions } from "@tanstack/react-query";
import { storageAPI } from "./api";
import type { PostUploadFileParams } from "./types";

export const storageMutations = {
  /**
   * 파일 업로드 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(storageMutations.uploadFile())
   * const formData = new FormData()
   * formData.append('file', file)
   * mutation.mutate({ params: { category: 'project-thumbnail' }, payload: formData })
   */
  uploadFile: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: PostUploadFileParams;
        payload: FormData;
      }) => storageAPI.uploadFile({ params, payload }),
    }),
};
