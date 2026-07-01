"use client";

import { useState } from "react";
import { label, input } from "./shared";

interface KRItem { id: string; num: number; label: string; weight: number; done: boolean; baseline: string; goal: string; unit: string }
const KRS: KRItem[] = [
  { id: "kr1", num: 1, label: "결제 게이트웨이 APM p95 응답속도 850→500ms", weight: 30, done: false, baseline: "850ms", goal: "500ms", unit: "ms" },
  { id: "kr2", num: 2, label: "결제 인증모듈 단위테스트 커버리지 65→85%", weight: 25, done: true, baseline: "65%", goal: "85%", unit: "%" },
  { id: "kr3", num: 3, label: "장애 알림 룰 자동화 4단계 중 3단계", weight: 20, done: false, baseline: "1/4", goal: "3/4", unit: "단계" },
];

const GRADES = [
  { g: "S", color: "#7C4DD9", def: "≤400ms — 목표 초과 20% 달성" },
  { g: "A", color: "#3B5BDB", def: "≤500ms — 목표 달성 (월평균)", target: true },
  { g: "B", color: "#2F9E5E", def: "500~650ms — 목표의 70~99%" },
  { g: "C", color: "#D98023", def: "650~800ms — 개선 추세 확인" },
  { g: "D", color: "#D64545", def: "≥800ms — baseline 수준" },
];

function AICoach({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  if (!open) return null;
  return (
    <div style={{ width: 320, flexShrink: 0, background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: 560 }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✨</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>AI 코치</div>
          <div style={{ fontSize: 10.5, color: "#7C87A4" }}>등급 기준 정의 도우미</div>
        </div>
        <button onClick={onClose} style={{ border: "none", background: "transparent", color: "#A6AEC2", cursor: "pointer", fontSize: 18 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ padding: "11px 14px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: "4px 12px 12px 12px", fontSize: 12.5, color: "#1F2A4A", lineHeight: 1.55 }}>✨ A등급은 <b>500ms</b>로 설정되어 있어요. S등급은 보통 <b>목표보다 20% 더 좋은 값</b>을 잡아요.</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["S = 400ms로 자동 적용", "C·D 기준도 추천해줘", "보수적으로 잡기"].map((s) => <button key={s} onClick={() => setText(s)} style={{ padding: "6px 11px", background: "#F1F4FD", color: "#2748C8", border: "1px solid #C5D0F7", borderRadius: 999, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{s}</button>)}
        </div>
        <div style={{ alignSelf: "flex-end", maxWidth: "85%", padding: "11px 14px", background: "#3B5BDB", color: "#fff", borderRadius: "12px 4px 12px 12px", fontSize: 12.5, lineHeight: 1.55 }}>S = 400ms로 적용하고, C·D도 추천해줘요.</div>
        <div style={{ padding: "11px 14px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: "4px 12px 12px 12px", fontSize: 12.5, color: "#0A6B44", lineHeight: 1.7 }}>✨ 좋아요! 좌측 폼에 자동 반영했어요:<br />S = ≤400ms ✓<br />B = 500~650ms ✓<br />C = 650~800ms ✓<br />D = ≥800ms ✓</div>
      </div>
      <div style={{ padding: "12px 18px 14px", borderTop: "1px solid #ECEFF5", display: "flex", gap: 8, alignItems: "flex-end", background: "#F9FAFC" }}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder="등급 기준을 물어보세요…" style={{ flex: 1, border: "1px solid #E1E5EF", borderRadius: 9, padding: "8px 11px", outline: "none", background: "#fff", fontFamily: "var(--font-sans)", fontSize: 12.5, resize: "none" }} />
        <button onClick={() => setText("")} style={{ width: 32, height: 32, borderRadius: 8, background: "#3B5BDB", border: "none", color: "#fff", fontSize: 13, cursor: "pointer", flexShrink: 0 }}>↑</button>
      </div>
    </div>
  );
}

export function Step5() {
  const [activeKR, setActiveKR] = useState("kr1");
  const [aiOpen, setAiOpen] = useState(false);
  const kr = KRS.find((k) => k.id === activeKR)!;

  return (
    <div style={{ position: "relative", display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>STEP 5 / 7</div>
        <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#0F1A36" }}>각 KR의 측정 방법과 등급 기준을 정해주세요</h2>

        {/* KR tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {KRS.map((k) => {
            const on = activeKR === k.id;
            return (
              <button key={k.id} onClick={() => setActiveKR(k.id)} style={{ flex: 1, textAlign: "left", padding: "12px 14px", background: on ? "#F1F4FD" : "#fff", border: `1.5px solid ${on ? "#3B5BDB" : "#E1E5EF"}`, borderRadius: 11, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#213A8C" }}>KR {k.num.toString().padStart(2, "0")}</span>
                  <span style={{ padding: "1px 8px", borderRadius: 999, background: "var(--page-bg)", color: "#5B6685", fontSize: 10, fontWeight: 700 }}>가중치 {k.weight}%</span>
                  {k.done && <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3, color: "#2F9E5E", fontSize: 10.5, fontWeight: 700 }}>✓ 완료</span>}
                </div>
                <div style={{ fontSize: 12, color: "#3A4565", lineHeight: 1.45 }}>{k.label}</div>
              </button>
            );
          })}
        </div>

        {/* 1. 측정 방법 */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "22px 24px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 24, height: 24, borderRadius: 7, background: "#F1F4FD", color: "#3B5BDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>1</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>측정 방법</span>
          </div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 16 }}>어떻게 측정하고 검증할지 정해주세요</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div><label style={label}>측정 도구</label><input style={input} defaultValue="APM (Datadog)" /></div>
            <div><label style={label}>통계 단위</label><input style={input} defaultValue="p95" /></div>
            <div><label style={label}>집계 주기</label><input style={input} defaultValue="월평균" /></div>
          </div>
        </div>

        {/* 2. 등급 기준 */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 24, height: 24, borderRadius: 7, background: "#F5EFFD", color: "#7C4DD9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>2</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>S / A / B / C / D 등급 기준</span>
            <button onClick={() => setAiOpen(true)} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>✨ AI로 자동 생성</button>
          </div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 16 }}>Baseline {kr.baseline} → Goal {kr.goal} · A등급이 목표선이에요</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {GRADES.map((g) => (
              <div key={g.g} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: g.target ? "#F1F4FD" : "#F9FAFC", border: `1px solid ${g.target ? "#C5D0F7" : "#ECEFF5"}`, borderRadius: 11 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: g.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{g.g}</div>
                <input style={{ ...input, flex: 1 }} defaultValue={g.def} />
                {g.target && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, background: "#3B5BDB", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>★ 목표선 (A등급)</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AICoach open={aiOpen} onClose={() => setAiOpen(false)} />
      {!aiOpen && (
        <button onClick={() => setAiOpen(true)} style={{ position: "sticky", top: 8, alignSelf: "flex-start", padding: "10px 14px", background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", border: "none", borderRadius: 11, boxShadow: "0 8px 18px -4px rgba(59,91,219,.4)", display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", flexShrink: 0 }}>✨ AI 코치</button>
      )}
    </div>
  );
}
