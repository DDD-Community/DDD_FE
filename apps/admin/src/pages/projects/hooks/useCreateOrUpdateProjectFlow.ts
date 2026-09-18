import { useCallback, useRef, useState } from "react"
import { toast } from "@heroui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { projectKeys, projectMutations, projectQueries } from "@ddd/api"
import type {
  PatchUpdateProjectRequest,
  PostCreateProjectRequest,
  ProjectDto,
} from "@ddd/api"

import {
  PROJECT_ASSET_RULE,
  toAssetUploadErrorMessage,
  type ProjectAssetKind,
} from "../lib/projectAsset"
import {
  PROJECT_ASSET_FIELD,
  type ProjectFormValues,
} from "../lib/projectForm"

type Mode = "create" | "edit"

export type ProjectAssetFailures = Partial<Record<ProjectAssetKind, string>>

interface Args {
  mode: Mode
  /** edit 에서 채워짐. create 모드면 null */
  targetId: number | null
  /** 파일 하나가 서버에 연결될 때마다 호출. 폼의 File 을 비우고 서버 URL 로 바꾸는 데 쓴다 */
  onAssetUploaded: (kind: ProjectAssetKind, project: ProjectDto) => void
  /** 필드와 파일이 모두 저장됐을 때 호출 (Drawer 닫기 등) */
  onSuccess?: () => void
}

interface PendingAsset {
  kind: ProjectAssetKind
  file: File
}

const ASSET_KINDS: ProjectAssetKind[] = ["pdf", "thumbnail"]

/**
 * 프로젝트 등록/수정 흐름 훅.
 *
 * ① 필드 저장 → ② 파일 업로드 순서로 진행한다. 파일은 프로젝트 id 가 있어야 올릴 수 있고,
 * 업로드 API 는 호출 즉시 공개 페이지에 반영되므로 저장 시점에만 호출한다.
 *
 * - mode=create → POST /admin/projects
 * - mode=edit   → PATCH /admin/projects/:id + PUT /admin/projects/:id/members
 * - 공통        → POST /admin/projects/:id/pdf, /thumbnail (새로 고른 파일만)
 *
 * ② 가 실패해도 프로젝트는 이미 저장된 상태다. 다시 저장을 눌러도 ① 의 POST 는 재전송하지
 * 않고(중복 프로젝트 방지), 실패한 파일만 다시 올린다.
 */
export function useCreateOrUpdateProjectFlow({
  mode,
  targetId,
  onAssetUploaded,
  onSuccess,
}: Args) {
  const queryClient = useQueryClient()
  const createProject = useMutation(projectMutations.createProject())
  const updateProject = useMutation(projectMutations.updateProject())
  const updateMembers = useMutation(projectMutations.updateProjectMembers())
  const uploadPdf = useMutation(projectMutations.uploadProjectPdf())
  const uploadThumbnail = useMutation(projectMutations.uploadProjectThumbnail())

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assetFailures, setAssetFailures] = useState<ProjectAssetFailures>({})

  // isSubmitting state 는 다음 렌더에야 버튼을 막는다. 같은 틱의 연타로 POST 가 두 번
  // 나가지 않도록 ref 로 즉시 잠근다.
  const isSubmittingRef = useRef(false)
  const createdProjectIdRef = useRef<number | null>(null)
  const lastSavedFieldsRef = useRef<string | null>(null)
  const failedFilesRef = useRef<Partial<Record<ProjectAssetKind, File>>>({})
  // Drawer 가 닫혔다 다시 열린 뒤에 도착한 응답이 새 폼을 건드리지 않게 한다.
  const flowGenerationRef = useRef(0)

  const resetFlow = useCallback(function resetFlow() {
    flowGenerationRef.current += 1
    createdProjectIdRef.current = null
    lastSavedFieldsRef.current = null
    failedFilesRef.current = {}
    setAssetFailures({})
  }, [])

  async function saveFields(values: ProjectFormValues): Promise<number> {
    const serializedFields = JSON.stringify({
      cohortId: values.cohortId,
      platforms: values.platforms,
      name: values.name,
      description: values.description,
      members: values.members,
    })
    const projectId = createdProjectIdRef.current ?? targetId

    if (projectId == null) {
      const payload: PostCreateProjectRequest = {
        cohortId: values.cohortId,
        platforms: values.platforms,
        name: values.name,
        description: values.description,
        members: values.members,
      }
      const project = await createProject.mutateAsync({ payload })
      createdProjectIdRef.current = project.id
      lastSavedFieldsRef.current = serializedFields
      return project.id
    }

    // 파일 재시도만 하는 경우(필드가 그대로)에는 필드를 다시 보내지 않는다.
    if (lastSavedFieldsRef.current === serializedFields) return projectId

    const payload: PatchUpdateProjectRequest = {
      platforms: values.platforms,
      name: values.name,
      description: values.description,
    }
    await updateProject.mutateAsync({ params: { id: projectId }, payload })
    await updateMembers.mutateAsync({
      params: { id: projectId },
      payload: { members: values.members },
    })
    lastSavedFieldsRef.current = serializedFields
    return projectId
  }

  /**
   * 직전 업로드가 타임아웃·연결 끊김으로 실패처럼 보였어도 서버는 저장을 끝냈을 수 있다.
   * 같은 파일을 다시 올리기 전에 프로젝트를 조회해, URL 이 이미 바뀐 파일은 성공으로 처리한다.
   */
  async function excludeAlreadyLinkedAssets(
    projectId: number,
    values: ProjectFormValues,
    pendingAssets: PendingAsset[],
    generation: number
  ): Promise<PendingAsset[]> {
    const retriedAssets = pendingAssets.filter(
      ({ kind, file }) => failedFilesRef.current[kind] === file
    )
    if (retriedAssets.length === 0) return pendingAssets

    const project = await queryClient.fetchQuery({
      ...projectQueries.getAdminProject({ params: { id: projectId } }),
      staleTime: 0,
    })

    const linkedKinds = retriedAssets
      .filter(({ kind }) => {
        const urlField = PROJECT_ASSET_FIELD[kind].url
        return (project[urlField] ?? "") !== values[urlField]
      })
      .map(({ kind }) => kind)

    linkedKinds.forEach((kind) => {
      delete failedFilesRef.current[kind]
      if (generation === flowGenerationRef.current) onAssetUploaded(kind, project)
    })
    return pendingAssets.filter(({ kind }) => !linkedKinds.includes(kind))
  }

  async function uploadAssets(
    projectId: number,
    values: ProjectFormValues,
    generation: number
  ): Promise<ProjectAssetFailures> {
    const pendingAssets = ASSET_KINDS.flatMap((kind) => {
      const file = values[PROJECT_ASSET_FIELD[kind].file]
      return file ? [{ kind, file }] : []
    })
    if (pendingAssets.length === 0) return {}

    let assetsToUpload: PendingAsset[]
    try {
      assetsToUpload = await excludeAlreadyLinkedAssets(
        projectId,
        values,
        pendingAssets,
        generation
      )
    } catch (error) {
      return Object.fromEntries(
        pendingAssets.map(({ kind }) => [
          kind,
          toAssetUploadErrorMessage(kind, error),
        ])
      )
    }

    const uploadByKind = { pdf: uploadPdf, thumbnail: uploadThumbnail }
    // 종류가 다른 파일끼리만 병렬이다. 같은 종류를 동시에 올리면 하나가 서버에 고아로 남는다.
    const results = await Promise.allSettled(
      assetsToUpload.map(({ kind, file }) =>
        uploadByKind[kind].mutateAsync({
          params: { id: projectId },
          payload: { file },
        })
      )
    )

    const failures: ProjectAssetFailures = {}
    results.forEach((result, index) => {
      const { kind, file } = assetsToUpload[index]
      if (result.status === "fulfilled") {
        delete failedFilesRef.current[kind]
        if (generation === flowGenerationRef.current) {
          onAssetUploaded(kind, result.value)
        }
        return
      }
      failedFilesRef.current[kind] = file
      failures[kind] = toAssetUploadErrorMessage(kind, result.reason)
    })
    return failures
  }

  async function submit(values: ProjectFormValues) {
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setIsSubmitting(true)
    const generation = flowGenerationRef.current

    try {
      let projectId: number
      try {
        projectId = await saveFields(values)
      } catch (error) {
        toast.danger("저장에 실패했습니다", {
          description: (error as Error).message,
        })
        return
      } finally {
        // PATCH 는 성공하고 PUT members 만 실패한 경우에도 목록은 갱신돼야 한다.
        queryClient.invalidateQueries({ queryKey: projectKeys.all })
      }

      const failures = await uploadAssets(projectId, values, generation)
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      if (generation !== flowGenerationRef.current) return

      setAssetFailures(failures)
      const failedKinds = ASSET_KINDS.filter((kind) => failures[kind])
      if (failedKinds.length > 0) {
        const failedLabels = failedKinds
          .map((kind) => PROJECT_ASSET_RULE[kind].label)
          .join(", ")
        toast.danger("프로젝트는 저장됐지만 파일 업로드에 실패했어요", {
          description: `${failedLabels} 파일만 다시 올릴 수 있어요.`,
        })
        return
      }

      toast.success(
        mode === "create"
          ? "프로젝트가 저장되었습니다"
          : "프로젝트가 수정되었습니다",
        mode === "create" ? { description: "홈페이지에 노출됩니다." } : undefined
      )
      onSuccess?.()
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return {
    submit,
    resetFlow,
    isPending: isSubmitting,
    /** ① 은 끝났고 ② 만 남은 상태. 저장 버튼을 "파일 다시 업로드" 로 바꾸는 데 쓴다 */
    hasAssetFailure: Object.keys(assetFailures).length > 0,
    assetFailures,
    uploadingKinds: {
      pdf: uploadPdf.isPending,
      thumbnail: uploadThumbnail.isPending,
    } satisfies Record<ProjectAssetKind, boolean>,
  }
}
