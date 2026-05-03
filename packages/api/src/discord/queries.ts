import { queryOptions } from "@tanstack/react-query";
import { discordAPI } from "./api";
import { discordKeys } from "./queryKeys";
import type { GetDiscordAuthorizeUrlParams, GetDiscordLinkParams } from "./types";

export const discordQueries = {
  /**
   * Discord 인증 URL 조회 쿼리
   *
   * @param {GetDiscordAuthorizeUrlParams} params - 조회 파라미터
   * @param {string} params.applicationFormId - 지원서 ID
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(discordQueries.getAuthorizeUrl({ params: { applicationFormId: 'form-uuid-123' } }))
   */
  getAuthorizeUrl: ({ params }: { params: GetDiscordAuthorizeUrlParams }) =>
    queryOptions({
      queryKey: discordKeys.authorizeUrl(params),
      queryFn: () => discordAPI.getAuthorizeUrl({ params }),
      enabled: !!params.applicationFormId,
    }),

  /**
   * Discord 연동 정보 조회 쿼리
   *
   * @param {GetDiscordLinkParams} params - 조회 파라미터
   * @param {string} params.applicationFormId - 지원서 ID
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   *
   * @example
   * const query = useQuery(discordQueries.getLink({ params: { applicationFormId: 'form-uuid-123' } }))
   */
  getLink: ({ params }: { params: GetDiscordLinkParams }) =>
    queryOptions({
      queryKey: discordKeys.link(params),
      queryFn: () => discordAPI.getLink({ params }),
      enabled: !!params.applicationFormId,
    }),
};
