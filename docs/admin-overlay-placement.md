# 어드민 — 오버레이(Dialog/Modal/Popover) 배치 규칙

> 적용 범위: `apps/admin` (HeroUI v3 = `react-aria-components` 기반)
>
> **결론(한 줄):** portal 기반 오버레이는 `<Table.Body>` · `<ListBox>` · `<GridList>` · `<Menu>` · `<ComboBox>` · `<Select>` 같은 **RAC collection 컨테이너의 children 트리 안에서 렌더하지 않는다.** 행/아이템에서 오버레이를 띄워야 하면, **오버레이는 컬렉션 바깥(섹션/페이지)** 에 두고 어떤 행이 트리거인지는 상태로 위로 올린다 (`useState<Row | null>`).

---

## 1. 문제 정의

`<Table.Body>` 의 children 안에 `AlertDialog` 를 두면, 다이얼로그가 열렸을 때 내부의 HeroUI `Button` 과 `AlertDialog.CloseTrigger` 가 **DOM 에 마운트되지 않고 통째로 사라지는** 현상이 발생한다.

```html
<!-- 실제 렌더 결과 -->
<div class="alert-dialog__footer" data-slot="alert-dialog-footer"></div>
```

같은 footer 안에 plain `<button>` 이나 `<span>` 을 두면 정상 출력된다 → 즉 HeroUI / `react-aria-components` 의 `Button` (= `ButtonPrimitive`) 계열만 선택적으로 사라지는 패턴.

### 재현 (안티패턴)

```tsx
// SemesterTableRow.tsx — 행 컴포넌트 내부에 dialog 를 같이 렌더 ❌
export function SemesterTableRow({ row, ... }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Table.Row>
        ...
        <Button onPress={() => setOpen(true)}>삭제</Button>
      </Table.Row>

      {/* JSX 상으로는 Table.Row 의 형제지만 ... */}
      <DeleteCohortDialog
        cohort={row}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
```

호출부가

```tsx
<Table.Body>
  {rows.map((row) => <SemesterTableRow key={row.id} row={row} />)}
</Table.Body>
```

이므로, 결과적으로 다이얼로그 트리는 **`<Table.Body>` 의 children 트리 내부**에 들어간다.

---

## 2. 원인 — RAC Collection 의 dual-pass 렌더

`react-aria-components` 의 `Table`, `ListBox`, `GridList`, `Menu` 등은 children 을 두 번 traverse 하는 **Collection 시스템** 위에서 동작한다.

1. **Collection build pass** — children 을 가상 트리로 한 번 렌더해 row/column/cell 같은 collection node 정의를 추출. 이 단계는 실제 DOM 이 아니라 **collection 메타데이터를 위한 fake render** 다.
2. **Real render pass** — 추출된 메타데이터로 `<table>` DOM 을 구성하고 row/cell 을 박는다.

`<Table.Body>` children 트리 안에 들어간 `<AlertDialog.Backdrop>` 은 1차 패스의 분석 대상이 된다. 그 내부의 `<Modal>` 은 원래 `document.body` 로 portal 되어야 하지만, collection 의 가상 트리에 끌려가면서 **portal 마운트 타이밍과 Provider 체인이 깨진다**.

그 결과:

- `react-aria-components/Button` (= `ButtonPrimitive`) 은 `useContextProps(props, ref, ButtonContext)` 로 Dialog 가 깔아주는 ButtonContext (close slot 포함) 를 읽어 들이는데, collection 가상 트리에선 그 Provider 체인이 끊겨 있다 → Button 이 그려지지 않음.
- HeroUI `Button` 과 `AlertDialog.CloseTrigger` 는 모두 `ButtonPrimitive` 위에 있는 얇은 래퍼다 → **둘이 동시에 사라지는 증상이 일관되게 설명된다**.
- plain `<button>` / `<span>` 은 RAC 컨텍스트에 의존하지 않으므로 그대로 출력된다.

같은 컴포넌트가 같은 props 로 collection 트리 **밖** 에서는 정상 렌더된다는 점이 이 진단의 결정적 단서다.

---

## 3. 정석 패턴 — Command 호이스팅

오버레이는 **컬렉션 바깥 (섹션/페이지)** 에 1개만 두고, 행은 "이 row 에 대해 삭제하려 한다" 는 의도만 부모로 올린다.

```tsx
// SemesterTableSection/index.tsx
export function SemesterTableSection({ rows, ... }: Props) {
  const [deletingRow, setDeletingRow] = useState<CohortRow | null>(null)

  return (
    <div className="space-y-5">
      ...
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="기수 목록">
            ...
            <Table.Body>
              {filteredRows.map((row) => (
                <SemesterTableRow
                  key={row.id}
                  row={row}
                  onDelete={() => setDeletingRow(row)}   // ← 의도만 위로
                  ...
                />
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {/* ✅ 컬렉션 바깥, 단일 인스턴스 */}
      {deletingRow && (
        <DeleteCohortDialog
          cohort={deletingRow}
          isOpen
          onClose={() => setDeletingRow(null)}
        />
      )}
    </div>
  )
}
```

```tsx
// SemesterTableRow.tsx — useState/DeleteCohortDialog 모두 제거
export function SemesterTableRow({ row, onDelete, ... }: Props) {
  return (
    <Table.Row>
      ...
      <Button size="sm" variant="danger" onPress={onDelete}>
        삭제
      </Button>
    </Table.Row>
  )
}
```

---

## 4. 이 패턴이 원래부터 표준인 다른 이유

오늘의 RAC collection 충돌은 가장 눈에 띄는 증상일 뿐, 행 내부에 모달을 두는 패턴은 이전부터 이미 다음 문제들을 가진다.

1. **N 개의 hidden 모달 트리가 항상 마운트.**
   행 100개 = 닫혀 있는 100개의 dialog 컴포넌트 + `useState × 100` + `useMutation × 100` 이 react-query store 에 등록된다. 리렌더할 때마다 N 번 reconcile.

2. **상태가 행 정체성에 묶임 → 누수.**
   정렬/필터/페이지 이동/`key` 변경으로 행이 unmount → remount 되면 모달 상태도 같이 날아가거나, 다른 row 의 데이터가 모달에 꽂혀 있는 것처럼 보인다. 부모로 들어올리면 데이터 자체가 source of truth 가 된다.

3. **focus trap / Escape / scroll lock 의 N 중첩.**
   포털·focus trap 류는 단일 인스턴스를 가정하는 경우가 많다. 닫힌 다이얼로그 N 개가 마운트돼 있으면 stack 관리가 묘하게 꼬인다.

4. **virtualization / 가상 스크롤과 충돌.**
   viewport 안의 행만 마운트되는 구조에서는 viewport 바깥 행의 모달은 아예 마운트되지 않는다.

5. **mutation / toast 분산.**
   N 개로 분산된 mutation 훅은 race · 중복 toast · 중복 invalidate 의 원인이 된다. 한 곳에 모으면 한 번에 한 mutation, 일관된 UX.

번들 크기는 사실상 부수 이유다 — 진짜 비용은 위 1~5 번이고, 이번 이슈는 (4) 가 RAC Collection 차원에서 폭발한 케이스다.

---

## 5. 적용 범위

같은 함정이 적용되는 RAC collection 컨테이너:

- `<Table.Body>` (이번 케이스)
- `<ListBox>`, `<GridList>`, `<Menu>` 의 아이템 트리
- `<ComboBox>`, `<Select>` 의 옵션 트리

이 컨테이너의 children 트리 안에 `Dialog` / `AlertDialog` / `Drawer` / `Modal` / `Popover` 를 두지 말고, 트리거에서 의도만 위로 올린다.

---

## 6. 예외 — 행과 함께 두는 게 자연스러운 inline UI

다음은 trigger element 와 **시각적·논리적으로 강결합** 되어야 하므로 행 내부에 두는 게 자연스럽다.

- `Tooltip` (트리거 hover/focus 와 강결합)
- 행 안의 inline edit popover (트리거 셀 위치에 anchor)
- 행 안의 dropdown menu (트리거 버튼 위치에 anchor)

다만 위 (1)~(5) 비용은 그대로 적용되므로, 행 수가 많아질수록 비용이 누적된다는 점은 인지하고 있어야 한다.
