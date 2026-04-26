import { apiFetch } from "../client";
import type {
  PostGoogleLoginResponse,
  PostRefreshTokenResponse,
} from "./types";

const AUTH_BASE_URL = "/api/v1/auth" as const;

export const authAPI = {
  /**
   * Google OAuth 로그인 콜백
   *
   * @returns {Promise<PostGoogleLoginResponse>} 발급된 Access Token 응답
   *
   * @example
   * const data = await authAPI.googleLoginCallback()
   */
  googleLoginCallback: () =>
    apiFetch<PostGoogleLoginResponse>(`${AUTH_BASE_URL}/google`),

  /**
   * Access Token 갱신 (refresh_token 쿠키 사용)
   *
   * @returns {Promise<PostRefreshTokenResponse>} 새로 발급된 Access Token 응답
   *
   * @example
   * const data = await authAPI.refreshToken()
   */
  refreshToken: () =>
    apiFetch<PostRefreshTokenResponse>(`${AUTH_BASE_URL}/refresh`, {
      method: "POST",
    }),

  /**
   * 로그아웃
   *
   * @returns {Promise<void>}
   *
   * @example
   * await authAPI.logout()
   */
  logout: () =>
    apiFetch<void>(`${AUTH_BASE_URL}/logout`, {
      method: "POST",
    }),

  /**
   * 회원 탈퇴
   *
   * @returns {Promise<void>}
   *
   * @example
   * await authAPI.withdrawal()
   */
  withdrawal: () =>
    apiFetch<void>(`${AUTH_BASE_URL}/withdrawal`, {
      method: "DELETE",
    }),
};
