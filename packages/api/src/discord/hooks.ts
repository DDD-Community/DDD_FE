import { useQuery } from "@tanstack/react-query";
import { discordQueries } from "./queries";
import type {
  GetDiscordAuthorizeUrlParams,
  GetDiscordLinkParams,
} from "./types";

/**
 * Discord 인증 URL 조회 훅
 *
 * @param {GetDiscordAuthorizeUrlParams} params - 조회 파라미터
 * @param {string} params.applicationFormId - 지원서 ID
 *
 * @example
 * const { data: authorizeUrl, isLoading } = useDiscordAuthorizeUrl({ params: { applicationFormId: 'form-uuid-123' } })
 */
export const useDiscordAuthorizeUrl = ({
  params,
}: {
  params: GetDiscordAuthorizeUrlParams;
}) => useQuery(discordQueries.getAuthorizeUrl({ params }));

/**
 * Discord 연동 정보 조회 훅
 *
 * @param {GetDiscordLinkParams} params - 조회 파라미터
 * @param {string} params.applicationFormId - 지원서 ID
 *
 * @example
 * const { data: linkInfo, isLoading } = useDiscordLink({ params: { applicationFormId: 'form-uuid-123' } })
 */
export const useDiscordLink = ({ params }: { params: GetDiscordLinkParams }) =>
  useQuery(discordQueries.getLink({ params }));
