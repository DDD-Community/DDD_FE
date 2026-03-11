import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isAdmin = session?.user?.isAdmin ?? false;

  // /dashboard/** 보호
  if (nextUrl.pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  // 이미 로그인한 상태에서 /login 접근 시 대시보드로
  if (nextUrl.pathname === "/login" && isLoggedIn && isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
