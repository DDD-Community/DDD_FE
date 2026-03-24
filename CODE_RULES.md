# 코드 규약 및 철학 (Code Rules & Philosophy)

## 1. 목적 및 핵심 철학

- 본 문서는 프로젝트의 실행 규약이자 코드 작성 철학을 담은 문서이다.
- 구현, 리뷰, 테스트, PR 승인 판단은 모두 본 문서를 기준으로 한다.

**[ 7대 핵심 개발 철학 ]**

1. **return 연산 제한**: `return`문에는 연산이나 복잡한 식을 최대한 배제하고 읽기 깔끔하게 작성한다.
2. **코드 흐름 (Top-Down)**: 코드는 고수준(정책)에서 저수준(구현 세부사항) 순서로 읽기 쉽게 작성한다.
3. **선언적 조건문**: 제어문(`if`)이 복잡해질 경우 가독성을 위해 맵 기반 분기 (lookup table)를 적극 활용한다.
4. **화살표 함수 지향**: 가독성이 명백한 경우 일반 `function` 대신 `const` 화살표 함수로 개발한다.
5. **Self-Documenting Code**: 코드를 설명하는 주석(어떻게 동작하는지)은 배제하고, 명확한 네이밍으로 표현한다. (단, 도메인 용어나 비즈니스 로직 상 영어로 설명하기 너무 어렵거나 의미가 퇴색되는 경우, 과감히 **한글 변수명이나 Enum 값**을 사용하는 것을 허용한다.)
   - **축약어 지양**: 변수명은 의미를 알 수 없는 축약어(예: `m`, `app`, `req`) 대신 의도가 명확히 드러나는 풀네임(예: `member`, `application`, `request`)을 지향한다.
6. **복잡한 합성 타입 배제**: `Pick`, `Omit` 등이 과도하게 얽힌 어려운 유틸리티 합성 타입 사용을 지양한다.
7. **관심사 분리**: 각 함수/모듈/컴포넌트는 단일 책임을 가지며, 역할이 섞이지 않도록 관심사를 철저히 분리한다.

---

## 2. 규칙 레벨

- `MUST`: 반드시 준수
- `SHOULD`: 특별한 이유가 없으면 준수

## 3. MUST 규칙

### 3.1 프로젝트 구조

1. **패키지 의존성**: 의존 방향은 앱에서 패키지로만 허용한다. (`apps/*` → `packages/ui`)
2. **공통 컴포넌트**: 여러 앱에서 사용하는 컴포넌트는 `@ddd/ui`에 작성한다.
3. **앱 전용 컴포넌트**: 특정 앱에서만 사용하는 컴포넌트는 해당 앱의 `components/`에 작성한다.

### 3.2 React 컴포넌트

1. **컴포넌트 분리 기준**: 컴포넌트는 재사용 가능성, 복잡도, 관심사에 따라 적절히 분리한다.
2. **Props 타입 정의**: 컴포넌트 Props는 `interface`로 정의하고, 컴포넌트명 + `Props` 형식을 따른다.
   ```tsx
   interface ButtonProps {
     variant: "primary" | "secondary";
     children: React.ReactNode;
   }
   ```
3. **컴포넌트 선언**: 화살표 함수로 선언하고, `export`는 named export를 기본으로 한다.
   ```tsx
   export const Button = ({ variant, children }: ButtonProps) => {
     return <button className={cn(buttonVariants({ variant }))}>{children}</button>;
   };
   ```

### 3.3 커스텀 훅

1. **네이밍**: 커스텀 훅은 `use` 접두사를 사용한다. (예: `useAuth`, `useMember`)
2. **단일 책임**: 하나의 훅은 하나의 관심사만 다룬다.
3. **반환값**: 객체 구조 분해가 가능하도록 객체로 반환한다.

   ```tsx
   const useAuth = () => {
     const [user, setUser] = useState<User | null>(null);
     const isAuthenticated = user !== null;

     return { user, isAuthenticated, setUser };
   };
   ```

### 3.4 상태 관리

1. **로컬 상태 우선**: 가능한 컴포넌트 로컬 상태(`useState`)를 우선 사용한다.
2. **Props Drilling 회피**: 3단계 이상 props가 전달되면 Context 또는 상태 관리 라이브러리 도입을 검토한다.
3. **서버 상태 분리**: API 응답 데이터(서버 상태)와 UI 상태는 명확히 구분한다.

### 3.5 스타일링 (Tailwind CSS)

1. **클래스 병합**: 조건부 클래스 조합은 `cn()` 유틸리티(`clsx` + `tailwind-merge`)를 사용한다.
2. **컴포넌트 변형**: 복수의 variant가 있는 컴포넌트는 `cva()`(class-variance-authority)로 정의한다.
3. **디자인 토큰**: 색상, 타이포그래피, 스페이싱은 `@ddd/ui/tokens`에 정의된 Tailwind 테마 값을 사용한다. 임의의 하드코딩 값(`text-[13px]`, `bg-[#fff]`) 사용을 지양한다.

   ```tsx
   const buttonVariants = cva("rounded font-medium", {
     variants: {
       variant: {
         primary: "bg-primary text-primary-foreground",
         secondary: "bg-secondary text-secondary-foreground",
       },
     },
   });

   export const Button = ({ variant, className, ...props }: ButtonProps) => {
     return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
   };
   ```

### 3.6 API 통신

1. **타입 정의**: API 요청/응답 타입은 명시적으로 정의한다.
2. **에러 처리**: API 호출 시 에러 상황을 반드시 처리한다.
3. **로딩 상태**: 비동기 작업 시 로딩 상태를 사용자에게 표시한다.

### 3.7 코드 작성 (TypeScript)

1. **타입 안정성**: `any`는 금지하고 `unknown` + 타입 가드로 타입을 안전하게 좁힌다.
2. **매직 넘버/스트링**: 의미를 알 수 없는 숫자나 문자열은 상수 또는 Enum으로 분리한다.
3. **Null 체크**: Optional Chaining(`?.`)과 Nullish Coalescing(`??`)을 적절히 활용한다.

### 3.8 테스트

1. **컴포넌트 테스트**: 사용자 상호작용 중심으로 테스트를 작성한다.
2. **훅 테스트**: 커스텀 훅은 `@testing-library/react`의 `renderHook`을 사용한다.
3. **버그 수정 시**: 해당 버그를 재현하고 검증하는 회귀 테스트를 추가한다.

---

## 4. SHOULD 규칙

### 4.1 성능

1. **메모이제이션**: `useMemo`, `useCallback`은 실제 성능 문제가 있을 때만 사용한다.
2. **번들 크기**: 불필요한 의존성 추가를 지양하고, tree-shaking을 고려한다.

### 4.2 접근성

1. **시맨틱 HTML**: 적절한 HTML 요소를 사용한다. (`<button>`, `<nav>`, `<main>` 등)
2. **키보드 접근성**: 인터랙티브 요소는 키보드로 접근 가능해야 한다.
3. **대체 텍스트**: 이미지에는 의미 있는 `alt` 텍스트를 제공한다.

---

## 5. PR 체크리스트

- [ ] 컴포넌트가 단일 책임 원칙을 따르는가? (관심사 분리)
- [ ] 공통으로 사용될 컴포넌트가 `@ddd/ui`에 있는가?
- [ ] `any`, 어려운 `Pick/Omit` 합성 구조, 코드를 설명(번역)하는 주석이 없는가?
- [ ] `return` 문 안에 복잡한 연산이 숨어있진 않은가?
- [ ] 하드코딩된 스타일 값 없이 디자인 토큰을 사용했는가?
- [ ] API 에러 상황과 로딩 상태를 적절히 처리했는가?
