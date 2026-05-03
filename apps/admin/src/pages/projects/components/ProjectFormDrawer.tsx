import { useEffect } from "react"
import { useFieldArray, useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import {
  Button,
  Drawer,
  Input,
  ListBox,
  Select,
  TextArea,
  toast,
} from "@heroui/react"
import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  projectKeys,
  useCreateProject,
  useUpdateProject,
  useUpdateProjectMembers,
  useUploadFile,
} from "@ddd/api"
import type {
  CohortDto,
  ProjectDto,
  ProjectPlatform,
  PostCreateProjectRequest,
  PutUpdateProjectRequest,
} from "@ddd/api"

import { cn } from "@/shared/lib/cn"
import { useIsMobile } from "@/shared/hooks/useIsMobile"

import {
  PART_LABEL,
  PART_OPTIONS,
  PLATFORM_LABEL,
  PLATFORM_OPTIONS,
  type ProjectPart,
} from "../constants"

// ───── Form schema ───────────────────────────────────────────────────────────

const memberSchema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요."),
  part: z.enum(PART_OPTIONS),
  review: z.string().optional(),
})

const projectFormSchema = z.object({
  cohortId: z.number({ message: "기수를 선택해 주세요." }).int().positive(),
  platforms: z
    .array(z.enum(["IOS", "AOS", "WEB"] as const))
    .min(1, "최소 1개 플랫폼을 선택해 주세요."),
  name: z
    .string()
    .min(1, "서비스명을 입력해 주세요.")
    .max(100, "100자 이하로 입력해 주세요."),
  description: z
    .string()
    .min(1, "한줄 설명을 입력해 주세요.")
    .max(200, "200자 이하로 입력해 주세요."),
  thumbnailUrl: z
    .string()
    .url("URL 형식이 아닙니다.")
    .optional()
    .or(z.literal("")),
  members: z.array(memberSchema),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

// ───── Component ─────────────────────────────────────────────────────────────

export type ProjectFormDrawerMode = "create" | "edit"

type ProjectFormDrawerProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: ProjectFormDrawerMode
  project?: ProjectDto
  cohorts: CohortDto[]
}

const buildDefaults = (project?: ProjectDto): ProjectFormValues => ({
  cohortId: project?.cohortId ?? 0,
  platforms: project?.platforms ?? [],
  name: project?.name ?? "",
  description: project?.description ?? "",
  thumbnailUrl: project?.thumbnailUrl ?? "",
  members:
    project?.members?.map((m) => ({
      name: m.name,
      part: (PART_OPTIONS.includes(m.part as ProjectPart)
        ? m.part
        : "PM") as ProjectPart,
      review: undefined,
    })) ?? [],
})

export const ProjectFormDrawer = ({
  isOpen,
  onOpenChange,
  mode,
  project,
  cohorts,
}: ProjectFormDrawerProps) => {
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: buildDefaults(project),
  })

  const {
    fields: memberFields,
    append: appendMember,
    remove: removeMember,
  } = useFieldArray({ control, name: "members" })

  // 모드 / 대상 변경 시 폼 리셋
  useEffect(() => {
    if (isOpen) reset(buildDefaults(project))
  }, [isOpen, mode, project, reset])

  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const updateMembers = useUpdateProjectMembers()
  const uploadFile = useUploadFile()

  const handleThumbnailUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadFile.mutateAsync({
        params: { category: "project-thumbnail" },
        payload: formData,
      })
      setValue("thumbnailUrl", result.url, { shouldValidate: true })
    } catch (error) {
      toast.danger("썸네일 업로드에 실패했습니다", {
        description: (error as Error).message,
      })
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (mode === "create") {
        const payload: PostCreateProjectRequest = {
          cohortId: values.cohortId,
          platforms: values.platforms,
          name: values.name,
          description: values.description,
          ...(values.thumbnailUrl ? { thumbnailUrl: values.thumbnailUrl } : {}),
          members: values.members,
        }
        await createProject.mutateAsync({ payload })
        toast.success("프로젝트가 저장되었습니다", {
          description: "홈페이지에 노출됩니다.",
        })
      } else if (project) {
        const payload: PutUpdateProjectRequest = {
          //id: values.cohortId,
          platforms: values.platforms,
          name: values.name,
          description: values.description,
          ...(values.thumbnailUrl ? { thumbnailUrl: values.thumbnailUrl } : {}),
        }
        await updateProject.mutateAsync({
          params: { id: project.id },
          payload,
        })
        await updateMembers.mutateAsync({
          params: { id: project.id },
          payload: { members: values.members },
        })
        toast.success("프로젝트가 수정되었습니다")
      }

      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      onOpenChange(false)
    } catch (error) {
      toast.danger("저장에 실패했습니다", {
        description: (error as Error).message,
      })
    }
  })

  const platforms = useWatch({ control, name: "platforms" })
  const togglePlatform = (p: ProjectPlatform) => {
    const next = platforms.includes(p)
      ? platforms.filter((v) => v !== p)
      : [...platforms, p]
    setValue("platforms", next, { shouldValidate: true })
  }

  const thumbnailUrl = useWatch({ control, name: "thumbnailUrl" })
  const cohortId = useWatch({ control, name: "cohortId" })
  const cohortLabel =
    cohorts.find((c) => c.id === cohortId)?.name ?? "기수 선택"

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Backdrop>
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
              <Section title="프로젝트 정보">
                <FormField label="썸네일 이미지">
                  <ThumbnailUploader
                    url={thumbnailUrl}
                    isUploading={uploadFile.isPending}
                    onSelect={handleThumbnailUpload}
                    onClear={() =>
                      setValue("thumbnailUrl", "", { shouldValidate: true })
                    }
                  />
                </FormField>

                <FormField label="서비스명" error={errors.name?.message}>
                  <Input
                    {...register("name")}
                    placeholder="서비스명을 입력하세요"
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
                  />
                </FormField>
              </Section>

              <Section title="참여자">
                <div className="space-y-3">
                  {memberFields.map((field, index) => (
                    <MemberRow
                      key={field.id}
                      index={index}
                      register={register}
                      control={control}
                      onRemove={() => removeMember(index)}
                      errors={errors.members?.[index]}
                    />
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() =>
                    appendMember({
                      name: "",
                      part: "PM",
                      review: "",
                    })
                  }
                  className="mt-3"
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="mr-1" />
                  참여자 추가
                </Button>
              </Section>
            </Drawer.Body>

            <Drawer.Footer className="gap-2">
              <Drawer.CloseTrigger />
              <Button onPress={() => onSubmit()} isDisabled={isSubmitting}>
                {isSubmitting ? "저장 중..." : "저장"}
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  )
}

// ───── Subcomponents ─────────────────────────────────────────────────────────

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <section className="space-y-4">
    <h3 className="text-muted-foreground border-b border-gray-200 pb-2 text-xs font-semibold tracking-wider uppercase">
      {title}
    </h3>
    {children}
  </section>
)

const FormField = ({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-gray-700">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

type ThumbnailUploaderProps = {
  url?: string
  isUploading: boolean
  onSelect: (file: File) => void
  onClear: () => void
}

const ThumbnailUploader = ({
  url,
  isUploading,
  onSelect,
  onClear,
}: ThumbnailUploaderProps) => {
  return (
    <div className="space-y-2">
      {url ? (
        <div className="relative inline-block">
          <img
            src={url}
            alt="썸네일 미리보기"
            className="h-24 w-24 rounded-md border border-gray-200 object-cover"
          />
          <Button
            size="sm"
            variant="outline"
            onPress={onClear}
            className="ml-2"
          >
            제거
          </Button>
        </div>
      ) : (
        <label
          className={cn(
            "flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-8 text-center transition hover:border-blue-400",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onSelect(file)
            }}
          />
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              {isUploading ? "업로드 중..." : "이미지를 클릭해서 업로드"}
            </p>
            <p className="text-xs text-gray-400">PNG, JPG (최대 5MB)</p>
          </div>
        </label>
      )}
    </div>
  )
}

type MemberRowProps = {
  index: number
  register: ReturnType<typeof useForm<ProjectFormValues>>["register"]
  control: ReturnType<typeof useForm<ProjectFormValues>>["control"]
  onRemove: () => void
  errors?: {
    name?: { message?: string }
    part?: { message?: string }
    review?: { message?: string }
  }
}

const MemberRow = ({
  index,
  register,
  control,
  onRemove,
  errors,
}: MemberRowProps) => {
  return (
    <div className="space-y-2 rounded-md border border-gray-200 bg-white p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField label="이름" error={errors?.name?.message}>
          <Input {...register(`members.${index}.name`)} placeholder="이름" />
        </FormField>
        <FormField label="파트" error={errors?.part?.message}>
          <Controller
            control={control}
            name={`members.${index}.part`}
            render={({ field }) => (
              <Select aria-label="파트">
                <Select.Trigger>
                  <Select.Value>
                    {field.value ? PART_LABEL[field.value] : "선택"}
                  </Select.Value>
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {PART_OPTIONS.map((p) => (
                      <ListBox.Item
                        key={p}
                        id={p}
                        textValue={PART_LABEL[p]}
                        onClick={() => field.onChange(p)}
                      >
                        {PART_LABEL[p]}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            )}
          />
        </FormField>
        <div className="flex items-end justify-end">
          <Button size="sm" variant="ghost" onPress={onRemove}>
            <HugeiconsIcon icon={Delete02Icon} className="mr-1" />
            삭제
          </Button>
        </div>
      </div>
      <FormField label="후기" error={errors?.review?.message}>
        <TextArea
          {...register(`members.${index}.review`)}
          placeholder="참여 후기 (선택)"
        />
      </FormField>
    </div>
  )
}
