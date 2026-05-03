import { useQuery, useMutation } from "@tanstack/react-query";
import { applicationQueries, applicationMutations } from "./queries";
import type {
  GetAdminApplicationsParams,
  GetAdminApplicationParams,
  GetApplicationDraftParams,
} from "./types";

/**
 * 어드민 지원서 목록 조회 훅
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
 * 어드민 지원서 단건 상세 조회 훅
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
 * 파트별 임시저장 단건 조회 훅
 *
 * @example
 * const { data: draft } = useApplicationDraft({ params: { cohortPartId: 3 } })
 */
export const useApplicationDraft = ({
  params,
}: {
  params: GetApplicationDraftParams;
}) => useQuery(applicationQueries.getApplicationDraft({ params }));

/**
 * 어드민 지원서 상태 변경 훅
 *
 * @example
 * const { mutate: patchStatus, isPending } = usePatchApplicationStatus()
 * patchStatus({ params: { id: 1 }, payload: { status: '서류합격' } })
 */
export const usePatchApplicationStatus = () =>
  useMutation(applicationMutations.patchApplicationStatus());

/**
 * 지원서 임시저장 훅
 *
 * @example
 * const { mutate: saveDraft, isPending } = useSaveApplicationDraft()
 * saveDraft({ payload: { cohortPartId: 1, answers: {} } })
 */
export const useSaveApplicationDraft = () =>
  useMutation(applicationMutations.saveApplicationDraft());

/**
 * 지원서 최종 제출 훅
 *
 * @example
 * const { mutate: submit, isPending } = useSubmitApplication()
 * submit({ payload: { cohortPartId: 1, applicantName: '홍길동', ... } })
 */
export const useSubmitApplication = () =>
  useMutation(applicationMutations.submitApplication());
