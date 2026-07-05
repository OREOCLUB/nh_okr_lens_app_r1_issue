"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { Button } from "@/components/Button";
import { FORMAT_COLOR, DraftRow } from "./shared";
import type { WizardState, WizardKR, KRGrades, KRTextDraft } from "@/lib/wizard";
import { weightSum, submitReadiness, anyDirty, commitDrafts, measureText } from "@/lib/wizard";
import type { CriteriaData } from "@/lib/dataAccess";

const AI_BADGE: Record<string, { c: string; bg: string; short: string; ico: string }> = {
  claude: { c: "#D97757", bg: "#FBF0E9", short: "Claude", ico: "🌀" },
  gpt: { c: "#10A37F", bg: "#E6F5F0", short: "GPT", ico: "✦" },
  gemini: { c: "#4285F4", bg: "#E8F0FE", short: "Gemini", ico: "✧" },
};

const GRADE_META: [keyof KRGrades, string][] = [
  ["S", "#7C4DD9"],
  ["A", "#3B5BDB"],
  ["B", "#2F9E5E"],
  ["C", "#D98023"],
  ["D", "#D64545"],
];

const TEXT_FIELDS: (keyof KRTextDraft)[] = ["objective", "kr", "baseline", "goal", "measure", "plan"];

function AIChipBadge({ vendor }: { vendor: string }) {
  const v = AI_BADGE[vendor];
  if (!v) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: v.bg, color: v.c, fontSize: 11, fontWeight: 700 }}>{v.ico} {v.short} 채택</span>;
}

// 고정 슬롯 일괄 버튼 (비활성 시에도 자리 유지 — 레이아웃 고정)
const bulkBtn = (active: boolean, primary?: boolean): CSSProperties => ({
  padding: "6px 12px",
  borderRadius: 8,
  fontSize: 11.5,
  fontWeight: primary ? 700 : 600,
  fontFamily: "var(--font-sans)",
  cursor: active ? "pointer" : "default",
  opacity: active ? 1 : 0.35,
  background: primary ? "#2F9E5E" : "#fff",
  color: primary ? "#fff" : "#5B6685",
  border: primary ? "1px solid #2F9E5E" : "1px solid #E1E5EF",
  flexShrink: 0,
});

const sectionLabel: CSSProperties = { fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 5 };

function FinalKRCard({
  kr,
  patchText,
  commitText,
  revertText,
  patchGrade,
  commitGrade,
  revertGrade,
  commitCard,
  revertCard,
  bulk,
}: {
  kr: WizardKR;
  patchText: (field: keyof KRTextDraft, v: string) => void;
  commitText: (field: keyof KRTextDraft) => void;
  revertText: (field: keyof KRTextDraft) => void;
  patchGrade: (g: keyof KRGrades, v: string) => void;
  commitGrade: (g: keyof KRGrades) => void;
  revertGrade: (g: keyof KRGrades) => void;
  commitCard: () => void;
  revertCard: () => void;
  bulk: { mode: "open" | "close"; seq: number };
}) {
  const [expanded, setExpanded] = useState(kr.num === 1);
  useEffect(() => {
    if (bulk.seq > 0) setExpanded(bulk.mode === "open");
  }, [bulk.seq, bulk.mode]);
  const fmtColor = FORMAT_COLOR[kr.format] ?? { bg: "#F1F3F8", fg: "#5B6685" };
  const dirty = anyDirty(kr);

  const committedOf = (f: keyof KRTextDraft): string =>
    f === "measure" ? measureText(kr) : f === "plan" ? (kr.plan ?? "") : (kr[f as "objective" | "kr" | "baseline" | "goal"] ?? "");
  const shownOf = (f: keyof KRTextDraft): string => kr.textDraft?.[f] ?? committedOf(f);

  const textRow = (f: keyof KRTextDraft, opts?: { multiline?: boolean; mono?: boolean; fontSize?: number; fontWeight?: number; color?: string }) => (
    <DraftRow
      value={shownOf(f)}
      committed={committedOf(f)}
      onChange={(v) => patchText(f, v)}
      onCommit={() => commitText(f)}
      onRevert={() => revertText(f)}
      {...opts}
    />
  );

  return (
    <div style={{ background: "#fff", border: `1px solid ${dirty ? "#F0DFA0" : kr.chosenAI ? "#E1E5EF" : "#FFE0BA"}`, borderRadius: 14, overflow: "hidden" }}>
      <div onClick={() => setExpanded((e) => !e)} style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderBottom: expanded ? "1px solid #ECEFF5" : "none" }}>
        <span className="mono" style={{ padding: "2px 9px", borderRadius: 999, background: "#F1F4FD", color: "#213A8C", fontSize: 11, fontWeight: 700 }}>KR {String(kr.num).padStart(2, "0")}</span>
        <span style={{ padding: "2px 9px", borderRadius: 999, background: fmtColor.bg, color: fmtColor.fg, fontSize: 11, fontWeight: 600 }}>{kr.format || "형태 미선택"}</span>
        {kr.chosenAI ? <AIChipBadge vendor={kr.chosenAI} /> : <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 999, background: "#FFF7EC", color: "#D98023", fontSize: 11, fontWeight: 700 }}>! AI 의견 미채택</span>}
        {dirty && <span style={{ padding: "2px 9px", borderRadius: 999, background: "#FFFBE6", border: "1px solid #F0DFA0", color: "#B8860B", fontSize: 11, fontWeight: 700 }}>확정 전 변경</span>}
        {/* 카드 단위 일괄 확정/취소 — 자리 고정, 헤더 클릭과 분리 */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => dirty && revertCard()} style={bulkBtn(dirty)}>↩ 전체 취소</button>
          <button onClick={() => dirty && commitCard()} style={bulkBtn(dirty, true)}>✓ 전체 확정</button>
        </div>
        <span style={{ fontSize: 12, color: "#7C87A4", flexShrink: 0 }}>가중치 <b className="mono" style={{ color: "#0F1A36" }}>{kr.weight}%</b></span>
        <span style={{ fontSize: 13, color: "#A6AEC2" }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={sectionLabel}>Objective</div>
            {textRow("objective", { fontSize: 13 })}
          </div>
          <div>
            <div style={sectionLabel}>Key Result</div>
            {textRow("kr", { multiline: true, fontSize: 14, fontWeight: 600 })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 190px 190px", gap: 12 }}>
            <div><div style={sectionLabel}>측정 방법</div>{textRow("measure", { fontSize: 12.5 })}</div>
            <div><div style={sectionLabel}>Baseline</div>{textRow("baseline", { mono: true, fontSize: 12.5 })}</div>
            <div><div style={sectionLabel}>Goal</div>{textRow("goal", { mono: true, fontSize: 12.5, color: "#3B5BDB" })}</div>
          </div>
          <div>
            <div style={sectionLabel}>실행 계획 <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>— STEP 5에서 반영한 계획을 여기서 최종 확정해요 (제출 시 저장)</span></div>
            {textRow("plan", { multiline: true, fontSize: 12.5, color: "#3A4565" })}
          </div>
          <div>
            <div style={sectionLabel}>등급 기준 (S/A/B/C/D)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {GRADE_META.map(([g, c]) => (
                <div key={g} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, background: c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>{g}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <DraftRow
                      value={kr.gradesDraft?.[g] ?? kr.grades[g]}
                      committed={kr.grades[g]}
                      onChange={(v) => patchGrade(g, v)}
                      onCommit={() => commitGrade(g)}
                      onRevert={() => revertGrade(g)}
                      fontSize={12}
                      color="#3A4565"
                    />
                  </div>
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
  const [bulk, setBulk] = useState<{ mode: "open" | "close"; seq: number }>({ mode: "open", seq: 0 });
  const sum = weightSum(krs);
  const adopted = krs.filter((k) => k.chosenAI).length;
  const unadopted = krs.filter((k) => !k.chosenAI);
  const dirtyKrs = krs.filter(anyDirty);
  const readiness = submitReadiness(state, criteria.system, criteria.checklist);

  const patchKR = (id: string, fn: (k: WizardKR) => WizardKR) =>
    set((s) => ({ ...s, krs: s.krs.map((k) => (k.id === id ? fn(k) : k)) }));

  // ── 텍스트 필드 draft ──
  const committedOf = (k: WizardKR, f: keyof KRTextDraft): string =>
    f === "measure" ? measureText(k) : f === "plan" ? (k.plan ?? "") : (k[f as "objective" | "kr" | "baseline" | "goal"] ?? "");

  const patchText = (id: string, f: keyof KRTextDraft, v: string) =>
    patchKR(id, (k) => ({ ...k, textDraft: { ...(k.textDraft ?? {}), [f]: v } }));

  const commitText = (id: string, f: keyof KRTextDraft) =>
    patchKR(id, (k) => {
      const d = k.textDraft;
      if (!d || d[f] === undefined) return k;
      const v = d[f] as string;
      const rest = { ...d };
      delete rest[f];
      const clean = TEXT_FIELDS.every((x) => rest[x] === undefined || rest[x] === committedOf(k, x));
      const base = { ...k, textDraft: clean && Object.keys(rest).length === 0 ? null : rest };
      if (f === "measure") return v !== measureText(k) ? { ...base, measureTool: v, measureStat: "", measureCycle: "" } : base;
      return { ...base, [f]: v };
    });

  const revertText = (id: string, f: keyof KRTextDraft) =>
    patchKR(id, (k) => {
      if (!k.textDraft) return k;
      const rest = { ...k.textDraft };
      delete rest[f];
      return { ...k, textDraft: Object.keys(rest).length === 0 ? null : rest };
    });

  // ── 등급 draft (STEP 5와 동일 로직) ──
  const patchGrade = (id: string, g: keyof KRGrades, v: string) =>
    patchKR(id, (k) => ({ ...k, gradesDraft: { ...(k.gradesDraft ?? k.grades), [g]: v } }));

  const commitGrade = (id: string, g: keyof KRGrades) =>
    patchKR(id, (k) => {
      if (!k.gradesDraft) return k;
      const grades = { ...k.grades, [g]: k.gradesDraft[g] };
      const clean = (Object.keys(grades) as (keyof KRGrades)[]).every((x) => k.gradesDraft![x] === grades[x]);
      return { ...k, grades, gradesDraft: clean ? null : k.gradesDraft };
    });

  const revertGrade = (id: string, g: keyof KRGrades) =>
    patchKR(id, (k) => {
      if (!k.gradesDraft) return k;
      const draft = { ...k.gradesDraft, [g]: k.grades[g] };
      const clean = (Object.keys(k.grades) as (keyof KRGrades)[]).every((x) => draft[x] === k.grades[x]);
      return { ...k, gradesDraft: clean ? null : draft };
    });

  const commitCard = (id: string) => patchKR(id, commitDrafts);
  const revertCard = (id: string) => patchKR(id, (k) => ({ ...k, gradesDraft: null, textDraft: null }));

  const stats = [
    { ico: "⚙️", bg: "#E5EBFB", fg: "#3B5BDB", label: "OKR 유형", val: state.okrType === "ops" ? "운영" : "전략 혁신", sub: `비중 ${state.okrType === "ops" ? criteria.system.weights.operation : criteria.system.weights.strategy}%` },
    { ico: "📊", bg: "#F1F4FD", fg: "#213A8C", label: "KR 개수", val: `${krs.length}개`, sub: `가중치 합 ${sum}/${criteria.system.scoreCap}` },
    { ico: "✨", bg: "#F5EFFD", fg: "#7C4DD9", label: "AI 채택", val: `${adopted} / ${krs.length}`, sub: unadopted.length > 0 ? `KR ${unadopted.map((k) => String(k.num).padStart(2, "0")).join("·")} 미채택` : "전체 채택 완료" },
    { ico: "✓", bg: dirtyKrs.length > 0 ? "#FFFBE6" : "#ECFAF1", fg: dirtyKrs.length > 0 ? "#B8860B" : "#2F9E5E", label: "변경 확정", val: dirtyKrs.length > 0 ? `${dirtyKrs.length}건 확정 전` : "완료", sub: dirtyKrs.length > 0 ? "제출 시 일괄 확정 안내" : "미확정 변경 없음" },
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
        <span style={{ fontSize: 12, color: "#7C87A4" }}>바로 수정할 수 있어요 · 수정한 줄은 ✓ 확정 또는 ↩ 취소로 정리해주세요</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button variant="ai" size="sm" onClick={() => setBulk((b) => ({ mode: "open", seq: b.seq + 1 }))}>⚗️ 전체 펼치기</Button>
          <Button variant="secondary" size="sm" onClick={() => setBulk((b) => ({ mode: "close", seq: b.seq + 1 }))}>▲ 전체 접기</Button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {krs.map((kr) => (
          <FinalKRCard
            key={kr.id}
            kr={kr}
            bulk={bulk}
            patchText={(f, v) => patchText(kr.id, f, v)}
            commitText={(f) => commitText(kr.id, f)}
            revertText={(f) => revertText(kr.id, f)}
            patchGrade={(g, v) => patchGrade(kr.id, g, v)}
            commitGrade={(g) => commitGrade(kr.id, g)}
            revertGrade={(g) => revertGrade(kr.id, g)}
            commitCard={() => commitCard(kr.id)}
            revertCard={() => revertCard(kr.id)}
          />
        ))}
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

      {/* 제출 적합성 체크 — 미통과 항목이 있으면 제출 버튼이 비활성화된다 */}
      <div style={{ background: "#fff", border: `1px solid ${readiness.ok ? "#BBE9CC" : "#FFE0BA"}`, borderRadius: 14, padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>{readiness.ok ? "✅" : "🧭"}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>제출 적합성 체크</span>
          <span style={{ marginLeft: "auto", padding: "3px 11px", borderRadius: 999, background: readiness.ok ? "#ECFAF1" : "#FFF7EC", color: readiness.ok ? "#2F9E5E" : "#D98023", fontSize: 11.5, fontWeight: 700 }}>
            {readiness.items.filter((i) => i.pass).length} / {readiness.items.length} 통과
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {readiness.items.map((it) => (
            <div key={it.key} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "10px 12px", background: it.pass ? "#F9FAFC" : "#FFF7EC", border: `1px solid ${it.pass ? "#ECEFF5" : "#FFE0BA"}`, borderRadius: 10 }}>
              <span style={{ width: 18, height: 18, borderRadius: 6, background: it.pass ? "#2F9E5E" : "#D98023", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{it.pass ? "✓" : "!"}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36" }}>{it.label}</div>
                <div style={{ fontSize: 11.5, color: it.pass ? "#7C87A4" : "#9C5E26", marginTop: 2, lineHeight: 1.5 }}>{it.detail}</div>
              </div>
            </div>
          ))}
        </div>
        {!readiness.ok && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#9C5E26", lineHeight: 1.55 }}>
            💡 보완이 필요한 항목을 채우면 제출 버튼이 활성화돼요. 함께 정제하면 검토도 더 빨라져요.
          </div>
        )}
      </div>

      {/* Submit panel */}
      <div style={{ background: "linear-gradient(135deg, #0A1F17, #14342B)", color: "#fff", borderRadius: 16, padding: "26px 28px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,169,104,0.25)", color: "#7CE9BE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📥</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{evaluatorName} 팀장에게 제출하시겠어요?</div>
          <div style={{ fontSize: 12.5, color: "#9DB3A9", lineHeight: 1.5 }}>
            {readiness.ok
              ? <>제출 후에는 열람만 가능하고, 수정하려면 회수 → 재제출하면 돼요.{dirtyKrs.length > 0 && " 확정하지 않은 변경이 있으면 제출 시 일괄 확정 여부를 여쭤봐요."}</>
              : "위 적합성 체크의 보완 항목을 채우면 제출할 수 있어요."}
          </div>
        </div>
        <Button variant="primary" onClick={onSubmit} disabled={submitting || !readiness.ok} style={{ padding: "12px 22px" }}>
          {submitting ? "제출 중…" : readiness.ok ? "제출하기 →" : "보완 후 제출 가능"}
        </Button>
      </div>
    </div>
  );
}
