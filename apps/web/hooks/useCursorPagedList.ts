"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
  커서 페이지네이션 목록의 페이지 이동·캐시·페이지 수 파악을 한곳에서 맡는다.

  BE 는 전체 개수를 주지 않고 `nextCursor` 하나만 준다. 그래서 "지금 페이지 + 한 칸"
  까지만 그리면 3페이지에 글이 있어도 2페이지에 들어가야만 3이 나타난다. 커서는 앞에서
  뒤로만 이어지니 페이지 수를 알아내는 길은 체인을 실제로 한 번 걸어보는 것뿐이다.

  그래서 첫 페이지를 그린 뒤 배경에서 나머지 체인을 마저 걷는다. 끝까지 걸으면
  `pages.length` 가 곧 전체 페이지 수라 번호가 처음부터 다 보이고, 걸으면서 받아둔
  페이지가 그대로 캐시라 번호를 눌렀을 때 요청 없이 즉시 바뀐다.

  필터(탭)마다 체인을 따로 들고 캐시한다. 한 번 본 탭으로 돌아오는 건 요청이 0번이다.
*/

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};

type Chain<T> = {
  /** 1페이지부터 순서대로 이어붙인 페이지들. 커서는 앞에서 뒤로만 가므로 중간은 비지 않는다. */
  pages: Array<CursorPage<T>>;
  /** 마지막 페이지까지 확인했는지. true 면 `pages.length` 가 곧 전체 페이지 수다. */
  isComplete: boolean;
};

type State<T> = {
  /** 필터별 체인 캐시. 키는 `filterKey`. */
  chains: Record<string, Chain<T>>;
  pageIndex: number;
  hasError: boolean;
};

type Options<T> = {
  /**
   * 목록의 내용을 통째로 바꾸는 값(탭 등). 이 값이 바뀌면 체인을 갈아끼우고 1페이지로 간다.
   * `fetchPage` 도 반드시 같이 바뀌어야 한다 — 키와 요청이 어긋나면 남의 탭 결과가 캐시된다.
   */
  filterKey: string;
  /** 참조가 안정적이어야 한다(`useCallback`). 바뀌는 순간 체인을 다시 걷기 때문이다. */
  fetchPage: (cursor: string | null) => Promise<CursorPage<T>>;
  /** 서버에서 그려 내려온 1페이지. 하이드레이션 직후 같은 요청을 다시 보내지 않게 한다. */
  initialChain?: { filterKey: string; page: CursorPage<T> };
  /** 사용자가 보지도 않은 페이지를 배경에서 미리 걸어둘 상한. */
  backgroundPageLimit?: number;
  /** 콘솔 로그 앞에 붙일 이름. 어느 목록이 실패했는지 구분한다. */
  logLabel: string;
};

/**
 * 배경으로 미리 걸어둘 페이지 수 상한.
 *
 * 목록이 길어져도 첫 화면에서 요청이 무한정 나가지 않게 막는다. 상한을 넘은 뒤로는
 * 사용자가 실제로 그 페이지를 눌렀을 때만 한 칸씩 더 간다 — 즉 예전 동작으로 돌아간다.
 */
const DEFAULT_BACKGROUND_PAGE_LIMIT = 20;

export function useCursorPagedList<T>({
  filterKey,
  fetchPage,
  initialChain,
  backgroundPageLimit = DEFAULT_BACKGROUND_PAGE_LIMIT,
  logLabel,
}: Options<T>) {
  const [state, setState] = useState<State<T>>(() => ({
    chains: initialChain
      ? {
          [initialChain.filterKey]: {
            pages: [initialChain.page],
            isComplete: initialChain.page.nextCursor === null,
          },
        }
      : {},
    pageIndex: 0,
    hasError: false,
  }));

  // 필터가 바뀌면 1페이지부터 다시 본다. 효과로 미루면 새 탭에 이전 탭의 페이지 번호가
  // 한 프레임 비치므로, 렌더 중에 바로 맞춘다(React 의 "prop 변화에 state 맞추기").
  const [renderedFilterKey, setRenderedFilterKey] = useState(filterKey);
  if (renderedFilterKey !== filterKey) {
    setRenderedFilterKey(filterKey);
    setState((previous) => ({ ...previous, pageIndex: 0, hasError: false }));
  }

  const chain = state.chains[filterKey];
  const loadedCount = chain?.pages.length ?? 0;
  const { pageIndex } = state;

  /*
    지금 보고 있는 페이지가 아직 체인에 없으면 그게 곧 로딩이다.

    배경에서 뒤 페이지를 걷는 동안에는 화면에 그릴 게 멀쩡히 있으므로 로딩으로 치지
    않는다. 여기서 구분하지 않으면 1페이지를 보는 내내 스켈레톤이 깜빡인다.
  */
  const isAwaitingCurrentPage = pageIndex >= loadedCount;
  const hasBlockingError = state.hasError && isAwaitingCurrentPage;
  const isLoading = isAwaitingCurrentPage && !hasBlockingError;

  /*
    번호로 그릴 수 있는 페이지 수.

    체인을 끝까지 걸었으면 그 길이가 전체 페이지 수다. 아직 걷는 중이면 마지막 페이지의
    `nextCursor` 가 "한 칸 더 있다" 는 것까지는 보장하므로 한 칸을 더한다.
  */
  const pageCount = chain ? chain.pages.length + (chain.isComplete ? 0 : 1) : 1;

  /** 지금 나가 있는 요청의 자리(`필터:이미 받은 페이지 수`). 같은 자리를 두 번 채우지 않는다. */
  const inFlightRef = useRef<string | null>(null);

  useEffect(() => {
    if (chain?.isComplete) return;
    if (state.hasError) return;
    // 상한을 넘었어도 사용자가 그 페이지를 기다리고 있으면 간다. 상한은 배경 선행만 막는다.
    if (loadedCount >= backgroundPageLimit && !isAwaitingCurrentPage) return;

    const slot = `${filterKey}:${loadedCount}`;
    if (inFlightRef.current === slot) return;
    inFlightRef.current = slot;

    const cursor = loadedCount === 0 ? null : (chain?.pages[loadedCount - 1].nextCursor ?? null);

    void (async () => {
      try {
        const page = await fetchPage(cursor);
        setState((previous) => {
          // 기다리는 사이 같은 자리가 이미 채워졌으면 덮어쓰지 않는다.
          const previousChain = previous.chains[filterKey];
          if ((previousChain?.pages.length ?? 0) !== loadedCount) return previous;
          return {
            ...previous,
            chains: {
              ...previous.chains,
              [filterKey]: {
                pages: [...(previousChain?.pages ?? []), page],
                isComplete: page.nextCursor === null,
              },
            },
          };
        });
      } catch (error) {
        // 삼키면 번호만 안 먹는 것처럼 보인다. 어디서 끊겼는지는 콘솔에 남긴다.
        console.error(`[${logLabel}] 페이지를 불러오지 못했다.`, error);
        setState((previous) => ({ ...previous, hasError: true }));
      } finally {
        // 그사이 다른 자리로 넘어갔다면 그쪽 표식을 지우지 않는다.
        if (inFlightRef.current === slot) inFlightRef.current = null;
      }
    })();
  }, [
    filterKey,
    fetchPage,
    chain,
    loadedCount,
    isAwaitingCurrentPage,
    state.hasError,
    backgroundPageLimit,
    logLabel,
  ]);

  const goToPage = useCallback(
    (page: number) => {
      setState((previous) => {
        const targetChain = previous.chains[filterKey];
        const known = targetChain ? targetChain.pages.length + (targetChain.isComplete ? 0 : 1) : 1;
        if (page < 1 || page > known || page - 1 === previous.pageIndex) return previous;
        // 배경 선행이 실패해 멈춰 있었다면 이동을 계기로 다시 시도한다.
        return { ...previous, pageIndex: page - 1, hasError: false };
      });
    },
    [filterKey],
  );

  /** 지금 페이지를 그대로 다시 불러온다. 실패 표시를 지우면 위 효과가 같은 자리를 다시 집는다. */
  const retry = useCallback(() => {
    inFlightRef.current = null;
    setState((previous) => ({ ...previous, hasError: false }));
  }, []);

  return {
    items: chain?.pages[pageIndex]?.items ?? [],
    currentPage: pageIndex + 1,
    pageCount,
    isLoading,
    hasError: hasBlockingError,
    goToPage,
    retry,
  };
}
