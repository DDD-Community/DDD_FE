import { apiFetch } from "../client";
import type {
  GetProjectsParams,
  GetProjectsResponse,
  GetProjectParams,
  GetProjectResponse,
  PostCreateProjectRequest,
  PostCreateProjectResponse,
  PutUpdateProjectParams,
  PutUpdateProjectRequest,
  PutUpdateProjectResponse,
  DeleteProjectParams,
  PutUpdateProjectMembersParams,
  PutUpdateProjectMembersRequest,
  PutUpdateProjectMembersResponse,
} from "./types";

const PROJECT_BASE_URL = "/api/v1/project" as const;

export const projectAPI = {
  /**
   * 프로젝트 공개 목록 조회
   *
   * @param {GetProjectsParams} params - 조회 파라미터
   * @param {ProjectPlatform} [params.platform] - 플랫폼 필터 (선택)
   * @param {string} [params.cursor] - 다음 페이지 커서(base64url) (선택)
   * @param {number} [params.limit] - 페이지 크기 (1-100, 선택)
   *
   * @returns {Promise<GetProjectsResponse>} 프로젝트 목록 응답
   *
   * @example
   * const data = await projectAPI.getProjects({ params: { platform: 'WEB', limit: 10 } })
   */
  getProjects: ({ params }: { params: GetProjectsParams }) => {
    const searchParams = new URLSearchParams();
    if (params.platform !== undefined)
      searchParams.set("platform", params.platform);
    if (params.cursor !== undefined) searchParams.set("cursor", params.cursor);
    if (params.limit !== undefined)
      searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    return apiFetch<GetProjectsResponse>(
      `${PROJECT_BASE_URL}${query ? `?${query}` : ""}`
    );
  },

  /**
   * 프로젝트 단일 조회
   *
   * @param {GetProjectParams} params - 조회 파라미터
   * @param {number} params.id - 프로젝트 ID
   *
   * @returns {Promise<GetProjectResponse>} 프로젝트 상세 응답
   *
   * @example
   * const data = await projectAPI.getProject({ params: { id: 1 } })
   */
  getProject: ({ params }: { params: GetProjectParams }) =>
    apiFetch<GetProjectResponse>(`${PROJECT_BASE_URL}/${params.id}`),

  /**
   * 프로젝트 생성 (어드민)
   *
   * @param {PostCreateProjectRequest} payload - 프로젝트 생성 데이터
   * @param {number} payload.cohortId - 기수 ID
   * @param {ProjectCreatePlatform[]} payload.platforms - 플랫폼 목록 (최소 1개, 'IOS' | 'AOS' | 'WEB')
   * @param {string} payload.name - 프로젝트(서비스) 이름
   * @param {string} payload.description - 프로젝트 한줄 설명
   * @param {string} [payload.thumbnailUrl] - 썸네일 URL (선택)
   * @param {string} [payload.pdfUrl] - PDF URL (선택)
   * @param {ProjectMember[]} [payload.members] - 참여자 목록 (선택)
   *
   * @returns {Promise<PostCreateProjectResponse>} 생성된 프로젝트 응답
   *
   * @example
   * const data = await projectAPI.createProject({
   *   payload: { cohortId: 1, platforms: ['WEB'], name: '프로젝트명', description: '한줄 설명' }
   * })
   */
  createProject: ({ payload }: { payload: PostCreateProjectRequest }) =>
    apiFetch<PostCreateProjectResponse>(`${PROJECT_BASE_URL}/admin`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * 프로젝트 수정 (어드민)
   *
   * @param {Object} args - 함수 인자
   * @param {PutUpdateProjectParams} args.params - 프로젝트 파라미터
   * @param {number} args.params.id - 프로젝트 ID
   * @param {PutUpdateProjectRequest} args.payload - 프로젝트 수정 데이터
   * @param {ProjectUpdatePlatform[]} [args.payload.platforms] - 플랫폼 목록 (선택)
   * @param {string} [args.payload.name] - 프로젝트(서비스) 이름 (선택)
   * @param {string} [args.payload.description] - 프로젝트 한줄 설명 (선택)
   * @param {string} [args.payload.thumbnailUrl] - 썸네일 URL (선택)
   * @param {string} [args.payload.pdfUrl] - PDF URL (선택)
   *
   * @returns {Promise<PutUpdateProjectResponse>} 수정된 프로젝트 응답
   *
   * @example
   * const data = await projectAPI.updateProject({
   *   params: { id: 1 },
   *   payload: { name: '수정된 프로젝트명' }
   * })
   */
  updateProject: ({
    params,
    payload,
  }: {
    params: PutUpdateProjectParams;
    payload: PutUpdateProjectRequest;
  }) =>
    apiFetch<PutUpdateProjectResponse>(
      `${PROJECT_BASE_URL}/admin/${params.id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    ),

  /**
   * 프로젝트 삭제 (어드민)
   *
   * @param {DeleteProjectParams} params - 삭제할 프로젝트 파라미터
   * @param {number} params.id - 프로젝트 ID
   *
   * @returns {Promise<void>}
   *
   * @example
   * await projectAPI.deleteProject({ params: { id: 1 } })
   */
  deleteProject: ({ params }: { params: DeleteProjectParams }) =>
    apiFetch<void>(`${PROJECT_BASE_URL}/admin/${params.id}`, {
      method: "DELETE",
    }),

  /**
   * 프로젝트 참여자 수정 (어드민)
   *
   * @param {Object} args - 함수 인자
   * @param {PutUpdateProjectMembersParams} args.params - 프로젝트 파라미터
   * @param {number} args.params.id - 프로젝트 ID
   * @param {PutUpdateProjectMembersRequest} args.payload - 참여자 수정 데이터
   * @param {ProjectMember[]} args.payload.members - 참여자 목록
   *
   * @returns {Promise<PutUpdateProjectMembersResponse>} 수정된 프로젝트 응답
   *
   * @example
   * const data = await projectAPI.updateProjectMembers({
   *   params: { id: 1 },
   *   payload: { members: [{ name: '홍길동', part: 'FE' }] }
   * })
   */
  updateProjectMembers: ({
    params,
    payload,
  }: {
    params: PutUpdateProjectMembersParams;
    payload: PutUpdateProjectMembersRequest;
  }) =>
    apiFetch<PutUpdateProjectMembersResponse>(
      `${PROJECT_BASE_URL}/admin/${params.id}/members`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    ),
};
