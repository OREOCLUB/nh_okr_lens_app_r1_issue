// STEP 1 — OKR 유형 선택 (운영 / 전략혁신 — 단일 선택)

function TypeCard({ icon, title, badge, desc, features, examples, selected, accent, onSelect }) {
  return (
    <div onClick={onSelect} style={{
      background: selected ? "#fff" : "#F9FAFC",
      border: `2px solid ${selected ? accent : "#E1E5EF"}`,
      borderRadius: 18,
      padding: "32px 30px",
      cursor: "pointer", flex: 1,
      transition: "all 220ms cubic-bezier(0.16, 1, 0.3, 1)",
      boxShadow: selected ? `0 20px 40px -12px ${accent}28` : "0 1px 2px rgba(31,42,74,.04)",
      position: "relative",
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      {selected && (
        <div style={{
          position: "absolute", top: 20, right: 20,
          width: 30, height: 30, borderRadius: "50%",
          background: accent, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
          boxShadow: `0 4px 12px -2px ${accent}50`,
        }}>✓</div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16,
          background: selected ? accent : "#fff",
          color: selected ? "#fff" : accent,
          border: selected ? "none" : `1.5px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em" }}>{title}</div>
          <div style={{ display: "inline-flex", marginTop: 5, padding: "3px 11px", borderRadius: 7, background: `${accent}15`, color: accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>{badge}</div>
        </div>
      </div>

      <div style={{ fontSize: 14.5, color: "#3A4565", lineHeight: 1.7 }}>{desc}</div>

      {/* Features */}
      <div style={{ paddingTop: 18, borderTop: "1px solid #ECEFF5" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>이런 경우에 추천해요</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13.5, color: "#3A4565", lineHeight: 1.6 }}>
              <span style={{ color: accent, fontWeight: 700, fontSize: 15, lineHeight: 1.4 }}>✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Examples */}
      <div style={{
        background: `${accent}08`, border: `1px solid ${accent}20`, borderRadius: 12,
        padding: "14px 16px",
      }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: accent, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>📌 예시 KR</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 12.5, color: "#1F2A4A", lineHeight: 1.55 }}>
          {examples.map((e, i) => (
            <div key={i}>· {e}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function R1WriteStep1() {
  const [type, setType] = React.useState("ops");

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="OKR 작성" subtitle="STEP 1 / 7 · OKR 유형 선택"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 48px 40px" }}>

        <WizardBreadcrumb stepLabel="STEP 1 · OKR 유형"/>
        <WizardStepHeader current={1}/>

        {/* Hero — 더 여유롭게 */}
        <div style={{ marginBottom: 36, maxWidth: 760 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>STEP 1 / 7 · 필수</div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.25 }}>
            이번 분기 OKR은<br/>어떤 유형인가요?
          </h1>
          <p style={{ margin: "16px 0 0", fontSize: 15, color: "#5B6685", lineHeight: 1.7 }}>
            두 가지 유형 중 하나를 선택해주세요. 다음 단계에서 KR을 작성할 때 AI가 유형에 맞는 가이드를 제공해드려요.
          </p>
        </div>

        {/* Two type cards */}
        <div style={{ display: "flex", gap: 18, marginBottom: 28 }}>
          <TypeCard
            icon="⚙️" title="운영 OKR" badge="OPERATIONS"
            accent="#3B5BDB" selected={type === "ops"} onSelect={() => setType("ops")}
            desc="기존 본업의 안정성과 점진적 개선을 목표로 해요. 측정이 명확하고, 일상 운영에서 만들어내는 가치를 다룹니다."
            features={[
              "측정 도구가 이미 있는 영역 (APM, 로그, 모니터링)",
              "장애·SLA·응답속도 등 정량 지표가 명확한 업무",
              "꾸준한 개선이 핵심인 운영 본업",
            ]}
            examples={[
              "결제 게이트웨이 APM p95 응답속도 850ms → 500ms",
              "야간 배치 장애 MTTR 평균 35분 → 15분 단축",
              "결제 인증모듈 단위테스트 커버리지 65% → 85%",
            ]}
          />
          <TypeCard
            icon="🚀" title="전략혁신 OKR" badge="STRATEGY"
            accent="#7C4DD9" selected={type === "strategy"} onSelect={() => setType("strategy")}
            desc="새로운 시스템 도입, 도전적인 변화, 조직 차원의 혁신을 목표로 해요. 측정 설계가 더 필요하지만, 도전성과 변화의 폭이 큽니다."
            features={[
              "신규 기능 · 새로운 도구 도입",
              "전사 차원 표준화 · 거버넌스 구축",
              "기존 한계를 깨는 도전적 변화",
            ]}
            examples={[
              "결제 인프라 K8s 전환 마일스톤 4단계 중 3단계 완료",
              "AI 코드 리뷰 도구 도입 · 채택률 60% 달성",
              "신규 결제 수단(BNPL) 베타 런칭 · 결제 성공률 95%",
            ]}
          />
        </div>

        {/* Helper note — 가볍게 */}
        <div style={{
          padding: "16px 20px",
          background: "#F1F4FD", border: "1px solid #C5D0F7", borderRadius: 12,
          display: "flex", alignItems: "center", gap: 12,
          fontSize: 13, color: "#1B2A4E", lineHeight: 1.65,
        }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <div>난이도(상/중/하)는 KR 작성 후 <b>체크리스트 11항목</b>의 통과 개수로 자동 산정돼요. 지금은 유형만 골라주시면 됩니다.</div>
        </div>

        <WizardNav current={1}/>
      </div>
    </main>
  );
}

window.R1WriteStep1 = R1WriteStep1;
