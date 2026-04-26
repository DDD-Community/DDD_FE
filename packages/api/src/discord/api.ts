import { apiFetch } from "../client";
import type {
  GetDiscordAuthorizeUrlParams,
  GetDiscordAuthorizeUrlResponse,
  GetDiscordOauthCallbackParams,
  GetDiscordLinkParams,
  GetDiscordLinkResponse,
} from "./types";

const DISCORD_BASE_URL = "/api/v1/discord" as const;

export const discordAPI = {
  /**
   * Discord 인증 URL 조회
   *
   * @param {GetDiscordAuthorizeUrlParams} params - 조회 파라미터
   * @param {string} params.applicationFormId - 지원서 ID
   *
   * @returns {Promise<GetDiscordAuthorizeUrlResponse>} Discord 인증 URL 응답
   *
   * @example
   * const data = await discordAPI.getAuthorizeUrl({ params: { applicationFormId: 'form-uuid-123' } })
   */
  getAuthorizeUrl: ({ params }: { params: GetDiscordAuthorizeUrlParams }) => {
    const searchParams = new URLSearchParams({
      applicationFormId: params.applicationFormId,
    });
    return apiFetch<GetDiscordAuthorizeUrlResponse>(
      `${DISCORD_BASE_URL}/authorize?${searchParams}`
    );
  },

  /**
   * Discord OAuth 콜백 처리
   *
   * @param {GetDiscordOauthCallbackParams} params - 콜백 파라미터
   * @param {string} params.code - Discord OAuth 인증 코드
   * @param {string} params.state - Discord OAuth state 값
   *
   * @returns {Promise<void>}
   *
   * @example
   * await discordAPI.oauthCallback({ params: { code: 'auth-code', state: 'state-value' } })
   */
  oauthCallback: ({ params }: { params: GetDiscordOauthCallbackParams }) => {
    const searchParams = new URLSearchParams({
      code: params.code,
      state: params.state,
    });
    return apiFetch<void>(
      `${DISCORD_BASE_URL}/oauth/callback?${searchParams}`
    );
  },

  /**
   * Discord 연동 정보 조회
   *
   * @param {GetDiscordLinkParams} params - 조회 파라미터
   * @param {string} params.applicationFormId - 지원서 ID
   *
   * @returns {Promise<GetDiscordLinkResponse>} Discord 연동 정보 응답
   *
   * @example
   * const data = await discordAPI.getLink({ params: { applicationFormId: 'form-uuid-123' } })
   */
  getLink: ({ params }: { params: GetDiscordLinkParams }) => {
    const searchParams = new URLSearchParams({
      applicationFormId: params.applicationFormId,
    });
    return apiFetch<GetDiscordLinkResponse>(
      `${DISCORD_BASE_URL}/link?${searchParams}`
    );
  },
};
