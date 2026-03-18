import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  callbacks: {
    async jwt({ token }) {
      // TODO: DB 연동 후 member/admin 정보 추가
      return token;
    },

    async session({ session, token }) {
      // TODO: DB 연동 후 isAdmin, roles 실제 값으로 교체
      session.user.id = token.sub ?? "";
      session.user.isAdmin = false;
      session.user.roles = [];
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});
