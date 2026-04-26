import { useMutation } from "@tanstack/react-query";
import { storageMutations } from "./queries";

/**
 * 파일 업로드 훅
 *
 * @example
 * const { mutate: uploadFile, isPending } = useUploadFile()
 * const formData = new FormData()
 * formData.append('file', file)
 * uploadFile({ params: { category: 'project-thumbnail' }, payload: formData })
 */
export const useUploadFile = () => useMutation(storageMutations.uploadFile());
