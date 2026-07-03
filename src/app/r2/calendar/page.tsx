"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { scheduleTypes, members as seedMembers, type Member } from "@/lib/mockData";
import { getMembers, getEvalPhases, type Phase } from "@/lib/dataAccess";
import { getCurrentUser } from "@/lib/auth";

// eval_phases 폴백 더미 — supabase/schema.sql 시드와 동일 (D8)
const FALLBACK_PHASES: Phase[] = [
  { id: "write", ico: "📝", name: "목표 수립", start: "2026-07-01", end: "2026-07-10", control: "R1이 OKR을 작성·수정할 수 있어요.", who: "R1 전사 552명", status: "active" },
  { id: "approve", ico: "✅", name: "평가자 승인", start: "2026-07-08", end: "2026-07-15", control: "R2가 팀원 OKR을 승인·반려할 수 있어요.", who: "R2 평가자 48명", status: "up" },
  { id: "lock", ico: "🔒", name: "목표 확정 (마감)", start: "2026-07-15", end: "2026-07-15", control: "마감 이후 목표 수정 잠금.", who: "전사", status: "up" },
  { id: "progress", ico: "📈", name: "달성도 입력", start: "2026-07-16", end: "2026-11-30", control: "달성도(진척률)만 수정 가능해요.", who: "R1 전사 552명", status: "up" },
  { id: "self", ico: "🙋", name: "자기 평가", start: "2026-12-01", end: "2026-12-07", control: "R1이 최종 자기평가를 작성해요.", who: "R1 전사 552명", status: "up" },
  { id: "calib", ico: "⚖️", name: "평가자 평가·캘리브레이션", start: "2026-12-08", end: "2026-12-20", control: "R2 평가·R3 캘리브레이션 진행.", who: "R2·R3", status: "up" },
];

// 평가 단계 → 캘린더 일정 유형 매핑
const PHASE_TYPE: Record<string, keyof typeof scheduleTypes> = {
  write: "kickoff",
  approve: "quarter",
  lock: "deadline",
  progress: "etc",
  self: "oneonone",
  calib: "final",
};

interface CalEvent { type: keyof typeof scheduleTypes; title: string; date: string; kind: "시작" | "마감" | "당일" }

// eval_phases → 시작/마감 이벤트로 변환 (하루짜리 단계는 "당일" 1건)
function phasesToEvents(phases: Phase[]): CalEvent[] {
  const out: CalEvent[] = [];
  for (const p of phases) {
    const type = PHASE_TYPE[p.id] ?? "etc";
    if (p.start === p.end) out.push({ type, title: `${p.name}`, date: p.start, kind: "당일" });
    else {
      out.push({ type, title: `${p.name} 시작`, date: p.start, kind: "시작" });
      out.push({ type, title: `${p.name} 마감`, date: p.end, kind: "마감" });
    }
  }
  return out;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function R2CalendarPage() {
  const user = useMemo(() => getCurrentUser(), []);
  const today = useMemo(() => new Date(), []);
  const [members, setMembers] = useState<Member[]>(seedMembers);
  const [phases, setPhases] = useState<Phase[]>(FALLBACK_PHASES);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  // 월 이동 (D8) — 기본은 오늘이 속한 달
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() + 1 });

  useEffect(() => {
    Promise.all([getMembers(), getEvalPhases()]).then(([m, p]) => {
      if (m) setMembers(m);
      if (p) setPhases(p);
      if (!p) setDemoMode(true);
      setLoading(false);
    });
  }, []);

  const events = useMemo(() => phasesToEvents(phases), [phases]);
  const monthPrefix = `${ym.y}-${pad(ym.m)}`;
  const monthEvents = events.filter((e) => e.date.startsWith(monthPrefix)).sort((a, b) => a.date.localeCompare(b.date));
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalEvent[]>();
    for (const e of monthEvents) {
      const d = Number(e.date.slice(8, 10));
      map.set(d, [...(map.get(d) ?? []), e]);
    }
    return map;
  }, [monthEvents]);

  // 달력 셀 (월요일 시작)
  const firstOffset = (new Date(ym.y, ym.m - 1, 1).getDay() + 6) % 7;
  const total = new Date(ym.y, ym.m, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstOffset; i++) cells.push(null);
  for (let i = 1; i <= total; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);
  const isThisMonth = today.getFullYear() === ym.y && today.getMonth() + 1 === ym.m;

  function moveMonth(delta: number) {
    setYm(({ y, m }) => {
      const d = new Date(y, m - 1 + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() + 1 };
    });
  }

  const unregistered = members.filter((m) => m.focus && !m.coaching);
  const half = ym.m >= 7 ? "하반기" : "상반기";

  return (
    <RoleShell
      role="R2"
      title="코칭 캘린더"
      subtitle={`${user?.name ?? ""} 팀장 · 이번 달 평가 일정 ${monthEvents.length}건`}
      actions={<Button variant="primary" size="sm" leftIcon={<span>+</span>} onClick={() => alert("일정 등록은 준비 중이에요 🙂")}>일정 등록</Button>}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#00A968", letterSpacing: "0.04em", textTransform: "uppercase" }}>{ym.y} {half} · {ym.m}월</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>팀원과의 일정을 한눈에</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#5B6685" }}>평가 일정은 인사팀(R3)이 정한 단계 기준이에요. 시작·마감일을 놓치지 않게 도와드릴게요.</p>
      </div>

      {demoMode && (
        <div style={{ marginBottom: 14, padding: "9px 14px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10, fontSize: 12, color: "#7A4A14" }}>
          지금은 데모 일정으로 보여드리고 있어요. Supabase 연결(.env.local) 후 실제 평가 일정으로 확인할 수 있어요 🙂
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.65fr) 320px", gap: 18 }}>
        {/* 월간 캘린더 — eval_phases 연동 + 월 이동 (D8) */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px", boxShadow: "var(--shadow-xs)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>{ym.y} · {pad(ym.m)}월</div>
              <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2 }}>
                {loading ? "일정을 불러오는 중이에요…" : `평가 일정 ${monthEvents.length}건`}
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button onClick={() => moveMonth(-1)} title="이전 달" style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #E1E5EF", background: "#fff", color: "#3A4565", fontSize: 13, cursor: "pointer" }}>◀</button>
              <button onClick={() => setYm({ y: today.getFullYear(), m: today.getMonth() + 1 })} style={{ padding: "0 12px", height: 30, borderRadius: 8, border: "1px solid #E1E5EF", background: isThisMonth ? "#ECFAF1" : "#fff", color: isThisMonth ? "#2F9E5E" : "#3A4565", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>오늘</button>
              <button onClick={() => moveMonth(1)} title="다음 달" style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #E1E5EF", background: "#fff", color: "#3A4565", fontSize: 13, cursor: "pointer" }}>▶</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
            {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => (
              <div key={d} style={{ fontSize: 10.5, fontWeight: 700, color: i === 5 ? "#2B5DD9" : i === 6 ? "#D14343" : "#7C87A4", textAlign: "center", padding: "8px 0", letterSpacing: "0.04em" }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} style={{ minHeight: 84, background: "#F9FAFC", borderRadius: 8, opacity: 0.4 }} />;
              const ev = eventsByDay.get(d);
              const isToday = isThisMonth && d === today.getDate();
              const dow = (firstOffset + d - 1) % 7;
              const dateColor = dow === 6 ? "#D14343" : dow === 5 ? "#2B5DD9" : "#3A4565";
              return (
                <div key={i} onClick={() => alert(ev ? `${ym.m}월 ${d}일 일정 ${ev.length}건 · ${ev.map((e) => e.title).join(", ")}` : `${ym.m}월 ${d}일 · 일정 등록은 준비 중이에요 🙂`)} style={{ minHeight: 84, background: isToday ? "#F1FBF6" : "#fff", border: `1px solid ${isToday ? "#00A968" : "#ECEFF5"}`, borderRadius: 8, padding: "5px 6px", overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer" }}>
                  <div className="ds-num" style={{ fontSize: 11.5, fontWeight: isToday ? 700 : 600, color: isToday ? "#00A968" : dateColor, marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
                    {d}
                    {isToday && <span style={{ fontSize: 8.5, padding: "1px 5px", background: "#00A968", color: "#fff", borderRadius: 3 }}>오늘</span>}
                  </div>
                  {ev?.slice(0, 3).map((e, j) => {
                    const c = scheduleTypes[e.type];
                    return (
                      <div key={j} style={{ background: c.bg, color: c.fg, fontSize: 9.5, fontWeight: 600, padding: "2px 5px", borderRadius: 4, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 3 }} title={e.title}>
                        <span style={{ fontSize: 9 }}>{c.ico}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</span>
                      </div>
                    );
                  })}
                  {ev && ev.length > 3 && <div style={{ fontSize: 9, color: "#7C87A4" }}>+{ev.length - 3}건</div>}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 14, paddingTop: 12, borderTop: "1px solid #ECEFF5", flexWrap: "wrap", fontSize: 11, color: "#5B6685" }}>
            {Object.entries(scheduleTypes).map(([k, t]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: t.fg }} />
                <span style={{ fontSize: 11 }}>{t.ico}</span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* 이번 달 일정 — eval_phases 기반 */}
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>이번 달 일정</div>
            {loading ? (
              <div style={{ padding: "14px 0", fontSize: 12, color: "#7C87A4", textAlign: "center" }}>불러오는 중이에요…</div>
            ) : monthEvents.length === 0 ? (
              <div style={{ padding: "14px 0", fontSize: 12, color: "#7C87A4", textAlign: "center", lineHeight: 1.6 }}>이 달에는 평가 일정이 없어요.<br />◀▶로 다른 달을 살펴보세요 🙂</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {monthEvents.map((e, i) => {
                  const t = scheduleTypes[e.type];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 8 }}>
                      <div style={{ fontSize: 14 }}>{t.ico}</div>
                      <div className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: t.fg, width: 40 }}>{e.date.slice(5).replace("-", "/")}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#0F1A36" }}>{e.title}</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: e.kind === "마감" ? "#D14343" : "#7C87A4" }}>{e.kind}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 1on1 미등록 팀원 (현행 유지) */}
          <div style={{ background: "linear-gradient(135deg, #FFF7EC, #fff 70%)", border: "1px solid #FFE0BA", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: "#D98023", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>!</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#7A4A14" }}>1on1 미등록 팀원</div>
              <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "#9C5E26", fontWeight: 700 }}>{unregistered.length}명</span>
            </div>
            <div style={{ fontSize: 10.5, color: "#7A4A14", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>🎯 집중 코칭 우선</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {unregistered.map((m) => (
                <div key={m.id} onClick={() => alert(`${m.name} 님 1on1 등록은 준비 중이에요 🙂`)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", background: "#fff", border: "1px solid #FFE0BA", borderRadius: 8, cursor: "pointer" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#FFEDE2", color: "#E07A3C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11 }}>{m.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0F1A36" }}>{m.name} <span style={{ color: "#7C87A4", fontWeight: 500, fontSize: 11 }}>{m.grade}</span></div>
                    <div style={{ fontSize: 10, color: "#9C5E26" }}>{m.group}</div>
                  </div>
                  <span style={{ padding: "3px 8px", background: "#D98023", borderRadius: 6, color: "#fff", fontSize: 10, fontWeight: 700 }}>+ 1on1</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
