"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";

// ── 8단계 정의 (WizardShared.jsx 기준) ──
const STEPS = [
  { num: 0, label: "프로필 세팅" },
  { num: 1, label: "OKR 유형" },
  { num: 2, label: "기초 정보" },
  { num: 3, label: "AI 정제 대화" },
  { num: 4, label: "KR 형태" },
  { num: 5, label: "상세 수립" },
  { num: 6, label: "AI 비교 검토" },
  { num: 7, label: "최종 수정·제출" },
];

const label: CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#3A4565", marginBottom: 7 };
const input: CSSProperties = { width: "100%", padding: "11px 14px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, fontSize: 14, color: "#0F1A36", fontFamily: "var(--font-sans)", outline: "none" };
const hint: CSSProperties = { fontSize: 11.5, color: "#7C87A4", marginTop: 5, lineHeight: 1.5 };
const card: CSSProperties = { background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "30px 34px" };

const FORMAT_COLOR: Record<string, { bg: string; fg: string }> = {
  "수치": { bg: "#E5EBFB", fg: "#213A8C" },
  "마일스톤": { bg: "#F0E9FB", fg: "#7C4DD9" },
  "루브릭": { bg: "#FFEDE2", fg: "#E07A3C" },
  "이산": { bg: "#ECFAF1", fg: "#2F9E5E" },
};

// ── STEP 헤더 (8 dot progress) ──
function StepHeader({ current, onJump }: { current: number; onJump: (n: number) => void }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 4, overflowX: "auto" }}>
      {STEPS.map((s, i) => {
        const done = s.num < current;
        const cur = s.num === current;
        const next = s.num > current;
        return (
          <div key={s.num} style={{ display: "contents" }}>
            <button
              onClick={() => !next && onJump(s.num)}
              title={`STEP ${s.num} · ${s.label}`}
              style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, padding: cur ? "5px 11px 5px 5px" : 5, background: cur ? "#F1F4FD" : "transparent", borderRadius: 10, border: "none", cursor: next ? "default" : "pointer", opacity: next ? 0.55 : 1, fontFamily: "var(--font-sans)" }}
            >
              <div className="mono" style={{ width: 28, height: 28, borderRadius: "50%", background: cur ? "#3B5BDB" : done ? "#ECFAF1" : "var(--page-bg)", color: cur ? "#fff" : done ? "#2F9E5E" : "#7C87A4", border: cur ? "none" : done ? "1px solid #BBE9CC" : "1px solid #E1E5EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 700, flexShrink: 0 }}>{done ? "✓" : s.num}</div>
              {cur && <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36", whiteSpace: "nowrap" }}>STEP {s.num} · {s.label}</div>}
            </button>
            {i < STEPS.length - 1 && <div style={{ flex: 1, minWidth: 8, height: 2, background: done ? "#BBE9CC" : "#ECEFF5", borderRadius: 1 }} />}
          </div>
        );
      })}
    </div>
  );
}

function Hero({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase" }}>STEP {num} / 7</div>
      <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>{title}</h1>
      <p style={{ margin: "8px 0 0", fontSize: 14.5, color: "#5B6685", lineHeight: 1.55, maxWidth: 720 }}>{desc}</p>
    </div>
  );
}

// ── KR 데이터 (STEP 3에서 생성된 것으로 가정) ──
interface KR { num: string; format: string; kr: string; baseline: string; goal: string; measure: string; weight: number; before?: string }
const KRS: KR[] = [
  { num: "01", format: "수치", kr: "결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축한다.", baseline: "850ms", goal: "500ms", measure: "APM p95 월평균", weight: 30, before: "결제 게이트웨이 응답속도를 빠르게 개선한다." },
  { num: "02", format: "수치", kr: "결제 인증모듈 단위테스트 커버리지를 65% → 85%로 끌어올린다.", baseline: "65%", goal: "85%", measure: "Jest 커버리지 리포트", weight: 25, before: "결제 인증모듈 테스트를 강화한다." },
  { num: "03", format: "마일스톤", kr: "장애 알림 룰 자동화 마일스톤 4단계 중 3단계까지 완료한다.", baseline: "1/4", goal: "3/4", measure: "단계별 산출물 검토", weight: 20, before: "장애 알림을 자동화한다." },
];

// ── STEP 0: 프로필 세팅 ──
function Step0() {
  const rows = [
    ["조직", "운영본부 · 결제플랫폼팀"],
    ["직급 · 직렬", "3급 · SE (System Engineer)"],
    ["업무군", "성능/튜닝"],
    ["평가자", "박정훈 팀장"],
    ["보유 자격", "AWS SAA · CKA"],
  ];
  return (
    <div style={card}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em" }}>프로필을 확인해주세요</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#5B6685" }}>마이페이지에 저장된 프로필을 불러왔어요. 이 정보를 바탕으로 AI가 KR을 제안해요.</p>
      </div>
      <div style={{ border: "1px solid #ECEFF5", borderRadius: 12, overflow: "hidden" }}>
        {rows.map(([k, v], i) => (
          <div key={k} style={{ display: "flex", padding: "13px 18px", borderBottom: i < rows.length - 1 ? "1px solid #ECEFF5" : "none", background: i % 2 ? "#F9FAFC" : "#fff" }}>
            <div style={{ width: 120, fontSize: 12.5, color: "#7C87A4", fontWeight: 600 }}>{k}</div>
            <div style={{ fontSize: 13.5, color: "#0F1A36", fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, padding: "14px 18px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#0A6B44", lineHeight: 1.55 }}>
        <span style={{ fontSize: 16 }}>👤</span>
        <div>프로필이 최신 상태가 아니라면 <b>마이페이지</b>에서 먼저 업데이트해주세요. OKR 작성은 저장된 프로필을 그대로 불러옵니다.</div>
      </div>
    </div>
  );
}

// ── STEP 1: OKR 유형 ──
function Step1({ type, setType }: { type: string; setType: (t: string) => void }) {
  const cards = [
    { value: "ops", icon: "⚙️", title: "운영 OKR", desc: "기존 업무의 안정·개선", accent: "#3B5BDB", features: ["응답속도·장애율 개선", "기존 시스템 안정화", "정량 측정이 쉬운 편"] },
    { value: "strategy", icon: "🚀", title: "전략 혁신 OKR", desc: "새로운 가치 창출", accent: "#7C4DD9", features: ["신규 기능 · 시스템 도입", "조직 차원 도전 과제", "도전성과 가중치가 높음"] },
  ];
  return (
    <div style={card}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em" }}>OKR 유형을 선택해주세요</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#5B6685" }}>이번 분기 OKR이 어떤 성격인지 알려주시면, AI가 더 적절한 가이드를 드릴 수 있어요.</p>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {cards.map((c) => {
          const sel = type === c.value;
          return (
            <div key={c.value} onClick={() => setType(c.value)} style={{ flex: 1, background: sel ? "#F1F4FD" : "#fff", border: `2px solid ${sel ? c.accent : "#E1E5EF"}`, borderRadius: 16, padding: "24px 22px", cursor: "pointer", boxShadow: sel ? `0 0 0 4px ${c.accent}20` : "var(--shadow-xs)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: sel ? c.accent : "var(--page-bg)", color: sel ? "#fff" : c.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36" }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: "#7C87A4" }}>{c.desc}</div>
                </div>
                {sel && <div style={{ marginLeft: "auto", width: 22, height: 22, borderRadius: "50%", background: c.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
                {c.features.map((f) => <div key={f} style={{ display: "flex", gap: 7, fontSize: 12.5, color: "#3A4565", lineHeight: 1.5 }}><span style={{ color: c.accent, fontWeight: 700 }}>·</span>{f}</div>)}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 20, padding: "14px 18px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10, display: "flex", gap: 10, fontSize: 12.5, color: "#7A4A14", lineHeight: 1.55 }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <div><b>운영안 비중 안내</b> · 운영 40% · 전략혁신 40% · 사후평가 20%. 한 분기 OKR 중 운영과 전략을 혼합해서 작성할 수 있어요.</div>
      </div>
    </div>
  );
}

// ── STEP 2: 기초 정보 ──
function Step2() {
  const [krCount, setKrCount] = useState(5);
  return (
    <div style={card}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em" }}>기초 정보를 입력해주세요</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#5B6685" }}>AI가 KR 초안을 제안할 수 있도록 핵심 정보를 알려주세요.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <label style={label}>Objective (목표)</label>
          <input style={input} defaultValue="결제 게이트웨이 성능 개선" />
          <div style={hint}>선택 입력 · 비워두어도 OKR 작성이 가능해요</div>
        </div>
        <div>
          <label style={label}>업무 분장</label>
          <input style={input} defaultValue="결제플랫폼 백엔드 성능/튜닝" />
        </div>
        <div style={{ gridColumn: "1 / 3" }}>
          <label style={label}>올해 본업에서 반드시 지킬 것 / 새로 도전할 것</label>
          <textarea style={{ ...input, minHeight: 110, resize: "vertical", lineHeight: 1.6 }} defaultValue={"• 결제 게이트웨이의 p95 응답속도를 일정 수준 이하로 유지 (사용자 체감 속도)\n• 결제 인증 모듈의 단위테스트 커버리지를 끌어올려 회귀 리스크 줄이기\n• 야간 배치의 장애 알림 자동화를 마일스톤 단위로 진행"} />
          <div style={hint}>구어체로 자연스럽게 입력 · AI가 정제해 드려요</div>
        </div>
        <div>
          <label style={label}>제약 조건 / 협업 대상</label>
          <input style={input} placeholder="예: SRE팀, 인프라팀과 협업 필요" />
        </div>
        <div>
          <label style={label}>예상 KR 개수</label>
          <div style={{ display: "inline-flex", background: "var(--page-bg)", borderRadius: 10, padding: 4, gap: 3 }}>
            {[4, 5, 6].map((n) => (
              <button key={n} onClick={() => setKrCount(n)} className="mono" style={{ background: krCount === n ? "#fff" : "transparent", color: krCount === n ? "#0F1A36" : "#7C87A4", fontWeight: krCount === n ? 700 : 500, border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 13, cursor: "pointer", boxShadow: krCount === n ? "0 1px 3px rgba(31,42,74,.08)" : "none" }}>{n}개</button>
            ))}
          </div>
          <div style={hint}>운영안 권장: 4~6개</div>
        </div>
      </div>
    </div>
  );
}

// ── STEP 3: AI 정제 대화 ──
function Step3() {
  const [msgs, setMsgs] = useState<{ from: "ai" | "user"; text: ReactNode }[]>([
    { from: "ai", text: "입력해주신 내용을 바탕으로 KR 초안 3개를 정리해봤어요. 측정 방법을 조금 더 구체화하면 좋을 것 같은데, 함께 다듬어볼까요?" },
    { from: "user", text: "응답속도 KR은 어떤 지표로 재는 게 좋을까요?" },
    { from: "ai", text: <>단순 평균보다 <b style={{ color: "#0F1A36" }}>p95(상위 5%)</b>가 사용자 체감을 더 잘 반영해요. &ldquo;APM p95 월평균 850ms → 500ms&rdquo;처럼 baseline과 goal을 함께 적으면 진행률이 또렷해집니다.</> },
  ]);
  const [text, setText] = useState("");
  const chips = ["측정 지표 추천해줘", "도전성이 충분한가요?", "KR 개수 적절한가요?"];
  function send(t: string) {
    if (!t.trim()) return;
    setMsgs((m) => [...m, { from: "user", text: t }, { from: "ai", text: "좋아요, 그 방향으로 초안을 다듬어 다음 단계(KR 형태)에 반영할게요. (프로토타입 응답)" }]);
    setText("");
  }
  return (
    <div style={{ ...card, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: 480 }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #00A968, #14342B)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✨</div>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F1A36" }}>AI와 KR을 함께 정제해요</div>
          <div style={{ fontSize: 11.5, color: "#7C87A4" }}>대화 내용은 다음 단계 초안에 반영됩니다</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        {msgs.map((m, i) => {
          const ai = m.from === "ai";
          return (
            <div key={i} style={{ display: "flex", gap: 10, flexDirection: ai ? "row" : "row-reverse" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: ai ? "linear-gradient(135deg, #00A968, #14342B)" : "#E5EBFB", color: ai ? "#fff" : "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{ai ? "✨" : "정"}</div>
              <div style={{ maxWidth: "72%", padding: "11px 15px", background: ai ? "#fff" : "#3B5BDB", color: ai ? "#1F2A4A" : "#fff", border: ai ? "1px solid #E1E5EF" : "none", borderRadius: ai ? "4px 13px 13px 13px" : "13px 4px 13px 13px", fontSize: 13.5, lineHeight: 1.6 }}>{m.text}</div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "12px 24px 16px", borderTop: "1px solid #ECEFF5" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {chips.map((c) => <button key={c} onClick={() => setText(c)} style={{ padding: "6px 12px", background: "#F1FBF6", color: "#0A6B44", border: "1px solid #B9F1D8", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{c}</button>)}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 12, padding: "8px 12px" }}>
          <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }} rows={1} placeholder="KR에 대해 궁금한 점을 물어보세요…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 13.5, color: "#0F1A36", resize: "none", lineHeight: 1.5 }} />
          <button onClick={() => send(text)} style={{ width: 34, height: 34, borderRadius: 9, background: "#00A968", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", flexShrink: 0 }}>↑</button>
        </div>
      </div>
    </div>
  );
}

// ── STEP 4: KR 형태 ──
function Step4() {
  const formats = ["수치", "마일스톤", "루브릭", "이산"];
  const [sel, setSel] = useState<Record<string, string>>({ "01": "수치", "02": "수치", "03": "마일스톤" });
  return (
    <div style={card}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em" }}>각 KR의 측정 형태를 정해요</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#5B6685" }}>KR마다 가장 잘 맞는 측정 형태를 골라주세요. 형태에 따라 다음 단계 입력 필드가 달라져요.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {KRS.map((k) => (
          <div key={k.num} style={{ border: "1px solid #E1E5EF", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span className="mono" style={{ padding: "2px 9px", borderRadius: 999, background: "#F1F4FD", color: "#213A8C", fontSize: 11, fontWeight: 700 }}>KR · {k.num}</span>
              <span style={{ fontSize: 13.5, color: "#0F1A36", fontWeight: 500 }}>{k.kr}</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {formats.map((f) => {
                const on = sel[k.num] === f;
                const fc = FORMAT_COLOR[f];
                return (
                  <button key={f} onClick={() => setSel((s) => ({ ...s, [k.num]: f }))} style={{ padding: "8px 16px", borderRadius: 9, background: on ? fc.bg : "#fff", border: `1.5px solid ${on ? fc.fg : "#E1E5EF"}`, color: on ? fc.fg : "#5B6685", fontSize: 13, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{f}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STEP 5: 상세 수립 ──
function Step5() {
  const miniLabel: CSSProperties = { fontSize: 10.5, fontWeight: 600, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 };
  const miniVal: CSSProperties = { fontSize: 13.5, fontWeight: 600, color: "#3A4565", fontFamily: "var(--font-mono)" };
  const total = KRS.reduce((s, k) => s + k.weight, 0);
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {KRS.map((k) => {
          const fc = FORMAT_COLOR[k.format];
          return (
            <div key={k.num} style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span className="mono" style={{ padding: "2px 9px", borderRadius: 999, background: "#F1F4FD", color: "#213A8C", fontSize: 11, fontWeight: 700 }}>KR · {k.num}</span>
                <span style={{ padding: "2px 9px", borderRadius: 999, background: fc.bg, color: fc.fg, fontSize: 11, fontWeight: 600 }}>{k.format}</span>
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: "#0F1A36", lineHeight: 1.5, marginBottom: 14 }}>{k.kr}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 70px", gap: 14, paddingTop: 12, borderTop: "1px solid #ECEFF5" }}>
                <div><div style={miniLabel}>Baseline</div><div style={miniVal}>{k.baseline}</div></div>
                <div><div style={miniLabel}>Goal</div><div style={{ ...miniVal, color: "#3B5BDB" }}>{k.goal}</div></div>
                <div><div style={miniLabel}>측정 방법</div><div style={miniVal}>{k.measure}</div></div>
                <div><div style={miniLabel}>가중치</div><div style={{ ...miniVal, color: "#0F1A36" }}>{k.weight}%</div></div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 18, padding: "16px 20px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 13, color: "#5B6685", fontWeight: 600 }}>가중치 합산</span>
        <div style={{ flex: 1, height: 10, background: "var(--page-bg)", borderRadius: 5, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(total / 110) * 100}%`, background: "linear-gradient(90deg, #3B5BDB, #5C7AE6)", borderRadius: 5 }} />
        </div>
        <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>{total} / 110</span>
        <span style={{ fontSize: 11.5, color: "#2F9E5E", fontWeight: 600 }}>✓ 상한 이내</span>
      </div>
    </div>
  );
}

// ── STEP 6: AI 비교 검토 ──
function Step6() {
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #F1FBF6, #fff 40%)", border: "1px solid #B9F1D8", borderRadius: 14, padding: "18px 22px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#00A968", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✨</div>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F1A36" }}>원안과 AI 정제안을 비교해보세요</div>
          <div style={{ fontSize: 12.5, color: "#5B6685", marginTop: 2 }}>더 나은 표현을 선택하거나, 원안을 유지할 수 있어요.</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {KRS.map((k) => (
          <div key={k.num} style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "18px 20px" }}>
            <span className="mono" style={{ padding: "2px 9px", borderRadius: 999, background: "#F1F4FD", color: "#213A8C", fontSize: 11, fontWeight: 700 }}>KR · {k.num}</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div style={{ padding: "14px 16px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 10 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>원안</div>
                <div style={{ fontSize: 13, color: "#5B6685", lineHeight: 1.55 }}>{k.before}</div>
              </div>
              <div style={{ padding: "14px 16px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: 10 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#0A6B44", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>✨ AI 정제안 · 채택됨</div>
                <div style={{ fontSize: 13, color: "#0F1A36", fontWeight: 500, lineHeight: 1.55 }}>{k.kr}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STEP 7: 최종 제출 ──
function Step7({ onSubmit }: { onSubmit: () => void }) {
  const checks = [
    { pass: true, text: "수치로 측정 가능한가?", note: "모든 KR에 명확한 baseline/goal 수치가 있어요" },
    { pass: true, text: "외부 의존 없이 통제 가능한가?" },
    { pass: false, text: "외부 증빙 기반인가?", note: "KR 03의 마일스톤 산출물 형태를 더 구체적으로 적으면 좋아요 (함께 정제 후보)" },
    { pass: true, text: "시간 내 달성 가능한가?" },
    { pass: true, text: "명확한 언어인가?" },
    { pass: false, text: "단순 건수형이 아닌 질적 지표인가?", note: "KR 03에 결과 지표를 더하면 더 좋아요 (함께 정제 후보)" },
  ];
  return (
    <div>
      <div style={{ ...card, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "#0F1A36" }}>제출 전 최종 검토</h2>
          <span style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 999, background: "#ECFAF1", color: "#2F9E5E", fontSize: 11.5, fontWeight: 700 }}>11개 중 9개 통과</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {[["OKR 유형", "운영"], ["KR 개수", "3개"], ["가중치 합", "75 / 110"]].map(([l, v]) => (
            <div key={l} style={{ padding: "12px 14px", background: "var(--page-bg)", borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: "#7C87A4", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{l}</div>
              <div className="ds-num" style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36", marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "#00A968", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✨</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>AI 사전 검토 결과</div>
            <div style={{ fontSize: 12, color: "#5B6685", marginTop: 2 }}>제출 전 함께 정제하면 좋은 항목이에요</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {checks.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: c.pass ? "#ECFAF1" : "#FFF7EC", border: `1px solid ${c.pass ? "#BBE9CC" : "#FFE0BA"}`, borderRadius: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, background: c.pass ? "#2F9E5E" : "#D98023", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{c.pass ? "✓" : "!"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.pass ? "#1F5538" : "#7A4A14" }}>{c.text}</div>
                {c.note && <div style={{ fontSize: 11.5, color: c.pass ? "#2F6B48" : "#9C5E26", marginTop: 3, lineHeight: 1.5 }}>{c.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #0A1F17, #14342B)", color: "#fff", borderRadius: 16, padding: "26px 28px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,169,104,0.25)", color: "#7CE9BE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📥</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>박정훈 팀장에게 제출하시겠어요?</div>
          <div style={{ fontSize: 12.5, color: "#9DB3A9", lineHeight: 1.5 }}>제출 후에도 팀장이 조정 요청 시 수정할 수 있어요. AI 검토 미통과 2건은 평가자가 코칭 시 함께 정제하실 수 있습니다.</div>
        </div>
        <Button variant="secondary" onClick={() => alert("임시 저장되었습니다 🙂")} style={{ padding: "12px 22px" }}>저장만 하기</Button>
        <Button variant="primary" onClick={onSubmit} style={{ padding: "12px 22px" }}>제출하기 →</Button>
      </div>
    </div>
  );
}

export default function R1WritePage() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("ops");

  function submit() {
    alert("OKR이 박정훈 팀장에게 제출되었습니다! 🎉 (프로토타입)");
  }

  return (
    <RoleShell role="R1" title="OKR 작성" subtitle="정태영 · 2026 하반기 · 8단계 위저드">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 12.5, color: "#5B6685" }}>
        <Link href="/r1" style={{ color: "#5B6685", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}><span>←</span> 피평가자 홈</Link>
        <span style={{ color: "#C8CFDF" }}>/</span>
        <span style={{ color: "#0F1A36", fontWeight: 600 }}>OKR 작성</span>
      </div>

      <StepHeader current={step} onJump={setStep} />
      <Hero num={step} title={STEPS[step].label} desc={DESC[step]} />

      {step === 0 && <Step0 />}
      {step === 1 && <Step1 type={type} setType={setType} />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
      {step === 5 && <Step5 />}
      {step === 6 && <Step6 />}
      {step === 7 && <Step7 onSubmit={submit} />}

      {/* Nav */}
      <div style={{ marginTop: 22, padding: "16px 22px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-xs)" }}>
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>← {step === 0 ? "홈으로" : `이전 (STEP ${step - 1})`}</Button>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, color: "#7C87A4", display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2F9E5E" }} />임시 저장됨 · 방금 전</div>
        <Button variant="secondary" onClick={() => alert("임시 저장되었습니다 🙂")}>임시 저장</Button>
        {step < 7 ? (
          <Button variant="primary" onClick={() => setStep((s) => Math.min(7, s + 1))}>다음 (STEP {step + 1}) →</Button>
        ) : (
          <Button variant="primary" onClick={submit}>제출하기 →</Button>
        )}
      </div>

      <div style={{ marginTop: 18, padding: "12px 16px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#5B6685" }}>
        <span style={{ fontSize: 14 }}>💡</span>
        AI 코칭은 참고용 신호입니다. 평가에 직접 반영되지 않으며, 더 좋은 KR을 함께 만들기 위한 제안이에요.
      </div>
    </RoleShell>
  );
}

const DESC = [
  "마이페이지에 저장된 프로필을 확인해요. 이 정보를 바탕으로 AI가 KR을 제안합니다.",
  "이번 분기 OKR의 성격을 선택하면, AI가 더 적절한 가이드를 드려요.",
  "AI가 KR 초안을 제안할 수 있도록 핵심 정보를 알려주세요.",
  "AI와 대화하며 KR의 측정 방법과 도전성을 함께 다듬어요.",
  "각 KR에 가장 잘 맞는 측정 형태를 골라주세요.",
  "baseline·goal·측정 방법·가중치를 채워 KR을 구체화해요.",
  "원안과 AI 정제안을 비교하고 더 나은 표현을 선택해요.",
  "제출 전 AI 사전 검토 결과를 확인하고 평가자에게 제출해요.",
];
