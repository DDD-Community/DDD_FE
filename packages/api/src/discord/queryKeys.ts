import type {
  GetDiscordAuthorizeUrlParams,
  GetDiscordLinkParams,
} from "./types";

export const discordKeys = {
  /** Discord base key */
  all: ["discord"] as const,

  /**
   * Discord 인증 URL key
   *
   * @param {GetDiscordAuthorizeUrlParams} params - 조회 파라미터
   * @param {string} params.applicationFormId - 지원서 ID
   */
  authorizeUrl: (params: GetDiscordAuthorizeUrlParams) =>
    [...discordKeys.all, "authorize", params] as const,

  /**
   * Discord 연동 정보 key
   *
   * @param {GetDiscordLinkParams} params - 조회 파라미터
   * @param {string} params.applicationFormId - 지원서 ID
   */
  link: (params: GetDiscordLinkParams) =>
    [...discordKeys.all, "link", params] as const,
};
