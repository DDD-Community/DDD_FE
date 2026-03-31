import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DDD - 사이드 프로젝트로 성장하는 개발자 커뮤니티",
    template: "%s | DDD",
  },
  description: "개발자, 디자이너, 기획자가 함께 사이드 프로젝트를 만들고 성장하는 커뮤니티 DDD. 실전 협업 경험을 쌓아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
