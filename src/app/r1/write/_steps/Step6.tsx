"use client";

import { useState } from "react";
import { AI_VENDORS, VERDICT } from "./shared";

interface Review { score: number; scoreLabel: string; verdict: string; summary: string; items: { c: string; v: string; note: string }[]; suggestion: string }
interface KRReview { title: string; format: string; weight: number; reviews: Record<string, Review> }

const REVIEW_DATA: Record<string, KRReview> = {
  kr1: {
    title: "KR 01 · 결제 게이트웨이 APM p95 응답속도 850ms → 500ms", format: "수치", weight: 30,
    reviews: {
      claude: { score: 9, scoreLabel: "Strong", verdict: "pass", summary: "측정 기준(p95)·도구(APM)·집계 주기가 명확해 매우 객관적이에요. 다만 SRE 의존성은 명시적 협업 계획이 필요해요.", items: [{ c: "측정성", v: "pass", note: "APM p95 월평균 ─ 완벽" }, { c: "도전성", v: "pass", note: "850→500ms는 41% 개선 ─ 도전적" }, { c: "증빙", v: "pass", note: "APM 대시보드 캡처 자동 가능" }, { c: "의존성", v: "warn", note: "SRE팀 인프라 변경 필요 시 영향" }], suggestion: "S등급은 400ms로 두되, 캐시 추가 도입 마일스톤도 함께 적기를 추천해요." },
      gpt: { score: 8.5, scoreLabel: "Good", verdict: "pass", summary: "측정 가능성은 좋습니다. C·D 기준이 baseline과 너무 가까워서 변별력이 떨어질 수 있어요.", items: [{ c: "측정성", v: "pass", note: "p95 + 월평균 = 객관적" }, { c: "도전성", v: "pass", note: "전년 대비 큰 개선폭" }, { c: "증빙", v: "pass", note: "Datadog 자동 리포트 활용" }, { c: "변별력", v: "warn", note: "C/D 구간이 너무 좁음 ─ 재조정 추천" }], suggestion: "C = 700ms, D = 850ms 이상으로 재조정해 baseline 상태와 명확히 구분하세요." },
      gemini: { score: 8, scoreLabel: "Good", verdict: "pass", summary: "전반적으로 명확합니다. 다만 응답속도 외에도 처리량(TPS) 추세도 함께 보는 것을 권장해요.", items: [{ c: "측정성", v: "pass", note: "p95 — 표준 지표" }, { c: "도전성", v: "pass", note: "도전적이지만 달성 가능" }, { c: "증빙", v: "pass", note: "APM 표준 출력" }, { c: "완전성", v: "warn", note: "TPS·에러율 보조 지표 추가 권장" }], suggestion: "주 지표는 p95 응답속도, 보조 지표로 TPS·에러율을 함께 모니터링하세요." },
    },
  },
  kr2: {
    title: "KR 02 · 결제 인증모듈 단위테스트 커버리지 65% → 85%", format: "수치", weight: 25,
    reviews: {
      claude: { score: 8, scoreLabel: "Good", verdict: "pass", summary: "회귀 장애 근거를 명시한 점이 매우 좋아요. 다만 '커버리지'는 양적 지표라 질적 검증 보완이 필요해요.", items: [{ c: "측정성", v: "pass", note: "Jest coverage report 자동" }, { c: "도전성", v: "pass", note: "+20%p는 도전적" }, { c: "근거", v: "pass", note: "회귀 장애 3건 영역 명시" }, { c: "질적측면", v: "warn", note: "Mutation testing 보완 권장" }], suggestion: "Stryker 같은 mutation testing으로 커버리지의 질도 검증하면 더 견고해요." },
      gpt: { score: 9, scoreLabel: "Strong", verdict: "pass", summary: "회귀 장애 영역 100% 커버라는 구체적 정량 근거가 탁월합니다. 의존성도 낮아요.", items: [{ c: "측정성", v: "pass", note: "자동 수집 가능" }, { c: "도전성", v: "pass", note: "현실적이면서 도전적" }, { c: "근거", v: "pass", note: "장애 데이터 근거 ─ 강력" }, { c: "독립성", v: "pass", note: "본인 모듈 ─ 외부 의존 없음" }], suggestion: "추가 보완 없음. 이대로 진행해도 충분합니다." },
      gemini: { score: 7.5, scoreLabel: "Acceptable", verdict: "warn", summary: "커버리지 향상은 좋지만, 새 기능 개발 일정과의 균형을 어떻게 잡을지 명시되지 않았어요.", items: [{ c: "측정성", v: "pass", note: "자동 측정" }, { c: "도전성", v: "pass", note: "20%p 향상" }, { c: "근거", v: "pass", note: "회귀 장애 근거" }, { c: "현실성", v: "warn", note: "기능 개발 일정과 충돌 가능성" }], suggestion: "Sprint 내 'test refactor day'를 격주로 잡아두는 운영 계획을 함께 적어주세요." },
    },
  },
  kr3: {
    title: "KR 03 · 장애 알림 룰 자동화 4단계 중 3단계 완료", format: "마일스톤", weight: 20,
    reviews: {
      claude: { score: 6.5, scoreLabel: "Needs Work", verdict: "warn", summary: "마일스톤 단계가 무엇인지 구체적이지 않아요. 각 단계의 산출물·검증 방법을 명시해야 평가가 가능해요.", items: [{ c: "측정성", v: "warn", note: "4단계가 무엇인지 정의 필요" }, { c: "도전성", v: "pass", note: "자동화 자체는 도전적" }, { c: "증빙", v: "fail", note: "PR · 문서 첨부 가이드 없음" }, { c: "단계정의", v: "fail", note: "각 단계 산출물 미정의" }], suggestion: "1단계=룰 정의, 2단계=알림 채널 통합, 3단계=노이즈 필터링, 4단계=onCall 자동화 식으로 명시하세요." },
      gpt: { score: 7, scoreLabel: "Acceptable", verdict: "warn", summary: "마일스톤 구조는 적절하지만 각 단계의 완료 기준이 모호해요.", items: [{ c: "측정성", v: "warn", note: "단계 완료 기준 모호" }, { c: "도전성", v: "pass", note: "신규 자동화 도전" }, { c: "증빙", v: "warn", note: "산출물 명세 필요" }, { c: "분할적정성", v: "pass", note: "4단계 분할은 적절" }], suggestion: "각 단계마다 1줄로 '완료 정의(Definition of Done)'를 작성하세요." },
      gemini: { score: 6, scoreLabel: "Needs Work", verdict: "fail", summary: "측정 가능한 산출물이 정의되지 않았어요. 마일스톤형 KR은 단계별 evidence가 필수입니다.", items: [{ c: "측정성", v: "fail", note: "단계별 산출물 미정의" }, { c: "도전성", v: "pass", note: "자동화 시도 자체 도전적" }, { c: "증빙", v: "fail", note: "PR/문서/감사로그 등 미명시" }, { c: "회수성", v: "warn", note: "외부 SRE팀 의존성 고려 필요" }], suggestion: "STEP 5로 돌아가서 각 단계의 산출물(PR/Runbook/Dashboard 등)을 정의해주세요." },
    },
  },
};

const KR_TABS = [
  { id: "kr1", short: "KR 01", label: "응답속도 850→500ms", weight: 30 },
  { id: "kr2", short: "KR 02", label: "커버리지 65→85%", weight: 25 },
  { id: "kr3", short: "KR 03", label: "알림 자동화 3/4", weight: 20 },
];

export function Step6() {
  const [activeKR, setActiveKR] = useState("kr1");
  const [chosen, setChosen] = useState<Record<string, string>>({ kr1: "claude", kr2: "gpt" });

  const allV = Object.values(REVIEW_DATA).flatMap((kr) => Object.values(kr.reviews).map((r) => r.verdict));
  const passCt = allV.filter((v) => v === "pass").length;
  const warnCt = allV.filter((v) => v === "warn").length;
  const failCt = allV.filter((v) => v === "fail").length;
  const avgScore = (Object.values(REVIEW_DATA).flatMap((kr) => Object.values(kr.reviews).map((r) => r.score)).reduce((a, b) => a + b, 0) / 9).toFixed(1);

  const cur = REVIEW_DATA[activeKR];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* TOP — 종합 합의도 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 14 }}>
        <div style={{ background: "linear-gradient(135deg, #0A1F17, #14342B)", color: "#fff", borderRadius: 16, padding: "20px 22px" }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>🤝 3개 AI 종합 합의도</div>
          <div style={{ fontSize: 11, color: "#9DB3A9", marginTop: 2 }}>KR 3개 × AI 3사 = 9건 검토</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "12px 0 12px" }}>
            <span className="mono" style={{ fontSize: 34, fontWeight: 700, color: "#7CE9BE" }}>{avgScore}</span>
            <span style={{ fontSize: 14, color: "#9DB3A9" }}>/ 10</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["통과", passCt, "#7CE9BE"], ["보완", warnCt, "#F0C674"], ["필수", failCt, "#F09A9A"]].map(([l, v, c]) => (
              <div key={l as string} style={{ flex: 1, padding: "8px 10px", background: "rgba(255,255,255,0.08)", borderRadius: 9, textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: c as string }}>{v as number}</div>
                <div style={{ fontSize: 10.5, color: "#9DB3A9", marginTop: 2 }}>{l as string}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "20px 22px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36" }}>의견 채택 현황</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "12px 0" }}>
            <span className="mono" style={{ fontSize: 30, fontWeight: 700, color: "#3B5BDB" }}>{Object.values(chosen).filter(Boolean).length}</span>
            <span style={{ fontSize: 14, color: "#7C87A4" }}>/ 3</span>
          </div>
          <div style={{ fontSize: 11.5, color: "#7C87A4", lineHeight: 1.5 }}>KR별로 채택할 AI를 선택해주세요</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "20px 22px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>AI별 평균 점수</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {AI_VENDORS.map((v) => {
              const scores = Object.values(REVIEW_DATA).map((kr) => kr.reviews[v.id].score);
              const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
              return (
                <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: v.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{v.avatar}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#3A4565", flex: 1 }}>{v.short}</span>
                  <span className="mono" style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>{avg}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KR Tabs */}
      <div style={{ display: "flex", gap: 10 }}>
        {KR_TABS.map((k) => {
          const on = activeKR === k.id;
          const isChosen = !!chosen[k.id];
          return (
            <button key={k.id} onClick={() => setActiveKR(k.id)} style={{ flex: 1, textAlign: "left", padding: "12px 14px", background: on ? "#F1F4FD" : "#fff", border: `1.5px solid ${on ? "#3B5BDB" : "#E1E5EF"}`, borderRadius: 11, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#213A8C" }}>{k.short}</span>
                <span style={{ padding: "1px 8px", borderRadius: 999, background: "var(--page-bg)", color: "#5B6685", fontSize: 10, fontWeight: 700 }}>가중치 {k.weight}%</span>
                {isChosen && <span style={{ marginLeft: "auto", color: "#2F9E5E", fontSize: 10.5, fontWeight: 700 }}>채택 ✓</span>}
              </div>
              <div style={{ fontSize: 12, color: "#3A4565", marginTop: 6, lineHeight: 1.4 }}>{k.label}</div>
            </button>
          );
        })}
      </div>

      {/* Selected KR title */}
      <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F1A36" }}>{cur.title}</div>

      {/* 3 AI columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {AI_VENDORS.map((v) => {
          const r = cur.reviews[v.id];
          const ver = VERDICT[r.verdict];
          const isChosen = chosen[activeKR] === v.id;
          return (
            <div key={v.id} style={{ background: "#fff", border: `2px solid ${isChosen ? v.accent : "#E1E5EF"}`, borderRadius: 16, overflow: "hidden", boxShadow: isChosen ? `0 0 0 4px ${v.accent}18` : "var(--shadow-xs)" }}>
              <div style={{ padding: "14px 16px", background: v.accentBg, borderBottom: `1px solid ${v.accentBorder}`, display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: v.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{v.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>{v.short}</div>
                  <div style={{ fontSize: 10.5, color: "#7C87A4" }}>{v.vendor}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: v.accent }}>{r.score}</div>
                  <div style={{ fontSize: 10, color: "#7C87A4", fontWeight: 600 }}>{r.scoreLabel}</div>
                </div>
              </div>
              <div style={{ padding: "14px 16px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: ver.bg, color: ver.fg, fontSize: 11, fontWeight: 700, marginBottom: 10 }}><span style={{ fontSize: 9 }}>{ver.ico}</span>{ver.label}</span>
                <div style={{ fontSize: 12, color: "#3A4565", lineHeight: 1.6, marginBottom: 12 }}>{r.summary}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
                  {r.items.map((it) => {
                    const iv = VERDICT[it.v];
                    return (
                      <div key={it.c} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ width: 16, height: 16, borderRadius: 5, background: iv.fg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{iv.ico}</span>
                        <div><span style={{ fontSize: 11.5, fontWeight: 700, color: "#0F1A36" }}>{it.c}</span> <span style={{ fontSize: 11, color: "#7C87A4" }}>{it.note}</span></div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: "10px 12px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 9, fontSize: 11.5, color: "#5B6685", lineHeight: 1.55, marginBottom: 12 }}><b style={{ color: "#3A4565" }}>💡 제안</b> · {r.suggestion}</div>
                <button onClick={() => setChosen((c) => ({ ...c, [activeKR]: isChosen ? "" : v.id }))} style={{ width: "100%", padding: "9px", background: isChosen ? v.accent : "#fff", color: isChosen ? "#fff" : v.accent, border: `1.5px solid ${v.accent}`, borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{isChosen ? "✓ 이 의견 채택됨" : "이 의견 채택하기"}</button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "12px 16px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, fontSize: 12, color: "#5B6685", lineHeight: 1.55 }}>
        💡 채택한 의견은 STEP 7 최종 수정에 자동 반영됩니다. 3개 AI의 관점이 다를 수 있으니, KR 성격에 가장 잘 맞는 의견을 고르세요.
      </div>
    </div>
  );
}
