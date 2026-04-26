# /blog-posts · /projects 어드민 페이지 — 설계 문서

> **작성일**: 2026-04-26
> **레퍼런스**: `~/Downloads/ddd-admin (1) (1).html`
> **대상**: `apps/admin/src/pages/blog-posts/`, `apps/admin/src/pages/projects/`
> **API**: `@ddd/api`의 `blog`, `project`, `cohort`, `storage` 도메인

---

## 1. 목적

기존의 임시 mock 기반 목록 페이지를 **백엔드 API DTO와 정합**되게 재구성한다.
`@ddd/api` 훅을 직접 사용해 목록 조회·검색·필터·등록·수정·삭제·삭제 확인·토스트까지 HTML 레퍼런스 흐름을 충족한다.

## 2. 결정 사항 (Decision Log)

| # | 영역 | 결정 |
| --- | --- | --- |
| 1 | status 필드 | API DTO에 없으므로 두 페이지에서 전면 제거 |
| 2 | 작업 스코프 | 목록 + Drawer(등록/수정) + 삭제 확인까지 |
| 3 | 썸네일 업로드 | `useUploadFile({ category })` 사용. category = `'project-thumbnail' \| 'blog-thumbnail'` |
| 4 | 기수 표시·필터 | `useCohorts()` → `cohort.name` 매핑, 클라이언트 필터링 |
| 5 | 페이지네이션 | cursor 기반 + "더 보기" 버튼 (`useInfiniteQuery`) |
| 6 | infinite 훅 위치 | `@ddd/api/blog/hooks.ts`, `@ddd/api/project/hooks.ts`에 추가 |
| 7 | 폼 검증 | 페이지 단 인라인 Zod + `@hookform/resolvers/zod` |
| 8 | 참여자 입력 | `react-hook-form`의 `useFieldArray` |
| 9 | 삭제 확인 | HeroUI v3 `AlertDialog` |
| 10 | 토스트 | HeroUI v3 `toast.success/error/info`, `RemindersPage` 패턴 |
| 11 | 토스트 패턴 가이드 | `docs/admin-toast.md` 작성 + `apps/admin/CLAUDE.md` 참조 추가 + (선택) `.claude/skills/admin-toast/SKILL.md` |

## 3. 아키텍처

### 3.1 폴더 구조

```
apps/admin/src/pages/projects/
├── ProjectsPage.tsx
├── index.tsx
├── components/
│   ├── ProjectsToolbar.tsx        # 검색 + 플랫폼 + 기수 Select
│   ├── ProjectsTable.tsx          # 테이블 본체 + 액션 버튼
│   ├── ProjectFormDrawer.tsx      # 등록/수정 Drawer
│   └── DeleteProjectDialog.tsx    # AlertDialog
└── constants.ts                   # PLATFORM_LABEL, PART_LABEL 등
   # ❌ 삭제: types.d.ts, mockApi.ts

apps/admin/src/pages/blog-posts/
├── BlogPostsPage.tsx
├── index.tsx
├── components/
│   ├── BlogPostsToolbar.tsx
│   ├── BlogPostsTable.tsx
│   ├── BlogPostFormDrawer.tsx
│   └── DeleteBlogPostDialog.tsx
└── constants.ts (필요 시)
   # ❌ 삭제: types.d.ts, mockApi.ts
```

### 3.2 `@ddd/api` 추가

```
packages/api/src/blog/queries.ts    # blogQueries.getInfiniteBlogPosts 추가
packages/api/src/blog/hooks.ts      # useInfiniteBlogPosts 추가
packages/api/src/project/queries.ts # projectQueries.getInfiniteProjects 추가
packages/api/src/project/hooks.ts   # useInfiniteProjects 추가
```

### 3.3 산출물 (문서)

```
docs/admin-toast.md                 # 토스트 패턴 가이드 (신규)
apps/admin/CLAUDE.md                # docs/admin-toast.md 참조 추가
.claude/skills/admin-toast/SKILL.md # (선택) 프로젝트 단 Skill
```

## 4. 데이터 흐름

### 4.1 목록 조회

```
ProjectsPage
  ├─ useInfiniteProjects({ params: { platform: serverFilter, limit: 20 } })
  │     → [page1.items, page2.items, ...] flatMap
  ├─ useCohorts()
  │     → cohortById = new Map(items.map(c => [c.id, c]))
  └─ 클라이언트 필터링 (이름 검색 + cohortId)
```

* `platform`은 API가 서버 필터를 지원하므로 서버에 위임
* `cohortId`/`searchText`는 백엔드 미지원 → 누적 로드된 페이지에서 클라이언트 필터링
* 더 보기 버튼: `hasNextPage && fetchNextPage()`

### 4.2 등록/수정

```
ProjectFormDrawer
  ├─ react-hook-form (zodResolver)
  ├─ thumbnail: useUploadFile('project-thumbnail') → setValue('thumbnailUrl', url)
  ├─ members: useFieldArray
  ├─ submit
  │     ├─ create: useCreateProject().mutateAsync({ payload })
  │     └─ update: useUpdateProject().mutateAsync({ params: { id }, payload })
  ├─ onSuccess
  │     ├─ queryClient.invalidateQueries(projectQueryKeys.all)
  │     ├─ toast.success(...)
  │     └─ onClose()
  └─ onError → toast.error(message)
```

### 4.3 삭제

```
DeleteProjectDialog
  ├─ AlertDialog (HeroUI)
  └─ confirm
        ├─ useDeleteProject().mutateAsync({ params: { id } })
        ├─ invalidate
        ├─ toast.success("삭제되었습니다")
        └─ close
```

## 5. 단계별 구현 계획 (11 phases)

> 각 phase 종료 후 사용자 브리핑 진행. 의존(▶) 표기.

### Phase 1 — legacy 타입/mock 정리

**목표**: 두 페이지에서 status·임시타입 흔적 제거, 백엔드 DTO 단일 출처화.

**변경**
- `apps/admin/src/pages/projects/types.d.ts` 삭제
- `apps/admin/src/pages/projects/mockApi.ts` 삭제
- `apps/admin/src/pages/projects/constants.ts`: `STATUS_*` 제거, `PLATFORM_LABEL`, `PART_LABEL` 정의
- `apps/admin/src/pages/blog-posts/types.d.ts` 삭제
- `apps/admin/src/pages/blog-posts/mockApi.ts` 삭제
- `apps/admin/src/pages/blog-posts/constants.ts`: `STATUS_*` 제거 (블로그는 라벨 상수가 거의 없음 — 제거 또는 비움)
- `ProjectsPage.tsx`/`BlogPostsPage.tsx`의 legacy 임시 import 제거

**검증**: `pnpm --filter @ddd/admin lint`로 미사용 import/타입 에러 없음.

---

### Phase 2 — `@ddd/api` infinite 훅 추가 ▶ Phase 1과 독립

**목표**: 두 페이지의 cursor 기반 무한스크롤을 패키지 단에서 재사용 가능하게 제공.

**변경**
- `packages/api/src/blog/queries.ts`
  ```ts
  blogQueries.getInfiniteBlogPosts = ({ params }) => infiniteQueryOptions({
    queryKey: blogQueryKeys.infinite(params),
    queryFn: ({ pageParam }) => blogAPI.getBlogPosts({ params: { ...params, cursor: pageParam } }),
    initialPageParam: undefined,
    getNextPageParam: (last) => last.hasMore ? last.nextCursor : undefined,
  })
  ```
- `packages/api/src/blog/hooks.ts`: `useInfiniteBlogPosts` export
- `packages/api/src/project/queries.ts`/`hooks.ts`: `useInfiniteProjects` 동일 패턴
- `packages/api/src/blog/queryKeys.ts`/`project/queryKeys.ts`: `infinite(params)` 키 추가

**검증**: `pnpm --filter @ddd/api typecheck` 통과 + 테스트 페이지에서 호출 시 타입 에러 없음.

---

### Phase 3 — 토스트 패턴 가이드 문서화 ▶ 독립

**목표**: HeroUI v3 토스트 사용 규약을 문서로 고정해 향후 작업이 일관되도록 한다.

**변경**
- `docs/admin-toast.md` 신규 작성 — 다음 항목 포함
  - `<Toast.Provider />` 마운트 위치 (`main.tsx`)
  - `import { toast } from "@heroui/react"` 단일 import 규칙
  - `toast.success(title, { description })` / `toast.error` / `toast.info` 사용 예
  - 표준 메시지 가이드 (성공: "X가 저장되었습니다", 실패: 백엔드 메시지 우선)
  - 실패 처리 시 `(error as Error).message` fallback 패턴
- `apps/admin/CLAUDE.md` — "주요 기술 결정" 또는 "UI 컴포넌트 작업 규칙" 섹션에 한 줄 추가:
  > 토스트 사용 패턴은 [docs/admin-toast.md](../../docs/admin-toast.md) 참조.
- (선택) `.claude/skills/admin-toast/SKILL.md` — 프론트 작업 시 자동 트리거되는 스킬 파일

**검증**: `apps/admin/CLAUDE.md`에서 상대경로 링크 클릭 가능, `docs/admin-toast.md`만 보고도 사용 패턴 재현 가능.

---

### Phase 4 — Projects 페이지 컴포넌트 분해 ▶ Phase 1, 2

**목표**: 한 파일 거대 컴포넌트를 SRP로 쪼갠다.

**변경**
- `components/ProjectsToolbar.tsx`
  - props: `searchText`, `onSearchTextChange`, `platform`, `onPlatformChange`, `cohortId`, `onCohortChange`, `cohorts`
- `components/ProjectsTable.tsx`
  - props: `projects`, `cohortById`, `onEdit(id)`, `onDelete(id)`
  - 컬럼: 썸네일 / 서비스명 / 플랫폼(태그) / 기수 / 한줄설명 / 참여자(N명) / 액션

**검증**: 단순 마운트 → 콘솔 에러 없음.

---

### Phase 5 — ProjectsPage 본체 재작성 ▶ Phase 4

**목표**: legacy `useQuery(api.get...)` 제거, infinite + cohorts 통합.

**변경**
- `useInfiniteProjects({ params: { platform: serverPlatform, limit: 20 } })`
- `useCohorts()` → `cohortById` Map 생성
- 클라이언트 필터: `(p) => p.name.includes(search) && (cohortId === 'ALL' || p.cohortId === cohortId)`
- 더 보기 버튼: `<Button onPress={() => fetchNextPage()} isDisabled={!hasNextPage || isFetchingNextPage}>`

**검증**: dev 서버 `/projects` 진입 시 빈 상태/로딩 상태/오류 상태 노출 정상.

---

### Phase 6 — ProjectFormDrawer 구현 ▶ Phase 2, 3, 5

**목표**: 등록/수정 통합 Drawer 구현.

**스키마 (Zod, 인라인)**
```ts
const projectFormSchema = z.object({
  cohortId: z.number().int().positive(),
  platforms: z.array(z.enum(['IOS','AOS','WEB'])).min(1),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(200),
  thumbnailUrl: z.string().url().optional(),
  members: z.array(z.object({
    name: z.string().min(1),
    part: z.enum(['PM','PD','BE','FE','IOS','AOS']),
    review: z.string().optional(),
  })).default([]),
})
```

**변경**
- HeroUI `Drawer.*` + `Form` + `TextField` + `Select` (multi platforms는 체크박스 그룹 또는 `Select` 다중선택)
- 썸네일: 클릭 → `<input type="file">`, 변경 시 `useUploadFile` 즉시 업로드 → `thumbnailUrl` setValue
- 참여자: `useFieldArray` + "참여자 추가" 버튼
- 저장: `mode === 'create' ? useCreateProject() : useUpdateProject()`
- 성공: `toast.success("프로젝트가 저장되었습니다")` + invalidate + close
- 실패: `toast.error((e as Error).message ?? "저장 실패")`

**검증**: 신규 등록 → 목록에 즉시 반영, 수정 → 기존 값 prefill, 업로드 진행 중 spinner.

---

### Phase 7 — DeleteProjectDialog ▶ Phase 3

**목표**: HTML의 confirm 모달을 HeroUI `AlertDialog`로.

**변경**
- HeroUI `AlertDialog` (제목 "프로젝트 삭제", 설명 "삭제된 프로젝트는 복구되지 않습니다")
- confirm → `useDeleteProject().mutateAsync({ params: { id } })`
- 성공: `toast.success("삭제되었습니다")` + invalidate
- 실패: `toast.error(...)`

**검증**: 삭제 후 row 사라짐, 카운트 갱신.

---

### Phase 8 — BlogPosts 페이지 컴포넌트 분해 ▶ Phase 1, 2

**목표**: Projects와 동일하게 SRP 분리.

**변경**
- `components/BlogPostsToolbar.tsx`: 제목 검색 Input
- `components/BlogPostsTable.tsx`: 썸네일 / 제목 / 본문일부 / 링크(외부) / 등록일 / 액션

**검증**: 마운트 정상.

---

### Phase 9 — BlogPostsPage 본체 재작성 ▶ Phase 8

**목표**: `useInfiniteBlogPosts` + 클라이언트 검색 + 더보기.

**변경**
- `useInfiniteBlogPosts({ params: { limit: 20 } })`
- 검색: `posts.filter(p => p.title.includes(search))`
- 더 보기 버튼

**검증**: dev 서버 `/blog-posts` 진입 정상.

---

### Phase 10 — BlogPostFormDrawer + DeleteBlogPostDialog ▶ Phase 2, 3, 9

**목표**: 등록/수정 + 삭제 모달.

**스키마**
```ts
const blogPostFormSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  thumbnail: z.string().url().optional(),
  externalUrl: z.string().url(),
})
```

**변경**
- 폼 필드: 썸네일 업로드 (`category: 'blog-thumbnail'`), 제목, 본문일부 textarea, 외부링크 input
- 저장: create/update 분기, toast, invalidate
- 삭제: AlertDialog 동일 패턴

**검증**: 신규/수정/삭제 동작.

---

### Phase 11 — progress.md 갱신 + 회귀 검증 ▶ 전 단계

**목표**: 문서 동기화 + 전체 검증.

**변경**
- `progress.md` 3.4·3.5 섹션의 ⬜/🔧 항목 갱신, "한눈에 보기" 표 갱신
- (이미 Phase 0에서 추가한) HTML 레퍼런스 가이드 섹션 점검
- 검증 명령
  - `pnpm --filter @ddd/api typecheck`
  - `pnpm --filter @ddd/admin lint`
  - `pnpm --filter @ddd/admin build` (또는 `dev` 후 페이지 진입 확인)

**검증**: 명령어 모두 0-exit, 두 페이지 정상 렌더.

## 6. 위험 요소 / 미정 사항

- **백엔드 cursor 페이지네이션 실제 응답 검증**: orval 타입은 `nextCursor`, `hasMore` 필드를 반환한다고 가정. 실 API 응답이 다르면 `getNextPageParam` 조정 필요.
- **`useUploadFile` 응답이 즉시 사용 가능한 절대 URL인지** vs presigned PUT 응답인지 여부 확인 필요. `FileUploadDto.url`을 그대로 `thumbnailUrl`에 매핑한다고 가정.
- **HeroUI v3 `AlertDialog`/`Drawer` props 시그니처**: `docs/hero-ui.txt` 우선 참조하여 실제 사용 가능한 API 확인.
- **무한스크롤에서 클라이언트 필터링 한계**: 검색어가 매우 좁을 때 모든 페이지를 다 로드해도 결과가 없을 수 있음. 향후 백엔드 검색 파라미터 추가 시 자동 마이그레이션 가능하도록 훅 시그니처 유지.

## 7. 후속 작업 (이번 스코프 외)

- `apps/web` `/projects/[id]`, `/blog/[id]` 라우트 SSG 연결
- 프로젝트 PDF 업로드(`pdfUrl` + `category: 'project-pdf'`) — Drawer에 추가
- cohort 단일 조회·생성 어드민 워크플로 (이미 별도 페이지 존재)
