"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { Button } from "@/components/Button";
import { FORMAT_COLOR } from "./shared";
import type { WizardState, WizardKR } from "@/lib/wizard";
import { weightSum } from "@/lib/wizard";
import type { CriteriaData } from "@/lib/dataAccess";

const AI_BADGE: Record<string, { c: string; bg: string; short: string; ico: string }> = {
  claude: { c: "#D97757", bg: "#FBF0E9", short: "Claude", ico: "🌀" },
  gpt: { c: "#10A37F", bg: "#E6F5F0", short: "GPT", ico: "✦" },
  gemini: { c: "#4285F4", bg: "#E8F0FE", short: "Gemini", ico: "✧" },
};

// 수정 흐름: ✏️ 수정 버튼 → 편집 → (내용이 바뀌면) 옅은 개나리색 미확정 상태 → ✓ 확정 버튼으로 커밋
const boxBase: CSSProperties = { padding: "8px 11px", fontSize: 13, borderRadius: 8, lineHeight: 1.5, display: "flex", alignItems: "center", gap: 6, minHeight: 36, flex: 1 };

function EditableField({ value, onCommit, multiline, mono, fontSize = 13, fontWeight = 500, color = "#0F1A36" }: { value: string; onCommit: (v: string) => void; multiline?: boolean; mono?: boolean; fontSize?: number; fontWeight?: number; color?: string }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);
  const font = mono ? "var(--font-mono)" : "var(--font-sans)";
  const dirty = val !== value; // 수정했지만 아직 확정(✓) 전

  function confirm() {
    setEditing(false);
    if (dirty) onCommit(val);
  }
  function cancelEdit() {
    setVal(value);
    setEditing(false);
  }

  const iconBtn: CSSProperties = { width: 28, height: 28, borderRadius: 8, border: "1px solid #E1E5EF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 };

  if (editing) {
    const common = { width: "100%", padding: "8px 11px", fontSize, fontWeight, color, fontFamily: font, background: dirty ? "#FFFBE6" : "#fff", border: "1.5px solid #3B5BDB", borderRadius: 8, outline: "none", lineHeight: 1.5, boxShadow: "0 0 0 4px rgba(59,91,219,.12)" } as CSSProperties;
    return (
      <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
        {multiline
          ? <textarea autoFocus value={val} rows={2} onChange={(e) => setVal(e.target.value)} onBlur={() => setEditing(false)} onKeyDown={(e) => { if (e.key === "Escape") cancelEdit(); }} style={{ ...common, resize: "vertical" }} />
          : <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => setEditing(false)} onKeyDown={(e) => { if (e.key === "Enter") confirm(); if (e.key === "Escape") cancelEdit(); }} style={common} />}
        <button title="확정" onMouseDown={(e) => e.preventDefault()} onClick={confirm} style={{ ...iconBtn, background: "#2F9E5E", border: "1px solid #2F9E5E", color: "#fff", marginTop: 2 }}>✓</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <div
        style={{
          ...boxBase,
          fontSize, fontWeight, color, fontFamily: font,
          background: dirty ? "#FFFBE6" : "#F9FAFC",
          border: dirty ? "1.5px solid #F0DFA0" : "1px dashed #D5DDF0",
        }}
      >
        {val || <span style={{ color: "#A6AEC2" }}>내용을 입력해주세요</span>}
        {dirty && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#B8860B", flexShrink: 0 }}>확정 전</span>}
      </div>
      <button title="수정" onClick={() => setEditing(true)} style={iconBtn}>✏️</button>
      {dirty && (
        <button title="확정" onClick={confirm} style={{ ...iconBtn, background: "#2F9E5E", border: "1px solid #2F9E5E", color: "#fff" }}>✓</button>
      )}
    </div>
  );
}

function AIChipBadge({ vendor }: { vendor: string }) {
  const v = AI_BADGE[vendor];
  if (!v) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: v.bg, color: v.c, fontSize: 11, fontWeight: 700 }}>{v.ico} {v.short} 채택</span>;
}

function FinalKRCard({ kr, patch, forceOpen }: { kr: WizardKR; patch: (p: Partial<WizardKR>) => void; forceOpen?: boolean }) {
  const [expanded, setExpanded] = useState(kr.num === 1);
  useEffect(() => { if (forceOpen) setExpanded(true); }, [forceOpen]);
  const fmtColor = FORMAT_COLOR[kr.format] ?? { bg: "#F1F3F8", fg: "#5B6685" };
  const grades: [keyof WizardKR["grades"], string][] = [["S", "#7C4DD9"], ["A", "#3B5BDB"], ["B", "#2F9E5E"], ["C", "#D98023"], ["D", "#D64545"]];
  return (
    <div style={{ background: "#fff", border: `1px solid ${kr.chosenAI ? "#E1E5EF" : "#FFE0BA"}`, borderRadius: 14, overflow: "hidden" }}>
      <div onClick={() => setExpanded((e) => !e)} style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderBottom: expanded ? "1px solid #ECEFF5" : "none" }}>
        <span className="mono" style={{ padding: "2px 9px", borderRadius: 999, background: "#F1F4FD", color: "#213A8C", fontSize: 11, fontWeight: 700 }}>KR {String(kr.num).padStart(2, "0")}</span>
        <span style={{ padding: "2px 9px", borderRadius: 999, background: fmtColor.bg, color: fmtColor.fg, fontSize: 11, fontWeight: 600 }}>{kr.format || "형태 미선택"}</span>
        {kr.chosenAI ? <AIChipBadge vendor={kr.chosenAI} /> : <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 999, background: "#FFF7EC", color: "#D98023", fontSize: 11, fontWeight: 700 }}>! AI 의견 미채택</span>}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#7C87A4" }}>가중치 <b className="mono" style={{ color: "#0F1A36" }}>{kr.weight}%</b></span>
        <span style={{ fontSize: 13, color: "#A6AEC2" }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 5 }}>Objective</div>
            <EditableField value={kr.objective} onCommit={(v) => patch({ objective: v })} fontSize={13} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 5 }}>Key Result</div>
            <EditableField value={kr.kr} onCommit={(v) => patch({ kr: v })} multiline fontSize={14} fontWeight={600} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 170px 170px", gap: 12 }}>
            <div><div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", marginBottom: 5 }}>측정 방법</div><EditableField value={[kr.measureTool, kr.measureStat, kr.measureCycle].filter(Boolean).join(" · ")} onCommit={(v) => patch({ measureTool: v, measureStat: "", measureCycle: "" })} fontSize={12.5} /></div>
            <div><div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", marginBottom: 5 }}>Baseline</div><EditableField value={kr.baseline} onCommit={(v) => patch({ baseline: v })} mono fontSize={12.5} /></div>
            <div><div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", marginBottom: 5 }}>Goal</div><EditableField value={kr.goal} onCommit={(v) => patch({ goal: v })} mono fontSize={12.5} color="#3B5BDB" /></div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 7 }}>등급 기준 (S/A/B/C/D)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {grades.map(([g, c]) => (
                <div key={g} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, background: c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>{g}</span>
                  <div style={{ flex: 1 }}><EditableField value={kr.grades[g]} onCommit={(v) => patch({ grades: { ...kr.grades, [g]: v } })} fontSize={12} color="#3A4565" /></div>
                </div>
              ))}
            </div>
          </div>
          {kr.chosenAI && kr.aiSuggestion && (
            <div style={{ padding: "11px 14px", background: AI_BADGE[kr.chosenAI].bg, borderRadius: 10, fontSize: 11.5, color: "#3A4565", lineHeight: 1.55 }}>
              <b style={{ color: AI_BADGE[kr.chosenAI].c }}>{AI_BADGE[kr.chosenAI].ico} {AI_BADGE[kr.chosenAI].short} 의견</b> · {kr.aiSuggestion}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Step7({ state, set, criteria, evaluatorName, onSubmit, submitting, onPickKr }: {
  state: WizardState;
  set: (fn: (s: WizardState) => WizardState) => void;
  criteria: CriteriaData;
  evaluatorName: string;
  onSubmit: () => void;
  submitting: boolean;
  onPickKr: (krId: string) => void;
}) {
  const krs = state.krs;
  const [allOpen, setAllOpen] = useState(false);
  const sum = weightSum(krs);
  const adopted = krs.filter((k) => k.chosenAI).length;
  const unadopted = krs.filter((k) => !k.chosenAI);

  const patchKR = (id: string, p: Partial<WizardKR>) =>
    set((s) => ({ ...s, krs: s.krs.map((k) => (k.id === id ? { ...k, ...p } : k)) }));

  const stats = [
    { ico: "⚙️", bg: "#E5EBFB", fg: "#3B5BDB", label: "OKR 유형", val: state.okrType === "ops" ? "운영" : "전략 혁신", sub: `비중 ${state.okrType === "ops" ? criteria.system.weights.operation : criteria.system.weights.strategy}%` },
    { ico: "📊", bg: "#F1F4FD", fg: "#213A8C", label: "KR 개수", val: `${krs.length}개`, sub: `가중치 합 ${sum}/${criteria.system.scoreCap}` },
    { ico: "✨", bg: "#F5EFFD", fg: "#7C4DD9", label: "AI 채택", val: `${adopted} / ${krs.length}`, sub: unadopted.length > 0 ? `KR ${unadopted.map((k) => String(k.num).padStart(2, "0")).join("·")} 미채택` : "전체 채택 완료" },
    { ico: "✓", bg: "#ECFAF1", fg: "#2F9E5E", label: "정제 완료", val: `${krs.filter((k) => k.refined).length} / ${krs.length}`, sub: "STEP 3 정제 기준" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: s.bg, color: s.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.ico}</div>
            <div>
              <div style={{ fontSize: 11, color: "#7C87A4", fontWeight: 600 }}>{s.label}</div>
              <div className="ds-num" style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36", marginTop: 2 }}>{s.val}</div>
              <div style={{ fontSize: 10.5, color: "#A6AEC2" }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Editable KR list */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>📋 KR 최종 검토</h2>
        <span style={{ fontSize: 12, color: "#7C87A4" }}>인라인 편집 · 점선 박스를 클릭하면 바로 수정할 수 있어요</span>
        <Button variant="ai" size="sm" style={{ marginLeft: "auto" }} onClick={() => setAllOpen(true)}>⚗️ 전체 펼쳐서 검토</Button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {krs.map((kr) => <FinalKRCard key={kr.id} kr={kr} patch={(p) => patchKR(kr.id, p)} forceOpen={allOpen} />)}
      </div>

      {/* 미채택 알림 — KR별 버튼을 누르면 STEP 6의 해당 KR 탭이 바로 열림 */}
      {unadopted.length > 0 && (
        <div style={{ background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#7A4A14" }}>KR {unadopted.map((k) => String(k.num).padStart(2, "0")).join(", ")} — AI 의견을 아직 채택하지 않으셨어요</div>
            <div style={{ fontSize: 12, color: "#9C5E26", marginTop: 3, lineHeight: 1.55 }}>아래 버튼을 누르면 STEP 6에서 해당 KR의 AI 의견이 바로 열려요. 채택 없이 제출해도 팀장 코칭 시 함께 정제할 수 있어요.</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {unadopted.map((k) => (
                <Button key={k.id} variant="secondary" size="sm" onClick={() => onPickKr(k.id)}>
                  KR {String(k.num).padStart(2, "0")} 선택하러 가기 →
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 가중치 상한 초과 안내 */}
      {sum > criteria.system.scoreCap && (
        <div style={{ background: "#FDECEC", border: "1px solid #F5C6C6", borderRadius: 14, padding: "14px 20px", fontSize: 12.5, color: "#8C3A3A", lineHeight: 1.55 }}>
          ⚠️ KR 가중치 합이 <b className="mono">{sum}%</b>예요. 상한 <b className="mono">{criteria.system.scoreCap}%</b> 이하로 조정해주세요 (STEP 5에서 가중치를 수정할 수 있어요).
        </div>
      )}

      {/* Submit panel */}
      <div style={{ background: "linear-gradient(135deg, #0A1F17, #14342B)", color: "#fff", borderRadius: 16, padding: "26px 28px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,169,104,0.25)", color: "#7CE9BE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📥</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{evaluatorName} 팀장에게 제출하시겠어요?</div>
          <div style={{ fontSize: 12.5, color: "#9DB3A9", lineHeight: 1.5 }}>제출 후에도 팀장이 조정 요청 시 수정할 수 있어요.{unadopted.length > 0 && ` AI 의견을 채택하지 않은 KR ${unadopted.map((k) => String(k.num).padStart(2, "0")).join("·")}은 팀장 코칭 시 함께 정제하실 수 있습니다.`}</div>
        </div>
        <Button variant="primary" onClick={onSubmit} disabled={submitting} style={{ padding: "12px 22px" }}>{submitting ? "제출 중…" : "제출하기 →"}</Button>
      </div>
    </div>
  );
}
