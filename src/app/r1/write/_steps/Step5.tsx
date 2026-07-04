"use client";

import { useState, type CSSProperties } from "react";
import { label, input, generateGrades, generateInitiatives, DraftRow } from "./shared";
import { gradesDirty, type WizardState, type WizardKR, type KRGrades } from "@/lib/wizard";
import { askCoach, nowTime } from "@/lib/aiCoach";
import type { ChatMsg } from "@/lib/wizard";

const GRADE_META: [keyof KRGrades, string][] = [
  ["S", "#7C4DD9"],
  ["A", "#3B5BDB"],
  ["B", "#2F9E5E"],
  ["C", "#D98023"],
  ["D", "#D64545"],
];

// ── AI 코치 — 우하단 플로팅 버튼 + 오버레이 패널 (레이아웃 비점유) ──
function AICoachOverlay({ kr, onAutoFill }: { kr: WizardKR; onAutoFill: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState<ChatMsg[]>([
    { from: "ai", time: nowTime(), text: `A등급은 목표선(${kr.goal})이에요. S등급은 보통 목표보다 20% 더 좋은 값을 잡아요. "자동 생성"을 누르면 등급 초안을 채워드릴게요.` },
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

  return (
    <>
      {/* 플로팅 버튼 — 콘텐츠 영역을 차지하지 않음 */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{ position: "fixed", right: 30, bottom: 30, zIndex: 60, padding: "13px 18px", background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", border: "none", borderRadius: 999, boxShadow: "0 10px 24px -6px rgba(59,91,219,.5)", display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}
        >
          ✨ AI 코치
        </button>
      )}
      {open && (
        <div style={{ position: "fixed", right: 30, bottom: 30, zIndex: 60, width: 340, height: 480, background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px -12px rgba(15,26,54,.3)" }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center", gap: 9, background: "linear-gradient(135deg, #F1F4FD, #fff)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>AI 코치</div>
              <div style={{ fontSize: 10.5, color: "#7C87A4" }}>KR {String(kr.num).padStart(2, "0")} 등급 기준 도우미</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ border: "none", background: "transparent", color: "#A6AEC2", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {chat.map((m, i) =>
              m.from === "ai" ? (
                <div key={i} style={{ padding: "10px 13px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: "4px 12px 12px 12px", fontSize: 12.5, color: "#1F2A4A", lineHeight: 1.6, whiteSpace: "pre-line" }}>✨ {m.text}</div>
              ) : (
                <div key={i} style={{ alignSelf: "flex-end", maxWidth: "85%", padding: "10px 13px", background: "#3B5BDB", color: "#fff", borderRadius: "12px 4px 12px 12px", fontSize: 12.5, lineHeight: 1.55 }}>{m.text}</div>
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
          <div style={{ padding: "10px 14px 12px", borderTop: "1px solid #ECEFF5", display: "flex", gap: 8, alignItems: "flex-end", background: "#F9FAFC" }}>
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
      )}
    </>
  );
}

// 고정 슬롯 일괄 버튼 (비활성 시에도 자리 유지 — 레이아웃 고정)
const bulkBtn = (active: boolean, primary?: boolean): CSSProperties => ({
  padding: "7px 13px",
  borderRadius: 9,
  fontSize: 12,
  fontWeight: primary ? 700 : 600,
  fontFamily: "var(--font-sans)",
  cursor: active ? "pointer" : "default",
  opacity: active ? 1 : 0.35,
  background: primary ? "#2F9E5E" : "#fff",
  color: primary ? "#fff" : "#5B6685",
  border: primary ? "1px solid #2F9E5E" : "1px solid #E1E5EF",
});

export function Step5({ state, set }: { state: WizardState; set: (fn: (s: WizardState) => WizardState) => void }) {
  const krs = state.krs;
  const [activeId, setActiveId] = useState(krs[0]?.id ?? "");
  const kr = krs.find((k) => k.id === activeId) ?? krs[0];

  const patchKR = (id: string, patch: Partial<WizardKR>) =>
    set((s) => ({ ...s, krs: s.krs.map((k) => (k.id === id ? { ...k, ...patch } : k)) }));

  // 등급 수정 → draft 기록 (바로 입력)
  const patchGradeDraft = (id: string, g: keyof KRGrades, v: string) =>
    set((s) => ({
      ...s,
      krs: s.krs.map((k) => (k.id === id ? { ...k, gradesDraft: { ...(k.gradesDraft ?? k.grades), [g]: v } } : k)),
    }));

  // 줄별 확정/취소 — 전부 일치하면 draft 해제
  const commitGrade = (id: string, g: keyof KRGrades) =>
    set((s) => ({
      ...s,
      krs: s.krs.map((k) => {
        if (k.id !== id || !k.gradesDraft) return k;
        const grades = { ...k.grades, [g]: k.gradesDraft[g] };
        const clean = (Object.keys(grades) as (keyof KRGrades)[]).every((x) => k.gradesDraft![x] === grades[x]);
        return { ...k, grades, gradesDraft: clean ? null : k.gradesDraft };
      }),
    }));

  const revertGrade = (id: string, g: keyof KRGrades) =>
    set((s) => ({
      ...s,
      krs: s.krs.map((k) => {
        if (k.id !== id || !k.gradesDraft) return k;
        const draft = { ...k.gradesDraft, [g]: k.grades[g] };
        const clean = (Object.keys(k.grades) as (keyof KRGrades)[]).every((x) => draft[x] === k.grades[x]);
        return { ...k, gradesDraft: clean ? null : draft };
      }),
    }));

  const commitAll = (id: string) =>
    set((s) => ({ ...s, krs: s.krs.map((k) => (k.id === id && k.gradesDraft ? { ...k, grades: k.gradesDraft, gradesDraft: null } : k)) }));

  const revertAll = (id: string) =>
    set((s) => ({ ...s, krs: s.krs.map((k) => (k.id === id ? { ...k, gradesDraft: null } : k)) }));

  const autoFill = () => kr && patchKR(kr.id, { gradesDraft: generateGrades(kr) });

  const isDone = (k: WizardKR) => !!k.measureTool.trim() && !!k.grades.A.trim() && !gradesDirty(k);

  if (!kr) {
    return <div style={{ padding: 40, background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, textAlign: "center", color: "#7C87A4", fontSize: 13.5 }}>KR 후보가 아직 없어요. STEP 2~3에서 기초 정보를 먼저 정리해주세요.</div>;
  }

  const dirty = gradesDirty(kr);

  return (
    <div>
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
                {gradesDirty(k) && <span style={{ padding: "1px 8px", borderRadius: 999, background: "#FFFBE6", border: "1px solid #F0DFA0", color: "#B8860B", fontSize: 10, fontWeight: 700 }}>확정 전</span>}
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

      {/* 2. 등급 기준 — 바로 입력 + 줄별 확정/취소 + 영역 일괄 (버튼 슬롯 고정) */}
      <div style={{ background: "#fff", border: `1px solid ${dirty ? "#F0DFA0" : "#E1E5EF"}`, borderRadius: 16, padding: "22px 24px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ width: 24, height: 24, borderRadius: 7, background: "#F5EFFD", color: "#7C4DD9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>2</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>S / A / B / C / D 등급 기준</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button onClick={() => dirty && revertAll(kr.id)} style={bulkBtn(dirty)}>↩ 전체 취소</button>
            <button onClick={() => dirty && commitAll(kr.id)} style={bulkBtn(dirty, true)}>✓ 전체 확정</button>
            <button onClick={autoFill} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>✨ AI로 자동 생성</button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 16 }}>Baseline {kr.baseline} → Goal {kr.goal} · A등급이 목표선이에요 <span style={{ color: "#D64545" }}>(A등급 필수)</span> · 수정하면 줄별 ✓/↩ 버튼으로 확정하거나 되돌릴 수 있어요</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {GRADE_META.map(([g, color]) => {
            const target = g === "A";
            const shown = kr.gradesDraft?.[g] ?? kr.grades[g];
            return (
              <div key={g} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{g}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <DraftRow
                    value={shown}
                    committed={kr.grades[g]}
                    onChange={(v) => patchGradeDraft(kr.id, g, v)}
                    onCommit={() => commitGrade(kr.id, g)}
                    onRevert={() => revertGrade(kr.id, g)}
                    fontSize={12.5}
                    placeholder={target ? "목표 달성 기준을 적어주세요" : ""}
                  />
                </div>
                {/* 목표선 배지 슬롯 — A행 외에는 투명 자리로 고정 (레이아웃 불변) */}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, background: target ? "#3B5BDB" : "transparent", color: target ? "#fff" : "transparent", fontSize: 11, fontWeight: 700, flexShrink: 0, userSelect: "none" }}>★ 목표선 (A등급)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 참고 실행계획 */}
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

      <AICoachOverlay kr={kr} onAutoFill={autoFill} />
    </div>
  );
}
