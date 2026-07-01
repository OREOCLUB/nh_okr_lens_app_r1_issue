"use client";

import { useState } from "react";

interface Fmt { key: string; icon: string; title: string; accent: string; badge: string; desc: string; structure: string; example: string; useCases: string[] }
const FORMATS: Fmt[] = [
  { key: "수치", icon: "📊", title: "수치형", accent: "#3B5BDB", badge: "정량", desc: "baseline → goal 수치로 진행률을 자동 계산", structure: "[지표] [baseline] → [goal] ([측정도구])", example: "APM p95 응답속도 850ms → 500ms", useCases: ["성능·SLA·커버리지처럼 자동 측정 가능한 지표", "명확한 시작값과 목표값이 있는 경우"] },
  { key: "마일스톤", icon: "🎯", title: "마일스톤", accent: "#7C4DD9", badge: "단계", desc: "여러 단계의 산출물 완료로 진행을 측정", structure: "[전체 N단계] 중 [M단계]까지 완료", example: "알림 자동화 4단계 중 3단계 완료", useCases: ["신규 도입·전환·표준화처럼 단계가 뚜렷한 일", "각 단계 산출물(PR·문서·대시보드)이 명확할 때"] },
  { key: "루브릭", icon: "📋", title: "루브릭", accent: "#E07A3C", badge: "질적", desc: "S/A/B/C/D 등급 기준을 사전에 합의해 평가", structure: "등급별 서술 기준 (S~D)", example: "설계문서 품질 루브릭 A등급 이상", useCases: ["문서 품질·역량처럼 질적 판단이 필요한 일", "평가자와 사전 기준 합의가 가능할 때"] },
  { key: "이산", icon: "✓", title: "이산형", accent: "#2F9E5E", badge: "완료", desc: "달성/미달성 이분법으로 판정", structure: "[조건] 달성 여부 (Y/N)", example: "신규 결제수단 런칭 완료", useCases: ["런칭·준수·완료처럼 이분법이 자연스러운 일", "중간 진행도보다 완료 자체가 중요한 경우"] },
];

const KR_LIST = [
  { id: "kr1", num: "01", text: "결제 게이트웨이 APM p95 응답속도 850ms → 500ms", recommended: "수치" },
  { id: "kr2", num: "02", text: "결제 인증모듈 단위테스트 커버리지 65% → 85%", recommended: "수치" },
  { id: "kr3", num: "03", text: "장애 알림 룰 자동화 4단계 중 3단계까지 완료", recommended: "마일스톤" },
];

const AI_REC = [
  { kr: "KR 01", text: "응답속도 단축 (850→500ms)", rec: "수치형", reason: "명확한 baseline·goal 수치 존재", accent: "#3FC1D1" },
  { kr: "KR 02", text: "커버리지 향상 (65→85%)", rec: "수치형", reason: "월별 자동 측정 가능", accent: "#3FC1D1" },
  { kr: "KR 03", text: "알림 자동화 (4단계 중 3단계)", rec: "마일스톤", reason: "단계 산출물이 명확", accent: "#C5A6F5" },
];

const TABLE = [
  { f: "수치형", icon: "📊", c: "#3B5BDB", diff: "낮음 (자동 측정)", clarity: "매우 명확", area: "성능·SLA·커버리지", warn: "측정 도구 사전 확보 필요" },
  { f: "마일스톤", icon: "🎯", c: "#7C4DD9", diff: "중간 (단계 정의)", clarity: "명확", area: "신규 도입·전환·표준화", warn: "각 단계 산출물 정의 필수" },
  { f: "루브릭", icon: "📋", c: "#E07A3C", diff: "높음 (기준 합의)", clarity: "합의 의존", area: "문서 품질·역량", warn: "평가자와 사전 기준 합의" },
  { f: "이산형", icon: "✓", c: "#2F9E5E", diff: "낮음 (이분법)", clarity: "매우 명확", area: "런칭·준수·완료", warn: "중간 진행도 측정 어려움" },
];

export function Step4() {
  const [activeKR, setActiveKR] = useState("kr1");
  const [selected, setSelected] = useState<Record<string, string>>({ kr1: "수치", kr2: "수치", kr3: "마일스톤" });
  const recommended = KR_LIST.find((k) => k.id === activeKR)!.recommended;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* KR selector tabs */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#7C87A4", marginBottom: 10, letterSpacing: "0.03em", textTransform: "uppercase" }}>지금 형태를 정하는 KR</div>
        <div style={{ display: "flex", gap: 10 }}>
          {KR_LIST.map((k) => {
            const on = activeKR === k.id;
            const sel = selected[k.id];
            return (
              <button key={k.id} onClick={() => setActiveKR(k.id)} style={{ flex: 1, textAlign: "left", padding: "12px 14px", background: on ? "#F1F4FD" : "#fff", border: `1.5px solid ${on ? "#3B5BDB" : "#E1E5EF"}`, borderRadius: 11, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#213A8C" }}>KR {k.num}</span>
                  {sel && <span style={{ padding: "1px 8px", borderRadius: 999, background: "#E5EBFB", color: "#213A8C", fontSize: 10, fontWeight: 700 }}>{sel}</span>}
                  {on && <span style={{ marginLeft: "auto", fontSize: 10, color: "#3B5BDB", fontWeight: 700 }}>현재</span>}
                </div>
                <div style={{ fontSize: 12, color: "#3A4565", lineHeight: 1.45 }}>{k.text}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 format cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {FORMATS.map((f) => {
          const sel = selected[activeKR] === f.key;
          const rec = recommended === f.key;
          return (
            <div key={f.key} onClick={() => setSelected((s) => ({ ...s, [activeKR]: f.key }))} style={{ position: "relative", background: sel ? "#F9FBFF" : "#fff", border: `2px solid ${sel ? f.accent : "#E1E5EF"}`, borderRadius: 16, padding: "20px 22px", cursor: "pointer", boxShadow: sel ? `0 0 0 4px ${f.accent}18` : "var(--shadow-xs)" }}>
              {rec && <div style={{ position: "absolute", top: -10, left: 18, padding: "3px 10px", background: f.accent, color: "#fff", borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>이 KR엔 추천</div>}
              {sel && <div style={{ position: "absolute", top: 16, right: 16, width: 22, height: 22, borderRadius: "50%", background: f.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${f.accent}18`, color: f.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>{f.title}</div>
                  <span style={{ padding: "1px 8px", borderRadius: 999, background: `${f.accent}18`, color: f.accent, fontSize: 10.5, fontWeight: 700 }}>{f.badge}</span>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: "#5B6685", lineHeight: 1.5, marginBottom: 12 }}>{f.desc}</div>
              <div style={{ padding: "10px 12px", background: "#F4F7FB", borderRadius: 9, marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em" }}>STRUCTURE</div>
                <div className="mono" style={{ fontSize: 11.5, color: "#3A4565", marginTop: 3 }}>{f.structure}</div>
              </div>
              <div style={{ fontSize: 11.5, color: "#3A4565", marginBottom: 10 }}>📌 예시 · <span style={{ color: "#0F1A36", fontWeight: 500 }}>{f.example}</span></div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", marginBottom: 5 }}>이런 경우에</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {f.useCases.map((u) => <div key={u} style={{ display: "flex", gap: 6, fontSize: 11.5, color: "#5B6685", lineHeight: 1.45 }}><span style={{ color: f.accent }}>·</span>{u}</div>)}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI recommendation panel */}
      <div style={{ background: "linear-gradient(135deg, #F1FBF6, #fff 50%)", border: "1px solid #B9F1D8", borderRadius: 16, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#00A968", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✨</div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F1A36" }}>AI 형태 추천</div>
            <div style={{ fontSize: 11.5, color: "#5B6685" }}>STEP 3 정제 결과 기반 · <span style={{ color: "#2F9E5E", fontWeight: 600 }}>✓ 분석 완료</span></div>
          </div>
          <button onClick={() => setSelected({ kr1: "수치", kr2: "수치", kr3: "마일스톤" })} style={{ marginLeft: "auto", padding: "9px 16px", background: "#00A968", color: "#fff", border: "none", borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>✨ 추천대로 일괄 적용</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {AI_REC.map((r) => (
            <div key={r.kr} style={{ background: "#fff", border: "1px solid #DFF3E8", borderRadius: 11, padding: "13px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#213A8C", marginBottom: 3 }}>{r.kr}</div>
              <div style={{ fontSize: 12, color: "#3A4565", marginBottom: 8, lineHeight: 1.4 }}>{r.text}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: `${r.accent}22`, color: "#0F1A36", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>추천 · {r.rec}</div>
              <div style={{ fontSize: 10.5, color: "#7C87A4", lineHeight: 1.5 }}>{r.reason}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reference table */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "20px 22px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 14 }}>4가지 형태 비교표</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["형태", "측정 난이도", "평가 명확성", "적합한 영역", "주의 사항"].map((h) => <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.03em", textTransform: "uppercase", borderBottom: "1px solid #E1E5EF" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {TABLE.map((r) => (
                <tr key={r.f}>
                  <td style={{ padding: "11px 12px", borderBottom: "1px solid #F1F4F9" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, color: r.c }}>{r.icon} {r.f}</span></td>
                  <td style={{ padding: "11px 12px", borderBottom: "1px solid #F1F4F9", color: "#3A4565" }}>{r.diff}</td>
                  <td style={{ padding: "11px 12px", borderBottom: "1px solid #F1F4F9", color: "#3A4565" }}>{r.clarity}</td>
                  <td style={{ padding: "11px 12px", borderBottom: "1px solid #F1F4F9", color: "#3A4565" }}>{r.area}</td>
                  <td style={{ padding: "11px 12px", borderBottom: "1px solid #F1F4F9", color: "#9C5E26" }}>{r.warn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
