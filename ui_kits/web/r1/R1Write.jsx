// R1Write.jsx — OKR 작성 위저드 (4단계)

function StepHeader({ step }) {
  const steps = [
    { num: 1, label: "OKR 유형" },
    { num: 2, label: "기초 정보" },
    { num: 3, label: "KR 작성" },
    { num: 4, label: "최종 검토" },
  ];
  return (
    <div style={{
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      padding: "20px 24px", marginBottom: 20,
      display: "flex", alignItems: "center", gap: 12,
    }}>
      {steps.map((s, i) => {
        const done = s.num < step;
        const cur = s.num === step;
        return (
          <React.Fragment key={s.num}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: cur ? "#3B5BDB" : done ? "#ECFAF1" : "#F4F7FB",
                color: cur ? "#fff" : done ? "#2F9E5E" : "#7C87A4",
                border: cur ? "none" : done ? "1px solid #BBE9CC" : "1px solid #E1E5EF",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                fontFamily: "var(--font-mono)",
                flexShrink: 0,
              }}>{done ? "✓" : s.num}</div>
              <div>
                <div style={{
                  fontSize: 10.5, fontWeight: 700,
                  color: cur ? "#3B5BDB" : done ? "#2F9E5E" : "#A4ADC4",
                  letterSpacing: "0.04em", textTransform: "uppercase",
                }}>STEP {s.num}</div>
                <div style={{
                  fontSize: 13.5, fontWeight: cur ? 700 : 600,
                  color: cur ? "#0F1A36" : done ? "#3A4565" : "#7C87A4",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}>{s.label}</div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? "#BBE9CC" : "#ECEFF5", borderRadius: 1 }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function TypeCard({ icon, title, desc, features, value, selected, onSelect, accentColor }) {
  return (
    <div onClick={() => onSelect(value)} style={{
      background: selected ? "#F1F4FD" : "#fff",
      border: `2px solid ${selected ? accentColor : "#E1E5EF"}`,
      borderRadius: 16,
      padding: "24px 22px",
      cursor: "pointer", flex: 1,
      transition: "all 180ms ease-out",
      boxShadow: selected ? `0 0 0 4px ${accentColor}20` : "0 1px 2px rgba(31,42,74,.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: selected ? accentColor : "#F4F7FB",
          color: selected ? "#fff" : accentColor,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.01em" }}>{title}</div>
          <div style={{ fontSize: 12, color: "#7C87A4" }}>{desc}</div>
        </div>
        {selected && (
          <div style={{ marginLeft: "auto", width: 22, height: 22, borderRadius: "50%", background: accentColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 12.5, color: "#3A4565", lineHeight: 1.5 }}>
            <span style={{ color: accentColor, fontWeight: 700 }}>·</span>
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

function Step1({ type, setType }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "32px 36px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em" }}>OKR 유형을 선택해주세요</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#5B6685" }}>
          이번 분기 OKR이 어떤 성격인지 알려주시면, AI가 더 적절한 가이드를 드릴 수 있어요.
        </p>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <TypeCard
          icon="⚙️" title="운영 OKR" desc="기존 업무의 안정·개선"
          features={["응답속도·장애율 개선", "기존 시스템 안정화", "정량 측정이 쉬운 편"]}
          value="ops" selected={type === "ops"} onSelect={setType} accentColor="#3B5BDB"
        />
        <TypeCard
          icon="🚀" title="전략 혁신 OKR" desc="새로운 가치 창출"
          features={["신규 기능 · 시스템 도입", "조직 차원 도전 과제", "도전성과 가중치가 높음"]}
          value="strategy" selected={type === "strategy"} onSelect={setType} accentColor="#7C4DD9"
        />
      </div>

      <div style={{
        marginTop: 20, padding: "14px 18px",
        background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10,
        display: "flex", alignItems: "flex-start", gap: 10,
        fontSize: 12.5, color: "#7A4A14", lineHeight: 1.55,
      }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <div>
          <b>운영안 비중 안내</b> · 운영 40% · 전략혁신 40% · 사후평가 20%. 한 분기 OKR 중 운영과 전략을 혼합해서 작성할 수 있어요.
        </div>
      </div>
    </div>
  );
}

function Step2() {
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "32px 36px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em" }}>기초 정보를 입력해주세요</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#5B6685" }}>
          AI가 KR 초안을 제안할 수 있도록 핵심 정보를 알려주세요.
        </p>
      </div>

      {/* Mode tabs */}
      <div style={{ display: "inline-flex", background: "#F4F7FB", borderRadius: 10, padding: 4, gap: 3, marginBottom: 22 }}>
        <button style={tabOn}>💬 대화형 입력</button>
        <button style={tabOff}>✏️ 직접 작성</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <label style={labelStyle}>Objective (목표)</label>
          <input style={inputStyle} placeholder="예: 핵심 서비스 응답속도 개선" value="결제 게이트웨이 성능 개선" readOnly/>
          <div style={hintStyle}>선택 입력 · 비워두어도 OKR 작성이 가능해요</div>
        </div>
        <div>
          <label style={labelStyle}>업무 분장</label>
          <input style={inputStyle} value="결제플랫폼 백엔드 성능/튜닝" readOnly/>
        </div>

        <div style={{ gridColumn: "1 / 3" }}>
          <label style={labelStyle}>올해 본업에서 반드시 지킬 것 / 새로 도전할 것</label>
          <textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} defaultValue="• 결제 게이트웨이의 p95 응답속도를 일정 수준 이하로 유지 (사용자 체감 속도)
• 결제 인증 모듈의 단위테스트 커버리지를 끌어올려 회귀 리스크 줄이기
• 야간 배치의 장애 알림 자동화를 마일스톤 단위로 진행"/>
          <div style={hintStyle}>구어체로 자연스럽게 입력 · AI가 정제해 드려요</div>
        </div>

        <div>
          <label style={labelStyle}>제약 조건 / 협업 대상</label>
          <input style={inputStyle} placeholder="예: SRE팀, 인프라팀과 협업 필요"/>
        </div>
        <div>
          <label style={labelStyle}>예상 KR 개수</label>
          <div style={{ display: "inline-flex", background: "#F4F7FB", borderRadius: 10, padding: 4, gap: 3 }}>
            {[4, 5, 6].map((n) => (
              <button key={n} style={n === 5 ? segOn : segOff}>{n}개</button>
            ))}
          </div>
          <div style={hintStyle}>운영안 권장: 4~6개</div>
        </div>
      </div>

      {/* AI suggestion preview */}
      <div style={{
        marginTop: 24, padding: "18px 20px",
        background: "linear-gradient(135deg, #F1F4FD, #fff 80%)",
        border: "1px solid #C5D0F7", borderRadius: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: "#3B5BDB", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✨</span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1B2A4E" }}>AI 미리보기 · 입력을 바탕으로 다음 단계에서 KR 초안 3개를 제안해드릴게요</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 34, fontSize: 12.5, color: "#3A4565", lineHeight: 1.6 }}>
          <div>· 결제 게이트웨이 APM p95 응답속도 850ms → 500ms</div>
          <div>· 결제 인증모듈 단위테스트 커버리지 65% → 85%</div>
          <div>· 야간 배치 알림 자동화 4단계 중 3단계까지 진행</div>
        </div>
      </div>
    </div>
  );
}

function KRDraftCard({ num, format, formatColor, kr, baseline, goal, measure, weight }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      padding: "20px 22px", position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{
          padding: "2px 9px", borderRadius: 999,
          background: "#F1F4FD", color: "#213A8C",
          fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
        }}>KR · {num}</span>
        <span style={{
          padding: "2px 9px", borderRadius: 999,
          background: formatColor.bg, color: formatColor.fg,
          fontSize: 11, fontWeight: 600,
        }}>{format}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button style={iconBtn}><Icon name="edit" size={14}/></button>
          <button style={iconBtn}><Icon name="sparkles" size={14}/></button>
        </div>
      </div>
      <div style={{ fontSize: 15.5, fontWeight: 600, color: "#0F1A36", lineHeight: 1.5, marginBottom: 14, letterSpacing: "-0.01em" }}>
        {kr}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 70px", gap: 14, paddingTop: 12, borderTop: "1px solid #ECEFF5" }}>
        <div>
          <div style={miniLabel}>Baseline</div>
          <div style={miniVal}>{baseline}</div>
        </div>
        <div>
          <div style={miniLabel}>Goal</div>
          <div style={{ ...miniVal, color: "#3B5BDB" }}>{goal}</div>
        </div>
        <div>
          <div style={miniLabel}>측정 방법</div>
          <div style={miniVal}>{measure}</div>
        </div>
        <div>
          <div style={miniLabel}>가중치</div>
          <div style={{ ...miniVal, color: "#0F1A36" }}>{weight}%</div>
        </div>
      </div>
    </div>
  );
}

function Step3() {
  const FORMAT_COLOR = {
    "수치":      { bg: "#E5EBFB", fg: "#213A8C" },
    "마일스톤":  { bg: "#F0E9FB", fg: "#7C4DD9" },
    "루브릭":    { bg: "#FFEDE2", fg: "#E07A3C" },
    "이산":      { bg: "#ECFAF1", fg: "#2F9E5E" },
  };
  return (
    <div>
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "24px 28px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F1F4FD", color: "#3B5BDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✨</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>AI가 3개 초안을 제안했어요</div>
            <div style={{ fontSize: 12.5, color: "#5B6685", marginTop: 2 }}>각 KR을 편집하거나, AI에게 다시 정제를 요청할 수 있어요.</div>
          </div>
          <Button variant="ai" size="sm" leftIcon={<span>↻</span>}>다시 제안</Button>
          <Button variant="secondary" size="sm" leftIcon={<span>+</span>}>KR 추가</Button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <KRDraftCard num="01" format="수치" formatColor={FORMAT_COLOR["수치"]}
          kr="결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축한다."
          baseline="850ms" goal="500ms" measure="APM p95 월평균" weight="30"/>
        <KRDraftCard num="02" format="수치" formatColor={FORMAT_COLOR["수치"]}
          kr="결제 인증모듈 단위테스트 커버리지를 65% → 85%로 끌어올린다."
          baseline="65%" goal="85%" measure="Jest 커버리지 리포트" weight="25"/>
        <KRDraftCard num="03" format="마일스톤" formatColor={FORMAT_COLOR["마일스톤"]}
          kr="장애 알림 룰 자동화 마일스톤 4단계 중 3단계까지 완료한다."
          baseline="1/4" goal="3/4" measure="단계별 산출물 검토" weight="20"/>
      </div>

      {/* Weight total */}
      <div style={{
        marginTop: 18, padding: "16px 20px",
        background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12,
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <span style={{ fontSize: 13, color: "#5B6685", fontWeight: 600 }}>가중치 합산</span>
        <div style={{ flex: 1, height: 10, background: "#F4F7FB", borderRadius: 5, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "100%", marginLeft: -1, width: 2, background: "#D14343", opacity: 0.4 }}/>
          <div style={{ height: "100%", width: "68%", background: "linear-gradient(90deg, #3B5BDB, #5C7AE6)", borderRadius: 5 }}/>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>75 / 110</span>
        <span style={{ fontSize: 11.5, color: "#2F9E5E", fontWeight: 600 }}>✓ 상한 이내</span>
      </div>
    </div>
  );
}

function CheckRow({ pass, text, note }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px 14px",
      background: pass ? "#ECFAF1" : "#FFF7EC",
      border: `1px solid ${pass ? "#BBE9CC" : "#FFE0BA"}`,
      borderRadius: 10,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 7,
        background: pass ? "#2F9E5E" : "#D98023", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, flexShrink: 0,
      }}>{pass ? "✓" : "!"}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: pass ? "#1F5538" : "#7A4A14" }}>{text}</div>
        {note && <div style={{ fontSize: 11.5, color: pass ? "#2F6B48" : "#9C5E26", marginTop: 3, lineHeight: 1.5 }}>{note}</div>}
      </div>
    </div>
  );
}

function Step4() {
  return (
    <div>
      {/* Summary card */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "26px 28px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>제출 전 최종 검토</h2>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <span style={{ padding: "4px 10px", borderRadius: 999, background: "#ECFAF1", color: "#2F9E5E", fontSize: 11.5, fontWeight: 700 }}>11개 중 9개 통과</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 18 }}>
          {[
            { label: "OKR 유형",   value: "운영" },
            { label: "KR 개수",    value: "3개" },
            { label: "가중치 합",  value: "75 / 110" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "12px 14px", background: "#F4F7FB", borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: "#7C87A4", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI checklist */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "26px 28px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "#F1F4FD", color: "#3B5BDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✨</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>AI 사전 검토 결과</div>
            <div style={{ fontSize: 12, color: "#5B6685", marginTop: 2 }}>제출 전 보완하면 좋은 항목이에요</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <CheckRow pass text="수치로 측정 가능한가?" note="모든 KR에 명확한 baseline/goal 수치가 있어요"/>
          <CheckRow pass text="외부 의존 없이 통제 가능한가?"/>
          <CheckRow pass={false} text="외부 증빙 기반인가?" note="KR 03의 마일스톤 산출물 형태를 더 구체적으로 적어주세요"/>
          <CheckRow pass text="시간 내 달성 가능한가?"/>
          <CheckRow pass text="명확한 언어인가?"/>
          <CheckRow pass={false} text="단순 건수형이 아닌 질적 지표인가?" note="KR 03이 건수 위주 — 결과 지표를 더할 수 있을까요?"/>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: "linear-gradient(135deg, #1B2A4E, #2C3E68)",
        color: "#fff", borderRadius: 16, padding: "26px 28px",
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(145,166,240,0.22)", color: "#C5D0F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📥</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>정태영 팀장에게 제출하시겠어요?</div>
          <div style={{ fontSize: 12.5, color: "#A4ADC4", lineHeight: 1.5 }}>제출 후에도 팀장이 조정 요청 시 수정할 수 있어요. AI 검토 미통과 2건은 평가자가 코칭 시 함께 정제하실 수 있습니다.</div>
        </div>
        <button style={{ background: "#fff", color: "#1B2A4E", border: "none", borderRadius: 10, padding: "12px 22px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          저장만 하기
        </button>
        <button style={{ background: "#3B5BDB", color: "#fff", border: "none", borderRadius: 10, padding: "12px 22px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          제출하기 →
        </button>
      </div>
    </div>
  );
}

function R1Write() {
  const [step, setStep] = React.useState(3);
  const [type, setType] = React.useState("ops");

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="OKR 작성" subtitle="김지훈 · 2026 상반기"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 40px 32px" }}>

        {/* Breadcrumb + back */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 12.5, color: "#5B6685" }}>
          <a href="./r1-employee.html" style={{ color: "#5B6685", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <span>←</span> 피평가자 홈
          </a>
          <span style={{ color: "#C8CFDF" }}>/</span>
          <span style={{ color: "#0F1A36", fontWeight: 600 }}>OKR 작성</span>
        </div>

        <StepHeader step={step}/>

        {/* Step content */}
        {step === 1 && <Step1 type={type} setType={setType}/>}
        {step === 2 && <Step2/>}
        {step === 3 && <Step3/>}
        {step === 4 && <Step4/>}

        {/* Nav */}
        <div style={{
          marginTop: 20, padding: "18px 24px",
          background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))}>
            ← 이전 단계
          </Button>
          <div style={{ flex: 1 }}/>
          <div style={{ fontSize: 12, color: "#7C87A4" }}>임시 저장됨 · 3분 전</div>
          <Button variant="secondary">임시 저장</Button>
          {step < 4 ? (
            <Button variant="primary" onClick={() => setStep(Math.min(4, step + 1))}>
              다음 단계 →
            </Button>
          ) : (
            <Button variant="primary">제출하기 →</Button>
          )}
        </div>

        {/* Helper */}
        <div style={{
          marginTop: 18, padding: "12px 16px",
          background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10,
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 12, color: "#5B6685",
        }}>
          <span style={{ fontSize: 14 }}>💡</span>
          AI 코칭은 참고용 신호입니다. 평가에 직접 반영되지 않으며, 더 좋은 KR을 함께 만들기 위한 제안이에요.
        </div>
      </div>
    </main>
  );
}

// Shared styles
const tabOn = {
  background: "#fff", color: "#0F1A36", fontWeight: 600,
  border: "none", borderRadius: 7, padding: "7px 14px",
  fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)",
  boxShadow: "0 1px 3px rgba(31,42,74,.08)",
};
const tabOff = {
  background: "transparent", color: "#5B6685", fontWeight: 500,
  border: "none", borderRadius: 7, padding: "7px 14px",
  fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)",
};
const segOn = {
  background: "#fff", color: "#0F1A36", fontWeight: 700,
  border: "none", borderRadius: 7, padding: "7px 14px",
  fontSize: 13, cursor: "pointer", fontFamily: "var(--font-mono)",
  boxShadow: "0 1px 3px rgba(31,42,74,.08)",
};
const segOff = {
  background: "transparent", color: "#7C87A4", fontWeight: 500,
  border: "none", borderRadius: 7, padding: "7px 14px",
  fontSize: 13, cursor: "pointer", fontFamily: "var(--font-mono)",
};
const labelStyle = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#3A4565", marginBottom: 7 };
const inputStyle = {
  width: "100%", padding: "10px 14px",
  background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10,
  fontSize: 14, color: "#0F1A36", fontFamily: "var(--font-sans)",
  outline: "none",
};
const hintStyle = { fontSize: 11.5, color: "#7C87A4", marginTop: 5 };
const iconBtn = {
  width: 28, height: 28, borderRadius: 7,
  background: "#F4F7FB", border: "1px solid #E1E5EF",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "#5B6685",
};
const miniLabel = { fontSize: 10.5, fontWeight: 600, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 };
const miniVal = { fontSize: 13.5, fontWeight: 600, color: "#3A4565", fontFamily: "var(--font-mono)" };

window.R1Write = R1Write;
