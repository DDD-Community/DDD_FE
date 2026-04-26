import type {
  GoogleAuthCallbackResponseDto,
  GoogleRefreshResponseDto,
} from "../generated/dddApi.schemas";

// POST /api/v1/auth/google - Google 로그인 콜백
export type PostGoogleLoginResponse = GoogleAuthCallbackResponseDto;

// POST /api/v1/auth/refresh - 토큰 갱신
export type PostRefreshTokenResponse = GoogleRefreshResponseDto;

// POST /api/v1/auth/logout - 로그아웃
export type PostLogoutResponse = void;

// DELETE /api/v1/auth/withdrawal - 회원 탈퇴
export type DeleteWithdrawalResponse = void;
