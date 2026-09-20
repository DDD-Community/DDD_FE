/*
  커서 목록을 끝까지 걸어 전부 모은다.

  BE 커서에 버그가 있어서 목록 페이지들이 이걸 쓴다 — 정렬이 `..., createdAt, id` 인데
  WHERE 절이 `id` 를 빼고 비교해서, `createdAt` 이 같은 행 묶음이 페이지 경계에 걸리면
  그 나머지가 통째로 건너뛰어진다. 프로젝트 목록은 실제로 `limit=9` 로 훑으면 23개 중
  21개만 나오고 `limit=4` 면 18개까지 떨어졌다. 초기 데이터 8개가 같은 타임스탬프로
  한꺼번에 들어간 탓이다.

  커서를 안 쓰는 첫 요청만 항상 정확하므로, 호출부는 `limit` 을 BE 최댓값(100)으로 줘서
  **한 번에 끝나게** 한다. 그러면 이 함수는 사실상 요청 1번이고 루프는 돌지 않는다.
  100개를 넘어 어쩔 수 없이 커서를 타게 되면 그 경계에서 같은 누락이 재발할 수 있으므로
  조용히 틀리지 않도록 경고를 남긴다.

  BE 가 커서 비교에 `id` 를 포함하도록 고치면 이 파일을 지우고 각 목록을 원래의 커서
  페이지네이션으로 되돌린다.
*/

/** BE 가 받아주는 `limit` 최댓값. 101 부터 400 "허용된 최댓값보다 큽니다" 가 온다. */
export const MAX_LIMIT = 100;

/** 커서를 이어 타는 횟수 상한. 같은 커서를 계속 돌려주는 BE 를 만나도 멈추게 하는 안전장치다. */
const MAX_PAGES = 20;

export async function fetchAllPages<T>(
  fetchPage: (cursor?: string) => Promise<{ items: T[]; nextCursor: string | null }>,
  logLabel: string,
): Promise<T[]> {
  const collected: T[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { items, nextCursor } = await fetchPage(cursor);
    collected.push(...items);

    if (!nextCursor) return collected;
    cursor = nextCursor;
    console.warn(
      `[${logLabel}] 한 번에 받을 수 있는 최대치를 넘어 커서를 이어 탄다. ` +
        "BE 커서 버그가 남아 있으면 이 경계에서 항목이 누락될 수 있다.",
    );
  }

  console.error(`[${logLabel}] 커서를 ${MAX_PAGES}번 이어 탔는데도 끝나지 않았다. 여기서 멈춘다.`);
  return collected;
}
