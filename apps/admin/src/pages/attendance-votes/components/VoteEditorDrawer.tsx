import { Suspense, useEffect, useRef, useState } from "react"
import { Alert, Button, Drawer } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { attendanceQueries, type AttendanceVoteDetail } from "@ddd/api"
import { useIsMobile } from "@/shared/hooks/useIsMobile"
import { ErrorFallback } from "@/shared/ui/ErrorFallback"
import { useVoteEditorFlow } from "../hooks/useVoteEditorFlow"
import {
  duplicateForm,
  emptyVoteForm,
  findAnonymousWording,
  voteFormSchema,
  voteToForm,
  type VoteEditorForm,
} from "../lib/voteTemplate"
import { VoteConfirmDialog } from "./VoteConfirmDialog"
import { VoteEditorFormFields } from "./VoteEditorFormFields"
import { VotePreviewPhone } from "./VotePreviewPhone"

export type VoteEditorMode = "create" | "duplicate" | "edit" | "text"
interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: VoteEditorMode
  generationId: number
  voteId: number | null
  onCreated: (voteId: number) => void
}
export function VoteEditorDrawer(props: Props) {
  const isMobile = useIsMobile()
  const closeRef = useRef<() => void>(() => props.onOpenChange(false))
  return (
    <Drawer.Backdrop
      isOpen={props.isOpen}
      onOpenChange={(open) => {
        if (!open) closeRef.current()
      }}
    >
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog className="w-full max-w-[min(1200px,95vw)] bg-gray-100">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense
              fallback={<div className="p-6">투표를 불러오는 중...</div>}
            >
              {props.mode === "create" ? (
                <Editor {...props} closeRef={closeRef} />
              ) : (
                <LoadedEditor {...props} closeRef={closeRef} />
              )}
            </Suspense>
          </ErrorBoundary>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
function LoadedEditor(
  props: Props & { closeRef: React.RefObject<() => void> }
) {
  const { data } = useSuspenseQuery(
    attendanceQueries.getVote({ params: { voteId: props.voteId! } })
  )
  return <Editor {...props} original={data} />
}
function Editor({
  mode,
  generationId,
  voteId,
  onOpenChange,
  onCreated,
  original,
  closeRef,
}: Props & {
  original?: AttendanceVoteDetail
  closeRef: React.RefObject<() => void>
}) {
  const initial = original
    ? mode === "duplicate"
      ? duplicateForm(original)
      : voteToForm(original)
    : { form: emptyVoteForm(), unsupported: null }
  const methods = useForm<VoteEditorForm>({
    resolver: zodResolver(voteFormSchema),
    defaultValues: initial.form,
  })
  const {
    handleSubmit,
    control,
    formState: { isDirty, isSubmitting, errors },
  } = methods
  const values = useWatch({ control }) as VoteEditorForm
  const [confirmClose, setConfirmClose] = useState(false)
  const { submit, isPending } = useVoteEditorFlow({
    mode,
    generationId,
    voteId,
    original,
  })
  const busy = isPending || isSubmitting
  function close() {
    if (busy) return
    if (isDirty) setConfirmClose(true)
    else onOpenChange(false)
  }
  useEffect(() => {
    closeRef.current = () => {
      if (busy) return
      if (isDirty) setConfirmClose(true)
      else onOpenChange(false)
    }
  }, [closeRef, busy, isDirty, onOpenChange])
  const onSubmit = handleSubmit(async (form) => {
    if (isPending || initial.unsupported) return
    const id = await submit(form)
    if (id !== null) {
      if (mode === "create" || mode === "duplicate") onCreated(id)
      onOpenChange(false)
    }
  })
  const title = {
    create: "새 투표",
    duplicate: "투표 복제",
    edit: "투표 편집",
    text: "글자 수정",
  }[mode]
  return (
    <>
      <Drawer.Header>
        <Drawer.Heading>{title}</Drawer.Heading>
      </Drawer.Header>
      <FormProvider {...methods}>
        <Drawer.Body className="flex-1 overflow-y-auto">
          <form
            id="vote-editor-form"
            onSubmit={onSubmit}
            className="grid gap-6 lg:grid-cols-2"
          >
            <div className="space-y-4">
              <Alert status="warning">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>
                    개인별 응답(실명) CSV 를 내려받을 수 있으므로 안내문·질문에
                    '익명'이라고 쓰지 마세요.
                  </Alert.Description>
                </Alert.Content>
              </Alert>
              {findAnonymousWording(values) && (
                <Alert status="warning">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>
                      입력 내용에 '익명'이 포함되어 있습니다. 안내 문구를 확인해
                      주세요.
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
              )}
              {mode === "text" && (
                <p className="rounded-lg bg-gray-200 p-4 text-sm">
                  진행 중인 투표는 글자만 고칠 수 있습니다. 부문·질문·선택지의
                  추가·삭제·순서와 선택 개수·글자 수 제한은 바꿀 수 없습니다.
                </p>
              )}
              {initial.unsupported && (
                <Alert status="danger">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>{initial.unsupported}</Alert.Description>
                  </Alert.Content>
                </Alert>
              )}
              {Object.keys(errors).length > 0 && (
                <p role="alert" className="text-sm text-danger">
                  입력 내용을 확인해 주세요.
                </p>
              )}
              <VoteEditorFormFields textOnly={mode === "text"} />
            </div>
            <div className="lg:sticky lg:top-0 lg:self-start">
              <VotePreviewPhone generationId={generationId} />
            </div>
          </form>
        </Drawer.Body>
      </FormProvider>
      <Drawer.Footer className="gap-2">
        <Button variant="tertiary" onPress={close} isDisabled={busy}>
          취소
        </Button>
        <Button
          type="submit"
          form="vote-editor-form"
          isDisabled={busy || !!initial.unsupported}
        >
          {busy ? "저장 중..." : "저장"}
        </Button>
      </Drawer.Footer>
      <VoteConfirmDialog
        isOpen={confirmClose}
        onOpenChange={setConfirmClose}
        title="작성 중인 내용을 버릴까요?"
        description="저장하지 않은 내용은 사라집니다."
        confirmLabel="버리기"
        pendingLabel="닫는 중..."
        confirmVariant="danger"
        iconStatus="danger"
        isPending={false}
        onConfirm={() => onOpenChange(false)}
      />
    </>
  )
}
