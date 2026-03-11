import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, getMemberByEmail, getAdminsByMemberId } from "@ddd/db";
import {
  authUsers,
  authAccounts,
  authSessions,
  authVerificationTokens,
} from "@ddd/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: authUsers,
    accountsTable: authAccounts,
    sessionsTable: authSessions,
    verificationTokensTable: authVerificationTokens,
  }),

  // Database Session 방식 (adapter 설정 시 자동으로 "database" 전략 사용)

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      // 가입된 member만 로그인 허용
      if (!user.email) return false;
      const member = await getMemberByEmail(user.email);
      return !!member;
    },

    async session({ session }) {
      // 매 요청마다 호출 — member/admin 상태를 DB에서 최신으로 조회
      if (!session.user.email) return session;

      const member = await getMemberByEmail(session.user.email);
      if (!member) {
        // member가 없으면 세션 무효화 (빈 세션 반환)
        return { ...session, user: { ...session.user, isAdmin: false, roles: [] } };
      }

      const admins = await getAdminsByMemberId(member.id);
      session.user.id = member.id;
      session.user.isAdmin = admins.length > 0;
      session.user.roles = admins.map((a) => a.role);

      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});
