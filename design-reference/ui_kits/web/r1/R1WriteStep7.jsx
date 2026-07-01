// STEP 7 — 최종 수정 + 제출 (인라인 편집 + 채택된 AI 의견 반영)
// 명세 1-6, 1-7: "완성된 지표에 대한 사용자의 최종 수정" → "피평가자 지표 제출"

function EditableField({ value, onChange, multiline, mono, fontSize, fontWeight, color }) {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(value);

  React.useEffect(() => { setVal(value); }, [value]);

  if (editing) {
    const Comp = multiline ? "textarea" : "input";
    return (
      <Comp
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => { setEditing(false); onChange && onChange(val); }}
        onKeyDown={(e) => { if (!multiline && e.key === "Enter") { setEditing(false); onChange && onChange(val); } }}
        rows={multiline ? 2 : undefined}
        style={{
          width: "100%",
          padding: "8px 11px",
          fontSize: fontSize || 13,
          fontWeight: fontWeight || 500,
          color: color || "#0F1A36",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
          background: "#fff",
          border: "1.5px solid #3B5BDB",
          borderRadius: 8,
          outline: "none",
          resize: multiline ? "vertical" : "none",
          lineHeight: 1.5,
          boxShadow: "0 0 0 4px rgba(59,91,219,.12)",
        }}
      />
    );
  }
  return (
    <div onClick={() => setEditing(true)} style={{
      padding: "8px 11px",
      fontSize: fontSize || 13,
      fontWeight: fontWeight || 500,
      color: color || "#0F1A36",
      fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
      background: "#F9FAFC",
      border: "1px dashed #D5DDF0",
      borderRadius: 8,
      cursor: "text",
      lineHeight: 1.5,
      display: "flex", alignItems: "center", gap: 6,
      transition: "all 140ms ease-out",
      minHeight: 36,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#F1F4FD";
      e.currentTarget.style.borderColor = "#C5D0F7";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "#F9FAFC";
      e.currentTarget.style.borderColor = "#D5DDF0";
    }}>
      <span style={{ flex: 1 }}>{val}</span>
      <span style={{ fontSize: 11, color: "#A4ADC4", flexShrink: 0 }}>✏️</span>
    </div>
  );
}

function AIChipBadge({ vendor }) {
  const v = {
    claude: { c: "#D97757", bg: "#FBF0E9", short: "Claude", ico: "🌀" },
    gpt: { c: "#10A37F", bg: "#E6F5F0", short: "GPT", ico: "✦" },
    gemini: { c: "#4285F4", bg: "#E8F0FE", short: "Gemini", ico: "✧" },
  }[vendor];
  if (!v) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 999,
      background: v.bg, color: v.c, border: `1px solid ${v.c}30`,
      fontSize: 10, fontWeight: 700,
    }}>
      <span>{v.ico}</span> {v.short} 채택
    </span>
  );
}

function FinalKRCard({ num, format, formatBg, formatFg, weight, kr, objective, measure, baseline, goal, sGrade, aGrade, bGrade, cGrade, dGrade, chosenAI, aiSuggestion, onUpdate }) {
  const [expanded, setExpanded] = React.useState(num === 1);
  const [appliedAI, setAppliedAI] = React.useState(false);

  return (
    <div style={{
      background: "#fff",
      border: `${expanded ? 1.5 : 1}px solid ${expanded ? "#3B5BDB" : "#E1E5EF"}`,
      borderRadius: 14,
      boxShadow: expanded ? "0 0 0 4px rgba(59,91,219,.08)" : "0 1px 2px rgba(31,42,74,.04)",
      transition: "all 220ms ease-out",
    }}>
      {/* Header */}
      <div onClick={() => setExpanded(!expanded)} style={{
        padding: "16px 22px",
        display: "flex", alignItems: "center", gap: 10,
        cursor: "pointer",
        borderBottom: expanded ? "1px solid #ECEFF5" : "none",
      }}>
        <span style={{ padding: "3px 10px", borderRadius: 999, background: "#F1F4FD", color: "#213A8C", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)" }}>KR {num.toString().padStart(2, "0")}</span>
        <span style={{ padding: "3px 10px", borderRadius: 999, background: formatBg, color: formatFg, fontSize: 11, fontWeight: 600 }}>{format}</span>
        {chosenAI && <AIChipBadge vendor={chosenAI}/>}
        {!chosenAI && (
          <span style={{ padding: "3px 10px", borderRadius: 999, background: "#FFF7EC", color: "#D98023", fontSize: 11, fontWeight: 600 }}>
            ! AI 의견 미채택
          </span>
        )}
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#7C87A4", fontWeight: 600 }}>가중치 {weight}%</span>
        <span style={{ fontSize: 18, color: "#A4ADC4", transform: expanded ? "rotate(90deg)" : "none", transition: "transform 220ms" }}>›</span>
      </div>

      {!expanded && (
        <div style={{ padding: "0 22px 16px", fontSize: 14, color: "#1F2A4A", lineHeight: 1.55, fontWeight: 500 }}>
          {kr}
        </div>
      )}

      {expanded && (
        <div style={{ padding: "18px 22px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* AI 채택 의견 알림 */}
          {chosenAI && aiSuggestion && !appliedAI && (
            <div style={{
              padding: "14px 16px",
              background: "linear-gradient(135deg, #F1F4FD, #fff 70%)",
              border: "1px solid #C5D0F7",
              borderRadius: 11,
              display: "flex", alignItems: "flex-start", gap: 11,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>✨</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#213A8C" }}>STEP 6에서 채택한 AI 의견</span>
                  <AIChipBadge vendor={chosenAI}/>
                </div>
                <div style={{ fontSize: 12.5, color: "#1F2A4A", lineHeight: 1.6 }}>{aiSuggestion}</div>
              </div>
              <Button variant="primary" size="sm" onClick={() => setAppliedAI(true)}>의견 반영</Button>
            </div>
          )}

          {appliedAI && (
            <div style={{
              padding: "10px 14px",
              background: "#ECFAF1", border: "1px solid #BBE9CC", borderRadius: 9,
              display: "flex", alignItems: "center", gap: 9,
              fontSize: 12, color: "#1F5538",
            }}>
              <span>✓</span> <b>AI 의견이 반영되었어요.</b> 아래 필드에서 추가로 미세 조정할 수 있어요.
            </div>
          )}

          {/* Objective */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
              Objective · 핵심 목표
            </label>
            <EditableField value={objective} fontSize={13} fontWeight={500} color="#3A4565"/>
          </div>

          {/* KR 문장 */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
              KR 문장 · 클릭해서 수정
            </label>
            <EditableField value={kr} fontSize={14.5} fontWeight={600} color="#0F1A36" multiline/>
          </div>

          {/* 측정 + Baseline + Goal */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>측정 방법</label>
              <EditableField value={measure} fontSize={12.5}/>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Baseline</label>
              <EditableField value={baseline} fontSize={13} mono/>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Goal</label>
              <EditableField value={goal} fontSize={13} mono color="#3B5BDB" fontWeight={700}/>
            </div>
          </div>

          {/* S/A/B/C/D 등급 */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>S / A / B / C / D 등급 기준</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                { g: "S", color: "#6B47E0", v: sGrade },
                { g: "A", color: "#3B5BDB", v: aGrade },
                { g: "B", color: "#2F9E5E", v: bGrade },
                { g: "C", color: "#D98023", v: cGrade },
                { g: "D", color: "#7C87A4", v: dGrade },
              ].map(({ g, color, v }) => (
                <div key={g} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: color, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700,
                    flexShrink: 0,
                  }}>{g}</div>
                  <div style={{ flex: 1 }}>
                    <EditableField value={v} fontSize={12.5}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function R1WriteStep7() {
  const krs = [
    {
      num: 1, format: "수치형", formatBg: "#E5EBFB", formatFg: "#213A8C", weight: 30,
      objective: "핵심 서비스 응답속도 개선",
      kr: "결제 게이트웨이 APM p95 응답속도(월평균)를 850ms → 500ms로 단축",
      measure: "APM Datadog · 월평균", baseline: "850ms", goal: "500ms",
      sGrade: "≤400ms — 목표 초과 20%, 캐시 추가 도입 완료",
      aGrade: "≤500ms — 목표 달성 (월평균 기준)",
      bGrade: "500~650ms — 목표의 70-99% 달성",
      cGrade: "650~800ms — 목표의 50-70% 달성, 개선 추세 확인",
      dGrade: "≥800ms — 개선 없음 (baseline 수준)",
      chosenAI: "claude",
      aiSuggestion: "S등급은 400ms로 두되, 캐시 추가 도입 마일스톤도 함께 적기를 추천해요.",
    },
    {
      num: 2, format: "수치형", formatBg: "#E5EBFB", formatFg: "#213A8C", weight: 25,
      objective: "결제 인증 모듈 안정화",
      kr: "결제 인증모듈 단위테스트 커버리지를 65% → 85%로 향상 (회귀 장애 영역 100% 커버)",
      measure: "Jest coverage report", baseline: "65%", goal: "85%",
      sGrade: "≥90% — Mutation testing 도입 완료",
      aGrade: "≥85% — 회귀 장애 영역 100% 커버",
      bGrade: "75~84% — 주요 영역 커버",
      cGrade: "65~74% — baseline 유지",
      dGrade: "<65% — baseline 이하 회귀",
      chosenAI: "gpt",
      aiSuggestion: "추가 보완 없음. 이대로 진행해도 충분합니다.",
    },
    {
      num: 3, format: "마일스톤", formatBg: "#F0E9FB", formatFg: "#7C4DD9", weight: 20,
      objective: "운영 자동화",
      kr: "장애 알림 룰 자동화 4단계 중 3단계까지 완료",
      measure: "단계별 산출물 PR 검증", baseline: "1/4", goal: "3/4",
      sGrade: "4/4 단계 완료 — onCall 자동화까지 운영 전환",
      aGrade: "3/4 단계 완료 — 노이즈 필터링까지",
      bGrade: "2/4 단계 완료 — 알림 채널 통합까지",
      cGrade: "1/4 단계 완료 — 룰 정의까지",
      dGrade: "0/4 — 진척 없음",
      chosenAI: null,
      aiSuggestion: null,
    },
  ];

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="OKR 작성" subtitle="STEP 7 / 7 · 최종 수정 + 제출"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 40px 32px" }}>

        <WizardBreadcrumb stepLabel="STEP 7 · 최종 수정·제출"/>
        <WizardStepHeader current={7}/>

        <WizardHero
          stepNum={7}
          title="채택된 AI 의견을 반영하고, 마지막으로 손볼게요"
          desc="STEP 6에서 채택한 의견이 KR별로 표시돼요. 한 번 클릭으로 반영하거나 직접 인라인 편집해도 좋아요. 검토가 끝나면 평가자에게 제출합니다."
          badge="마지막 단계"
          showAIHelp={false}
        />

        {/* Top stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
          {[
            { ico: "⚙️", bg: "#E5EBFB", fg: "#3B5BDB", label: "OKR 유형", val: "운영 70%", sub: "+ 전략 30%" },
            { ico: "📊", bg: "#F1F4FD", fg: "#213A8C", label: "KR 개수", val: "3개", sub: "가중치 합 75/110" },
            { ico: "✨", bg: "#F5EFFD", fg: "#7C4DD9", label: "AI 채택", val: "2 / 3", sub: "KR 03은 미채택" },
            { ico: "✓",  bg: "#ECFAF1", fg: "#2F9E5E", label: "AI 평균 점수", val: "7.7 / 10", sub: "Strong / Good 위주" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: s.bg, color: s.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{s.ico}</div>
                <div style={{ fontSize: 12, color: "#5B6685", fontWeight: 500 }}>{s.label}</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#0F1A36", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", lineHeight: 1.1, fontFamily: "var(--font-mono)" }}>{s.val}</div>
              <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Editable KR list */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>📋 KR 최종 검토 · 인라인 편집</div>
            <span style={{ fontSize: 11.5, color: "#7C87A4" }}>(점선 박스를 클릭하면 바로 수정할 수 있어요)</span>
            <div style={{ flex: 1 }}/>
            <Button variant="secondary" size="sm" leftIcon={<span>⚗️</span>}>AI 의견 모두 반영</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {krs.map((kr, i) => <FinalKRCard key={i} {...kr}/>)}
          </div>
        </div>

        {/* KR 03 미채택 알림 */}
        <div style={{
          padding: "14px 18px",
          background: "linear-gradient(135deg, #FFF7EC, #fff 70%)",
          border: "1px solid #FFE0BA",
          borderRadius: 12,
          display: "flex", alignItems: "flex-start", gap: 11,
          marginBottom: 22,
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#7A4A14", marginBottom: 4 }}>KR 03 — AI 의견을 아직 채택하지 않으셨어요</div>
            <div style={{ fontSize: 12, color: "#7A4A14", lineHeight: 1.6 }}>
              3개 AI 모두 "각 단계의 산출물·완료 기준 정의 부족"으로 보완 권장했어요. STEP 6으로 돌아가서 의견을 채택하시거나, 위 카드에서 직접 단계별 정의를 보완해주세요.
            </div>
          </div>
          <a href="./r1-write-step6.html" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm">STEP 6으로 →</Button>
          </a>
        </div>

        {/* Submit panel */}
        <div style={{ background: "linear-gradient(135deg, #1B2A4E, #2C3E68)", color: "#fff", borderRadius: 14, padding: "26px 28px" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(145,166,240,0.22)", color: "#C5D0F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📥</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: "-0.015em" }}>정태영 팀장에게 제출하시겠어요?</div>
              <div style={{ fontSize: 13, color: "#A4ADC4", lineHeight: 1.55 }}>
                제출 후에도 팀장이 조정 요청 시 수정할 수 있어요. AI 의견을 채택하지 않은 KR 03은 팀장 코칭 시 함께 정제하실 수 있습니다.
              </div>
            </div>
          </div>

          {/* Submission destination */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}>
            {[
              { l: "결재 라인", v: "정태영 팀장", sub: "운영본부 · 결제플랫폼팀" },
              { l: "제출 후 상태", v: "검토 대기", sub: "평균 검토 시간 2-3일" },
              { l: "재상신 가능", v: "예", sub: "반려/조정요청 시" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.06)", borderRadius: 10 }}>
                <div style={{ fontSize: 10.5, color: "#91A6F0", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 4 }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "#A4ADC4", marginTop: 3 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Confirm checkboxes */}
          <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.06)", borderRadius: 10, marginBottom: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>✓</div>
              <div style={{ fontSize: 12.5, color: "#E5EBFB", lineHeight: 1.5 }}>
                3개 AI 검토 결과를 확인했으며, 채택한 의견을 반영했습니다.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>✓</div>
              <div style={{ fontSize: 12.5, color: "#E5EBFB", lineHeight: 1.5 }}>
                KR 03(미채택)은 팀장 코칭 시 함께 정제할 예정임을 인지했습니다.
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <a href="./r1-write-step6.html" style={{ textDecoration: "none", flex: 1 }}>
              <button style={{
                width: "100%",
                background: "rgba(255,255,255,0.10)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 11, padding: "14px",
                fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)",
              }}>← AI 비교로 돌아가기</button>
            </a>
            <button style={{
              flex: 1,
              background: "rgba(255,255,255,0.10)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 11, padding: "14px",
              fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>📥 임시 저장만 하기</button>
            <a href="./r1-employee.html" style={{ textDecoration: "none", flex: 1.5 }}>
              <button style={{
                width: "100%",
                background: "#fff", color: "#1B2A4E",
                border: "none", borderRadius: 11, padding: "14px",
                fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)",
                boxShadow: "0 6px 16px -2px rgba(0,0,0,.25)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              }}>
                📤 정태영 팀장에게 제출하기 →
              </button>
            </a>
          </div>
        </div>

        {/* Helper */}
        <div style={{ marginTop: 16, padding: "14px 18px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#5B6685", lineHeight: 1.55 }}>
          <span style={{ fontSize: 16 }}>💡</span>
          AI 의견은 참고용 신호예요. 의견을 모두 채택할 필요 없고, 본인의 판단을 가장 우선시해주세요. 평가자가 함께 정제하는 출발점으로 활용해주세요.
        </div>
      </div>
    </main>
  );
}

window.R1WriteStep7 = R1WriteStep7;
