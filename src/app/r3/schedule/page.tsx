"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { scheduleTypes } from "@/lib/mockData";
import { getEvalPhases, type Phase } from "@/lib/dataAccess";

// ── 평가 입력 제어 단계 ─────────────────────────────────────
// 각 단계의 기간이 R1·R2 화면에서 무엇을 할 수 있는지 제어한다.
// (DB eval_phases 테이블 — 미연결 시 아래 더미로 동작)

const INITIAL_PHASES: Phase[] = [
  { id: "write", ico: "📝", name: "목표 수립", start: "2026-07-01", end: "2026-07-10", control: "R1이 OKR을 작성·수정할 수 있어요. 이 기간에만 신규 목표 등록 가능.", who: "R1 전사 552명", status: "active" },
  { id: "approve", ico: "✅", name: "평가자 승인", start: "2026-07-08", end: "2026-07-15", control: "R2가 팀원 OKR을 승인·반려할 수 있어요.", who: "R2 평가자 48명", status: "up" },
  { id: "lock", ico: "🔒", name: "목표 확정 (마감)", start: "2026-07-15", end: "2026-07-15", control: "마감 이후 목표 문구·KR 수정 잠금. 이후에는 달성도만 입력 가능해요.", who: "전사", status: "up" },
  { id: "progress", ico: "📈", name: "달성도 입력", start: "2026-07-16", end: "2026-11-30", control: "목표는 잠긴 상태로 달성도(진척률)만 수정 가능해요.", who: "R1 전사 552명", status: "up" },
  { id: "self", ico: "🙋", name: "자기 평가", start: "2026-12-01", end: "2026-12-07", control: "R1이 최종 자기평가를 작성해요. 달성도 수정 마감.", who: "R1 전사 552명", status: "up" },
  { id: "calib", ico: "⚖️", name: "평가자 평가·캘리브레이션", start: "2026-12-08", end: "2026-12-20", control: "R2 평가·R3 캘리브레이션 진행. 피평가자 입력 전면 잠금.", who: "R2·R3", status: "up" },
];

const STATUS_CFG: Record<string, { bg: string; fg: string; label: string }> = {
  done: { bg: "#ECFAF1", fg: "#2F9E5E", label: "완료" },
  active: { bg: "#FFEDE2", fg: "#E07A3C", label: "진행 중" },
  up: { bg: "#F1F3F8", fg: "#5B6685", label: "예정" },
};

// 하단 미리보기 캘린더 (7월)
const EVENTS: Record<number, { type: keyof typeof scheduleTypes; title: string }[]> = {
  1: [{ type: "kickoff", title: "목표 수립 시작" }],
  10: [{ type: "deadline", title: "작성 마감" }],
  15: [{ type: "deadline", title: "목표 확정·잠금" }],
};

function CalendarPreview() {
  const firstOffset = 2, total = 31, TODAY = 3;
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstOffset; i++) cells.push(null);
  for (let i = 1; i <= total; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>팀원 캘린더 미리보기 <span style={{ fontSize: 11.5, fontWeight: 500, color: "#7C87A4", marginLeft: 6 }}>· 2026 07월 · 설정한 기간이 이렇게 공지돼요</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => <div key={d} style={{ fontSize: 10.5, fontWeight: 700, color: i === 5 ? "#2B5DD9" : i === 6 ? "#D14343" : "#7C87A4", textAlign: "center", padding: "6px 0" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} style={{ minHeight: 62, background: "#F9FAFC", borderRadius: 8, opacity: 0.4 }} />;
          const ev = EVENTS[d];
          const isToday = d === TODAY;
          const inWrite = d >= 1 && d <= 10;
          return (
            <div key={i} style={{ minHeight: 62, background: isToday ? "#FFF6EF" : inWrite ? "#F1FBF6" : "#fff", border: `1px solid ${isToday ? "#E07A3C" : inWrite ? "#B9F1D8" : "#ECEFF5"}`, borderRadius: 8, padding: "4px 6px", overflow: "hidden" }}>
              <div className="ds-num" style={{ fontSize: 11, fontWeight: isToday ? 700 : 600, color: isToday ? "#E07A3C" : "#3A4565", marginBottom: 2 }}>{d}</div>
              {ev?.map((e, j) => {
                const c = scheduleTypes[e.type];
                return <div key={j} style={{ background: c.bg, color: c.fg, fontSize: 9, fontWeight: 600, padding: "1px 4px", borderRadius: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={e.title}>{c.ico} {e.title}</div>;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function R3SchedulePage() {
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);

  useEffect(() => {
    getEvalPhases().then((p) => p && setPhases(p));
  }, []);

  function setDate(id: string, field: "start" | "end", value: string) {
    setPhases((ps) => ps.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  const dateInput: React.CSSProperties = { flex: "1 1 128px", minWidth: 0, padding: "7px 10px", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 12.5, color: "#0F1A36", outline: "none" };

  return (
    <RoleShell
      role="R3"
      title="평가 일정 관리"
      subtitle="한지영 · 평가 입력 제어판"
      actions={<Button variant="primary" size="sm" leftIcon={<span>✓</span>} onClick={() => alert("일정이 저장되어 전 구성원 캘린더에 공지됩니다 (프로토타입)")}>일정 저장 · 공지</Button>}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 하반기 · 평가 입력 제어</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>언제 무엇을 입력할 수 있는지 제어해요 🗓️</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#5B6685", lineHeight: 1.6 }}>여기서 정한 기간이 R1 작성·R2 승인·달성도 입력의 <b style={{ color: "#0F1A36" }}>가능 여부</b>를 결정하고, 팀원 캘린더에 자동 공지돼요.</p>
      </div>

      {/* 제어 규칙 요약 배너 */}
      <div style={{ background: "linear-gradient(135deg, #0A1F17, #14342B)", color: "#fff", borderRadius: 14, padding: "18px 22px", marginBottom: 18, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(0,169,104,0.22)", color: "#7CE9BE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🔒</div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 11, color: "#7CE9BE", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>핵심 제어 규칙</div>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>마감 이후에는 목표 문구·KR이 잠기고, <span style={{ color: "#7CE9BE" }}>달성도만 수정</span>할 수 있어요.</div>
        </div>
        <span style={{ padding: "5px 11px", background: "rgba(224,122,60,0.25)", color: "#F4C9A8", borderRadius: 7, fontSize: 11, fontWeight: 700 }}>설정 UI · R1 연동은 Supabase 단계</span>
      </div>

      {/* 단계별 제어 설정 */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #ECEFF5", fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>단계별 기간 · 제어 효과</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {phases.map((p) => {
            const s = STATUS_CFG[p.status];
            return (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "minmax(280px, 300px) 1fr", gap: 18, padding: "16px 22px", borderBottom: "1px solid #F2F4F8", alignItems: "start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "#F9FAFC", border: "1px solid #ECEFF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{p.ico}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>{p.name}</div>
                    <span style={{ padding: "2px 8px", borderRadius: 999, background: s.bg, color: s.fg, fontSize: 10, fontWeight: 700 }}>{s.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                    <input type="date" value={p.start} onChange={(e) => setDate(p.id, "start", e.target.value)} style={dateInput} />
                    <span style={{ color: "#A4ADC4", fontSize: 12 }}>~</span>
                    <input type="date" value={p.end} onChange={(e) => setDate(p.id, "end", e.target.value)} style={dateInput} />
                  </div>
                </div>
                <div style={{ paddingTop: 2 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>이 기간의 제어 효과</div>
                  <div style={{ fontSize: 13, color: "#1F2A4A", lineHeight: 1.6 }}>{p.control}</div>
                  <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 6 }}>대상 · {p.who}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CalendarPreview />
    </RoleShell>
  );
}
