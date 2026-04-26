import { mutationOptions } from "@tanstack/react-query";
import { authAPI } from "./api";

export const authMutations = {
  /**
   * Access Token 갱신 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const refreshMutation = useMutation(authMutations.refreshToken())
   * refreshMutation.mutate()
   */
  refreshToken: () =>
    mutationOptions({
      mutationFn: authAPI.refreshToken,
    }),

  /**
   * 로그아웃 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const logoutMutation = useMutation(authMutations.logout())
   * logoutMutation.mutate()
   */
  logout: () =>
    mutationOptions({
      mutationFn: authAPI.logout,
    }),

  /**
   * 회원 탈퇴 mutation
   *
   * @returns {MutationOptions} TanStack Query Mutation 옵션 객체
   *
   * @example
   * const withdrawalMutation = useMutation(authMutations.withdrawal())
   * withdrawalMutation.mutate()
   */
  withdrawal: () =>
    mutationOptions({
      mutationFn: authAPI.withdrawal,
    }),
};
