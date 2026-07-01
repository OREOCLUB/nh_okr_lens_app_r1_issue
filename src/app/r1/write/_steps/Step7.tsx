"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { Button } from "@/components/Button";

const AI_BADGE: Record<string, { c: string; bg: string; short: string; ico: string }> = {
  claude: { c: "#D97757", bg: "#FBF0E9", short: "Claude", ico: "🌀" },
  gpt: { c: "#10A37F", bg: "#E6F5F0", short: "GPT", ico: "✦" },
  gemini: { c: "#4285F4", bg: "#E8F0FE", short: "Gemini", ico: "✧" },
};

interface FinalKR {
  num: number; format: string; formatBg: string; formatFg: string; weight: number;
  objective: string; kr: string; measure: string; baseline: string; goal: string;
  sGrade: string; aGrade: string; bGrade: string; cGrade: string; dGrade: string;
  chosenAI: string | null; aiSuggestion: string;
}

const KRS: FinalKR[] = [
  { num: 1, format: "수치형", formatBg: "#E5EBFB", formatFg: "#213A8C", weight: 30, objective: "핵심 서비스 응답속도 개선", kr: "결제 게이트웨이 APM p95 응답속도(월평균)를 850ms → 500ms로 단축", measure: "APM Datadog 월평균", baseline: "850ms", goal: "500ms", sGrade: "≤400ms — 목표 초과 20%, 캐시 추가 도입 완료", aGrade: "≤500ms — 목표 달성 (월평균 기준)", bGrade: "500~650ms — 목표의 70-99% 달성", cGrade: "650~800ms — 목표의 50-70% 달성, 개선 추세 확인", dGrade: "≥800ms — 개선 없음 (baseline 수준)", chosenAI: "claude", aiSuggestion: "S등급은 400ms로 두되, 캐시 추가 도입 마일스톤도 함께 적기를 추천해요." },
  { num: 2, format: "수치형", formatBg: "#E5EBFB", formatFg: "#213A8C", weight: 25, objective: "결제 인증 모듈 안정화", kr: "결제 인증모듈 단위테스트 커버리지를 65% → 85%로 향상 (회귀 장애 영역 100% 커버)", measure: "Jest coverage report", baseline: "65%", goal: "85%", sGrade: "≥90% — Mutation testing 도입 완료", aGrade: "≥85% — 회귀 장애 영역 100% 커버", bGrade: "75~84% — 주요 영역 커버", cGrade: "65~74% — baseline 유지", dGrade: "<65% — baseline 미달", chosenAI: "gpt", aiSuggestion: "추가 보완 없음. 이대로 진행해도 충분합니다." },
  { num: 3, format: "마일스톤", formatBg: "#F0E9FB", formatFg: "#7C4DD9", weight: 20, objective: "장애 대응 자동화", kr: "장애 알림 룰 자동화 4단계 중 3단계까지 완료", measure: "단계별 산출물 검토", baseline: "1/4", goal: "3/4", sGrade: "4단계 전체 완료 (onCall 자동화 포함)", aGrade: "3단계 완료 (노이즈 필터링까지)", bGrade: "2단계 완료 (알림 채널 통합)", cGrade: "1단계 완료 (룰 정의)", dGrade: "미착수", chosenAI: null, aiSuggestion: "각 단계의 산출물(PR/Runbook/Dashboard)과 완료 기준을 정의해주세요." },
];

const dashed: CSSProperties = { padding: "8px 11px", fontSize: 13, background: "#F9FAFC", border: "1px dashed #D5DDF0", borderRadius: 8, cursor: "text", lineHeight: 1.5, display: "flex", alignItems: "center", gap: 6, minHeight: 36 };

function EditableField({ value, multiline, mono, fontSize = 13, fontWeight = 500, color = "#0F1A36" }: { value: string; multiline?: boolean; mono?: boolean; fontSize?: number; fontWeight?: number; color?: string }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);
  const font = mono ? "var(--font-mono)" : "var(--font-sans)";
  if (editing) {
    const common = { width: "100%", padding: "8px 11px", fontSize, fontWeight, color, fontFamily: font, background: "#fff", border: "1.5px solid #3B5BDB", borderRadius: 8, outline: "none", lineHeight: 1.5, boxShadow: "0 0 0 4px rgba(59,91,219,.12)" } as CSSProperties;
    return multiline
      ? <textarea autoFocus value={val} rows={2} onChange={(e) => setVal(e.target.value)} onBlur={() => setEditing(false)} style={{ ...common, resize: "vertical" }} />
      : <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => setEditing(false)} onKeyDown={(e) => { if (e.key === "Enter") setEditing(false); }} style={common} />;
  }
  return <div onClick={() => setEditing(true)} style={{ ...dashed, fontSize, fontWeight, color, fontFamily: font }}>{val}<span style={{ marginLeft: "auto", fontSize: 11, color: "#A6AEC2" }}>✏️</span></div>;
}

function AIChipBadge({ vendor }: { vendor: string }) {
  const v = AI_BADGE[vendor];
  if (!v) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: v.bg, color: v.c, fontSize: 11, fontWeight: 700 }}>{v.ico} {v.short} 채택</span>;
}

function FinalKRCard({ kr }: { kr: FinalKR }) {
  const [expanded, setExpanded] = useState(kr.num === 1);
  const grades: [string, string, string][] = [
    ["S", "#7C4DD9", kr.sGrade], ["A", "#3B5BDB", kr.aGrade], ["B", "#2F9E5E", kr.bGrade], ["C", "#D98023", kr.cGrade], ["D", "#D64545", kr.dGrade],
  ];
  return (
    <div style={{ background: "#fff", border: `1px solid ${kr.chosenAI ? "#E1E5EF" : "#FFE0BA"}`, borderRadius: 14, overflow: "hidden" }}>
      <div onClick={() => setExpanded((e) => !e)} style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderBottom: expanded ? "1px solid #ECEFF5" : "none" }}>
        <span className="mono" style={{ padding: "2px 9px", borderRadius: 999, background: "#F1F4FD", color: "#213A8C", fontSize: 11, fontWeight: 700 }}>KR {kr.num.toString().padStart(2, "0")}</span>
        <span style={{ padding: "2px 9px", borderRadius: 999, background: kr.formatBg, color: kr.formatFg, fontSize: 11, fontWeight: 600 }}>{kr.format}</span>
        {kr.chosenAI ? <AIChipBadge vendor={kr.chosenAI} /> : <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 999, background: "#FFF7EC", color: "#D98023", fontSize: 11, fontWeight: 700 }}>! AI 의견 미채택</span>}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#7C87A4" }}>가중치 <b className="mono" style={{ color: "#0F1A36" }}>{kr.weight}%</b></span>
        <span style={{ fontSize: 13, color: "#A6AEC2" }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 5 }}>Objective</div>
            <EditableField value={kr.objective} fontSize={13} />
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 5 }}>Key Result</div>
            <EditableField value={kr.kr} multiline fontSize={14} fontWeight={600} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 12 }}>
            <div><div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", marginBottom: 5 }}>측정 방법</div><EditableField value={kr.measure} fontSize={12.5} /></div>
            <div><div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", marginBottom: 5 }}>Baseline</div><EditableField value={kr.baseline} mono fontSize={12.5} /></div>
            <div><div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", marginBottom: 5 }}>Goal</div><EditableField value={kr.goal} mono fontSize={12.5} color="#3B5BDB" /></div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 7 }}>등급 기준 (S/A/B/C/D)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {grades.map(([g, c, def]) => (
                <div key={g} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, background: c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>{g}</span>
                  <div style={{ flex: 1 }}><EditableField value={def} fontSize={12} color="#3A4565" /></div>
                </div>
              ))}
            </div>
          </div>
          {kr.chosenAI && (
            <div style={{ padding: "11px 14px", background: AI_BADGE[kr.chosenAI].bg, borderRadius: 10, fontSize: 11.5, color: "#3A4565", lineHeight: 1.55 }}>
              <b style={{ color: AI_BADGE[kr.chosenAI].c }}>{AI_BADGE[kr.chosenAI].ico} {AI_BADGE[kr.chosenAI].short} 의견</b> · {kr.aiSuggestion}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Step7({ onSubmit }: { onSubmit: () => void }) {
  const stats = [
    { ico: "⚙️", bg: "#E5EBFB", fg: "#3B5BDB", label: "OKR 유형", val: "운영 70%", sub: "+ 전략 30%" },
    { ico: "📊", bg: "#F1F4FD", fg: "#213A8C", label: "KR 개수", val: "3개", sub: "가중치 합 75/110" },
    { ico: "✨", bg: "#F5EFFD", fg: "#7C4DD9", label: "AI 채택", val: "2 / 3", sub: "KR 03은 미채택" },
    { ico: "✓", bg: "#ECFAF1", fg: "#2F9E5E", label: "AI 평균 점수", val: "7.7 / 10", sub: "Strong / Good 위주" },
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
        <Button variant="ai" size="sm" style={{ marginLeft: "auto" }} onClick={() => alert("채택된 AI 의견을 모든 KR에 반영했습니다 ✨")}>⚗️ AI 의견 모두 반영</Button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {KRS.map((kr) => <FinalKRCard key={kr.num} kr={kr} />)}
      </div>

      {/* KR03 미채택 알림 */}
      <div style={{ background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#7A4A14" }}>KR 03 — AI 의견을 아직 채택하지 않으셨어요</div>
          <div style={{ fontSize: 12, color: "#9C5E26", marginTop: 3, lineHeight: 1.55 }}>3개 AI 모두 &ldquo;각 단계의 산출물·완료 기준 정의 부족&rdquo;으로 보완 권장했어요. STEP 6으로 돌아가서 의견을 채택하시거나, 위 카드에서 직접 단계별 정의를 보완해주세요.</div>
        </div>
        <Button variant="secondary" size="sm">STEP 6으로 →</Button>
      </div>

      {/* Submit panel */}
      <div style={{ background: "linear-gradient(135deg, #0A1F17, #14342B)", color: "#fff", borderRadius: 16, padding: "26px 28px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,169,104,0.25)", color: "#7CE9BE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📥</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>정태영 팀장에게 제출하시겠어요?</div>
          <div style={{ fontSize: 12.5, color: "#9DB3A9", lineHeight: 1.5 }}>제출 후에도 팀장이 조정 요청 시 수정할 수 있어요. AI 의견을 채택하지 않은 KR 03은 팀장 코칭 시 함께 정제하실 수 있습니다.</div>
        </div>
        <Button variant="secondary" onClick={() => alert("임시 저장되었습니다 🙂")} style={{ padding: "12px 22px" }}>저장만 하기</Button>
        <Button variant="primary" onClick={onSubmit} style={{ padding: "12px 22px" }}>제출하기 →</Button>
      </div>
    </div>
  );
}
