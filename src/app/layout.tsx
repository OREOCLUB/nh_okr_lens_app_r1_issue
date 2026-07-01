import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Pretendard — 한국어 본문/UI (SKILL.md §8)
const pretendard = localFont({
  variable: "--font-pretendard",
  display: "swap",
  src: [
    { path: "../../fonts/Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/Pretendard-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../fonts/Pretendard-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../fonts/Pretendard-Bold.woff2", weight: "700", style: "normal" },
  ],
});

// JetBrains Mono — KR ID·수치·날짜 (tabular-nums)
const jbMono = localFont({
  variable: "--font-jbmono",
  display: "swap",
  src: [
    { path: "../../fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/JetBrainsMono-Medium.woff2", weight: "500", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "OKR LENS — 사내 OKR 평가·코칭 AI 서비스",
  description: "성과를 연결하고, 성장을 가속화합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${jbMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
