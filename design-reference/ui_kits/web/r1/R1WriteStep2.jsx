// STEP 2 — 기초 정보 입력 (대화형 + 직접 작성 2채널)

function ChatMessage({ from, message, time, options }) {
  const isAI = from === "ai";
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 14, flexDirection: isAI ? "row" : "row-reverse" }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: isAI ? "linear-gradient(135deg, #3B5BDB, #5C7AE6)" : "#E5EBFB",
        color: isAI ? "#fff" : "#213A8C",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700, flexShrink: 0,
      }}>{isAI ? "✨" : "김"}</div>
      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 4, alignItems: isAI ? "flex-start" : "flex-end" }}>
        <div style={{ fontSize: 10.5, color: "#7C87A4", fontWeight: 600 }}>{isAI ? "AI 코치" : "김지훈"} · <span style={{ color: "#A4ADC4", fontWeight: 500 }}>{time}</span></div>
        <div style={{
          padding: "10px 14px",
          background: isAI ? "#fff" : "#3B5BDB",
          color: isAI ? "#1F2A4A" : "#fff",
          border: isAI ? "1px solid #E1E5EF" : "none",
          borderRadius: isAI ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
          fontSize: 13, lineHeight: 1.55,
        }}>{message}</div>
        {options && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
            {options.map((o, i) => (
              <button key={i} style={{
                padding: "5px 11px", background: "#F1F4FD", color: "#213A8C",
                border: "1px solid #C5D0F7", borderRadius: 999,
                fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)",
              }}>{o}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContextRow({ label, value, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderBottom: "1px solid #ECEFF5" }}>
      {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
      <div style={{ fontSize: 11.5, color: "#7C87A4", fontWeight: 600, width: 88 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: "#0F1A36", fontWeight: 500, flex: 1 }}>{value}</div>
    </div>
  );
}

function CheckChip({ label, checked, color }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 11px", borderRadius: 999,
      background: checked ? `${color}15` : "#F4F7FB",
      border: `1px solid ${checked ? color : "#E1E5EF"}`,
      fontSize: 11.5, fontWeight: 600,
      color: checked ? color : "#7C87A4",
      cursor: "pointer",
    }}>
      <span>{checked ? "✓" : "□"}</span> {label}
    </div>
  );
}

function R1WriteStep2() {
  const [mode, setMode] = React.useState("chat");

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="OKR 작성" subtitle="STEP 2 / 7 · 기초 정보 입력"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 40px 32px" }}>

        <WizardBreadcrumb stepLabel="STEP 2 · 기초 정보"/>
        <WizardStepHeader current={2}/>
        <WizardHero
          stepNum={2}
          title="이번 분기 어떤 일을 해보실 거예요?"
          desc="구어체로 자연스럽게 말씀해주시면, AI가 KR 초안으로 정제해드려요. 직접 작성하셔도 좋아요."
        />

        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: 5, marginBottom: 18, width: "fit-content" }}>
          <button onClick={() => setMode("chat")} style={{
            padding: "10px 18px", background: mode === "chat" ? "#3B5BDB" : "transparent",
            color: mode === "chat" ? "#fff" : "#5B6685",
            border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 7,
          }}>
            💬 대화형 입력
            <span style={{ padding: "1px 7px", borderRadius: 5, background: mode === "chat" ? "rgba(255,255,255,0.22)" : "#F4F7FB", color: mode === "chat" ? "#fff" : "#7C87A4", fontSize: 10, fontWeight: 700 }}>추천</span>
          </button>
          <button onClick={() => setMode("form")} style={{
            padding: "10px 18px", background: mode === "form" ? "#3B5BDB" : "transparent",
            color: mode === "form" ? "#fff" : "#5B6685",
            border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 7,
          }}>
            ✏️ 직접 작성
          </button>
        </div>

        {/* Two columns layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18 }}>

          {/* Left — Main input */}
          {mode === "chat" ? (
            <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, display: "flex", flexDirection: "column", height: 620 }}>
              {/* Chat header */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✨</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>AI 코치와 대화하기</div>
                  <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2F9E5E" }}/>
                    질문 3 / 5 · 50% 완료
                  </div>
                </div>
                <Button variant="ghost" size="sm" leftIcon={<span>↻</span>}>처음부터</Button>
              </div>

              {/* Chat messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
                <ChatMessage from="ai" time="14:22"
                  message={<>안녕하세요 김지훈 님 :) 운영 70% + 전략혁신 30% 비중으로 선택하셨네요.<br/><br/>
                  먼저, <b style={{ color: "#0F1A36" }}>올해 본업에서 반드시 지킬 것</b>은 무엇인가요? 가장 중요하게 생각하시는 부분부터 들려주세요.</>}
                  options={["결제 안정성", "응답속도", "장애 예방"]}
                />

                <ChatMessage from="user" time="14:23"
                  message="결제 게이트웨이 응답속도가 작년부터 계속 신경 쓰여요. 6월부터 일부 캐시 적용해서 850ms 정도로 내렸는데, 500ms대로 더 끌어내리고 싶어요."
                />

                <ChatMessage from="ai" time="14:23"
                  message={<>좋아요 :) <b style={{ color: "#0F1A36" }}>응답속도 850→500ms</b>는 측정도 명확하고 도전적인 좋은 목표예요.<br/><br/>
                  추가로 여쭤볼게요. <b style={{ color: "#0F1A36" }}>새로 도전하고 싶은 일</b>이 있나요? 처음 해보는 것, 작년엔 못 했던 것, 평소 미뤄두던 것 등 무엇이든 좋아요.</>}
                />

                <ChatMessage from="user" time="14:25"
                  message="장애 알림 자동화를 마일스톤 단위로 진행하고 싶어요. 인증 모듈 단위테스트 커버리지도 65 → 85%로 올리고 싶고요."
                />

                <ChatMessage from="ai" time="14:25"
                  message={<>좋습니다! 세 가지 후보가 모였네요:
                  <div style={{ marginTop: 8, padding: "10px 12px", background: "#F1F4FD", borderRadius: 8, fontSize: 12.5 }}>
                    <div>1. APM p95 응답속도 850ms → 500ms</div>
                    <div>2. 단위테스트 커버리지 65% → 85%</div>
                    <div>3. 장애 알림 자동화 4단계 중 3단계</div>
                  </div>
                  <div style={{ marginTop: 8 }}>마지막으로, <b style={{ color: "#0F1A36" }}>다른 팀과 협업이 필요한 부분</b>이 있을까요? SRE팀이라든지요.</div></>}
                />
              </div>

              {/* Composer */}
              <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #ECEFF5" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                  {["SRE팀 협업 필요", "인프라팀 도움 필요", "독립적으로 진행", "팀 내에서 해결"].map((s, i) => (
                    <button key={i} style={{
                      padding: "5px 11px", background: "#F4F7FB", color: "#3A4565",
                      border: "1px solid #E1E5EF", borderRadius: 999,
                      fontSize: 11.5, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)",
                    }}>{s}</button>
                  ))}
                </div>
                <div style={{ background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "flex-end", gap: 10 }}>
                  <textarea placeholder="자유롭게 입력해주세요…" rows="2" style={{
                    flex: 1, border: "none", outline: "none", background: "transparent",
                    fontFamily: "var(--font-sans)", fontSize: 13, color: "#0F1A36",
                    resize: "none", lineHeight: 1.5,
                  }}/>
                  <button style={{ width: 32, height: 32, borderRadius: 9, background: "#3B5BDB", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", flexShrink: 0 }}>↑</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "24px 26px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36", marginBottom: 18 }}>직접 작성하기</div>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={wizLabelStyle}>Objective (목표) <span style={{ color: "#A4ADC4", fontWeight: 500 }}>· 선택</span></label>
                  <input style={wizInputStyle} placeholder="예: 핵심 서비스 응답속도 개선" defaultValue="결제 게이트웨이 성능 개선"/>
                  <div style={wizHintStyle}>비워두어도 OKR 작성이 가능해요. 나중에 추가할 수도 있어요.</div>
                </div>

                <div>
                  <label style={wizLabelStyle}>올해 본업에서 반드시 지킬 것</label>
                  <textarea style={{ ...wizInputStyle, minHeight: 90, resize: "vertical" }} defaultValue="결제 게이트웨이의 p95 응답속도를 일정 수준 이하로 유지 (사용자 체감 속도 핵심 지표)"/>
                </div>

                <div>
                  <label style={wizLabelStyle}>새로 도전하고 싶은 것</label>
                  <textarea style={{ ...wizInputStyle, minHeight: 90, resize: "vertical" }} defaultValue="• 결제 인증 모듈 단위테스트 커버리지 향상
• 야간 배치 장애 알림 자동화 (마일스톤 단위)"/>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={wizLabelStyle}>협업 대상</label>
                    <input style={wizInputStyle} defaultValue="SRE팀, 인프라팀"/>
                  </div>
                  <div>
                    <label style={wizLabelStyle}>예상 KR 개수</label>
                    <div style={{ display: "inline-flex", background: "#F4F7FB", borderRadius: 10, padding: 4, gap: 3, width: "100%" }}>
                      {[4, 5, 6].map((n) => (
                        <button key={n} style={n === 5 ? {
                          flex: 1, background: "#fff", color: "#0F1A36", fontWeight: 700,
                          border: "none", borderRadius: 7, padding: "9px 12px",
                          fontSize: 13, cursor: "pointer", fontFamily: "var(--font-mono)",
                          boxShadow: "0 1px 2px rgba(31,42,74,.08)",
                        } : {
                          flex: 1, background: "transparent", color: "#7C87A4", fontWeight: 500,
                          border: "none", borderRadius: 7, padding: "9px 12px",
                          fontSize: 13, cursor: "pointer", fontFamily: "var(--font-mono)",
                        }}>{n}개</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right side - context panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Your context */}
            <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Icon name="users" size={16} style={{ color: "#3B5BDB" }}/>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>나의 정보</div>
                <button style={{ marginLeft: "auto", padding: "3px 8px", background: "#F4F7FB", border: "1px solid #E1E5EF", borderRadius: 6, fontSize: 10.5, color: "#5B6685", cursor: "pointer", fontFamily: "var(--font-sans)" }}>편집</button>
              </div>
              <ContextRow icon="👤" label="직급/직렬" value="4급갑 · SE"/>
              <ContextRow icon="🏢" label="조직" value="운영본부 · 결제플랫폼팀"/>
              <ContextRow icon="📝" label="업무 분장" value="결제플랫폼 백엔드 성능/튜닝"/>
              <ContextRow icon="📅" label="입사/발령" value="2018 / 2022.03.01"/>
              <ContextRow icon="🏠" label="근무 형태" value="상주"/>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0" }}>
                <span style={{ fontSize: 13 }}>📜</span>
                <div style={{ fontSize: 11.5, color: "#7C87A4", fontWeight: 600, width: 88 }}>자격증</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, flex: 1 }}>
                  <span style={{ padding: "2px 7px", background: "#F1F4FD", color: "#213A8C", borderRadius: 5, fontSize: 10.5, fontFamily: "var(--font-mono)", fontWeight: 600 }}>AWS SAA</span>
                  <span style={{ padding: "2px 7px", background: "#F1F4FD", color: "#213A8C", borderRadius: 5, fontSize: 10.5, fontFamily: "var(--font-mono)", fontWeight: 600 }}>CKA</span>
                </div>
              </div>
              <div style={{ marginTop: 12, padding: "10px 12px", background: "#ECFAF1", border: "1px solid #BBE9CC", borderRadius: 9, fontSize: 11.5, color: "#1F5538", display: "flex", alignItems: "flex-start", gap: 7, lineHeight: 1.5 }}>
                <span>✓</span> 팀장 결재가 완료되어 OKR 작성을 시작할 수 있어요.
              </div>
            </div>

            {/* AI extracted */}
            <div style={{ background: "linear-gradient(135deg, #F1F4FD, #fff 60%)", border: "1px solid #C5D0F7", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✨</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1B2A4E" }}>AI가 정리한 핵심 키워드</div>
                  <div style={{ fontSize: 11, color: "#5B6685", marginTop: 2 }}>대화에서 자동 추출</div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <CheckChip label="응답속도 개선" checked color="#3B5BDB"/>
                <CheckChip label="테스트 커버리지" checked color="#3B5BDB"/>
                <CheckChip label="장애 알림 자동화" checked color="#3B5BDB"/>
                <CheckChip label="SRE 협업" checked color="#3B5BDB"/>
                <CheckChip label="캐시 최적화" color="#7C87A4"/>
                <CheckChip label="배포 자동화" color="#7C87A4"/>
              </div>
              <div style={{ marginTop: 12, fontSize: 11.5, color: "#5B6685", lineHeight: 1.5 }}>
                체크된 키워드들이 다음 단계 KR 초안의 기반이 됩니다.
              </div>
            </div>

          </div>
        </div>

        <WizardNav current={2}/>
      </div>
    </main>
  );
}

window.R1WriteStep2 = R1WriteStep2;
