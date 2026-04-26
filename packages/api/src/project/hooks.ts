import { useQuery, useMutation } from "@tanstack/react-query";
import { projectQueries, projectMutations } from "./queries";
import type {
  GetProjectsParams,
  GetProjectParams,
  PostCreateProjectRequest,
  PutUpdateProjectParams,
  PutUpdateProjectRequest,
  DeleteProjectParams,
  PutUpdateProjectMembersParams,
  PutUpdateProjectMembersRequest,
} from "./types";

/**
 * 프로젝트 공개 목록 조회 훅
 *
 * @param {GetProjectsParams} params - 조회 파라미터
 * @param {ProjectPlatform} [params.platform] - 플랫폼 필터 (선택)
 * @param {string} [params.cursor] - 다음 페이지 커서(base64url) (선택)
 * @param {number} [params.limit] - 페이지 크기 (1-100, 선택)
 *
 * @example
 * const { data: projects, isLoading } = useProjects({ params: { platform: 'WEB' } })
 */
export const useProjects = ({ params }: { params: GetProjectsParams }) =>
  useQuery(projectQueries.getProjects({ params }));

/**
 * 프로젝트 단일 조회 훅
 *
 * @param {GetProjectParams} params - 조회 파라미터
 * @param {number} params.id - 프로젝트 ID
 *
 * @example
 * const { data: project, isLoading } = useProject({ params: { id: 1 } })
 */
export const useProject = ({ params }: { params: GetProjectParams }) =>
  useQuery(projectQueries.getProject({ params }));

/**
 * 프로젝트 생성 훅 (어드민)
 *
 * @example
 * const { mutate: createProject, isPending } = useCreateProject()
 * createProject({ payload: { cohortId: 1, platforms: ['WEB'], name: '...', description: '...' } })
 */
export const useCreateProject = () =>
  useMutation(projectMutations.createProject());

/**
 * 프로젝트 수정 훅 (어드민)
 *
 * @example
 * const { mutate: updateProject, isPending } = useUpdateProject()
 * updateProject({ params: { id: 1 }, payload: { name: '수정된 이름' } })
 */
export const useUpdateProject = () =>
  useMutation(projectMutations.updateProject());

/**
 * 프로젝트 삭제 훅 (어드민)
 *
 * @example
 * const { mutate: deleteProject, isPending } = useDeleteProject()
 * deleteProject({ params: { id: 1 } })
 */
export const useDeleteProject = () =>
  useMutation(projectMutations.deleteProject());

/**
 * 프로젝트 참여자 수정 훅 (어드민)
 *
 * @example
 * const { mutate: updateMembers, isPending } = useUpdateProjectMembers()
 * updateMembers({ params: { id: 1 }, payload: { members: [{ name: '홍길동', part: 'FE' }] } })
 */
export const useUpdateProjectMembers = () =>
  useMutation(projectMutations.updateProjectMembers());
