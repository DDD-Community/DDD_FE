import {
  discordAuthorizeUrl,
  discordGetLink,
  discordOauthCallback,
} from "../generated/public-discord/public-discord";
import type {
  GetDiscordAuthorizeUrlParams,
  GetDiscordLinkParams,
  GetDiscordOauthCallbackParams,
} from "./types";

export const discordAPI = {
  /** Discord OAuth 동의 URL 조회 — GET /api/v1/discord/oauth/authorize */
  getAuthorizeUrl: ({ params }: { params: GetDiscordAuthorizeUrlParams }) =>
    discordAuthorizeUrl(params),

  /** Discord OAuth 콜백 — GET /api/v1/discord/oauth/callback */
  oauthCallback: ({ params }: { params: GetDiscordOauthCallbackParams }) =>
    discordOauthCallback(params),

  /** Discord 연동 상태 조회 — GET /api/v1/discord/link */
  getLink: ({ params }: { params: GetDiscordLinkParams }) =>
    discordGetLink(params),
};
