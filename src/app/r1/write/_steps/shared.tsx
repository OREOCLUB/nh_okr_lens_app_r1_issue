"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { WizardKR } from "@/lib/wizard";

// ── 가로 드래그 패닝 컨테이너 — 스크롤바 없이 클릭+드래그로 이동 ──
export function DragScroll({ children, gap = 10, style }: { children: ReactNode; gap?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, startLeft: 0, moved: false });
  const [dragging, setDragging] = useState(false);

  function onMouseDown(e: React.MouseEvent) {
    if (!ref.current) return;
    drag.current = { startX: e.clientX, startLeft: ref.current.scrollLeft, moved: false };
    setDragging(true);
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging || !ref.current) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    ref.current.scrollLeft = drag.current.startLeft - dx;
  }
  function endDrag() {
    setDragging(false);
  }
  // 드래그 직후 클릭 이벤트가 카드 선택으로 새지 않게 캡처 단계에서 차단
  function onClickCapture(e: React.MouseEvent) {
    if (drag.current.moved) {
      e.stopPropagation();
      e.preventDefault();
      drag.current.moved = false;
    }
  }

  return (
    <div
      ref={ref}
      className={`drag-scroll${dragging ? " dragging" : ""}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onClickCapture={onClickCapture}
      style={{ display: "flex", gap, ...style }}
    >
      {children}
    </div>
  );
}

// ── 공용 스타일 ──
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

// ── AI 벤더 (STEP 6 — 멀티 AI 실 API는 P2, MVP는 목데이터 비교) ──
export const AI_VENDORS = [
  { id: "claude", name: "Claude Sonnet 4.5", short: "Claude", vendor: "Anthropic", avatar: "🌀", accent: "#D97757", accentBg: "#FBF0E9", accentBorder: "#F0CDB1" },
  { id: "gpt", name: "GPT-4o", short: "GPT", vendor: "OpenAI", avatar: "✦", accent: "#10A37F", accentBg: "#E6F5F0", accentBorder: "#A8DDCB" },
  { id: "gemini", name: "Gemini 1.5 Pro", short: "Gemini", vendor: "Google", avatar: "✧", accent: "#4285F4", accentBg: "#E8F0FE", accentBorder: "#A4C2F4" },
] as const;

// ── 결정적 형태 추천 (STEP 4) — KR 신호 기반 ──
export function recommendFormat(kr: WizardKR): { format: string; reason: string } {
  if (/단계|마일스톤/.test(kr.kr) || /\d+\s*\/\s*\d+/.test(kr.goal))
    return { format: "마일스톤", reason: "단계 산출물이 명확" };
  if (/\d/.test(kr.baseline) && /\d/.test(kr.goal))
    return { format: "수치", reason: "명확한 baseline·goal 수치 존재" };
  if (/품질|루브릭|등급|역량/.test(kr.kr))
    return { format: "루브릭", reason: "질적 판단 기준의 사전 합의가 적합" };
  return { format: "이산", reason: "달성/미달성 이분법이 자연스러움" };
}

// ── 결정적 등급 초안 생성 (STEP 5 — AI 자동 생성 폴백과 동일 룰) ──
export function generateGrades(kr: WizardKR): WizardKR["grades"] {
  const num = (s: string) => {
    const m = s.match(/[\d.]+/);
    return m ? parseFloat(m[0]) : null;
  };
  const unit = kr.goal.replace(/[\d.,\s/]+/g, "") || "";
  const b = num(kr.baseline);
  const g = num(kr.goal);
  if (kr.format === "수치" && b !== null && g !== null && b !== g) {
    const better = (ratio: number) => Math.round(g + (g - b) * ratio);
    const mid = (ratio: number) => Math.round(g + (b - g) * ratio);
    const lower = g < b; // 낮을수록 좋은 지표 (예: 응답속도)
    if (lower) {
      return {
        S: `≤${better(0.2)}${unit} — 목표 초과 20% 달성`,
        A: `≤${g}${unit} — 목표 달성`,
        B: `${g}~${mid(0.5)}${unit} — 목표의 70~99%`,
        C: `${mid(0.5)}~${mid(0.85)}${unit} — 개선 추세 확인`,
        D: `≥${mid(0.85)}${unit} — baseline 수준`,
      };
    }
    return {
      S: `≥${better(0.2)}${unit} — 목표 초과 20% 달성`,
      A: `≥${g}${unit} — 목표 달성`,
      B: `${mid(0.3)}~${g}${unit} — 목표의 70~99%`,
      C: `${mid(0.7)}~${mid(0.3)}${unit} — 개선 추세 확인`,
      D: `≤${mid(0.7)}${unit} — baseline 수준`,
    };
  }
  if (kr.format === "마일스톤") {
    return {
      S: "전체 단계 완료 + 확장 산출물",
      A: `${kr.goal} 완료 — 목표 달성`,
      B: "목표 직전 단계까지 완료",
      C: "초기 단계 완료 (산출물 확인)",
      D: "미착수",
    };
  }
  return {
    S: "목표 초과 — 추가 성과 포함",
    A: `${kr.goal} — 목표 달성`,
    B: "목표의 70~99% 수준",
    C: "부분 달성 — 개선 추세 확인",
    D: "baseline 수준",
  };
}
