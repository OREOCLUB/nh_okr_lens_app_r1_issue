"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { scheduleTypes, members as seedMembers, type Member } from "@/lib/mockData";
import { getMembers } from "@/lib/dataAccess";

interface Ev { type: keyof typeof scheduleTypes; title: string; time: string; focus?: boolean }

const EVENTS: Record<number, Ev[]> = {
  1: [{ type: "kickoff", title: "OKR 등록 시작", time: "전일" }],
  8: [{ type: "quarter", title: "분기 미팅", time: "10:00" }],
  10: [{ type: "oneonone", title: "1on1 — 김지훈", time: "10:00", focus: true }],
  14: [{ type: "oneonone", title: "1on1 — 김태양", time: "14:00", focus: true }],
  15: [{ type: "oneonone", title: "1on1 — 강동우", time: "10:00", focus: true }],
  17: [{ type: "quarter", title: "분기 중간 점검", time: "14:00" }],
  22: [{ type: "oneonone", title: "1on1 — 박서연", time: "10:30", focus: true }, { type: "oneonone", title: "1on1 — 한지윤", time: "14:00", focus: true }],
  23: [{ type: "etc", title: "팀 간담회", time: "15:00" }],
  30: [{ type: "deadline", title: "OKR 등록 마감", time: "18:00" }],
};

const MONTH_LIST = [
  { date: "07/01", type: "kickoff", title: "OKR 등록 시작", time: "전일", target: null },
  { date: "07/08", type: "quarter", title: "분기 미팅", time: "10:00", target: "팀 전체" },
  { date: "07/14", type: "oneonone", title: "1on1 코칭", time: "14:00", target: "김태양", focus: true },
  { date: "07/15", type: "oneonone", title: "1on1 코칭", time: "10:00", target: "강동우", focus: true },
  { date: "07/17", type: "quarter", title: "분기 중간 점검", time: "14:00", target: "팀 전체" },
  { date: "07/22", type: "oneonone", title: "1on1 코칭", time: "10:30", target: "박서연", focus: true },
  { date: "07/30", type: "deadline", title: "OKR 등록 마감", time: "18:00", target: null },
] as const;

function Calendar() {
  const firstOffset = 2; // 2026-07-01 = 수요일 (월=0)
  const total = 31;
  const TODAY = 1;
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstOffset; i++) cells.push(null);
  for (let i = 1; i <= total; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px", boxShadow: "var(--shadow-xs)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>2026 · 07월</div>
          <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2 }}>등록 일정 12건 · 1on1 7건 · 분기 미팅 2건</div>
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
          const ev = EVENTS[d];
          const isToday = d === TODAY;
          const dow = (firstOffset + d - 1) % 7;
          const dateColor = dow === 6 ? "#D14343" : dow === 5 ? "#2B5DD9" : "#3A4565";
          return (
            <div key={i} onClick={() => alert(ev ? `7월 ${d}일 일정 ${ev.length}건 (프로토타입)` : `7월 ${d}일 · 일정 등록은 준비 중이에요 🙂`)} style={{ minHeight: 84, background: isToday ? "#F1FBF6" : "#fff", border: `1px solid ${isToday ? "#00A968" : "#ECEFF5"}`, borderRadius: 8, padding: "5px 6px", overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer" }}>
              <div className="ds-num" style={{ fontSize: 11.5, fontWeight: isToday ? 700 : 600, color: isToday ? "#00A968" : dateColor, marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
                {d}
                {isToday && <span style={{ fontSize: 8.5, padding: "1px 5px", background: "#00A968", color: "#fff", borderRadius: 3 }}>오늘</span>}
              </div>
              {ev?.slice(0, 3).map((e, j) => {
                const c = scheduleTypes[e.type];
                return (
                  <div key={j} style={{ background: c.bg, color: c.fg, fontSize: 9.5, fontWeight: 600, padding: "2px 5px", borderRadius: 4, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 3 }} title={`${e.time} ${e.title}`}>
                    <span style={{ fontSize: 9 }}>{c.ico}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</span>
                  </div>
                );
              })}
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
  );
}

export default function R2CalendarPage() {
  const [members, setMembers] = useState<Member[]>(seedMembers);

  useEffect(() => {
    getMembers().then((m) => m && setMembers(m));
  }, []);

  const unregistered = members.filter((m) => m.focus && !m.coaching);
  return (
    <RoleShell
      role="R2"
      title="코칭 캘린더"
      subtitle="박정훈 팀장 · 이번 달 1on1 7건"
      actions={<Button variant="primary" size="sm" leftIcon={<span>+</span>} onClick={() => alert("일정 등록은 준비 중이에요 🙂")}>일정 등록</Button>}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#00A968", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 하반기 · 7월</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>팀원과의 일정을 한눈에</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#5B6685" }}>오늘은 OKR 등록이 시작되는 날이에요. 김지훈 님의 코칭 요청 1건이 대기 중이에요.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.65fr) 320px", gap: 18 }}>
        <Calendar />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Month list */}
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>이번 달 일정</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {MONTH_LIST.map((e, i) => {
                const t = scheduleTypes[e.type];
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 8 }}>
                    <div style={{ fontSize: 14 }}>{t.ico}</div>
                    <div className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: t.fg, width: 36 }}>{e.date}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#0F1A36" }}>{e.title}</span>
                        {e.target && <span style={{ fontSize: 11, color: "#7C87A4" }}>· {e.target}</span>}
                        {"focus" in e && e.focus && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#D98023", marginLeft: 2 }} />}
                      </div>
                    </div>
                    <div className="mono" style={{ fontSize: 10.5, color: "#A4ADC4" }}>{e.time}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unregistered */}
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
