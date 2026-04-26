---
description: "api-scaffold 에이전트로 도메인별 api/types/queries/queryKeys/hooks 파일을 생성/최신화"
argument-hint: "[도메인 이름 또는 generated 폴더명 (선택, 비우면 전체)]"
allowed-tools: Task
---

# API 스캐폴딩

`packages/api/src/generated/` 의 orval 산출물을 기반으로 도메인별 API 모듈(`api.ts`, `types.ts`, `queryKeys.ts`, `queries.ts`, `hooks.ts`)을 생성/최신화한다.

## 동작

`api-scaffold` 서브에이전트를 호출한다. 에이전트는 다음을 수행한다:

1. `pnpm gen:api` 실행으로 OpenAPI → orval 코드 최신화
2. `packages/api/src/generated/{domain}/` 와 `dddApi.schemas.ts` 분석
3. `packages/api/src/{domain}/` 5개 파일 생성
   - 신규 파일: 즉시 생성
   - 기존 파일: 사용자에게 덮어쓰기 여부 확인 (`Overwrite` / `Skip` / `Overwrite all` / `Skip all`)

## 입력

- 인자: `$ARGUMENTS`
  - 비어 있으면 `packages/api/src/generated/` 의 모든 도메인 처리
  - 특정 도메인명(예: `cohort`, `admin-cohort`, `application`)이 주어지면 해당 도메인만 처리

## 행동 규칙

- 반드시 `api-scaffold` 서브에이전트를 호출하고, 메인 컨텍스트에서 직접 파일을 만들지 않는다
- 에이전트 실행 후 어떤 파일이 생성/덮어쓰기/스킵되었는지 한국어로 요약 보고한다
