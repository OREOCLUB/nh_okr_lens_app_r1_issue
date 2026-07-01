"use client";

import { useState, type CSSProperties } from "react";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { evalSystem, taxonomy as seedTaxonomy, checklist as seedChecklist, type TaxonomyGroup } from "@/lib/criteria";

const numInput: CSSProperties = { padding: "8px 12px", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, outline: "none", textAlign: "right" };

const TABS = [
  { id: "system", label: "평가제도", hint: "비중·배분·상한" },
  { id: "taxonomy", label: "분류체계", hint: "업무군·BSC·KR유형·직무" },
  { id: "checklist", label: "OKR 검토리스트", hint: "AI Validation 문항" },
];

function NumField({ label, value, unit, color }: { label?: string; value: string | number; unit: string; color?: string }) {
  return (
    <div style={{ padding: "12px 14px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12 }}>
      {label && <div style={{ fontSize: 11.5, fontWeight: 600, color: "#5B6685", marginBottom: 8 }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <input defaultValue={String(value)} className="mono ds-num" style={{ ...numInput, width: 70, color: color || "#0F1A36" }} />
        <span style={{ fontSize: 13, color: "#7C87A4", fontWeight: 500 }}>{unit}</span>
      </div>
    </div>
  );
}

// ── ① 평가제도 (구 운영안 흡수 + 등급 강제배분 통합) ─────────────
function SystemTab() {
  const [ops, setOps] = useState(evalSystem.weights.operation);
  const [str, setStr] = useState(evalSystem.weights.strategy);
  const post = 100 - ops - str;
  const wRows = [
    { label: "운영", value: ops, color: "#3B5BDB", bg: "#E5EBFB", set: setOps },
    { label: "전략혁신", value: str, color: "#7C4DD9", bg: "#F0E9FB", set: setStr },
    { label: "사후평가", value: post, color: "#E07A3C", bg: "#FFEDE2", set: null as null | ((n: number) => void) },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 평가 영역 비중 */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "20px 22px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>평가 영역 비중</div>
        <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 16 }}>운영 · 전략혁신 · 사후평가의 점수 비중 (합계 100%)</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          {wRows.map((w) => (
            <div key={w.label} style={{ flex: 1, padding: "14px 16px", background: w.bg, borderRadius: 11, border: `1px solid ${w.color}33` }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: w.color, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>{w.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <input type="number" value={w.value} onChange={(e) => w.set?.(Number(e.target.value) || 0)} disabled={!w.set} className="ds-num" style={{ width: 60, padding: "6px 8px", background: w.set ? "#fff" : "transparent", border: w.set ? "1px solid #E1E5EF" : "none", borderRadius: 7, fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: w.color, outline: "none", textAlign: "right" }} />
                <span style={{ fontSize: 13, color: w.color, fontWeight: 600 }}>%</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", height: 36, borderRadius: 9, overflow: "hidden", border: "1px solid #E1E5EF" }}>
          <div className="mono" style={{ width: `${ops}%`, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>운영 {ops}%</div>
          <div className="mono" style={{ width: `${str}%`, background: "#7C4DD9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>전략 {str}%</div>
          <div className="mono" style={{ width: `${Math.max(post, 0)}%`, background: "#E07A3C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>사후 {post}%</div>
        </div>
        <div className="mono" style={{ fontSize: 11.5, color: post < 0 || ops + str + post !== 100 ? "#D14343" : "#7C87A4", marginTop: 8, textAlign: "right" }}>합계 {ops + str + post}%{ops + str + post !== 100 && " · 100%가 되어야 합니다"}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* 등급 강제배분 (통합) */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "20px 22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>등급 강제배분</div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 16 }}>상대평가 S/A/B/C/D 비율 — D는 규정(현저한 미달성) 수동 배정</div>
          <div style={{ display: "flex", height: 44, borderRadius: 10, overflow: "hidden", border: "1px solid #E1E5EF", marginBottom: 16 }}>
            {([["S", evalSystem.distribution.S, "#7C4DD9"], ["A", evalSystem.distribution.A, "#3B5BDB"], ["B", evalSystem.distribution.B, "#2F9E5E"], ["C", evalSystem.distribution.C, "#D98023"]] as const).map(([g, v, c]) => (
              <div key={g} className="mono" style={{ width: `${v}%`, background: c, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{g}</div><div style={{ fontSize: 10, opacity: 0.85 }}>{v}%</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {([["S", evalSystem.distribution.S, "#7C4DD9", "상위 5%"], ["A", evalSystem.distribution.A, "#3B5BDB", "S 다음 10%"], ["B", evalSystem.distribution.B, "#2F9E5E", "표준 분포"], ["C", evalSystem.distribution.C, "#D98023", "C 최대치"], ["D", evalSystem.distribution.D, "#D14343", "규정 (수동)"]] as const).map(([g, v, c, hint]) => (
              <div key={g} style={{ padding: "14px 12px", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 10, textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: c, marginBottom: 8 }}>{g}</div>
                {v != null ? <input defaultValue={String(v)} className="ds-num" style={{ ...numInput, width: 56, textAlign: "center", color: c, fontSize: 16 }} /> : <span style={{ fontSize: 12, color: "#7C87A4", fontStyle: "italic" }}>수동</span>}
                <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 8 }}>{hint}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 난이도 가중치 */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "20px 22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>난이도 가중치</div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 16 }}>KR 난이도(상·중·하)별 점수 가중치</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {([["상", evalSystem.difficulty.high, "#D14343", "#FDECEC"], ["중", evalSystem.difficulty.mid, "#D98023", "#FFF7EC"], ["하", evalSystem.difficulty.low, "#2F9E5E", "#ECFAF1"]] as const).map(([lvl, w, c, bg]) => (
              <div key={lvl} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: bg, borderRadius: 10 }}>
                <span style={{ width: 50, padding: "4px 10px", borderRadius: 999, background: "#fff", color: c, fontSize: 12, fontWeight: 700, textAlign: "center" }}>{lvl}</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <input defaultValue={String(w)} className="mono ds-num" style={{ ...numInput, width: 64, color: c }} />
                  <span style={{ fontSize: 13, color: "#7C87A4", fontWeight: 500 }}>배</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 점수 상한 & 제외 기준 */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "20px 22px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 14 }}>점수 상한 & 공통 제외 기준</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 160, fontSize: 13, fontWeight: 600, color: "#0F1A36" }}>KR 점수 상한</div>
          <input defaultValue={String(evalSystem.scoreCap)} className="ds-num" style={{ ...numInput, width: 90, color: "#3B5BDB", fontSize: 16 }} /><span style={{ fontSize: 12.5, color: "#7C87A4" }}>%</span>
          <span style={{ fontSize: 11.5, color: "#7C87A4" }}>달성률 130%여도 점수에는 {evalSystem.scoreCap}%만 반영됩니다.</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36", marginBottom: 8 }}>제외 기준 문구 <span style={{ fontSize: 11, color: "#7C87A4", fontWeight: 400 }}>· R1 작성 가이드에 노출</span></div>
        <textarea defaultValue={evalSystem.exclusionRule} style={{ width: "100%", minHeight: 64, padding: "12px 14px", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 10, fontFamily: "var(--font-sans)", fontSize: 13, color: "#0F1A36", outline: "none", resize: "vertical", lineHeight: 1.6 }} />
      </div>
    </div>
  );
}

// ── ② 분류체계 (추가/삭제 가능) ─────────────────────────────
function TaxonomyTab() {
  const [groups, setGroups] = useState<TaxonomyGroup[]>(() => seedTaxonomy.map((g) => ({ ...g, items: [...g.items] })));
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function addItem(id: string) {
    const val = (drafts[id] || "").trim();
    if (!val) return;
    setGroups((gs) => gs.map((g) => (g.id === id && !g.items.includes(val) ? { ...g, items: [...g.items, val] } : g)));
    setDrafts((d) => ({ ...d, [id]: "" }));
  }
  function removeItem(id: string, item: string) {
    setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, items: g.items.filter((i) => i !== item) } : g)));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>분류체계 · Taxonomy</div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 3 }}>여기서 항목을 더하거나 지우면 R1 작성 선택지·R2 검토 분류에 즉시 반영돼요.</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {groups.map((t) => (
          <div key={t.id} style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>{t.title}</div>
              <span style={{ padding: "3px 9px", borderRadius: 999, background: `${t.color}15`, color: t.color, fontSize: 11, fontWeight: 700 }}>{t.items.length}개</span>
            </div>
            <div style={{ fontSize: 11, color: "#7C87A4", lineHeight: 1.5, marginBottom: 14, minHeight: 32 }}>{t.desc}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {t.items.map((it) => (
                <span key={it} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 8px 5px 11px", borderRadius: 7, background: "#F9FAFC", border: "1px solid #ECEFF5", fontSize: 11.5, color: "#1F2A4A", fontFamily: it.includes("—") ? "var(--font-mono)" : "var(--font-sans)" }}>
                  {it}
                  <button onClick={() => removeItem(t.id, it)} title="삭제" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 15, height: 15, borderRadius: "50%", border: "none", background: "#E7EBF1", color: "#7C87A4", fontSize: 10, fontWeight: 700, cursor: "pointer", lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
              <input
                value={drafts[t.id] || ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addItem(t.id)}
                placeholder="새 항목 입력 후 Enter"
                style={{ flex: 1, padding: "8px 11px", background: "var(--page-bg)", border: "1px solid #E1E5EF", borderRadius: 8, fontSize: 12, color: "#0F1A36", outline: "none", fontFamily: "var(--font-sans)" }}
              />
              <Button variant="secondary" size="sm" leftIcon={<span>+</span>} onClick={() => addItem(t.id)}>추가</Button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: "12px 16px", background: "#F1F4FD", border: "1px solid #C5D0F7", borderRadius: 10, fontSize: 12, color: "#3A4565", lineHeight: 1.6 }}>
        💡 <b>업무군</b>은 &ldquo;무슨 일을 하는가&rdquo;(실무 도메인), <b>BSC 카테고리</b>는 &ldquo;어떤 전략에 기여하는가&rdquo;(경영 관점)로 서로 다른 축이에요. 한 KR은 업무군 1개 + BSC 1개를 동시에 가집니다.
      </div>
    </div>
  );
}

// ── ③ OKR 검토리스트 ────────────────────────────────────────
function ChecklistTab() {
  const [items, setItems] = useState(() => [...seedChecklist]);
  const [text, setText] = useState("");
  const [tag, setTag] = useState("");

  function addCheck() {
    if (!text.trim()) return;
    setItems((xs) => [...xs, { no: xs.length + 1, text: text.trim(), tag: tag.trim() || "미분류", edited: true }]);
    setText(""); setTag("");
  }
  function removeCheck(no: number) {
    setItems((xs) => xs.filter((x) => x.no !== no).map((x, i) => ({ ...x, no: i + 1 })));
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>{items.length}항목 검토리스트</div>
            <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 3 }}>R2 평가자의 AI Validation은 이 문항들을 자동 판정해요.</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {items.map((c) => (
            <div key={c.no} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: c.edited ? "#FFF7EC" : "#fff", border: `1px solid ${c.edited ? "#FFE0BA" : "#ECEFF5"}`, borderRadius: 10 }}>
              <div className="mono" style={{ width: 26, height: 26, borderRadius: 7, background: "#F1F4FD", color: "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{c.no.toString().padStart(2, "0")}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "#0F1A36" }}>{c.text}</div>
                <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 3 }}>위험 태그 · <span className="mono" style={{ color: "#D14343", fontWeight: 600 }}>{c.tag}</span></div>
              </div>
              {c.edited && <span style={{ padding: "2px 8px", borderRadius: 999, background: "#fff", border: "1px solid #FFE0BA", color: "#D98023", fontSize: 10.5, fontWeight: 700 }}>✏️ 수정됨</span>}
              <button onClick={() => removeCheck(c.no)} title="삭제" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 6, border: "1px solid #ECEFF5", background: "#fff", color: "#A4ADC4", fontSize: 13, cursor: "pointer", flexShrink: 0 }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12, padding: "12px 14px", background: "#F9FAFC", border: "1px dashed #D3DAE8", borderRadius: 10 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCheck()} placeholder="새 검토 문항" style={{ flex: 1, padding: "8px 11px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 8, fontSize: 12.5, color: "#0F1A36", outline: "none", fontFamily: "var(--font-sans)" }} />
          <input value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCheck()} placeholder="위험 태그" style={{ width: 110, padding: "8px 11px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 8, fontSize: 12.5, color: "#0F1A36", outline: "none", fontFamily: "var(--font-mono)" }} />
          <Button variant="ai" size="sm" leftIcon={<span>+</span>} onClick={addCheck}>추가</Button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>KR 개수 범위</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <NumField label="최소" value={evalSystem.krRange.min} unit="개" />
          <NumField label="최대" value={evalSystem.krRange.max} unit="개" />
        </div>
        <div style={{ padding: "12px 14px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 10, fontSize: 11.5, color: "#5B6685", lineHeight: 1.6 }}>
          각 검토 문항에 걸리면 위험 태그가 KR에 자동 부착돼요. 평가자가 검토 시 태그를 확인하고 <b style={{ color: "#0F1A36" }}>코칭 후보</b>로 분류합니다.
        </div>
      </div>
    </div>
  );
}

export default function R3CriteriaPage() {
  const [tab, setTab] = useState("system");
  return (
    <RoleShell
      role="R3"
      title="평가 기준 관리"
      subtitle={`${evalSystem.version} · 운영중 · 마지막 수정 3일 전`}
      actions={<Button variant="primary" size="sm" leftIcon={<span>✓</span>} onClick={() => alert("변경사항이 저장되었습니다 (프로토타입)")}>변경사항 저장 (2건)</Button>}
    >
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase" }}>전사 적용 기준</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>이 기준이 R1·R2 화면을 움직입니다</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5B6685" }}>평가제도 · 분류체계 · 검토리스트를 한곳에서 관리해요. 한 줄만 수정해도 피평가자 작성 가이드와 평가자 AI Validation에 즉시 반영돼요.</p>
      </div>

      {/* Active version + impact */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 20 }}>
        <div style={{ background: "linear-gradient(135deg, #0A1F17, #14342B)", color: "#fff", borderRadius: 14, padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(0,169,104,0.22)", color: "#7CE9BE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛡️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#7CE9BE", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>활성 버전</div>
              <div className="mono" style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.015em" }}>{evalSystem.version}</div>
            </div>
            <span style={{ padding: "5px 11px", background: "rgba(0,169,104,0.25)", color: "#A3E5BD", borderRadius: 7, fontSize: 11, fontWeight: 700 }}>● LIVE</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[["운영 비중", `${evalSystem.weights.operation}%`], ["전략 비중", `${evalSystem.weights.strategy}%`], ["사후평가", `${evalSystem.weights.post}%`], ["KR 점수 상한", String(evalSystem.scoreCap)]].map(([l, v]) => (
              <div key={l} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.06)", borderRadius: 9 }}>
                <div style={{ fontSize: 10.5, color: "#7CE9BE", marginBottom: 3 }}>{l}</div>
                <div className="mono ds-num" style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.015em" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>변경 시 영향 범위</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { ico: "👤", bg: "#E5EBFB", fg: "#3B5BDB", name: "R1 피평가자", count: "552명", desc: "작성 가이드 · 분류 선택지" },
              { ico: "👥", bg: "#E0F7EC", fg: "#00A968", name: "R2 평가자", count: "48명", desc: "AI Validation 검토 기준" },
              { ico: "📊", bg: "#FFEDE2", fg: "#E07A3C", name: "R3 인사이트", count: "전사", desc: "위험유형 집계·사례카드" },
            ].map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: s.bg, color: s.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{s.ico}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>{s.name} <span className="mono" style={{ fontSize: 10.5, color: "#7C87A4", fontWeight: 500 }}>· {s.count}</span></div>
                  <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 1 }}>{s.desc}</div>
                </div>
                <span style={{ fontSize: 11, color: "#2F9E5E", fontWeight: 600 }}>즉시 반영</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, borderBottom: "1px solid #E1E5EF", marginBottom: 18 }}>
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 16px", background: "transparent", border: "none", borderBottom: `2px solid ${on ? "#E07A3C" : "transparent"}`, fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? "#0F1A36" : "#5B6685", cursor: "pointer", textAlign: "left" }}>
              {t.label} <span style={{ fontSize: 11, color: "#A4ADC4", marginLeft: 4, fontWeight: 500 }}>{t.hint}</span>
            </button>
          );
        })}
      </div>

      {tab === "system" && <SystemTab />}
      {tab === "taxonomy" && <TaxonomyTab />}
      {tab === "checklist" && <ChecklistTab />}
    </RoleShell>
  );
}
