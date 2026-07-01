import type { CSSProperties } from "react";

// ── 공용 스타일 (WizardShared.jsx 기준) ──
export const label: CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#3A4565", marginBottom: 7 };
export const input: CSSProperties = { width: "100%", padding: "11px 14px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, fontSize: 14, color: "#0F1A36", fontFamily: "var(--font-sans)", outline: "none" };
export const hint: CSSProperties = { fontSize: 11.5, color: "#7C87A4", marginTop: 5, lineHeight: 1.5 };
export const card: CSSProperties = { background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "30px 34px" };

export const FORMAT_COLOR: Record<string, { bg: string; fg: string }> = {
  "수치": { bg: "#E5EBFB", fg: "#213A8C" },
  "마일스톤": { bg: "#F0E9FB", fg: "#7C4DD9" },
  "루브릭": { bg: "#FFEDE2", fg: "#E07A3C" },
  "이산": { bg: "#ECFAF1", fg: "#2F9E5E" },
};

export const VERDICT: Record<string, { bg: string; fg: string; ico: string; label: string }> = {
  pass: { bg: "#ECFAF1", fg: "#2F9E5E", ico: "✓", label: "통과" },
  warn: { bg: "#FFF7EC", fg: "#D98023", ico: "!", label: "보완" },
  fail: { bg: "#FDECEC", fg: "#D64545", ico: "×", label: "필수" },
};

// ── AI 벤더 (STEP 6) ──
export const AI_VENDORS = [
  { id: "claude", name: "Claude Sonnet 4.5", short: "Claude", vendor: "Anthropic", avatar: "🌀", accent: "#D97757", accentBg: "#FBF0E9", accentBorder: "#F0CDB1" },
  { id: "gpt", name: "GPT-4o", short: "GPT", vendor: "OpenAI", avatar: "✦", accent: "#10A37F", accentBg: "#E6F5F0", accentBorder: "#A8DDCB" },
  { id: "gemini", name: "Gemini 1.5 Pro", short: "Gemini", vendor: "Google", avatar: "✧", accent: "#4285F4", accentBg: "#E8F0FE", accentBorder: "#A4C2F4" },
] as const;

// ── KR 데이터 (STEP 3 정제 산출물로 가정, STEP 4~7 공용) ──
export interface KR {
  num: string;
  format: string;
  kr: string;
  baseline: string;
  goal: string;
  measure: string;
  weight: number;
  before?: string;
}
export const KRS: KR[] = [
  { num: "01", format: "수치", kr: "결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축한다.", baseline: "850ms", goal: "500ms", measure: "APM p95 월평균", weight: 30, before: "결제 게이트웨이 응답속도를 빠르게 개선한다." },
  { num: "02", format: "수치", kr: "결제 인증모듈 단위테스트 커버리지를 65% → 85%로 끌어올린다.", baseline: "65%", goal: "85%", measure: "Jest 커버리지 리포트", weight: 25, before: "결제 인증모듈 테스트를 강화한다." },
  { num: "03", format: "마일스톤", kr: "장애 알림 룰 자동화 마일스톤 4단계 중 3단계까지 완료한다.", baseline: "1/4", goal: "3/4", measure: "단계별 산출물 검토", weight: 20, before: "장애 알림을 자동화한다." },
];
