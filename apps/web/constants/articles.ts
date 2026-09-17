/**
 * `/blog` 목록의 한 페이지 크기.
 *
 * 서버에서 그리는 1페이지와 브라우저에서 커서로 넘기는 2페이지 이후가 반드시 같은 값을
 * 써야 한다. 다르면 "이전" 으로 돌아온 1페이지가 처음 본 1페이지와 달라진다.
 */
export const ARTICLE_LIST_PAGE_SIZE = 4;

export type ArticleItem = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  externalUrl: string;
};
