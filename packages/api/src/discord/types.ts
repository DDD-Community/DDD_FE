import type {
  DiscordAuthorizeUrlParams,
  DiscordOauthCallbackParams,
  DiscordGetLinkParams,
} from "../generated/dddApi.schemas";

// GET /api/v1/discord/oauth/authorize - Discord OAuth 동의 URL 조회
export type GetDiscordAuthorizeUrlParams = DiscordAuthorizeUrlParams;

// GET /api/v1/discord/oauth/callback - Discord OAuth 콜백
export type GetDiscordOauthCallbackParams = DiscordOauthCallbackParams;

// GET /api/v1/discord/link - Discord 연동 상태 조회
export type GetDiscordLinkParams = DiscordGetLinkParams;
