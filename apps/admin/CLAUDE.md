# apps/admin — 어드민 앱 개발 가이드

DDD 동아리 운영진용 어드민 페이지. Vite + React 19, Tailwind CSS 4, React Router(Data Mode), HeroUI v3 기반.

> 기능 명세 대비 구현 체크리스트는 루트의 **[tasks/checklist.md](../../tasks/checklist.md)** 를 참조한다.

---

## 디렉터리 구조 (FSD 기반)

```
src/
├── app/                        # 앱 초기화 레이어
│   └── providers/
│       ├── QueryProvider.tsx   # TanStack Query Provider
│       └── ThemeProvider.tsx   # 전역 테마 Provider + useTheme 훅
│
├── pages/                      # 페이지 레이어 (라우트 1:1 대응, 주요 feature 단위)
│   ├── index.tsx               # 라우터 설정 (createBrowserRouter)
│   ├── login/
│   ├── sign-up/
│   ├── applications/
│   ├── semesters/
│   ├── reminders/
│   ├── projects/
│   ├── blog-posts/
│   └── error/
│
├── widgets/                    # 복합 UI 블록 레이어 (페이지 간 공유)
│   ├── navigation/
│   │   ├── SideBar.tsx         # 데스크톱 사이드바
│   │   ├── MobileHeader.tsx    # 모바일 상단 헤더
│   │   ├── constants.ts        # 메뉴 아이템 정의
│   │   └── types.d.ts
│   ├── heading/
│   │   └── index.tsx           # 페이지 헤딩 블록
│   └── admin-layout/
│       └── AdminLayout.tsx     # 뷰포트에 따라 SideBar/MobileHeader + Outlet 구성
│
├── mocks/                      # MSW 목업 환경
│   ├── browser.ts
│   └── handlers.ts
│
└── shared/                     # 순수 공유 자원 레이어
    ├── ui/                     # UI 컴포넌트 (HeroUI 외 커스텀 프리미티브)
    ├── hooks/                  # 범용 훅 (useIsMobile 등)
    └── lib/                    # 유틸 함수 및 상수 (cn, paths, auth)
```

---

## 레이어 규칙

의존성 방향은 **단방향**으로 강제한다.

```
pages → widgets → shared
app   → pages
```

- 각 레이어는 자신보다 **아래** 레이어만 import할 수 있다.
- `shared`는 어떤 레이어도 import하지 않는다.
- `widgets`는 `pages`를 import하지 않는다.

---

## 새 페이지 추가 방법

1. `src/pages/{페이지명}/` 폴더 생성
2. 페이지 컴포넌트 작성 (`{페이지명}Page.tsx`)
3. `src/pages/index.tsx` 라우터에 경로 추가
4. `src/shared/lib/paths.ts`에 경로 상수 추가
5. `src/widgets/navigation/constants.ts`에 메뉴 아이템 추가 (사이드바/모바일 헤더에 노출 시)

### 페이지 slice 내부 구조

현재 어드민 페이지들은 **feature 단위 평탄 구조**를 사용한다. 한 페이지가 다음 파일들로 구성된다.

```
pages/applications/
├── ApplicationsPage.tsx        # 최상위 페이지 컴포넌트
├── index.tsx                   # 외부 노출 배럴
├── components/                 # 이 페이지 전용 하위 컴포넌트 (예: Sections.tsx)
├── constants.ts                # 컬럼/필터/상태 라벨 등 상수
├── mockApi.ts                  # MSW 또는 임시 목업용 fetcher
└── types.d.ts                  # 임시 타입 (추후 `@ddd/api` 생성 타입으로 대체)
```

- 파일이 하나뿐인 단순 페이지(`login`, `error`, `sign-up`)는 `{Feature}Page.tsx`만 두고 세부 폴더를 만들지 않는다.
- 페이지 전용 Drawer/Modal 등 큰 서브 컴포넌트는 페이지 루트(`SemesterRegisterDrawer.tsx`) 또는 `components/` 하위에 둔다.

---

## UI 컴포넌트 작업 규칙

**기본 원칙**: 새로운 컴포넌트는 **HeroUI v3을 직접 import하여 사용**한다.

> UI 컴포넌트를 **생성 / 수정 / 삭제 / 교체**하는 작업을 수행하기 전에는 반드시 루트의 **[docs/hero-ui.txt](../../docs/hero-ui.txt)** 를 먼저 참조하여, 사용 가능한 컴포넌트·props·패턴을 확인한다. (본 문서의 요약 목록은 참고용이며, 세부 API는 `docs/hero-ui.txt` 를 단일 출처로 삼는다.)

### shared/ui에만 배치하는 컴포넌트

| 경로                         | 용도                       | 비고                             |
| ---------------------------- | -------------------------- | -------------------------------- |
| `shared/ui/FlexBox.tsx`      | flex 레이아웃 유틸         | Tailwind 직접 사용으로 대체 가능 |
| `shared/ui/GridBox.tsx`      | grid 레이아웃 유틸         | Tailwind 직접 사용으로 대체 가능 |
| `shared/ui/DDDLogo.tsx`      | DDD 정적 로고              | 커스텀 구현                      |
| `shared/ui/DDDAnimated.tsx`  | DDD 브랜드 로고 애니메이션 | 커스텀 구현                      |
| `shared/ui/GoogleButton.tsx` | Google 로그인 버튼         | 커스텀 구현                      |

### HeroUI v3에서 직접 import하는 컴포넌트

일반적인 UI 컴포넌트는 **`@heroui/react`에서 직접 import**한다:

```tsx
// ❌ 이전 방식 (사용금지)
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"

// ✅ 현재 방식 (권장)
import { Button, Input, Card, Drawer, Table, Tabs } from "@heroui/react"
```

**HeroUI v3 컴포넌트 목록** (자주 사용되는 것들):

- **기본**: Button, Input, TextArea, Checkbox, Radio, Switch, Label
- **선택**: Select, ComboBox, Autocomplete
- **폼**: Form, Fieldset, TextField (복합 필드)
- **레이아웃**: Card (CardHeader, CardBody, CardFooter), Drawer (DrawerContent 등)
- **테이블**: Table (TableHeader, TableBody, TableColumn, TableRow, TableCell)
- **탭**: Tabs (Tab)
- **모달**: Modal, AlertDialog
- **기타**: Tooltip, Badge, Pagination, Spinner, ProgressBar

### shared/hooks와 shared/lib

| 경로                          | 용도                       |
| ----------------------------- | -------------------------- |
| `shared/hooks/useIsMobile.ts` | 모바일 뷰포트 감지 훅      |
| `shared/lib/cn.ts`            | clsx + tailwind-merge 유틸 |
| `shared/lib/paths.ts`         | 라우트 경로 상수           |
| `shared/lib/auth.ts`          | 인증 체크 로더 유틸 (TODO) |

---

## 주요 기술 결정

- **라우터**: React Router Data Mode (`createBrowserRouter`) — loader로 페이지 진입 전 데이터 페칭
- **스타일링**: Tailwind CSS 4 + `cn()` 유틸
- **UI 라이브러리**: `@heroui/react` v3 (React Aria Components 기반)
- **아이콘**: `@hugeicons/react`
- **테마**: `ThemeProvider` — localStorage 유지, `d` 키로 토글, 다크/라이트/시스템 지원
- **API**: `@ddd/api` 패키지에서 import, `main.tsx`에서 `configureApi()` 초기화

---

## HeroUI v3 개발 가이드

새로운 컴포넌트나 UI 작업을 할 때는 로컬의 **[docs/hero-ui.txt](../../docs/hero-ui.txt)** 를 우선 참조한다. (이전에 사용하던 HeroUI MCP 대신 이 파일을 단일 출처로 삼는다.)

### 작업 순서

1. **컴포넌트 확인**: 필요한 HeroUI v3 컴포넌트가 있는지 `docs/hero-ui.txt` 에서 검색
2. **문서 조회**: 해당 컴포넌트의 props·slots·compound 구조를 `docs/hero-ui.txt` 에서 확인
3. **구현**: HeroUI의 compound component 패턴 및 props 활용
4. **스타일링**: Tailwind CSS + `cn()` 유틸로 커스터마이징

### 자주 사용되는 패턴

#### Compound Components (조합형)

HeroUI v3는 compound component 패턴을 사용한다:

```tsx
import { Card, Drawer, Table, Tabs } from "@heroui/react"

// Card 예시
<Card>
  <Card.Header>제목</Card.Header>
  <Card.Body>본문</Card.Body>
  <Card.Footer>푸터</Card.Footer>
</Card>

// Table 예시
<Table>
  <Table.Header>
    <Table.Column>컬럼명</Table.Column>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>셀 데이터</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>

// Tabs 예시
<Tabs>
  <Tab key="tab1" title="탭1">내용1</Tab>
  <Tab key="tab2" title="탭2">내용2</Tab>
</Tabs>
```

#### Form 필드

폼 작업은 HeroUI의 Form, Fieldset, TextField, Label을 조합:

```tsx
import { Form, Fieldset, TextField, Label } from "@heroui/react"

<Form>
  <Fieldset>
    <TextField name="username" type="text" required>
      <Label>사용자명</Label>
      <Input />
    </TextField>
  </Fieldset>
</Form>
```

## 기능 개발 현황

기수 관리 / 사전 알림 / 지원자 / 프로젝트 / 블로그 / SEO 등 영역별 구현 상태는 루트의 **[tasks/checklist.md](../../tasks/checklist.md)** 에서 관리한다. 본 문서에는 중복 기재하지 않는다.
