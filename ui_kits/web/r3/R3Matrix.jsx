// R3Matrix.jsx — 표준 매트릭스 "도출" 워크플로우
// 2026년 OKR 첫 도입 → 표준이 아직 없음
// 인사담당자가 작성된 286개 KR에서 측정 지표를 추출하고,
// 동의어 통합 → 검증 → 표준 승인 → 다음 분기 배포하는 워크플로우

// ============ Data ============
// AI가 286개 KR에서 추출한 "후보" 지표들 (동의어 그룹화 전)
const DISCOVERED = [
  {
    id: "D001",
    canonical: "고객만족도",
    aliases: ["고객만족도", "고객 만족 점수", "CSAT", "Customer Satisfaction", "NPS 점수"],
    occurrences: 24, orgs: 8, uniqueWriters: 18,
    krSamples: [
      { kr: "고객만족도 82 → 88",                 base: "82", goal: "88",  member: "사업본부 SI",   year: "2026" },
      { kr: "고객 NPS 점수 +12점 향상 (72 → 84)", base: "72", goal: "84",  member: "고객본부 SM",   year: "2026" },
      { kr: "분기 고객만족도 평균 78 → 85",       base: "78", goal: "85",  member: "고객본부 SM",   year: "2026" },
      { kr: "CSAT 4.2 → 4.6",                     base: "4.2",goal: "4.6", member: "사업본부 PM",   year: "2026" },
    ],
    formulaCandidates: [
      { formula: "고객 설문 5점 척도 평균 × 20", votes: 12, source: "12명 작성" },
      { formula: "NPS = 추천 % - 비추천 %",       votes: 8,  source: "8명 작성" },
      { formula: "5점 척도 가중평균",              votes: 4,  source: "4명 작성" },
    ],
    suggestedUnit: "점",
    risks: ["통제불가 (외부 응답 의존)", "측정모호 (계산식 3종 혼재)"],
    aiSuggestion: "계산식이 3종 혼재해요. 본부별로 다른 표준을 쓰고 있어요. 통일 필요.",
    status: "discovery", // discovery → consolidation → validation → approved
    step: 1,
  },
  {
    id: "D002",
    canonical: "MTTR (평균 복구시간)",
    aliases: ["MTTR", "평균 복구시간", "복구 시간", "Mean Time To Recovery"],
    occurrences: 31, orgs: 6, uniqueWriters: 22,
    krSamples: [
      { kr: "MTTR 4시간 → 2시간",                base: "4h",   goal: "2h",  member: "운영본부 SE", year: "2026" },
      { kr: "P1 장애 MTTR 35분 → 15분 단축",     base: "35m",  goal: "15m", member: "운영본부 SE", year: "2026" },
      { kr: "결제 게이트웨이 MTTR 90분 이내 유지", base: "120m", goal: "90m", member: "DX본부 SE",   year: "2026" },
    ],
    formulaCandidates: [
      { formula: "SUM(복구시간) / 장애 건수", votes: 26, source: "26명 작성 · 84%" },
      { formula: "AVG(복구시간 분 단위)",     votes: 5,  source: "5명 작성" },
    ],
    suggestedUnit: "분 (표준화 필요)",
    risks: ["단위 혼재 (시간/분)"],
    aiSuggestion: "계산식 합의도 84% (높음). 단위만 '분'으로 통일하면 표준 승인 가능해요.",
    status: "consolidation",
    step: 2,
  },
  {
    id: "D003",
    canonical: "이직률",
    aliases: ["이직률", "조직 이탈률", "퇴사율", "Attrition Rate"],
    occurrences: 6, orgs: 2, uniqueWriters: 5,
    krSamples: [
      { kr: "이직률 8% → 5%",                base: "8%",  goal: "5%", member: "인사노무팀 PM",   year: "2026" },
      { kr: "조직 이탈률 12% → 7% 개선",     base: "12%", goal: "7%", member: "경영지원팀 PM",   year: "2026" },
    ],
    formulaCandidates: [
      { formula: "퇴사자수 / 평균 재직자수 × 100", votes: 6, source: "6명 작성 · 100%" },
    ],
    suggestedUnit: "%",
    risks: ["외부 노동시장 영향 — 통제 가능 범위 정의 필요"],
    aiSuggestion: "계산식 100% 합의. 외부 영향 주의 노트만 추가하면 표준 승인 가능해요.",
    status: "validation",
    step: 3,
  },
  {
    id: "D004",
    canonical: "교육 이수율",
    aliases: ["교육이수율", "교육 이수율", "필수교육 이수", "Training Completion"],
    occurrences: 9, orgs: 3, uniqueWriters: 8,
    krSamples: [
      { kr: "교육이수율 95%",                       base: "—",   goal: "95%",  member: "인사노무팀 PM", year: "2026" },
      { kr: "필수 교육 이수율 87% → 100%",         base: "87%", goal: "100%", member: "경영지원팀 PM", year: "2026" },
      { kr: "보안 교육 분기 이수율 80% 이상 유지", base: "65%", goal: "80%",  member: "운영본부 SE",   year: "2026" },
    ],
    formulaCandidates: [
      { formula: "이수자 / 대상자 × 100", votes: 9, source: "9명 작성 · 100%" },
    ],
    suggestedUnit: "%",
    risks: [],
    aiSuggestion: "전 분기 표준 승인 완료. 다음 분기부터 R1 작성 가이드에 자동 포함됩니다.",
    status: "approved",
    step: 4,
  },
  {
    id: "D005",
    canonical: "신규 회원수",
    aliases: ["신규 회원수", "신규 가입자", "신규 회원 확보", "신규 고객사"],
    occurrences: 18, orgs: 4, uniqueWriters: 14,
    krSamples: [
      { kr: "신규회원 1만 명 확보",            base: "0",     goal: "10,000", member: "사업본부 PM",   year: "2026" },
      { kr: "분기 신규 가입자 3,500 → 5,000명",base: "3,500", goal: "5,000",  member: "마케팅본부 PM", year: "2026" },
      { kr: "B2B 신규 고객사 12 → 20개사",     base: "12",    goal: "20",     member: "사업본부 PM",   year: "2026" },
    ],
    formulaCandidates: [
      { formula: "COUNT(신규가입) WHERE 기간",      votes: 11, source: "11명 작성" },
      { formula: "COUNT(가입사번 IS NULL → NOT NULL)", votes: 4, source: "4명 작성" },
      { formula: "신규 고객 수 (월말 스냅샷)",         votes: 3, source: "3명 작성" },
    ],
    suggestedUnit: "명",
    risks: ["건수형 — 질적 후속 지표(잔존율 등)와 함께 사용 권장"],
    aiSuggestion: "측정 시점이 본부마다 달라요. 회원 정의도 다름(개인/B2B). 정규화 필요.",
    status: "consolidation",
    step: 2,
  },
  {
    id: "D006",
    canonical: "APM p95 응답속도",
    aliases: ["APM p95", "p95 응답속도", "API p95", "응답시간 p95"],
    occurrences: 27, orgs: 6, uniqueWriters: 20,
    krSamples: [
      { kr: "결제 게이트웨이 APM p95 850ms → 500ms", base: "850", goal: "500", member: "운영본부 SE",  year: "2026" },
      { kr: "API p95 응답시간 1200ms → 800ms",       base: "1200",goal: "800", member: "개발본부 SE",  year: "2026" },
      { kr: "메인 페이지 p95 응답속도 < 600ms 유지",  base: "750", goal: "600", member: "프론트팀 SE",  year: "2026" },
    ],
    formulaCandidates: [
      { formula: "P95(response_time) · 월평균", votes: 23, source: "23명 작성 · 85%" },
      { formula: "P95(api_latency) · 일평균",   votes: 4,  source: "4명 작성" },
    ],
    suggestedUnit: "ms",
    risks: [],
    aiSuggestion: "계산식 합의도 85%. 집계 주기(월/일)만 합의하면 표준 승인 가능해요.",
    status: "validation",
    step: 3,
  },
];

const STAGES = [
  { id: 1, name: "발견",   icon: "🔍", color: "#7C4DD9", desc: "KR에서 측정 지표 추출" },
  { id: 2, name: "통합",   icon: "🔄", color: "#D98023", desc: "동의어·계산식 정규화" },
  { id: 3, name: "검증",   icon: "🛡️", color: "#3B5BDB", desc: "위험 검토·임계값 확정" },
  { id: 4, name: "승인",   icon: "✓",  color: "#2F9E5E", desc: "표준 라이브러리 등록" },
];

// ============ Atoms ============
function StatusChip({ stage, size = "sm" }) {
  const s = STAGES.find(x => x.id === stage);
  return (
    <span style={{
      padding: size === "sm" ? "3px 9px" : "5px 12px",
      borderRadius: 999,
      background: `${s.color}15`, color: s.color,
      fontSize: size === "sm" ? 10.5 : 12, fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span>{s.icon}</span> {s.name}
    </span>
  );
}

// ============ Funnel header (4 stages with counts) ============
function StageFunnel({ counts, activeStage, onStageClick }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "22px 26px", marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>표준 도출 파이프라인 · 4단계</div>
          <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 3 }}>2026년 첫 도입 · AI가 286개 KR에서 측정 지표를 추출하여 표준 후보를 구성했어요. 인사담당자가 단계별로 승인합니다.</div>
        </div>
        <div style={{ flex: 1 }}/>
        <a href="#" style={{ fontSize: 12, color: "#3B5BDB", textDecoration: "none", fontWeight: 600 }}>플라이휠 보기 →</a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {STAGES.map((s, i) => {
          const isActive = activeStage === s.id || activeStage === "all";
          const c = counts[s.id] || 0;
          return (
            <div key={s.id} onClick={() => onStageClick(s.id)} style={{
              padding: "18px 18px",
              background: isActive ? "#fff" : "#F9FAFC",
              border: `2px solid ${activeStage === s.id ? s.color : isActive ? `${s.color}33` : "#E1E5EF"}`,
              borderRadius: 12, cursor: "pointer",
              transition: "all 180ms",
              position: "relative",
              opacity: isActive ? 1 : 0.55,
            }}>
              {/* Top: number + icon */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: `${s.color}15`, color: s.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}>{s.icon}</div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#7C87A4", letterSpacing: "0.06em", fontWeight: 700 }}>STAGE {s.id}</span>
              </div>
              {/* Stage name */}
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 4, letterSpacing: "-0.01em" }}>{s.name}</div>
              <div style={{ fontSize: 11, color: "#7C87A4", marginBottom: 12, lineHeight: 1.45 }}>{s.desc}</div>
              {/* Count */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: s.color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{c}</span>
                <span style={{ fontSize: 12, color: "#7C87A4" }}>건</span>
              </div>
              {/* Arrow to next */}
              {i < STAGES.length - 1 && (
                <div style={{
                  position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)",
                  color: "#C8CFDF", fontSize: 18, zIndex: 1,
                }}>→</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ Discovery Card (each candidate) ============
function CandidateCard({ candidate, expanded, onToggle }) {
  const stage = STAGES.find(s => s.id === candidate.step);
  const totalVotes = candidate.formulaCandidates.reduce((sum, f) => sum + f.votes, 0);
  const topFormula = candidate.formulaCandidates[0];
  const consensus = Math.round((topFormula.votes / totalVotes) * 100);

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${expanded ? stage.color : "#E1E5EF"}`,
      borderRadius: 13, overflow: "hidden",
      boxShadow: expanded ? `0 10px 24px -8px ${stage.color}33` : "0 1px 2px rgba(31,42,74,.04)",
      transition: "all 220ms cubic-bezier(0.16, 1, 0.3, 1)",
      borderLeft: `4px solid ${stage.color}`,
    }}>
      {/* Header */}
      <div onClick={onToggle} style={{
        display: "grid",
        gridTemplateColumns: "44px 1fr 220px 110px 90px 90px 32px",
        gap: 14, alignItems: "center",
        padding: "16px 20px 16px 18px",
        cursor: "pointer",
        background: expanded ? "#FAFBFE" : "#fff",
      }}>
        {/* ID */}
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "#7C87A4", fontWeight: 700,
          padding: "4px 8px", background: "#F4F7FB", borderRadius: 6, textAlign: "center",
        }}>{candidate.id}</div>

        {/* Canonical name + aliases */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>{candidate.canonical}</span>
            {candidate.aliases.length > 1 && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, padding: "2px 7px", background: "#F0E9FB", color: "#7C4DD9", borderRadius: 5, fontWeight: 700 }}>
                동의어 {candidate.aliases.length}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#7C87A4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {candidate.aliases.slice(0, 4).join(" · ")}{candidate.aliases.length > 4 ? ` · +${candidate.aliases.length - 4}` : ""}
          </div>
        </div>

        {/* Top formula + consensus */}
        <div style={{ minWidth: 0 }}>
          <div style={{
            padding: "6px 10px",
            background: candidate.formulaCandidates.length > 1 ? "#FFF7EC" : "#ECFAF1",
            border: `1px solid ${candidate.formulaCandidates.length > 1 ? "#FFE0BA" : "#BBE9CC"}`,
            borderRadius: 7,
            fontFamily: "var(--font-mono)", fontSize: 10.5,
            color: candidate.formulaCandidates.length > 1 ? "#7A4A14" : "#1F5C3A",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            fontWeight: 600,
          }}>{topFormula.formula}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: 10.5 }}>
            <span style={{ color: "#7C87A4" }}>합의도</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: consensus >= 80 ? "#2F9E5E" : consensus >= 60 ? "#D98023" : "#D14343" }}>{consensus}%</span>
            {candidate.formulaCandidates.length > 1 && (
              <span style={{ color: "#D98023", fontSize: 10 }}>· 계산식 {candidate.formulaCandidates.length}종</span>
            )}
          </div>
        </div>

        {/* Occurrences */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "#0F1A36", fontVariantNumeric: "tabular-nums" }}>{candidate.occurrences}</div>
          <div style={{ fontSize: 10, color: "#7C87A4", marginTop: 1 }}>KR 등장</div>
        </div>

        {/* Orgs */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "#0F1A36", fontVariantNumeric: "tabular-nums" }}>{candidate.orgs}</div>
          <div style={{ fontSize: 10, color: "#7C87A4", marginTop: 1 }}>본부 사용</div>
        </div>

        {/* Status */}
        <div>
          <StatusChip stage={candidate.step}/>
        </div>

        {/* Chevron */}
        <span style={{
          width: 26, height: 26, borderRadius: 7,
          background: "#F9FAFC", border: "1px solid #E1E5EF",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 220ms",
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          <Icon name="chevronDown" size={12} style={{ color: "#5B6685" }}/>
        </span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ padding: "0 22px 22px", borderTop: "1px solid #ECEFF5" }}>

          {/* AI suggestion */}
          <div style={{
            marginTop: 16, padding: "12px 16px",
            background: "linear-gradient(135deg, #F1F4FD, #fff)",
            border: "1px solid #C5D0F7", borderRadius: 10,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>✨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4, fontFamily: "var(--font-mono)" }}>AI 진단</div>
              <div style={{ fontSize: 12.5, color: "#1B2A4E", lineHeight: 1.6 }}>{candidate.aiSuggestion}</div>
            </div>
          </div>

          {/* 2 columns: 동의어 통합 + 계산식 후보 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>

            {/* Aliases consolidation */}
            <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#7C4DD9", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>▸ 동의어 통합</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#7C87A4" }}>{candidate.aliases.length}개 → 1개</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {candidate.aliases.map((a, i) => {
                  const isCanonical = a === candidate.canonical;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 11px",
                      background: isCanonical ? "#F0E9FB" : "#F9FAFC",
                      border: `1px solid ${isCanonical ? "#7C4DD9" : "#ECEFF5"}`,
                      borderRadius: 7,
                    }}>
                      <input type="radio" name={`canon-${candidate.id}`} defaultChecked={isCanonical} style={{ accentColor: "#7C4DD9", margin: 0 }}/>
                      <span style={{ fontSize: 12, fontWeight: isCanonical ? 700 : 500, color: isCanonical ? "#5D38B0" : "#3A4565", flex: 1 }}>{a}</span>
                      {isCanonical && <span style={{ fontSize: 10, color: "#7C4DD9", fontWeight: 700, fontFamily: "var(--font-mono)" }}>대표명</span>}
                    </div>
                  );
                })}
              </div>
              <button style={{
                width: "100%", marginTop: 10,
                padding: "7px 12px",
                background: "transparent", border: "1px dashed #C8CFDF",
                borderRadius: 7, color: "#5B6685",
                fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)",
              }}>+ 새 동의어 추가</button>
            </div>

            {/* Formula candidates */}
            <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#D98023", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>▸ 계산식 후보</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#7C87A4" }}>가장 많이 쓰인 식 선택</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {candidate.formulaCandidates.map((f, i) => {
                  const pct = Math.round((f.votes / totalVotes) * 100);
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 11px",
                      background: i === 0 ? "#FFF7EC" : "#F9FAFC",
                      border: `1px solid ${i === 0 ? "#FFE0BA" : "#ECEFF5"}`,
                      borderRadius: 7,
                    }}>
                      <input type="radio" name={`formula-${candidate.id}`} defaultChecked={i === 0} style={{ accentColor: "#D98023", margin: 0 }}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#1F2A4A", fontWeight: 600 }}>{f.formula}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <div style={{ flex: 1, height: 4, background: "#F4F7FB", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: i === 0 ? "#D98023" : "#A4ADC4", borderRadius: 2 }}/>
                          </div>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: i === 0 ? "#D98023" : "#7C87A4", fontWeight: 700, minWidth: 36, textAlign: "right" }}>{pct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* KR samples */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>▸ 실제 KR 예시 · {candidate.krSamples.length}건</span>
              <div style={{ flex: 1 }}/>
              <span style={{ fontSize: 10.5, color: "#7C87A4" }}>2026년 작성된 KR에서 추출</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {candidate.krSamples.map((s, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 110px 90px 110px 60px",
                  gap: 12, alignItems: "center",
                  padding: "10px 14px",
                  background: "#fff", border: "1px solid #E1E5EF", borderRadius: 8,
                }}>
                  <div style={{ fontSize: 12.5, color: "#0F1A36", lineHeight: 1.45, fontStyle: "italic" }}>"{s.kr}"</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#7C87A4" }}>baseline</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#D98023", fontWeight: 700 }}>{s.base}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: "#A4ADC4", fontSize: 10 }}>→</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#2F9E5E", fontWeight: 700 }}>{s.goal}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "#5B6685", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.member}</div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#7C87A4", textAlign: "right" }}>{s.year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risks */}
          {candidate.risks.length > 0 && (
            <div style={{
              marginTop: 14, padding: "10px 14px",
              background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 9,
              display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#7A4A14",
            }}>
              <span style={{ fontSize: 14 }}>⚠️</span>
              <span style={{ flex: 1 }}><b>승인 전 주의:</b> {candidate.risks.join(" · ")}</span>
            </div>
          )}

          {/* Action footer */}
          <div style={{ display: "flex", gap: 10, marginTop: 18, paddingTop: 14, borderTop: "1px dashed #E1E5EF", alignItems: "center" }}>
            <span style={{ fontSize: 11.5, color: "#7C87A4" }}>
              현재 단계: <StatusChip stage={candidate.step}/>
            </span>
            <div style={{ flex: 1 }}/>
            <Button variant="danger" size="sm" leftIcon={<Icon name="x" size={12}/>}>비권장 처리</Button>
            <Button variant="secondary" size="sm" leftIcon={<Icon name="refresh" size={12}/>}>이전 단계로</Button>
            {candidate.step < 4 ? (
              <Button variant="primary" size="sm" rightIcon={<Icon name="chevronRight" size={13}/>}>
                {candidate.step === 1 ? "통합 단계로" : candidate.step === 2 ? "검증 단계로" : "표준 승인"}
              </Button>
            ) : (
              <Button variant="success" size="sm" leftIcon={<Icon name="check" size={12}/>}>표준 승인됨 · R1 가이드 노출</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MAIN ============
function R3Matrix() {
  const [activeStage, setActiveStage] = React.useState("all");
  const [expandedId, setExpandedId] = React.useState("D001"); // 고객만족도 펼침

  const filtered = activeStage === "all" ? DISCOVERED : DISCOVERED.filter(d => d.step === activeStage);
  const stageCounts = STAGES.reduce((acc, s) => ({ ...acc, [s.id]: DISCOVERED.filter(d => d.step === s.id).length }), {});
  const totalKRs = 286;
  const extractedKRs = DISCOVERED.reduce((sum, d) => sum + d.occurrences, 0);

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="표준 매트릭스 도출" subtitle={`2026 첫 도입 · ${totalKRs}개 KR에서 ${DISCOVERED.length}개 후보 추출`}/>
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px 56px" }}>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.06em" }}>STEP 04 / 06</span>
          <div style={{ flex: 1, height: 2, background: "#E1E5EF", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: "66%", height: "100%", background: "#E07A3C" }}/>
          </div>
          <a href="./r3-hr.html" style={{ fontSize: 12, color: "#3B5BDB", textDecoration: "none", fontWeight: 600 }}>다음: 캘리브레이션 인사이트 →</a>
        </div>

        {/* Hero */}
        <div style={{
          background: "linear-gradient(135deg, #1B2A4E, #2C3E68)", color: "#fff",
          borderRadius: 14, padding: "24px 28px", marginBottom: 22,
          display: "flex", alignItems: "center", gap: 22,
        }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.1)", color: "#F4C9A8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🧬</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#F4C9A8", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 6 }}>2026 첫 도입 · 표준이 아직 없습니다</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25 }}>데이터에서 우리 회사의 표준을 도출합니다</div>
            <div style={{ fontSize: 13, color: "#91A6F0", marginTop: 8, lineHeight: 1.65, maxWidth: 720 }}>
              AI가 2026 상반기 작성된 286개 KR을 분석해서 동의어를 그룹화하고 계산식을 통계 냈어요.
              인사담당자가 4단계로 검토·승인하면, 다음 평가 분기부터 R1·R2 화면에 표준으로 자동 반영됩니다.
            </div>
          </div>
          <div style={{ textAlign: "right", paddingLeft: 22, borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#91A6F0", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 6 }}>분석 대상</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{totalKRs}</div>
            <div style={{ fontSize: 11, color: "#91A6F0", marginTop: 4 }}>2026 상반기 KR</div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "12px 0 10px" }}/>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "#A3E5BD" }}>{extractedKRs}</div>
            <div style={{ fontSize: 11, color: "#91A6F0", marginTop: 2 }}>{Math.round(extractedKRs / totalKRs * 100)}% 추출 완료</div>
          </div>
        </div>

        {/* Stage Funnel */}
        <StageFunnel counts={stageCounts} activeStage={activeStage} onStageClick={(s) => setActiveStage(activeStage === s ? "all" : s)}/>

        {/* Filter bar */}
        <div style={{
          background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12,
          padding: "12px 18px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
            <Icon name="search" size={14} style={{ position: "absolute", left: 12, top: 10, color: "#A4ADC4" }}/>
            <input placeholder="후보 지표명 · 동의어 검색" style={{
              width: "100%", padding: "9px 12px 9px 34px",
              background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 8,
              fontSize: 12.5, color: "#0F1A36", outline: "none",
            }}/>
          </div>

          <div style={{ display: "inline-flex", background: "#F4F7FB", borderRadius: 9, padding: 3, gap: 2 }}>
            <button onClick={() => setActiveStage("all")} style={{
              background: activeStage === "all" ? "#fff" : "transparent",
              color: activeStage === "all" ? "#0F1A36" : "#5B6685",
              fontWeight: activeStage === "all" ? 700 : 500,
              border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, cursor: "pointer",
              boxShadow: activeStage === "all" ? "0 1px 2px rgba(31,42,74,.06)" : "none", fontFamily: "var(--font-sans)",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              전체 <span style={{ fontFamily: "var(--font-mono)", color: "#7C87A4", fontSize: 10.5 }}>{DISCOVERED.length}</span>
            </button>
            {STAGES.map((s) => {
              const on = activeStage === s.id;
              return (
                <button key={s.id} onClick={() => setActiveStage(s.id)} style={{
                  background: on ? "#fff" : "transparent",
                  color: on ? s.color : "#5B6685",
                  fontWeight: on ? 700 : 500,
                  border: "none", borderRadius: 7, padding: "7px 12px", fontSize: 12, cursor: "pointer",
                  boxShadow: on ? "0 1px 2px rgba(31,42,74,.06)" : "none", fontFamily: "var(--font-sans)",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span>{s.icon}</span> {s.name} <span style={{ fontFamily: "var(--font-mono)", color: "#7C87A4", fontSize: 10.5 }}>{stageCounts[s.id]}</span>
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1 }}/>
          <Button variant="ai" size="sm" leftIcon={<span>✨</span>}>AI 재분석 실행</Button>
          <Button variant="secondary" size="sm" leftIcon={<span>📥</span>}>표준 후보 Excel</Button>
          <Button variant="primary" size="sm" leftIcon={<Icon name="plus" size={13}/>}>수동 후보 추가</Button>
        </div>

        {/* Column header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "44px 1fr 220px 110px 90px 90px 32px",
          gap: 14, alignItems: "center",
          padding: "10px 22px 10px",
          fontSize: 10.5, fontWeight: 700, color: "#7C87A4",
          letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-mono)",
        }}>
          <div style={{ textAlign: "center" }}>ID</div>
          <div>후보 지표 (대표명 · 동의어)</div>
          <div>최다 계산식 · 합의도</div>
          <div style={{ textAlign: "center" }}>KR 등장</div>
          <div style={{ textAlign: "center" }}>본부 사용</div>
          <div>단계</div>
          <div></div>
        </div>

        {/* Candidate list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((d) => (
            <CandidateCard
              key={d.id} candidate={d}
              expanded={expandedId === d.id}
              onToggle={() => setExpandedId(expandedId === d.id ? null : d.id)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{
            padding: "60px 20px", textAlign: "center",
            background: "#fff", border: "1px dashed #C8CFDF", borderRadius: 14,
            color: "#7C87A4", fontSize: 13,
          }}>
            🔍 이 단계의 후보가 없어요.
          </div>
        )}

        {/* Footer note */}
        <div style={{
          marginTop: 22, padding: "18px 22px",
          background: "linear-gradient(135deg, #F1F4FD, #fff)",
          border: "1px solid #C5D0F7", borderRadius: 14,
          display: "flex", gap: 16, alignItems: "flex-start",
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>📅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1B2A4E", marginBottom: 6 }}>표준 도출 일정</div>
            <div style={{ fontSize: 12.5, color: "#3A4565", lineHeight: 1.7 }}>
              · <b>2026 상반기 (~7월):</b> AI가 KR에서 지표 추출 (지금 단계)<br/>
              · <b>2026 8~9월:</b> 인사담당자가 4단계 검토·승인 (목표: 표준 30개 확정)<br/>
              · <b>2026 4분기:</b> 다음 평가 분기 R1 작성 가이드에 표준 라이브러리 자동 반영<br/>
              · <b>2027 상반기:</b> 표준 사용률 70% 이상 목표 · 추가 후보 발견 → 매트릭스 v2
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

window.R3Matrix = R3Matrix;
