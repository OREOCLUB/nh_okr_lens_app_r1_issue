"use client";

import { useState } from "react";
import { label, input, generateGrades, generateInitiatives } from "./shared";
import { gradesDirty, type WizardState, type WizardKR } from "@/lib/wizard";
import { askCoach, nowTime } from "@/lib/aiCoach";
import type { ChatMsg } from "@/lib/wizard";

const GRADE_META: [keyof WizardKR["grades"], string][] = [
  ["S", "#7C4DD9"],
  ["A", "#3B5BDB"],
  ["B", "#2F9E5E"],
  ["C", "#D98023"],
  ["D", "#D64545"],
];

function AICoach({ open, onClose, kr, onAutoFill }: { open: boolean; onClose: () => void; kr: WizardKR; onAutoFill: () => void }) {
  const [text, setText] = useState("");
  const [chat, setChat] = useState<ChatMsg[]>([
    { from: "ai", time: nowTime(), text: `A등급은 목표선(${kr.goal})이에요. S등급은 보통 목표보다 20% 더 좋은 값을 잡아요. "자동 생성"을 누르면 좌측 폼에 등급 초안을 채워드릴게요.` },
  ]);
  const [loading, setLoading] = useState(false);

  async function send(raw: string) {
    const t = raw.trim();
    if (!t || loading) return;
    setText("");
    const userMsg: ChatMsg = { from: "user", time: nowTime(), text: t };
    setChat((c) => [...c, userMsg]);
    setLoading(true);
    try {
      const history = [...chat, userMsg].map((m) => ({ role: m.from === "ai" ? ("assistant" as const) : ("user" as const), content: m.text }));
      const reply = await askCoach("grade", history, { krs: [{ num: kr.num, kr: kr.kr, baseline: kr.baseline, goal: kr.goal }] });
      setChat((c) => [...c, { from: "ai", time: nowTime(), text: reply.text }]);
    } catch {
      setChat((c) => [...c, { from: "ai", time: nowTime(), text: "연결이 잠시 원활하지 않았어요. 다시 보내주시면 이어서 도와드릴게요 🙂" }]);
    } finally {
      setLoading(false);
    }
  }

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
        {chat.map((m, i) =>
          m.from === "ai" ? (
            <div key={i} style={{ padding: "11px 14px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: "4px 12px 12px 12px", fontSize: 12.5, color: "#1F2A4A", lineHeight: 1.6, whiteSpace: "pre-line" }}>✨ {m.text}</div>
          ) : (
            <div key={i} style={{ alignSelf: "flex-end", maxWidth: "85%", padding: "11px 14px", background: "#3B5BDB", color: "#fff", borderRadius: "12px 4px 12px 12px", fontSize: 12.5, lineHeight: 1.55 }}>{m.text}</div>
          )
        )}
        {loading && <div style={{ fontSize: 12, color: "#7C87A4" }}>생각을 정리하는 중이에요…</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button onClick={onAutoFill} style={{ padding: "6px 11px", background: "#3B5BDB", color: "#fff", border: "none", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>✨ 등급 초안 자동 생성</button>
          {["S등급 기준을 어떻게 잡을까요?", "보수적으로 잡고 싶어요"].map((s) => (
            <button key={s} onClick={() => send(s)} style={{ padding: "6px 11px", background: "#F1F4FD", color: "#2748C8", border: "1px solid #C5D0F7", borderRadius: 999, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 18px 14px", borderTop: "1px solid #ECEFF5", display: "flex", gap: 8, alignItems: "flex-end", background: "#F9FAFC" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
          rows={1}
          placeholder="등급 기준을 물어보세요…"
          style={{ flex: 1, border: "1px solid #E1E5EF", borderRadius: 9, padding: "8px 11px", outline: "none", background: "#fff", fontFamily: "var(--font-sans)", fontSize: 12.5, resize: "none" }}
        />
        <button onClick={() => send(text)} disabled={loading} style={{ width: 32, height: 32, borderRadius: 8, background: "#3B5BDB", border: "none", color: "#fff", fontSize: 13, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1, flexShrink: 0 }}>↑</button>
      </div>
    </div>
  );
}

export function Step5({ state, set }: { state: WizardState; set: (fn: (s: WizardState) => WizardState) => void }) {
  const krs = state.krs;
  const [activeId, setActiveId] = useState(krs[0]?.id ?? "");
  const [aiOpen, setAiOpen] = useState(false);
  const kr = krs.find((k) => k.id === activeId) ?? krs[0];

  const patchKR = (id: string, patch: Partial<WizardKR>) =>
    set((s) => ({ ...s, krs: s.krs.map((k) => (k.id === id ? { ...k, ...patch } : k)) }));

  // 등급 수정은 draft에 먼저 기록 — ✓ 확정을 눌러야 grades로 커밋된다
  const patchGradeDraft = (id: string, g: keyof WizardKR["grades"], v: string) =>
    set((s) => ({
      ...s,
      krs: s.krs.map((k) => (k.id === id ? { ...k, gradesDraft: { ...(k.gradesDraft ?? k.grades), [g]: v } } : k)),
    }));

  const confirmGrades = (id: string) =>
    set((s) => ({
      ...s,
      krs: s.krs.map((k) => (k.id === id && k.gradesDraft ? { ...k, grades: k.gradesDraft, gradesDraft: null } : k)),
    }));

  const cancelGrades = (id: string) =>
    set((s) => ({ ...s, krs: s.krs.map((k) => (k.id === id ? { ...k, gradesDraft: null } : k)) }));

  // AI 자동 생성도 draft로 — 검토 후 확정
  const autoFill = () => kr && patchKR(kr.id, { gradesDraft: generateGrades(kr) });

  const isDone = (k: WizardKR) => !!k.measureTool.trim() && !!k.grades.A.trim() && !gradesDirty(k);

  if (!kr) {
    return <div style={{ padding: 40, background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, textAlign: "center", color: "#7C87A4", fontSize: 13.5 }}>KR 후보가 아직 없어요. STEP 2~3에서 기초 정보를 먼저 정리해주세요.</div>;
  }

  return (
    <div style={{ position: "relative", display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>STEP 5 / 7</div>
        <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#0F1A36" }}>각 KR의 측정 방법과 등급 기준을 정해주세요</h2>

        {/* KR tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {krs.map((k) => {
            const on = kr.id === k.id;
            return (
              <button key={k.id} onClick={() => setActiveId(k.id)} style={{ flex: 1, textAlign: "left", padding: "12px 14px", background: on ? "#F1F4FD" : "#fff", border: `1.5px solid ${on ? "#3B5BDB" : "#E1E5EF"}`, borderRadius: 11, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#213A8C" }}>KR {String(k.num).padStart(2, "0")}</span>
                  <span style={{ padding: "1px 8px", borderRadius: 999, background: "var(--page-bg)", color: "#5B6685", fontSize: 10, fontWeight: 700 }}>가중치 {k.weight}%</span>
                  {isDone(k) && <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3, color: "#2F9E5E", fontSize: 10.5, fontWeight: 700 }}>✓ 완료</span>}
                </div>
                <div style={{ fontSize: 12, color: "#3A4565", lineHeight: 1.45 }}>{k.kr}</div>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 120px", gap: 14 }}>
            <div><label style={label}>측정 도구 <span style={{ color: "#D64545" }}>*</span></label><input style={input} value={kr.measureTool} onChange={(e) => patchKR(kr.id, { measureTool: e.target.value })} placeholder="예: APM (Datadog)" /></div>
            <div><label style={label}>통계 단위</label><input style={input} value={kr.measureStat} onChange={(e) => patchKR(kr.id, { measureStat: e.target.value })} placeholder="예: p95" /></div>
            <div><label style={label}>집계 주기</label><input style={input} value={kr.measureCycle} onChange={(e) => patchKR(kr.id, { measureCycle: e.target.value })} placeholder="예: 월평균" /></div>
            <div><label style={label}>가중치 (%)</label><input className="mono" style={input} type="number" min={0} max={110} value={kr.weight} onChange={(e) => patchKR(kr.id, { weight: Math.max(0, Math.min(110, Number(e.target.value) || 0)) })} /></div>
          </div>
        </div>

        {/* 2. 등급 기준 — 수정은 개나리색 미확정 상태로 표시, ✓ 확정을 눌러야 반영 */}
        <div style={{ background: "#fff", border: `1px solid ${gradesDirty(kr) ? "#F0DFA0" : "#E1E5EF"}`, borderRadius: 16, padding: "22px 24px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ width: 24, height: 24, borderRadius: 7, background: "#F5EFFD", color: "#7C4DD9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>2</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>S / A / B / C / D 등급 기준</span>
            {gradesDirty(kr) && <span style={{ padding: "2px 10px", borderRadius: 999, background: "#FFFBE6", border: "1px solid #F0DFA0", color: "#B8860B", fontSize: 11, fontWeight: 700 }}>확정 전 변경 있음</span>}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {gradesDirty(kr) && (
                <>
                  <button onClick={() => cancelGrades(kr.id)} style={{ padding: "7px 13px", background: "#fff", color: "#5B6685", border: "1px solid #E1E5EF", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>↩ 취소 (원복)</button>
                  <button onClick={() => confirmGrades(kr.id)} style={{ padding: "7px 13px", background: "#2F9E5E", color: "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>✓ 등급 확정</button>
                </>
              )}
              <button onClick={autoFill} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>✨ AI로 자동 생성</button>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 16 }}>Baseline {kr.baseline} → Goal {kr.goal} · A등급이 목표선이에요 <span style={{ color: "#D64545" }}>(A등급 필수)</span> · 수정 후 ✓ 확정을 눌러야 다음 단계로 넘어갈 수 있어요</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {GRADE_META.map(([g, color]) => {
              const target = g === "A";
              const shown = kr.gradesDraft?.[g] ?? kr.grades[g];
              const changed = kr.gradesDraft != null && kr.gradesDraft[g] !== kr.grades[g];
              return (
                <div key={g} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: changed ? "#FFFBE6" : target ? "#F1F4FD" : "#F9FAFC", border: `1px solid ${changed ? "#F0DFA0" : target ? "#C5D0F7" : "#ECEFF5"}`, borderRadius: 11 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{g}</div>
                  <input style={{ ...input, flex: 1, background: changed ? "#FFFBE6" : "#fff" }} value={shown} onChange={(e) => patchGradeDraft(kr.id, g, e.target.value)} placeholder={target ? "목표 달성 기준을 적어주세요" : ""} />
                  {changed && <span style={{ fontSize: 10.5, fontWeight: 700, color: "#B8860B", flexShrink: 0 }}>확정 전</span>}
                  {target && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, background: "#3B5BDB", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>★ 목표선 (A등급)</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. 참고 실행계획 — 등급 기준에 맞춰 자동 제안 */}
        <div style={{ background: "linear-gradient(135deg, #F1FBF6, #fff 55%)", border: "1px solid #B9F1D8", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 24, height: 24, borderRadius: 7, background: "#E0F7EC", color: "#00794B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>3</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>참고 실행계획 (AI 제안)</span>
            <span style={{ fontSize: 10.5, color: "#2F9E5E", fontWeight: 700, marginLeft: "auto" }}>등급 기준 기반 자동 제안</span>
          </div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 12 }}>등급 기준에 맞춰 참고용으로 제안하는 실행계획이에요. 그대로 쓰지 않아도 괜찮아요.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {generateInitiatives(kr).map((it, i) => (
              <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "9px 12px", background: "#fff", border: "1px solid #DFF3E8", borderRadius: 9, fontSize: 12.5, color: "#3A4565", lineHeight: 1.55 }}>
                <span className="mono" style={{ color: "#00A968", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                {it}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AICoach open={aiOpen} onClose={() => setAiOpen(false)} kr={kr} onAutoFill={autoFill} />
      {!aiOpen && (
        <button onClick={() => setAiOpen(true)} style={{ position: "sticky", top: 8, alignSelf: "flex-start", padding: "10px 14px", background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", border: "none", borderRadius: 11, boxShadow: "0 8px 18px -4px rgba(59,91,219,.4)", display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", flexShrink: 0 }}>✨ AI 코치</button>
      )}
    </div>
  );
}
