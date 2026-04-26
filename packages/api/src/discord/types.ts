import type {
  DiscordAuthorizeUrlParams,
  DiscordOauthCallbackParams,
  DiscordGetLinkParams,
} from "../generated/dddApi.schemas";

// GET /api/v1/discord/authorize - Discord 인증 URL 조회
export type GetDiscordAuthorizeUrlParams = DiscordAuthorizeUrlParams;
export type GetDiscordAuthorizeUrlResponse = DiscordAuthorizeUrlDto;

// GET /api/v1/discord/oauth/callback - Discord OAuth 콜백
export type GetDiscordOauthCallbackParams = DiscordOauthCallbackParams;
export type GetDiscordOauthCallbackResponse = void;

// GET /api/v1/discord/link - Discord 연동 정보 조회
export type GetDiscordLinkParams = DiscordGetLinkParams;
export type GetDiscordLinkResponse = DiscordLinkDto;

// 엔티티 타입
export interface DiscordAuthorizeUrlDto {
  authorizeUrl: string;
}

export interface DiscordLinkDto {
  applicationFormId: string;
  discordUserId?: string;
  discordUsername?: string;
  linkedAt?: string;
}
