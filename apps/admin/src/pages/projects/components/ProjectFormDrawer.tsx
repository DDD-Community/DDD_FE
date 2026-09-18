import { useEffect } from "react"
import { Alert, Button, Drawer, Input, ListBox, Select } from "@heroui/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form"

import type { CohortDto, ProjectDto, ProjectPlatform } from "@ddd/api"

import { PLATFORM_LABEL, PLATFORM_OPTIONS } from "@/pages/projects/constants"
import type { ProjectAssetKind } from "@/pages/projects/lib/projectAsset"
import {
  buildProjectFormDefaults,
  PROJECT_ASSET_FIELD,
  projectFormSchema,
  type ProjectFormValues,
} from "@/pages/projects/lib/projectForm"
import { useCreateOrUpdateProjectFlow } from "@/pages/projects/hooks/useCreateOrUpdateProjectFlow"
import { useIsMobile } from "@/shared/hooks/useIsMobile"
import { cn } from "@/shared/lib/cn"
import { FormField } from "@/shared/ui/FormField"
import { Section } from "@/shared/ui/Section"

import { MemberRow } from "./MemberRow"
import { PdfUploader } from "./PdfUploader"
import { ThumbnailUploader } from "./ThumbnailUploader"

export type ProjectFormDrawerMode = "create" | "edit"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: ProjectFormDrawerMode
  project?: ProjectDto
  cohorts: CohortDto[]
}

const FORM_ID = "project-register-form"

export function ProjectFormDrawer({
  isOpen,
  onOpenChange,
  mode,
  project,
  cohorts,
}: Props) {
  const isMobile = useIsMobile()

  const methods = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: buildProjectFormDefaults(project),
  })
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = methods

  const {
    fields: memberFields,
    append: appendMember,
    remove: removeMember,
  } = useFieldArray({ control, name: "members" })

  // 업로드 응답(갱신된 프로젝트)으로 미리보기를 서버 URL 로 바꾸고 File 을 비운다.
  // File 이 비면 성공한 파일은 재시도 대상에서 빠지고, 썸네일 object URL 도 해제된다.
  function handleAssetUploaded(kind: ProjectAssetKind, uploaded: ProjectDto) {
    const field = PROJECT_ASSET_FIELD[kind]
    setValue(field.url, uploaded[field.url] ?? "")
    setValue(field.file, null)
  }

  const {
    submit,
    resetFlow,
    isPending,
    hasAssetFailure,
    assetFailures,
    uploadingKinds,
  } = useCreateOrUpdateProjectFlow({
    mode,
    targetId: project?.id ?? null,
    onAssetUploaded: handleAssetUploaded,
    onSuccess: () => onOpenChange(false),
  })

  useEffect(function resetFormOnOpen() {
    if (!isOpen) return
    reset(buildProjectFormDefaults(project))
    resetFlow()
  }, [isOpen, mode, project, reset, resetFlow])

  const onSubmit = handleSubmit((values) => submit(values))

  const platforms = useWatch({ control, name: "platforms" })
  const togglePlatform = (p: ProjectPlatform) => {
    const next = platforms.includes(p)
      ? platforms.filter((v) => v !== p)
      : [...platforms, p]
    setValue("platforms", next, { shouldValidate: true })
  }

  const cohortId = useWatch({ control, name: "cohortId" })
  const cohortLabel =
    cohorts.find((c) => c.id === cohortId)?.name ?? "기수 선택"

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog
          className={!isMobile ? "w-full max-w-1/2 bg-gray-50" : ""}
        >
          <Drawer.Header>
            <Drawer.Heading className="text-lg font-semibold">
              {mode === "create" ? "프로젝트 등록" : "프로젝트 수정"}
            </Drawer.Heading>
          </Drawer.Header>

          <Drawer.Body className="flex-1 space-y-6 overflow-y-auto">
            <FormProvider {...methods}>
              <form id={FORM_ID} onSubmit={onSubmit} className="space-y-6">
                {hasAssetFailure ? (
                  <Alert status="danger" role="alert">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>
                        프로젝트는 저장됐지만 파일 업로드에 실패했어요
                      </Alert.Title>
                      <Alert.Description>
                        아래 버튼을 누르면 실패한 파일만 다시 올려요. 프로젝트가
                        중복으로 생기지 않아요.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert>
                ) : null}

                <Section title="프로젝트 정보">
                  <FormField label="썸네일 이미지">
                    <ThumbnailUploader
                      isUploading={uploadingKinds.thumbnail}
                      errorMessage={assetFailures.thumbnail}
                    />
                  </FormField>

                  <FormField label="최종 발표 PDF">
                    <PdfUploader
                      isUploading={uploadingKinds.pdf}
                      errorMessage={assetFailures.pdf}
                    />
                  </FormField>

                  <FormField label="서비스명" error={errors.name?.message}>
                    <Input
                      {...register("name")}
                      placeholder="서비스명을 입력하세요"
                      className="w-full"
                    />
                  </FormField>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="플랫폼" error={errors.platforms?.message}>
                      <div className="flex flex-wrap gap-2">
                        {PLATFORM_OPTIONS.map((p) => {
                          const active = platforms.includes(p)
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => togglePlatform(p)}
                              className={cn(
                                "rounded-md border px-3 py-1.5 text-xs font-medium transition",
                                active
                                  ? "border-transparent bg-blue-500 text-white"
                                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                              )}
                            >
                              {PLATFORM_LABEL[p]}
                            </button>
                          )
                        })}
                      </div>
                    </FormField>

                    <FormField label="기수" error={errors.cohortId?.message}>
                      <Controller
                        control={control}
                        name="cohortId"
                        render={({ field }) => (
                          <Select aria-label="기수">
                            <Select.Trigger>
                              <Select.Value>{cohortLabel}</Select.Value>
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                {cohorts.map((c) => (
                                  <ListBox.Item
                                    key={c.id}
                                    id={String(c.id)}
                                    textValue={c.name}
                                    onClick={() => field.onChange(c.id)}
                                  >
                                    {c.name}
                                  </ListBox.Item>
                                ))}
                              </ListBox>
                            </Select.Popover>
                          </Select>
                        )}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="한줄 설명"
                    error={errors.description?.message}
                  >
                    <Input
                      {...register("description")}
                      placeholder="서비스를 한 줄로 설명해 주세요"
                      className="w-full"
                    />
                  </FormField>
                </Section>

                <Section title="참여자">
                  <div className="space-y-3">
                    {memberFields.map((field, index) => (
                      <MemberRow
                        key={field.id}
                        index={index}
                        onRemove={() => removeMember(index)}
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onPress={() =>
                      appendMember({ name: "", part: "PM" })
                    }
                    className="mt-3"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="mr-1" />
                    참여자 추가
                  </Button>
                </Section>
              </form>
            </FormProvider>
          </Drawer.Body>

          <Drawer.Footer className="gap-2">
            <Drawer.CloseTrigger />
            <Button type="submit" form={FORM_ID} isDisabled={isPending}>
              {isPending
                ? "저장 중..."
                : hasAssetFailure
                  ? "파일 다시 업로드"
                  : "저장"}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
