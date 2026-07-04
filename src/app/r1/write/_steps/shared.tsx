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

// ── 통일 편집 행 (STEP 5·7 공용) ─────────────────────────────
// 바로 입력 가능 + 변경 시 옅은 개나리색·"확정 전" 배지 + 줄별 ✓ 확정/↩ 취소.
// 버튼 자리는 항상 예약(visibility)해서 나타나고 사라져도 레이아웃이 움직이지 않는다.
export function DraftRow({
  value,
  committed,
  onChange,
  onCommit,
  onRevert,
  multiline,
  mono,
  fontSize = 13,
  fontWeight = 500,
  color = "#0F1A36",
  placeholder,
}: {
  value: string; // 표시값 (draft ?? committed)
  committed: string; // 확정값
  onChange: (v: string) => void; // draft 기록
  onCommit: () => void; // 이 줄만 확정
  onRevert: () => void; // 이 줄만 원복
  multiline?: boolean;
  mono?: boolean;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  placeholder?: string;
}) {
  const dirty = value !== committed;
  const font = mono ? "var(--font-mono)" : "var(--font-sans)";
  const fieldStyle: CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    fontSize,
    fontWeight,
    color,
    fontFamily: font,
    background: dirty ? "#FFFBE6" : "#fff",
    border: dirty ? "1.5px solid #F0DFA0" : "1px solid #E1E5EF",
    borderRadius: 9,
    outline: "none",
    lineHeight: 1.5,
  };
  const iconBtn: CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    flexShrink: 0,
  };
  return (
    <div style={{ display: "flex", gap: 6, alignItems: multiline ? "flex-start" : "center" }}>
      <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
        {multiline ? (
          <textarea value={value} rows={2} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ ...fieldStyle, resize: "vertical" }} />
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && dirty) onCommit(); }} placeholder={placeholder} style={fieldStyle} />
        )}
        {dirty && (
          <span style={{ position: "absolute", top: -8, right: 8, padding: "1px 8px", borderRadius: 999, background: "#FFFBE6", border: "1px solid #F0DFA0", color: "#B8860B", fontSize: 9.5, fontWeight: 800, lineHeight: 1.4 }}>
            확정 전
          </span>
        )}
      </div>
      {/* 버튼 슬롯 — 공간 상시 예약 (레이아웃 고정) */}
      <div style={{ display: "flex", gap: 4, flexShrink: 0, visibility: dirty ? "visible" : "hidden", marginTop: multiline ? 4 : 0 }}>
        <button title="이 줄 확정" onClick={onCommit} style={{ ...iconBtn, background: "#2F9E5E", border: "1px solid #2F9E5E", color: "#fff" }}>✓</button>
        <button title="이 줄 취소 (원복)" onClick={onRevert} style={{ ...iconBtn, background: "#fff", border: "1px solid #E1E5EF", color: "#7C87A4" }}>↩</button>
      </div>
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

// ── 참고 실행계획 제안 (STEP 5) — 등급 기준·형태 기반 결정적 생성 ──
export function generateInitiatives(kr: WizardKR): string[] {
  const grades = kr.gradesDraft ?? kr.grades;
  const base: string[] = [];
  if (kr.format === "수치") {
    base.push(`현재 수준(${kr.baseline}) 재측정으로 baseline 확정 · ${kr.measureTool || "측정 도구"} 대시보드 셋업`);
    base.push(`목표(${kr.goal}) 달성을 위한 개선 항목 도출 → 우선순위 백로그화`);
    base.push(`${kr.measureCycle || "주기"}마다 측정값 기록 · 진행률 업데이트에 증빙 캡처 첨부`);
    if (grades.S) base.push(`S등급(${grades.S}) 도전을 위한 추가 개선 아이템 1건 준비`);
  } else if (kr.format === "마일스톤") {
    base.push("각 단계의 산출물(PR·문서·대시보드)과 완료 정의(DoD) 1줄씩 확정");
    base.push(`목표 단계(${kr.goal})까지의 일정을 월 단위로 배치`);
    base.push("단계 완료 시마다 산출물 링크를 진행률 업데이트에 첨부");
  } else if (kr.format === "루브릭") {
    base.push("평가자와 등급별 기준 문구 사전 합의 (1on1 안건으로 등록)");
    base.push("A등급 기준을 충족하는 산출물 예시 1건 먼저 제작");
    base.push("중간 점검 시점에 평가자 피드백 반영 라운드 1회");
  } else {
    base.push(`달성 조건(${kr.goal})의 완료 판정 기준을 평가자와 합의`);
    base.push("완료 시 증빙(배포 로그·공지·승인 내역) 확보 계획 수립");
    base.push("완료 전 중간 리스크 점검 1회 (일정·의존성)");
  }
  return base;
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
