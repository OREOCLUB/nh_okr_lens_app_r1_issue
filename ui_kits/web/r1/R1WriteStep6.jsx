// STEP 6 — 멀티 AI 검토 비교 (Claude · GPT · Gemini 3개 결과 나란히)
// 명세 1-5: "여러개(3개정도)의 AI API 활용하여 검토 비교"

const AI_VENDORS = [
  {
    id: "claude",
    name: "Claude Sonnet 4.5",
    short: "Claude",
    vendor: "Anthropic",
    avatar: "🌀", // 색상 강조 + 모노그램
    accent: "#D97757",
    accentBg: "#FBF0E9",
    accentBorder: "#F0CDB1",
  },
  {
    id: "gpt",
    name: "GPT-4o",
    short: "GPT",
    vendor: "OpenAI",
    avatar: "✦",
    accent: "#10A37F",
    accentBg: "#E6F5F0",
    accentBorder: "#A8DDCB",
  },
  {
    id: "gemini",
    name: "Gemini 1.5 Pro",
    short: "Gemini",
    vendor: "Google",
    avatar: "✧",
    accent: "#4285F4",
    accentBg: "#E8F0FE",
    accentBorder: "#A4C2F4",
  },
];

// 각 AI의 KR별 검토 결과 (시연용 — 의도적으로 결과가 약간씩 다름)
const REVIEW_DATA = {
  kr1: {
    title: "KR 01 · 결제 게이트웨이 APM p95 응답속도 850ms → 500ms",
    format: "수치", weight: 30,
    reviews: {
      claude: {
        score: 9, scoreLabel: "Strong",
        verdict: "pass",
        summary: "측정 기준(p95)·도구(APM)·집계 주기가 명확해 매우 객관적이에요. 다만 SRE 의존성은 명시적 협업 계획이 필요해요.",
        items: [
          { c: "측정성", v: "pass", note: "APM p95 · 월평균 ─ 완벽" },
          { c: "도전성", v: "pass", note: "850→500ms는 41% 개선 ─ 도전적" },
          { c: "증빙",   v: "pass", note: "APM 대시보드 캡처 자동 가능" },
          { c: "의존성", v: "warn", note: "SRE팀 인프라 변경 필요 시 영향" },
        ],
        suggestion: "S등급은 400ms로 두되, 캐시 추가 도입 마일스톤도 함께 적기를 추천해요.",
      },
      gpt: {
        score: 8.5, scoreLabel: "Good",
        verdict: "pass",
        summary: "측정 가능성은 좋습니다. C·D 기준이 baseline과 너무 가까워서 변별력이 떨어질 수 있어요.",
        items: [
          { c: "측정성", v: "pass", note: "p95 + 월평균 = 객관적" },
          { c: "도전성", v: "pass", note: "전년 대비 큰 개선폭" },
          { c: "증빙",   v: "pass", note: "Datadog 자동 리포트 활용" },
          { c: "변별력", v: "warn", note: "C/D 구간이 너무 좁음 ─ 재조정 추천" },
        ],
        suggestion: "C = 700ms, D = 850ms 이상으로 재조정해 baseline 상태와 명확히 구분하세요.",
      },
      gemini: {
        score: 8, scoreLabel: "Good",
        verdict: "pass",
        summary: "전반적으로 명확합니다. 다만 응답속도 외에도 처리량(TPS) 추세도 함께 보는 것을 권장해요.",
        items: [
          { c: "측정성", v: "pass", note: "p95 — 표준 지표" },
          { c: "도전성", v: "pass", note: "도전적이지만 달성 가능" },
          { c: "증빙",   v: "pass", note: "APM 표준 출력" },
          { c: "완전성", v: "warn", note: "TPS·에러율 보조 지표 추가 권장" },
        ],
        suggestion: "주 지표는 p95 응답속도, 보조 지표로 TPS · 에러율을 함께 모니터링하세요.",
      },
    },
  },
  kr2: {
    title: "KR 02 · 결제 인증모듈 단위테스트 커버리지 65% → 85%",
    format: "수치", weight: 25,
    reviews: {
      claude: {
        score: 8, scoreLabel: "Good",
        verdict: "pass",
        summary: "회귀 장애 근거를 명시한 점이 매우 좋아요. 다만 '커버리지'는 양적 지표라 질적 검증 보완이 필요해요.",
        items: [
          { c: "측정성", v: "pass", note: "Jest coverage report 자동" },
          { c: "도전성", v: "pass", note: "+20%p는 도전적" },
          { c: "근거",   v: "pass", note: "회귀 장애 3건 영역 명시" },
          { c: "질적측면", v: "warn", note: "Mutation testing 보완 권장" },
        ],
        suggestion: "Stryker 같은 mutation testing으로 커버리지의 질도 검증하면 더 견고해요.",
      },
      gpt: {
        score: 9, scoreLabel: "Strong",
        verdict: "pass",
        summary: "회귀 장애 영역 100% 커버라는 구체적 정량 근거가 탁월합니다. 의존성도 낮아요.",
        items: [
          { c: "측정성", v: "pass", note: "자동 수집 가능" },
          { c: "도전성", v: "pass", note: "현실적이면서 도전적" },
          { c: "근거",   v: "pass", note: "장애 데이터 근거 ─ 강력" },
          { c: "독립성", v: "pass", note: "본인 모듈 ─ 외부 의존 없음" },
        ],
        suggestion: "추가 보완 없음. 이대로 진행해도 충분합니다.",
      },
      gemini: {
        score: 7.5, scoreLabel: "Acceptable",
        verdict: "warn",
        summary: "커버리지 향상은 좋지만, 새 기능 개발 일정과의 균형을 어떻게 잡을지 명시되지 않았어요.",
        items: [
          { c: "측정성", v: "pass", note: "자동 측정" },
          { c: "도전성", v: "pass", note: "20%p 향상" },
          { c: "근거",   v: "pass", note: "회귀 장애 근거" },
          { c: "현실성", v: "warn", note: "기능 개발 일정과 충돌 가능성" },
        ],
        suggestion: "Sprint 내 'test refactor day'를 격주로 잡아두는 운영 계획을 함께 적어주세요.",
      },
    },
  },
  kr3: {
    title: "KR 03 · 장애 알림 룰 자동화 4단계 중 3단계 완료",
    format: "마일스톤", weight: 20,
    reviews: {
      claude: {
        score: 6.5, scoreLabel: "Needs Work",
        verdict: "warn",
        summary: "마일스톤 단계가 무엇인지 구체적이지 않아요. 각 단계의 산출물·검증 방법을 명시해야 평가가 가능해요.",
        items: [
          { c: "측정성", v: "warn", note: "4단계가 무엇인지 정의 필요" },
          { c: "도전성", v: "pass", note: "자동화 자체는 도전적" },
          { c: "증빙",   v: "fail", note: "PR · 문서 첨부 가이드 없음" },
          { c: "단계정의", v: "fail", note: "각 단계 산출물 미정의" },
        ],
        suggestion: "1단계=룰 정의, 2단계=알림 채널 통합, 3단계=노이즈 필터링, 4단계=onCall 자동화 식으로 명시하세요.",
      },
      gpt: {
        score: 7, scoreLabel: "Acceptable",
        verdict: "warn",
        summary: "마일스톤 구조는 적절하지만 각 단계의 완료 기준이 모호해요.",
        items: [
          { c: "측정성", v: "warn", note: "단계 완료 기준 모호" },
          { c: "도전성", v: "pass", note: "신규 자동화 도전" },
          { c: "증빙",   v: "warn", note: "산출물 명세 필요" },
          { c: "분할적정성", v: "pass", note: "4단계 분할은 적절" },
        ],
        suggestion: "각 단계마다 1줄로 '완료 정의(Definition of Done)'를 작성하세요.",
      },
      gemini: {
        score: 6, scoreLabel: "Needs Work",
        verdict: "fail",
        summary: "측정 가능한 산출물이 정의되지 않았어요. 마일스톤형 KR은 단계별 evidence가 필수입니다.",
        items: [
          { c: "측정성", v: "fail", note: "단계별 산출물 미정의" },
          { c: "도전성", v: "pass", note: "자동화 시도 자체 도전적" },
          { c: "증빙",   v: "fail", note: "PR/문서/감사로그 등 미명시" },
          { c: "회수성", v: "warn", note: "외부 SRE팀 의존성 고려 필요" },
        ],
        suggestion: "STEP 5로 돌아가서 각 단계의 산출물(PR/Runbook/Dashboard 등)을 정의해주세요.",
      },
    },
  },
};

function AIBadge({ vendor, size = "md" }) {
  const s = size === "sm" ? { w: 24, h: 24, font: 11 } : { w: 32, h: 32, font: 14 };
  return (
    <div style={{
      width: s.w, height: s.h, borderRadius: 8,
      background: vendor.accent, color: "#fff",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: s.font, fontWeight: 700, flexShrink: 0,
    }}>{vendor.avatar}</div>
  );
}

function VerdictPill({ verdict }) {
  const v = {
    pass: { bg: "#ECFAF1", fg: "#2F9E5E", border: "#BBE9CC", ico: "✓", label: "통과" },
    warn: { bg: "#FFF7EC", fg: "#D98023", border: "#FFE0BA", ico: "!", label: "보완" },
    fail: { bg: "#FFF0F0", fg: "#D14343", border: "#FFD4D4", ico: "✗", label: "필수보완" },
  }[verdict];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 999,
      background: v.bg, color: v.fg, border: `1px solid ${v.border}`,
      fontSize: 10.5, fontWeight: 700,
    }}>
      <span>{v.ico}</span> {v.label}
    </span>
  );
}

function ItemRow({ c, v, note }) {
  const tone = {
    pass: { c: "#2F9E5E", ico: "✓" },
    warn: { c: "#D98023", ico: "!" },
    fail: { c: "#D14343", ico: "✗" },
  }[v];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", borderBottom: "1px dashed #ECEFF5" }}>
      <span style={{ color: tone.c, fontWeight: 700, fontSize: 13, lineHeight: 1.5, width: 12, flexShrink: 0 }}>{tone.ico}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#0F1A36" }}>{c}</div>
        <div style={{ fontSize: 11, color: "#5B6685", lineHeight: 1.5, marginTop: 1 }}>{note}</div>
      </div>
    </div>
  );
}

function AIReviewCard({ vendor, review, krNum, isChosen, onChoose }) {
  return (
    <div style={{
      background: "#fff",
      border: `${isChosen ? 2 : 1}px solid ${isChosen ? vendor.accent : "#E1E5EF"}`,
      borderRadius: 13,
      padding: "16px 16px",
      display: "flex", flexDirection: "column", gap: 11,
      boxShadow: isChosen ? `0 12px 28px -8px ${vendor.accent}30` : "0 1px 2px rgba(31,42,74,.04)",
      transition: "all 220ms cubic-bezier(0.16, 1, 0.3, 1)",
      position: "relative",
    }}>
      {isChosen && (
        <div style={{ position: "absolute", top: -8, right: 14, padding: "3px 10px", background: vendor.accent, color: "#fff", borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em" }}>
          ✓ 채택
        </div>
      )}

      {/* Vendor header */}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <AIBadge vendor={vendor}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>{vendor.short}</div>
          <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 1 }}>{vendor.vendor} · {vendor.name.split(" ").slice(-1)[0]}</div>
        </div>
        <VerdictPill verdict={review.verdict}/>
      </div>

      {/* Score */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "10px 13px", background: vendor.accentBg, borderRadius: 9, border: `1px solid ${vendor.accentBorder}` }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: vendor.accent, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {review.score}<span style={{ fontSize: 14, color: "#7C87A4", fontWeight: 500 }}>/10</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: vendor.accent, marginBottom: 3 }}>{review.scoreLabel}</div>
      </div>

      {/* Summary */}
      <div style={{ fontSize: 12, color: "#1F2A4A", lineHeight: 1.6 }}>{review.summary}</div>

      {/* Items */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>항목별 검토</div>
        {review.items.map((it, i) => <ItemRow key={i} {...it}/>)}
      </div>

      {/* Suggestion */}
      <div style={{ padding: "10px 12px", background: "#F9FAFC", borderRadius: 8, border: "1px dashed #C8CFDF" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: vendor.accent, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>💡 보완 제안</div>
        <div style={{ fontSize: 11.5, color: "#1F2A4A", lineHeight: 1.55 }}>{review.suggestion}</div>
      </div>

      {/* Choose button */}
      <button onClick={onChoose} style={{
        marginTop: "auto",
        padding: "9px 12px",
        background: isChosen ? vendor.accent : "#F4F7FB",
        color: isChosen ? "#fff" : "#3A4565",
        border: `1px solid ${isChosen ? vendor.accent : "#E1E5EF"}`,
        borderRadius: 9,
        fontSize: 12, fontWeight: 700,
        cursor: "pointer", fontFamily: "var(--font-sans)",
        transition: "all 140ms ease-out",
      }}>
        {isChosen ? "✓ 채택된 의견" : "이 의견 채택"}
      </button>
    </div>
  );
}

function ConsensusBar({ pass, warn, fail }) {
  const total = pass + warn + fail;
  return (
    <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "#F4F7FB" }}>
      {pass > 0 && <div style={{ flex: pass, background: "#2F9E5E" }}/>}
      {warn > 0 && <div style={{ flex: warn, background: "#D98023" }}/>}
      {fail > 0 && <div style={{ flex: fail, background: "#D14343" }}/>}
    </div>
  );
}

function R1WriteStep6() {
  const [activeKR, setActiveKR] = React.useState("kr1");
  const [chosen, setChosen] = React.useState({ kr1: "claude", kr2: "gpt", kr3: null });

  const krData = REVIEW_DATA[activeKR];
  const krs = [
    { id: "kr1", label: "KR 01", short: "응답속도 850→500ms", weight: 30 },
    { id: "kr2", label: "KR 02", short: "테스트 커버리지 65→85%", weight: 25 },
    { id: "kr3", label: "KR 03", short: "장애 알림 자동화", weight: 20 },
  ];

  // 전체 consensus 계산
  const allVerdicts = Object.values(REVIEW_DATA).flatMap(kr => Object.values(kr.reviews).map(r => r.verdict));
  const passCt = allVerdicts.filter(v => v === "pass").length;
  const warnCt = allVerdicts.filter(v => v === "warn").length;
  const failCt = allVerdicts.filter(v => v === "fail").length;
  const avgScore = (Object.values(REVIEW_DATA).flatMap(kr => Object.values(kr.reviews).map(r => r.score)).reduce((a, b) => a + b, 0) / 9).toFixed(1);

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="OKR 작성" subtitle="STEP 6 / 7 · 3개 AI 검토 비교"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 40px 32px" }}>

        <WizardBreadcrumb stepLabel="STEP 6 · AI 비교 검토"/>
        <WizardStepHeader current={6}/>

        <WizardHero
          stepNum={6}
          title="3개 AI가 본 KR — 함께 비교해볼까요?"
          desc="Claude · GPT · Gemini 세 가지 AI 모델이 동시에 KR을 검토했어요. 각 AI의 관점을 비교해 가장 공감되는 의견을 채택하면, STEP 7 최종 수정에 자동 반영됩니다."
          badge="✨ MULTI-AI"
          showAIHelp={false}
        />

        {/* TOP — 종합 합의도 */}
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
          {/* 종합 합의도 카드 */}
          <div style={{ background: "linear-gradient(135deg, #1B2A4E, #2C3E68)", color: "#fff", borderRadius: 14, padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤝</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>3개 AI 종합 합의도</div>
                <div style={{ fontSize: 11, color: "#91A6F0", marginTop: 2 }}>KR 3개 × AI 3사 = 9건 검토</div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {avgScore}<span style={{ fontSize: 13, color: "#91A6F0", fontWeight: 500 }}>/10</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <ConsensusBar pass={passCt} warn={warnCt} fail={failCt}/>
              </div>
              <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#C5D0F7" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "#2F9E5E" }}/> 통과 {passCt}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "#D98023" }}/> 보완 {warnCt}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "#D14343" }}/> 필수 {failCt}
                </span>
              </div>
            </div>
          </div>

          {/* 채택 현황 */}
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>의견 채택 현황</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em" }}>
              {Object.values(chosen).filter(Boolean).length} <span style={{ color: "#7C87A4", fontWeight: 500 }}>/ 3</span>
            </div>
            <div style={{ fontSize: 11.5, color: "#5B6685", marginTop: 4 }}>KR별로 채택할 AI를 선택해주세요</div>
          </div>

          {/* AI별 평균 */}
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>AI별 평균 점수</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {AI_VENDORS.map(v => {
                const scores = Object.values(REVIEW_DATA).map(kr => kr.reviews[v.id].score);
                const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
                return (
                  <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <AIBadge vendor={v} size="sm"/>
                    <div style={{ flex: 1, fontSize: 12, color: "#3A4565" }}>{v.short}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: v.accent, fontVariantNumeric: "tabular-nums" }}>{avg}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* KR Tabs */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "8px 8px", marginBottom: 16, display: "flex", gap: 6 }}>
          {krs.map(k => {
            const on = activeKR === k.id;
            const isChosen = !!chosen[k.id];
            return (
              <button key={k.id} onClick={() => setActiveKR(k.id)} style={{
                flex: 1,
                padding: "12px 14px",
                background: on ? "#F1F4FD" : "transparent",
                border: `1.5px solid ${on ? "#3B5BDB" : "transparent"}`,
                borderRadius: 10, cursor: "pointer", fontFamily: "var(--font-sans)",
                textAlign: "left", transition: "all 140ms ease-out",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: on ? "#213A8C" : "#7C87A4" }}>{k.label}</span>
                  <span style={{ padding: "1px 7px", borderRadius: 4, background: "#F4F7FB", color: "#5B6685", fontSize: 10, fontWeight: 600 }}>가중치 {k.weight}%</span>
                  {isChosen && (
                    <span style={{ padding: "1px 7px", borderRadius: 4, background: "#ECFAF1", color: "#2F9E5E", fontSize: 10, fontWeight: 700 }}>채택 ✓</span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: on ? 700 : 500, color: on ? "#0F1A36" : "#5B6685", lineHeight: 1.4 }}>{k.short}</div>
              </button>
            );
          })}
        </div>

        {/* Selected KR title */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "14px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ padding: "3px 10px", borderRadius: 999, background: "#F1F4FD", color: "#213A8C", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{krData.title.split("·")[0].trim()}</span>
          <span style={{ padding: "3px 10px", borderRadius: 999, background: krData.format === "수치" ? "#E5EBFB" : "#F0E9FB", color: krData.format === "수치" ? "#213A8C" : "#7C4DD9", fontSize: 11, fontWeight: 600 }}>{krData.format}형</span>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F1A36", flex: 1, lineHeight: 1.5 }}>
            {krData.title.split("·").slice(1).join("·").trim()}
          </div>
        </div>

        {/* 3 AI cards side-by-side */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 18 }}>
          {AI_VENDORS.map(v => (
            <AIReviewCard
              key={v.id}
              vendor={v}
              review={krData.reviews[v.id]}
              krNum={activeKR}
              isChosen={chosen[activeKR] === v.id}
              onChoose={() => setChosen({ ...chosen, [activeKR]: chosen[activeKR] === v.id ? null : v.id })}
            />
          ))}
        </div>

        {/* Merged synthesis card */}
        <div style={{ background: "linear-gradient(135deg, #1B2A4E, #2C3E68)", color: "#fff", borderRadius: 14, padding: "22px 26px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(63,193,209,0.22)", color: "#3FC1D1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚗️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>3개 AI 종합 의견 (합집합)</div>
              <div style={{ fontSize: 11.5, color: "#91A6F0", marginTop: 2 }}>{krData.title.split("·")[0].trim()} · 공통 / 차이 의견 정리</div>
            </div>
            <Button variant="ai" size="sm" leftIcon={<span>⚗️</span>}>합집합으로 자동 반영</Button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* 공통 */}
            <div style={{ padding: "14px 16px", background: "rgba(187, 233, 204, 0.08)", border: "1px solid rgba(187, 233, 204, 0.30)", borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#A3E5BD", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>✓ 3사 공통 의견</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: "#E5EBFB", lineHeight: 1.65 }}>
                {activeKR === "kr1" && <>
                  <li>측정 기준(p95)·도구(APM)·집계 주기가 명확</li>
                  <li>850→500ms는 도전적이면서 달성 가능한 수치</li>
                </>}
                {activeKR === "kr2" && <>
                  <li>회귀 장애 영역 100% 커버 — 근거 강력</li>
                  <li>Jest coverage 자동 수집으로 측정 가능</li>
                </>}
                {activeKR === "kr3" && <>
                  <li>마일스톤 자동화 시도 자체는 도전적이고 가치 있음</li>
                  <li>각 단계의 산출물·완료 기준 정의가 부족하다는 점에 3사 모두 동의</li>
                </>}
              </ul>
            </div>

            {/* 차이 */}
            <div style={{ padding: "14px 16px", background: "rgba(255, 195, 100, 0.08)", border: "1px solid rgba(255, 195, 100, 0.30)", borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FFC369", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>! AI별 차이 의견</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: "#E5EBFB", lineHeight: 1.65 }}>
                {activeKR === "kr1" && <>
                  <li><b style={{ color: "#FBD0AC" }}>Claude:</b> SRE 의존성에 주목 — 협업 계획 추가 권장</li>
                  <li><b style={{ color: "#A8DDCB" }}>GPT:</b> C/D 등급 변별력 부족 — 재조정 추천</li>
                  <li><b style={{ color: "#A4C2F4" }}>Gemini:</b> TPS·에러율 보조 지표 추가 권장</li>
                </>}
                {activeKR === "kr2" && <>
                  <li><b style={{ color: "#FBD0AC" }}>Claude:</b> Mutation testing으로 질적 검증 권장</li>
                  <li><b style={{ color: "#A8DDCB" }}>GPT:</b> 가장 높은 점수 — 추가 보완 불필요</li>
                  <li><b style={{ color: "#A4C2F4" }}>Gemini:</b> 기능 개발 일정과의 균형 명시 필요</li>
                </>}
                {activeKR === "kr3" && <>
                  <li><b style={{ color: "#FBD0AC" }}>Claude:</b> 1~4단계 구체 예시 제시</li>
                  <li><b style={{ color: "#A8DDCB" }}>GPT:</b> Definition of Done 작성 권장</li>
                  <li><b style={{ color: "#A4C2F4" }}>Gemini:</b> STEP 5로 복귀 권고 (가장 엄격)</li>
                </>}
              </ul>
            </div>
          </div>
        </div>

        {/* 하단 액션 */}
        <div style={{
          padding: "16px 22px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ fontSize: 12.5, color: "#5B6685" }}>
            <b style={{ color: "#0F1A36" }}>KR 3개 모두 의견을 채택</b>하시면 STEP 7에서 채택된 의견 기반으로 최종 수정할 수 있어요.
          </div>
          <div style={{ flex: 1 }}/>
          <Button variant="secondary">전체 합집합 자동 채택</Button>
          {activeKR !== "kr3" && (
            <Button variant="primary" onClick={() => setActiveKR(activeKR === "kr1" ? "kr2" : "kr3")}>
              다음 KR 검토 →
            </Button>
          )}
        </div>

        <WizardNav current={6}/>
      </div>
    </main>
  );
}

window.R1WriteStep6 = R1WriteStep6;
