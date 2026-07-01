// STEP 5 — 대화형 상세 수립 (단순화: 측정 방법 + 등급 기준만)
// 핵심: 각 KR마다 (1) 측정 방법, (2) S/A/B/C/D 등급 기준 정의

function GradeRow({ grade, color, defaultValue, isTarget }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "56px 1fr",
      gap: 14, alignItems: "center",
      padding: "12px 14px",
      background: isTarget ? `${color}06` : "#fff",
      border: `1px solid ${isTarget ? color : "#ECEFF5"}`,
      borderLeft: `4px solid ${color}`,
      borderRadius: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 700 }}>{grade}</div>
      </div>
      <div>
        <input
          defaultValue={defaultValue}
          placeholder={`${grade}등급 달성 기준을 입력해주세요`}
          style={{
            width: "100%", padding: "9px 13px",
            background: isTarget ? "#fff" : "#F9FAFC",
            border: "1px solid #E1E5EF", borderRadius: 8,
            fontSize: 13, color: "#1F2A4A", fontFamily: "var(--font-sans)",
            outline: "none",
            transition: "all 140ms ease-out",
          }}
        />
        {isTarget && (
          <div style={{ fontSize: 10.5, color, fontWeight: 700, marginTop: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            ★ 목표선 (A등급)
          </div>
        )}
      </div>
    </div>
  );
}

function KRTab({ num, label, weight, active, done, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1,
      padding: "14px 16px",
      background: active ? "#fff" : "transparent",
      border: active ? "1.5px solid #3B5BDB" : "1.5px solid transparent",
      borderRadius: 11,
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      textAlign: "left",
      transition: "all 140ms ease-out",
      boxShadow: active ? "0 4px 12px -4px rgba(59,91,219,.20)" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: active ? "#213A8C" : "#7C87A4", letterSpacing: "0.04em" }}>
          KR {num.toString().padStart(2, "0")}
        </span>
        <span style={{ padding: "1px 7px", borderRadius: 4, background: active ? "#F1F4FD" : "#F4F7FB", color: "#5B6685", fontSize: 10, fontWeight: 600 }}>가중치 {weight}%</span>
        {done && (
          <span style={{ marginLeft: "auto", padding: "1px 7px", borderRadius: 4, background: "#ECFAF1", color: "#2F9E5E", fontSize: 10, fontWeight: 700 }}>✓ 완료</span>
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#0F1A36" : "#5B6685", lineHeight: 1.4, letterSpacing: "-0.005em" }}>{label}</div>
    </button>
  );
}

// AI 코치 사이드 챗 (Step 5)
function Step5AICoach({ open, onToggle }) {
  return (
    <aside style={{
      width: open ? 360 : 0,
      flexShrink: 0,
      transition: "width 280ms cubic-bezier(0.16, 1, 0.3, 1)",
      overflow: "hidden",
      borderLeft: open ? "1px solid #E1E5EF" : "none",
      background: "#fff",
      display: "flex", flexDirection: "column",
    }}>
      {open && (
        <>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>AI 코치</div>
              <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 1 }}>등급 기준 정의 도우미</div>
            </div>
            <button onClick={onToggle} style={{ width: 26, height: 26, borderRadius: 7, background: "#F4F7FB", border: "1px solid #E1E5EF", color: "#5B6685", cursor: "pointer", fontSize: 13 }}>×</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 11 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>✨</div>
              <div style={{ padding: "10px 12px", background: "#F4F7FB", borderRadius: "4px 11px 11px 11px", fontSize: 12.5, color: "#1F2A4A", lineHeight: 1.6 }}>
                A등급은 <b>500ms</b>로 설정되어 있어요. S등급은 보통 <b>목표보다 20% 더 좋은 값</b>을 잡아요.
              </div>
            </div>

            <div style={{ marginLeft: 34, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                "S = 400ms로 자동 적용",
                "C·D 기준도 추천해줘",
                "보수적으로 잡기",
              ].map((s, i) => (
                <button key={i} style={{
                  padding: "5px 10px", background: "#F1F4FD", color: "#213A8C",
                  border: "1px solid #C5D0F7", borderRadius: 999,
                  fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)",
                }}>{s}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <div style={{ padding: "10px 12px", background: "#3B5BDB", color: "#fff", borderRadius: "11px 4px 11px 11px", fontSize: 12.5, lineHeight: 1.6, maxWidth: 240 }}>
                S = 400ms로 적용하고, C·D도 추천해줘요.
              </div>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "#E5EBFB", color: "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>김</div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>✨</div>
              <div style={{ padding: "10px 12px", background: "#F4F7FB", borderRadius: "4px 11px 11px 11px", fontSize: 12.5, color: "#1F2A4A", lineHeight: 1.6 }}>
                좋아요! 좌측 폼에 자동 반영했어요:
                <div style={{ marginTop: 7, padding: "8px 10px", background: "#fff", border: "1px solid #BBE9CC", borderRadius: 7, fontSize: 11.5, color: "#1F5538", fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
                  S = ≤400ms ✓<br/>
                  B = 500~650ms ✓<br/>
                  C = 650~800ms ✓<br/>
                  D = ≥800ms ✓
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "10px 18px 14px", borderTop: "1px solid #ECEFF5" }}>
            <div style={{ background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 10, padding: "9px 12px", display: "flex", alignItems: "flex-end", gap: 8 }}>
              <textarea
                placeholder="이 KR에 대해 질문하거나 요청해주세요…"
                rows="2"
                style={{
                  flex: 1, border: "none", outline: "none", background: "transparent",
                  fontFamily: "var(--font-sans)", fontSize: 12.5, color: "#0F1A36",
                  resize: "none", lineHeight: 1.5,
                }}
              />
              <button style={{ width: 30, height: 30, borderRadius: 8, background: "#3B5BDB", border: "none", color: "#fff", fontSize: 13, cursor: "pointer", flexShrink: 0 }}>↑</button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

function R1WriteStep5() {
  const [aiOpen, setAiOpen] = React.useState(false);
  const [activeKR, setActiveKR] = React.useState("kr1");

  const krs = [
    { id: "kr1", num: 1, label: "결제 게이트웨이 APM p95 응답속도 850→500ms", weight: 30, done: false },
    { id: "kr2", num: 2, label: "결제 인증모듈 단위테스트 커버리지 65→85%", weight: 25, done: false },
    { id: "kr3", num: 3, label: "장애 알림 룰 자동화 4단계 중 3단계", weight: 20, done: false },
  ];

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden", position: "relative" }}>
      <TopBar title="OKR 작성" subtitle="STEP 5 / 7 · 측정 방법 · 등급 기준"/>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* MAIN — 단순화: 탭 + 측정 방법 + 등급 기준 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 40px 32px", minWidth: 0 }}>

          <WizardBreadcrumb stepLabel="STEP 5 · 상세 수립"/>
          <WizardStepHeader current={5}/>

          {/* 짧은 헤더 — Hero 제거하고 한 줄로 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>STEP 5 / 7</div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.25 }}>
              각 KR의 측정 방법과 등급 기준을 정해주세요
            </h1>
          </div>

          {/* KR 탭 3개 — substep 12개 → KR 3개로 단순화 */}
          <div style={{ background: "#F4F7FB", border: "1px solid #E1E5EF", borderRadius: 14, padding: 6, marginBottom: 22, display: "flex", gap: 4 }}>
            {krs.map(k => (
              <KRTab
                key={k.id}
                num={k.num} label={k.label} weight={k.weight}
                active={activeKR === k.id} done={k.done}
                onClick={() => setActiveKR(k.id)}
              />
            ))}
          </div>

          {/* 측정 방법 + 등급 기준만 — 다른 모든 영역 제거 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* 1. 측정 방법 */}
            <section style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "24px 26px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "#F1F4FD", color: "#3B5BDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, fontFamily: "var(--font-mono)" }}>1</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.01em" }}>측정 방법</div>
                  <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 2 }}>어떻게 측정하고 검증할지 정해주세요</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#5B6685", marginBottom: 6 }}>측정 도구</label>
                  <input
                    defaultValue="APM (Datadog)"
                    placeholder="예: APM Datadog, Jest coverage report"
                    style={{ width: "100%", padding: "11px 13px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 9, fontSize: 13.5, color: "#0F1A36", outline: "none", fontFamily: "var(--font-sans)" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#5B6685", marginBottom: 6 }}>통계 단위</label>
                  <input
                    defaultValue="p95"
                    placeholder="예: p95, 평균, 합계"
                    style={{ width: "100%", padding: "11px 13px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 9, fontSize: 13.5, color: "#0F1A36", outline: "none", fontFamily: "var(--font-mono)" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#5B6685", marginBottom: 6 }}>집계 주기</label>
                  <input
                    defaultValue="월평균"
                    placeholder="예: 월평균, 주평균"
                    style={{ width: "100%", padding: "11px 13px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 9, fontSize: 13.5, color: "#0F1A36", outline: "none", fontFamily: "var(--font-sans)" }}
                  />
                </div>
              </div>
            </section>

            {/* 2. S/A/B/C/D 등급 기준 — 메인 */}
            <section style={{ background: "#fff", border: "1.5px solid #3B5BDB", borderRadius: 14, padding: "24px 26px", boxShadow: "0 0 0 4px rgba(59,91,219,.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, fontFamily: "var(--font-mono)" }}>2</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.01em" }}>S / A / B / C / D 등급 기준</div>
                  <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 2 }}>
                    Baseline <b style={{ color: "#1F2A4A", fontFamily: "var(--font-mono)" }}>850ms</b> → Goal <b style={{ color: "#3B5BDB", fontFamily: "var(--font-mono)" }}>500ms</b> · A등급이 목표선이에요
                  </div>
                </div>
                <Button variant="ai" size="sm" leftIcon={<span>✨</span>} onClick={() => setAiOpen(true)}>AI로 자동 생성</Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <GradeRow grade="S" color="#6B47E0" defaultValue="≤ 400ms (목표 초과)"/>
                <GradeRow grade="A" color="#3B5BDB" defaultValue="≤ 500ms (목표 달성)" isTarget/>
                <GradeRow grade="B" color="#2F9E5E" defaultValue="500 ~ 650ms"/>
                <GradeRow grade="C" color="#D98023" defaultValue="650 ~ 800ms"/>
                <GradeRow grade="D" color="#7C87A4" defaultValue="≥ 800ms (개선 없음)"/>
              </div>
            </section>

          </div>

          <WizardNav current={5}/>
        </div>

        {/* AI Coach Side Chat */}
        <Step5AICoach open={aiOpen} onToggle={() => setAiOpen(!aiOpen)}/>

        {/* Toggle button when closed */}
        {!aiOpen && (
          <button onClick={() => setAiOpen(true)} style={{
            position: "absolute", right: 24, top: 96, zIndex: 5,
            padding: "10px 14px", background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff",
            border: "none", borderRadius: 11, boxShadow: "0 8px 18px -4px rgba(59,91,219,.4)",
            display: "flex", alignItems: "center", gap: 7,
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)",
          }}>
            <span>✨</span> AI 코치
          </button>
        )}
      </div>
    </main>
  );
}

window.R1WriteStep5 = R1WriteStep5;
