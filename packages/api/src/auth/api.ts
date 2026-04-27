import { getApiClient } from "../client";
import type {
  PostGoogleLoginResponse,
  PostRefreshTokenResponse,
} from "./types";

const AUTH_BASE_URL = "/api/v1/auth" as const;

export const authAPI = {
  googleLoginCallback: () =>
    getApiClient().get<PostGoogleLoginResponse>(`${AUTH_BASE_URL}/google`),

  refreshToken: () =>
    getApiClient().post<PostRefreshTokenResponse>(`${AUTH_BASE_URL}/refresh`, null),

  logout: () =>
    getApiClient().post<void>(`${AUTH_BASE_URL}/logout`, null),

  withdrawal: () =>
    getApiClient().delete<void>(`${AUTH_BASE_URL}/withdrawal`),
};
