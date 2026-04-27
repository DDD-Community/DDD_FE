---
name: admin-toast
description: |
  apps/admin에서 사용자 알림(토스트)을 추가/수정할 때 자동 호출되는 스킬.
  HeroUI v3의 `toast.success/error/info/warning` 단일 패턴을 강제하고,
  사용 시점/메시지/실패 처리 방식을 일관되게 유지한다.

  사용 시점:
  - 어드민 페이지(`apps/admin/src/pages/**`)에 `toast` 호출을 추가/수정할 때
  - mutation(저장/수정/삭제) 성공/실패 알림을 작성할 때
  - 일괄 액션(예: 전체 발송)의 결과를 알릴 때
  - 새 라이브러리(sonner, react-hot-toast 등) 도입을 검토할 때 → 도입 차단

  예: "프로젝트 등록 성공 시 토스트 띄워줘", "삭제 실패 처리 추가",
      "어드민에 sonner 깔아줄까?" (이 경우 본 스킬이 거부 사유와 표준 대안을 안내)
---

## 단일 출처

상세 가이드는 **[`docs/admin-toast.md`](../../../docs/admin-toast.md)** 를 단일 출처로 한다.
본 스킬은 작업 시 자동 환기시킬 핵심 규약 요약본이다.

## 핵심 규약

1. **import 단일 형태**
   ```tsx
   import { toast } from "@heroui/react"
   ```
   대문자 `Toast`는 Provider 컴포넌트, 소문자 `toast`만 명령형 호출.

2. **Provider는 main.tsx에 한 번만**
   `apps/admin/src/main.tsx`의 `<Toast.Provider placement="top end" />`를
   페이지/컴포넌트에서 중복 마운트하지 않는다.

3. **메서드 매핑**
   | 메서드 | 용도 |
   | --- | --- |
   | `toast.success` | 저장/생성/삭제/발송 등 액션 성공 |
   | `toast.error` | API 실패, 검증 실패, 네트워크 오류 |
   | `toast.info` | 단순 안내 |
   | `toast.warning` | 비파괴 경고 |

4. **두 줄 메시지 구조**
   ```tsx
   toast.success("제목 (액션 결과)", { description: "보충 한 문장" })
   ```

5. **실패 처리 정형 패턴**
   ```tsx
   try {
     await mutateAsync(...)
     queryClient.invalidateQueries({ queryKey: <도메인>Keys.all })
     toast.success("저장되었습니다", { description: "..." })
   } catch (error) {
     toast.error("저장에 실패했습니다", {
       description: (error as Error).message,
     })
   }
   ```

## 금지 사항 (Anti-pattern)

- ❌ 페이지마다 `<Toast.Provider />` 중복 마운트
- ❌ `alert()`, `window.confirm()` 사용 (대신 `toast` + HeroUI `AlertDialog`)
- ❌ 외부 토스트 라이브러리 도입(`sonner`, `react-hot-toast`, 자체 구현)
- ❌ 에러를 swallowing하고 success만 알림 → catch에서 반드시 `toast.error`
- ❌ 백엔드 raw stack/내부 코드 노출 — 사용자 친화적 문구로 정제

## 작업 절차

1. 어드민 페이지에 토스트가 필요하면, 본 스킬 → `docs/admin-toast.md` 순으로 표준 확인.
2. mutation 흐름이면 try/catch + invalidate + toast 3종 세트로 작성.
3. 메시지는 어드민 표준 표(`docs/admin-toast.md` §3)을 우선 참조.
4. 외부 라이브러리 도입 요청은 "표준 패턴이 이미 존재함"을 안내하고 거절한다.

---

**마지막 수정**: 2026-04-26
