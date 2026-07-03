"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleShell } from "@/components/RoleShell";
import { scheduleTypes } from "@/lib/mockData";
import { getCurrentUser, type Session } from "@/lib/auth";

interface Ev { type: keyof typeof scheduleTypes; title: string; time: string; linked?: boolean; pending?: boolean }
const EVENTS: Record<number, Ev[]> = {
  1: [{ type: "kickoff", title: "OKR 등록 시작", time: "전일" }],
  8: [{ type: "quarter", title: "분기 미팅", time: "10:00" }],
  10: [{ type: "oneonone", title: "1on1 · 킥오프", time: "14:00", linked: true }],
  17: [{ type: "quarter", title: "분기 중간 점검", time: "14:00" }],
  22: [{ type: "oneonone", title: "1on1 코칭", time: "15:00", linked: true }],
  25: [{ type: "oneonone", title: "KR 조정 상담", time: "10:30", pending: true }],
  28: [{ type: "oneonone", title: "1on1 · 월간회고", time: "11:00", linked: true }],
  30: [{ type: "deadline", title: "OKR 등록 마감", time: "18:00" }],
};

const UPCOMING = [
  { date: "07/17", type: "quarter", title: "분기 중간 점검", time: "14:00", host: "인사팀", dday: 16 },
  { date: "07/22", type: "oneonone", title: "1on1 코칭", time: "15:00", host: "박정훈 팀장", dday: 21, linked: true },
  { date: "07/25", type: "oneonone", title: "KR 조정 상담", time: "10:30", host: "내가 요청", dday: 24, pending: true },
  { date: "07/30", type: "deadline", title: "OKR 등록 마감", time: "18:00", host: "전사", dday: 29 },
];

const HISTORY = [
  { period: "2025 하반기", grade: "A", color: "#3B5BDB", bg: "#E8F0FF", okr: 5, event: "12/20 최종 평가 확정" },
  { period: "2025 상반기", grade: "B", color: "#5B6685", bg: "#F1F3F8", okr: 4, event: "06/28 최종 평가 확정" },
  { period: "2024 하반기", grade: "B", color: "#5B6685", bg: "#F1F3F8", okr: 4, event: "12/22 최종 평가 확정" },
];

const PHASES = [
  { label: "OKR 등록 시작", date: "07/01", status: "done" },
  { label: "KR 확정", date: "07/01~30", status: "current" },
  { label: "평가자 검토", date: "08/01~07", status: "up" },
  { label: "자기 평가", date: "08/05~12", status: "up" },
  { label: "캘리브레이션", date: "08/15~22", status: "up" },
  { label: "결과 공지", date: "08/28", status: "up" },
];

function Calendar() {
  const firstOffset = 2, total = 31, TODAY = 1;
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstOffset; i++) cells.push(null);
  for (let i = 1; i <= total; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px", boxShadow: "var(--shadow-xs)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>2026 · 07월</div>
          <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2 }}>나의 일정 8건 · 코칭 예정 3건 · 마감 1건</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => <div key={d} style={{ fontSize: 10.5, fontWeight: 700, color: i === 5 ? "#2B5DD9" : i === 6 ? "#D14343" : "#7C87A4", textAlign: "center", padding: "8px 0" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} style={{ minHeight: 88, background: "#F9FAFC", borderRadius: 8, opacity: 0.4 }} />;
          const ev = EVENTS[d];
          const isToday = d === TODAY;
          const dow = (firstOffset + d - 1) % 7;
          const dateColor = dow === 6 ? "#D14343" : dow === 5 ? "#2B5DD9" : "#3A4565";
          return (
            <div key={i} style={{ minHeight: 88, background: isToday ? "#E8F0FF" : "#fff", border: `1px solid ${isToday ? "#3B5BDB" : "#ECEFF5"}`, borderRadius: 8, padding: "5px 6px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="ds-num" style={{ fontSize: 11.5, fontWeight: isToday ? 700 : 600, color: isToday ? "#3B5BDB" : dateColor, marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
                {d}{isToday && <span style={{ fontSize: 8.5, padding: "1px 5px", background: "#3B5BDB", color: "#fff", borderRadius: 3 }}>오늘</span>}
              </div>
              {ev?.map((e, j) => {
                const c = scheduleTypes[e.type];
                return (
                  <div key={j} style={{ background: e.pending ? "#FFF7EC" : c.bg, color: e.pending ? "#D98023" : c.fg, fontSize: 9.5, fontWeight: 600, padding: "2px 5px", borderRadius: 4, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 3, border: e.pending ? "1px dashed #D98023" : "none" }} title={`${e.time} ${e.title}`}>
                    <span style={{ fontSize: 9 }}>{e.pending ? "⏱" : c.ico}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</span>
                    {e.linked && <span style={{ fontSize: 8, marginLeft: "auto" }}>🔗</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 14, paddingTop: 12, borderTop: "1px solid #ECEFF5", flexWrap: "wrap", fontSize: 11, color: "#5B6685", alignItems: "center" }}>
        {Object.entries(scheduleTypes).map(([k, t]) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: t.fg }} /><span>{t.ico}</span><span>{t.label}</span></div>)}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, color: "#3B5BDB", fontWeight: 600 }}><span>🔗</span><span>평가자 연동</span></div>
      </div>
    </div>
  );
}

interface UpcomingEv { date: string; type: string; title: string; time: string; host: string; dday: number; linked?: boolean; pending?: boolean }

export default function R1CalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<Session | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingEv[]>(UPCOMING);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) setUser(u);
  }, []);

  function requestCoaching() {
    const topic = window.prompt("어떤 주제로 코칭을 요청할까요? (평가자 승인 후 일정이 확정돼요)");
    if (!topic?.trim()) return;
    const d = new Date(Date.now() + 3 * 86_400_000);
    setUpcoming((list) => [
      ...list,
      {
        date: `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`,
        type: "oneonone",
        title: topic.trim(),
        time: "미정",
        host: "내가 요청",
        dday: 3,
        pending: true,
      },
    ]);
  }

  return (
    <RoleShell role="R1" title="평가 캘린더" subtitle={user ? `${user.name} · 2026 하반기 · KR 확정 단계` : ""}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 하반기</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>나의 평가 여정을 한눈에</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#5B6685" }}>전사 마일스톤, 평가자와의 1on1 코칭, 이전 평가 이력을 모두 확인할 수 있어요.</p>
      </div>

      {/* D-Day 배너 */}
      <div style={{ background: "linear-gradient(135deg, #3B5BDB 0%, #2C49B8 100%)", borderRadius: 14, padding: "18px 22px", color: "#fff", display: "flex", alignItems: "center", gap: 20, boxShadow: "0 8px 20px -8px rgba(59,91,219,.4)", marginBottom: 18 }}>
        <div style={{ width: 60, height: 60, borderRadius: 14, background: "rgba(255,255,255,0.14)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85 }}>D-</div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>29</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>🎯 지금은 KR 확정 단계예요</div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>OKR 등록 마감까지 <span style={{ background: "rgba(255,255,255,0.18)", padding: "1px 8px", borderRadius: 6 }}>29일</span> 남았어요</div>
          <div style={{ fontSize: 12.5, opacity: 0.88, marginTop: 4 }}>7월 30일 (수) 18:00 까지 · KR 5개 중 3개 확정 완료</div>
        </div>
        <button onClick={() => router.push("/r1/write")} style={{ background: "#fff", color: "#2C49B8", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>OKR 이어서 작성 →</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.65fr) 340px", gap: 18, marginBottom: 18 }}>
        <Calendar />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Upcoming */}
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>📅 다가오는 일정</div>
              <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "#7C87A4", fontWeight: 600 }}>{upcoming.length}건</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {upcoming.map((e, i) => {
                const t = scheduleTypes[e.type as keyof typeof scheduleTypes];
                const urgent = e.dday <= 20;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: e.pending ? "#FFF7EC" : t.bg, color: e.pending ? "#D98023" : t.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, border: e.pending ? "1px dashed #D98023" : "none" }}>{e.pending ? "⏱" : t.ico}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</span>
                        {e.linked && <span style={{ fontSize: 9.5, color: "#3B5BDB" }}>🔗</span>}
                      </div>
                      <div className="mono" style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 1 }}>{e.date} · {e.time} · {e.host}</div>
                    </div>
                    <div className="mono" style={{ padding: "3px 8px", borderRadius: 999, background: urgent ? "#FFF0F0" : "#F1F4FD", color: urgent ? "#D14343" : "#2B5DD9", fontSize: 10.5, fontWeight: 700, flexShrink: 0 }}>D-{e.dday}</div>
                  </div>
                );
              })}
            </div>
            <button onClick={requestCoaching} style={{ width: "100%", marginTop: 10, padding: "10px 12px", background: "#3B5BDB", color: "#fff", border: "none", borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>💬 새 코칭 요청하기 (승인 대기로 등록)</button>
          </div>
          {/* Past history */}
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>📚 이전 평가 이력</div>
              <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "#7C87A4", fontWeight: 600 }}>3회</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {HISTORY.map((h) => (
                <div key={h.period} style={{ border: "1px solid #ECEFF5", borderRadius: 10, padding: "11px 12px", display: "flex", alignItems: "center", gap: 11 }}>
                  <div className="mono" style={{ width: 40, height: 40, borderRadius: 10, background: h.bg, color: h.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>{h.grade}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36" }}>{h.period}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 2 }}>KR {h.okr}개 · {h.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Process timeline */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 24px", boxShadow: "var(--shadow-xs)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>2026 하반기 평가 프로세스</div>
            <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 2 }}>총 6단계 · 현재 2단계 진행 중</div>
          </div>
          <div style={{ flex: 1 }} />
          <div className="mono" style={{ fontSize: 11.5, color: "#3B5BDB", fontWeight: 700 }}>2 / 6</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {PHASES.map((p, i) => {
            const done = p.status === "done", cur = p.status === "current";
            return (
              <div key={p.label} style={{ flex: 1, position: "relative" }}>
                {i < PHASES.length - 1 && <div style={{ position: "absolute", top: 15, left: "50%", right: "-50%", height: 2, background: done ? "#3B5BDB" : "#ECEFF5" }} />}
                <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <div className="mono" style={{ width: 32, height: 32, borderRadius: "50%", background: done ? "#3B5BDB" : cur ? "#E8F0FF" : "var(--page-bg)", border: `2px solid ${done || cur ? "#3B5BDB" : "#E1E5EF"}`, display: "flex", alignItems: "center", justifyContent: "center", color: done ? "#fff" : cur ? "#3B5BDB" : "#A4ADC4", fontSize: 13, fontWeight: 700, boxShadow: cur ? "0 0 0 6px rgba(59,91,219,.14)" : "none" }}>{done ? "✓" : i + 1}</div>
                  <div style={{ marginTop: 8, fontSize: 11.5, fontWeight: cur ? 700 : 600, color: cur ? "#3B5BDB" : done ? "#0F1A36" : "#7C87A4" }}>{p.label}</div>
                  <div className="mono" style={{ fontSize: 10, color: "#A4ADC4", marginTop: 2 }}>{p.date}</div>
                  {cur && <div style={{ marginTop: 4, padding: "2px 8px", background: "#3B5BDB", color: "#fff", fontSize: 9.5, fontWeight: 700, borderRadius: 999 }}>지금 여기</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </RoleShell>
  );
}
