import { useQuery, useMutation } from "@tanstack/react-query";
import { applicationQueries, applicationMutations } from "./queries";
import type {
  GetAdminApplicationsParams,
  GetAdminApplicationParams,
  PatchApplicationStatusParams,
  PatchApplicationStatusRequest,
  PostSaveApplicationDraftRequest,
  PostSubmitApplicationRequest,
} from "./types";

/**
 * 어드민 지원서 목록 조회 훅
 *
 * @param {GetAdminApplicationsParams} params - 조회 파라미터
 * @param {number} [params.cohortId] - 기수 ID (선택)
 * @param {number} [params.cohortPartId] - 파트 ID (선택)
 * @param {ApplicationStatus} [params.status] - 지원 상태 (선택)
 *
 * @example
 * const { data: applications, isLoading } = useAdminApplications({ params: { cohortId: 1 } })
 */
export const useAdminApplications = ({
  params,
}: {
  params: GetAdminApplicationsParams;
}) => useQuery(applicationQueries.getAdminApplications({ params }));

/**
 * 어드민 지원서 단일 조회 훅
 *
 * @param {GetAdminApplicationParams} params - 조회 파라미터
 * @param {number} params.id - 지원서 ID
 *
 * @example
 * const { data: application, isLoading } = useAdminApplication({ params: { id: 1 } })
 */
export const useAdminApplication = ({
  params,
}: {
  params: GetAdminApplicationParams;
}) => useQuery(applicationQueries.getAdminApplication({ params }));

/**
 * 내 지원서 조회 훅
 *
 * @example
 * const { data: myApplication, isLoading } = useMyApplication()
 */
export const useMyApplication = () =>
  useQuery(applicationQueries.getMyApplication());

/**
 * 지원서 상태 변경 훅
 *
 * @example
 * const { mutate: patchStatus, isPending } = usePatchApplicationStatus()
 * patchStatus({ params: { id: 1 }, payload: { status: '서류합격' } })
 */
export const usePatchApplicationStatus = () =>
  useMutation(applicationMutations.patchApplicationStatus());

/**
 * 지원서 임시 저장 훅
 *
 * @example
 * const { mutate: saveDraft, isPending } = useSaveApplicationDraft()
 * saveDraft({ payload: { cohortPartId: 1, answers: {} } })
 */
export const useSaveApplicationDraft = () =>
  useMutation(applicationMutations.saveApplicationDraft());

/**
 * 지원서 제출 훅
 *
 * @example
 * const { mutate: submit, isPending } = useSubmitApplication()
 * submit({ payload: { cohortPartId: 1, applicantName: '홍길동', ... } })
 */
export const useSubmitApplication = () =>
  useMutation(applicationMutations.submitApplication());
