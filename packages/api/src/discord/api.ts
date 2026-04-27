import { getApiClient } from "../client";
import type {
  GetDiscordAuthorizeUrlParams,
  GetDiscordAuthorizeUrlResponse,
  GetDiscordOauthCallbackParams,
  GetDiscordLinkParams,
  GetDiscordLinkResponse,
} from "./types";

const DISCORD_BASE_URL = "/api/v1/discord" as const;

export const discordAPI = {
  getAuthorizeUrl: ({ params }: { params: GetDiscordAuthorizeUrlParams }) => {
    const searchParams = new URLSearchParams({
      applicationFormId: params.applicationFormId,
    });
    return getApiClient().get<GetDiscordAuthorizeUrlResponse>(
      `${DISCORD_BASE_URL}/authorize?${searchParams}`,
    );
  },

  oauthCallback: ({ params }: { params: GetDiscordOauthCallbackParams }) => {
    const searchParams = new URLSearchParams({
      code: params.code,
      state: params.state,
    });
    return getApiClient().get<void>(
      `${DISCORD_BASE_URL}/oauth/callback?${searchParams}`,
    );
  },

  getLink: ({ params }: { params: GetDiscordLinkParams }) => {
    const searchParams = new URLSearchParams({
      applicationFormId: params.applicationFormId,
    });
    return getApiClient().get<GetDiscordLinkResponse>(
      `${DISCORD_BASE_URL}/link?${searchParams}`,
    );
  },
};
