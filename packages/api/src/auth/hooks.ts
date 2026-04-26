import { useMutation } from "@tanstack/react-query";
import { authMutations } from "./queries";

/**
 * Access Token 갱신 훅
 *
 * @example
 * const { mutate: refreshToken, isPending } = useRefreshToken()
 * refreshToken()
 */
export const useRefreshToken = () => useMutation(authMutations.refreshToken());

/**
 * 로그아웃 훅
 *
 * @example
 * const { mutate: logout, isPending } = useLogout()
 * logout()
 */
export const useLogout = () => useMutation(authMutations.logout());

/**
 * 회원 탈퇴 훅
 *
 * @example
 * const { mutate: withdrawal, isPending } = useWithdrawal()
 * withdrawal()
 */
export const useWithdrawal = () => useMutation(authMutations.withdrawal());
