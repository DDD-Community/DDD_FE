import {
  queryOptions,
  mutationOptions,
  infiniteQueryOptions,
} from "@tanstack/react-query";
import { projectAPI } from "./api";
import { projectKeys } from "./queryKeys";
import type {
  GetProjectsParams,
  GetProjectParams,
  GetInfiniteProjectsParams,
  GetAdminProjectParams,
  PostCreateProjectRequest,
  PatchUpdateProjectParams,
  PatchUpdateProjectRequest,
  DeleteProjectParams,
  PutUpdateProjectMembersParams,
  PutUpdateProjectMembersRequest,
} from "./types";

export const projectQueries = {
  /**
   * 프로젝트 공개 목록 조회 쿼리
   *
   * @param {GetProjectsParams} params - 조회 파라미터
   * @param {ProjectPlatform} [params.platform] - 플랫폼 필터 (선택)
   * @param {string} [params.cursor] - 다음 페이지 커서(base64url) (선택)
   * @param {number} [params.limit] - 페이지 크기 (1-100, 선택)
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(projectQueries.getProjects({ params: { platform: 'WEB' } }))
   */
  getProjects: ({ params }: { params: GetProjectsParams }) =>
    queryOptions({
      queryKey: projectKeys.list(params),
      queryFn: () => projectAPI.getProjects({ params }),
    }),

  /**
   * 프로젝트 무한 스크롤 목록 조회 쿼리
   *
   * cursor는 useInfiniteQuery의 pageParam으로 자동 관리되므로
   * params에 cursor를 직접 전달하지 않는다.
   *
   * @param {GetInfiniteProjectsParams} params - 조회 파라미터 (cursor 제외)
   * @param {ProjectPlatform} [params.platform] - 플랫폼 필터 (선택)
   * @param {number} [params.limit] - 페이지 크기 (1-100, 선택)
   *
   * @returns {InfiniteQueryOptions} TanStack Query Infinite 옵션 객체
   *
   * @example
   * const query = useInfiniteQuery(projectQueries.getInfiniteProjects({ params: { limit: 20 } }))
   */
  getInfiniteProjects: ({
    params,
  }: {
    params: GetInfiniteProjectsParams;
  }) =>
    infiniteQueryOptions({
      queryKey: projectKeys.infiniteList(params),
      queryFn: ({ pageParam }) =>
        projectAPI.getProjects({ params: { ...params, cursor: pageParam } }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) =>
        last.hasMore ? last.nextCursor : undefined,
    }),

  /**
   * 프로젝트 단일 조회 쿼리
   *
   * @param {GetProjectParams} params - 조회 파라미터
   * @param {number} params.id - 프로젝트 ID
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(projectQueries.getProject({ params: { id: 1 } }))
   */
  getProject: ({ params }: { params: GetProjectParams }) =>
    queryOptions({
      queryKey: projectKeys.detail(params),
      queryFn: () => projectAPI.getProject({ params }),
      enabled: !!params.id,
    }),

  /**
   * 어드민 프로젝트 무한 스크롤 목록 조회 쿼리 (GET /admin/projects)
   *
   * 어드민 페이지에서 사용. cursor는 useInfiniteQuery의 pageParam으로 관리.
   *
   * @param {GetInfiniteProjectsParams} params - 조회 파라미터 (cursor 제외)
   * @param {number} [params.limit] - 페이지 크기 (선택)
   *
   * @returns {InfiniteQueryOptions} TanStack Query Infinite 옵션 객체
   *
   * @example
   * const query = useInfiniteQuery(projectQueries.getAdminInfiniteProjects({ params: { limit: 20 } }))
   */
  getAdminInfiniteProjects: ({
    params,
  }: {
    params: GetInfiniteProjectsParams;
  }) =>
    infiniteQueryOptions({
      queryKey: projectKeys.adminInfiniteList(params),
      queryFn: () => projectAPI.getAdminProjects(),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) =>
        last.hasMore ? last.nextCursor : undefined,
    }),

  /**
   * 어드민 프로젝트 전체 목록 조회 쿼리 (GET /admin/projects, non-infinite)
   *
   * 단일 호출로 모든 프로젝트를 받아온다. cursor 페이지네이션이 필요한 화면은
   * getAdminInfiniteProjects 를 사용한다.
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   */
  getAdminProjects: () =>
    queryOptions({
      queryKey: projectKeys.adminLists(),
      queryFn: () => projectAPI.getAdminProjects(),
    }),

  /**
   * 어드민 프로젝트 단건 조회 쿼리 (GET /admin/projects/{id})
   *
   * @param {GetAdminProjectParams} params - 조회 파라미터
   * @param {number} params.id - 프로젝트 ID
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(projectQueries.getAdminProject({ params: { id: 1 } }))
   */
  getAdminProject: ({ params }: { params: GetAdminProjectParams }) =>
    queryOptions({
      queryKey: projectKeys.adminDetail(params),
      queryFn: () => projectAPI.getAdminProject({ params }),
      enabled: !!params.id,
    }),
};

export const projectMutations = {
  /**
   * 프로젝트 생성 mutation (어드민)
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(projectMutations.createProject())
   * mutation.mutate({ payload: { cohortId: 1, platforms: ['WEB'], name: '...', description: '...' } })
   */
  createProject: () =>
    mutationOptions({
      mutationFn: ({ payload }: { payload: PostCreateProjectRequest }) =>
        projectAPI.createProject({ payload }),
    }),

  /**
   * 프로젝트 수정 mutation (어드민) - PATCH /admin/projects/{id}
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(projectMutations.updateProject())
   * mutation.mutate({ params: { id: 1 }, payload: { name: '수정된 이름' } })
   */
  updateProject: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: PatchUpdateProjectParams;
        payload: PatchUpdateProjectRequest;
      }) => projectAPI.updateProject({ params, payload }),
    }),

  /**
   * 프로젝트 삭제 mutation (어드민)
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(projectMutations.deleteProject())
   * mutation.mutate({ params: { id: 1 } })
   */
  deleteProject: () =>
    mutationOptions({
      mutationFn: ({ params }: { params: DeleteProjectParams }) =>
        projectAPI.deleteProject({ params }),
    }),

  /**
   * 프로젝트 참여자 수정 mutation (어드민)
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const mutation = useMutation(projectMutations.updateProjectMembers())
   * mutation.mutate({ params: { id: 1 }, payload: { members: [{ name: '홍길동', part: 'FE' }] } })
   */
  updateProjectMembers: () =>
    mutationOptions({
      mutationFn: ({
        params,
        payload,
      }: {
        params: PutUpdateProjectMembersParams;
        payload: PutUpdateProjectMembersRequest;
      }) => projectAPI.updateProjectMembers({ params, payload }),
    }),
};
