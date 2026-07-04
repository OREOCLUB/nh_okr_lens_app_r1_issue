"use client";

import { card } from "./shared";
import type { WizardState } from "@/lib/wizard";
import type { CriteriaData } from "@/lib/dataAccess";

export function Step1({ state, set, criteria }: { state: WizardState; set: (fn: (s: WizardState) => WizardState) => void; criteria: CriteriaData }) {
  const type = state.okrType;
  const setType = (t: WizardState["okrType"]) => set((s) => ({ ...s, okrType: t }));
  const w = criteria.system.weights;

  const cards = [
    { value: "ops" as const, icon: "⚙️", title: "운영 OKR", desc: "기존 업무의 안정·개선", accent: "#3B5BDB", features: ["응답속도·장애율 개선", "기존 시스템 안정화", "정량 측정이 쉬운 편"] },
    { value: "strategy" as const, icon: "🚀", title: "전략 혁신 OKR", desc: "새로운 가치 창출", accent: "#7C4DD9", features: ["신규 기능 · 시스템 도입", "조직 차원 도전 과제", "도전성과 가중치가 높음"] },
  ];
  return (
    <div style={card}>
      {/* 페이지 상단 Hero가 제목·설명을 담당 — 카드 내부 중복 헤더 제거 */}
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
        <div><b>운영안 비중 안내</b> · 운영 {w.operation}% · 전략혁신 {w.strategy}% · 사후평가 {w.post}%. 한 분기 OKR 중 운영과 전략을 혼합해서 작성할 수 있어요. <span style={{ opacity: 0.75 }}>({criteria.system.version})</span></div>
      </div>
    </div>
  );
}
