// STEP 3 — AI 정제 대화 (객관성 + 주관성 검증)

function ChatMsg({ from, message, time, special }) {
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
          padding: "11px 14px",
          background: isAI ? "#fff" : "#3B5BDB",
          color: isAI ? "#1F2A4A" : "#fff",
          border: isAI ? "1px solid #E1E5EF" : "none",
          borderRadius: isAI ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
          fontSize: 13.5, lineHeight: 1.6,
        }}>{message}</div>
      </div>
    </div>
  );
}

function RefinementCard({ before, after, reason }) {
  return (
    <div style={{ marginLeft: 42, marginBottom: 14, background: "linear-gradient(135deg, #ECFAF1, #fff 70%)", border: "1px solid #BBE9CC", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#1F5538", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <span>💎</span> AI 정제 제안
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr", gap: 12, alignItems: "center", marginBottom: 10 }}>
        <div style={{ padding: "10px 12px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 9 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "#D98023", marginBottom: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>BEFORE</div>
          <div style={{ fontSize: 12.5, color: "#7A4A14", lineHeight: 1.5 }}>{before}</div>
        </div>
        <div style={{ textAlign: "center", fontSize: 20, color: "#2F9E5E" }}>→</div>
        <div style={{ padding: "10px 12px", background: "#fff", border: "1.5px solid #2F9E5E", borderRadius: 9 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "#2F9E5E", marginBottom: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>AFTER</div>
          <div style={{ fontSize: 12.5, color: "#0F1A36", fontWeight: 500, lineHeight: 1.5 }}>{after}</div>
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: "#1F5538", lineHeight: 1.55, marginBottom: 10 }}>
        <b>이유:</b> {reason}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <Button variant="success" size="sm">이대로 적용</Button>
        <Button variant="secondary" size="sm">조금 수정해서</Button>
        <Button variant="ghost" size="sm">건너뛰기</Button>
      </div>
    </div>
  );
}

function SubjectivityAlert({ phrase, reason }) {
  return (
    <div style={{ marginLeft: 42, marginBottom: 14, background: "linear-gradient(135deg, #FFF7EC, #fff 70%)", border: "1px solid #FFE0BA", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: "#D98023", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🛡️</span>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#7A4A14" }}>잠시만요, 다시 한 번 확인해볼까요?</div>
      </div>
      <div style={{ padding: "8px 12px", background: "#fff", border: "1px solid #FFE0BA", borderRadius: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 10.5, color: "#9C5E26", fontWeight: 600, marginBottom: 3 }}>입력하신 표현</div>
        <div style={{ fontSize: 13, color: "#7A4A14", fontStyle: "italic" }}>"{phrase}"</div>
      </div>
      <div style={{ fontSize: 11.5, color: "#7A4A14", lineHeight: 1.55, marginBottom: 10 }}>
        {reason}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <Button variant="primary" size="sm">객관적으로 다시 표현하기</Button>
        <Button variant="ghost" size="sm">그대로 진행</Button>
      </div>
    </div>
  );
}

function R1WriteStep3() {
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="OKR 작성" subtitle="STEP 3 / 7 · AI 정제 대화"/>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Main chat area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px 32px", minWidth: 0 }}>
          <WizardBreadcrumb stepLabel="STEP 3 · AI 정제 대화"/>
          <WizardStepHeader current={3}/>
          <WizardHero
            stepNum={3}
            title="AI와 대화하면서 KR 후보를 정제해요"
            desc="객관적 측정 가능성과 도전성을 함께 점검합니다. 주관적 표현은 자동으로 알려드려요."
          />

          {/* Chat */}
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "22px 24px" }}>

            {/* Date separator */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: "#ECEFF5" }}/>
              <span style={{ fontSize: 11, color: "#7C87A4", fontWeight: 600, fontFamily: "var(--font-mono)" }}>객관성 검증 · KR 1/3</span>
              <div style={{ flex: 1, height: 1, background: "#ECEFF5" }}/>
            </div>

            <ChatMsg from="ai" time="14:30"
              message={<>이제 KR 후보를 하나씩 정제해볼게요. 첫 번째 KR부터 시작합니다.<br/><br/>
              <b style={{ color: "#0F1A36" }}>"결제 게이트웨이 응답속도를 850→500ms로 단축"</b> — 이 목표는 측정 가능성이 명확해서 좋아요!<br/><br/>
              한 가지만 더 명료하게 해볼까요? <b style={{ color: "#0F1A36" }}>"응답속도"</b>는 평균인가요, p95인가요, p99인가요? 정확한 통계 단위를 정해주세요.</>}/>

            <ChatMsg from="user" time="14:31"
              message="p95로 측정할 거예요. APM 도구에 이미 대시보드가 있어서요."/>

            <ChatMsg from="ai" time="14:31"
              message={<>완벽해요. 그럼 KR 문장을 더 명료하게 정제해볼게요:</>}/>

            <RefinementCard
              before="결제 게이트웨이 응답속도를 850ms → 500ms로 단축"
              after="결제 게이트웨이 APM p95 응답속도(월평균)를 850ms → 500ms로 단축"
              reason="측정 단위(p95), 측정 도구(APM), 집계 주기(월평균)를 명시하면 평가자가 더 쉽게 확인할 수 있어요. 명세서 §체크리스트 No.1 '수치 측정 가능성' 통과 ✓"
            />

            {/* 두 번째 KR 검증 */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, marginTop: 8 }}>
              <div style={{ flex: 1, height: 1, background: "#ECEFF5" }}/>
              <span style={{ fontSize: 11, color: "#7C87A4", fontWeight: 600, fontFamily: "var(--font-mono)" }}>주관성 검증 · KR 2/3</span>
              <div style={{ flex: 1, height: 1, background: "#ECEFF5" }}/>
            </div>

            <ChatMsg from="ai" time="14:33"
              message={<>두 번째 KR로 넘어갈게요. <b style={{ color: "#0F1A36" }}>"단위테스트 커버리지 65 → 85%"</b> 인데, 왜 85%로 정하셨는지 여쭤봐도 될까요?</>}/>

            <ChatMsg from="user" time="14:34"
              message="작년에 옆 팀도 80%였고, 우리 팀도 그쯤 가는 게 좋을 것 같아서요. 사실 60대도 충분히 안정적이긴 한데..."/>

            <SubjectivityAlert
              phrase="옆 팀도 80%였고 우리 팀도 그쯤 가는 게 좋을 것 같아서요"
              reason="다른 팀과의 비교만으로 목표를 정하면, 우리 팀의 실제 필요(회귀 리스크, 장애 발생 빈도)와 어긋날 수 있어요. 객관적 근거(예: 작년 회귀 장애 N건, 인증 모듈 영향 범위)를 함께 고려하면 더 설득력 있는 KR이 돼요."
            />

            <ChatMsg from="user" time="14:36"
              message="그렇네요. 우리 인증 모듈이 작년에 회귀 장애 3건 있었고, 그 중 2건이 테스트 부족 영역이었어요. 85%까지 올려놓으면 해당 영역까지 커버되는 게 맞을 것 같아요."/>

            <ChatMsg from="ai" time="14:36"
              message={<>훌륭한 근거예요! 그 내용을 KR에 녹여낼게요:</>}/>

            <RefinementCard
              before="결제 인증모듈 단위테스트 커버리지 65% → 85%"
              after="결제 인증모듈 단위테스트 커버리지를 65% → 85%로 향상 (작년 회귀 장애 3건 중 2건 발생 영역 100% 커버)"
              reason="목표 수치만이 아니라 '왜 그 수치인지'의 근거를 함께 남기면, 평가자가 코칭하기도 좋고 본인도 진행 점검 시 길을 잃지 않아요."
            />

            {/* Validation summary */}
            <div style={{ marginTop: 22, padding: "16px 18px", background: "#F1F4FD", border: "1px solid #C5D0F7", borderRadius: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#213A8C", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span>✨</span> 현재까지의 점검 결과
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { l: "측정 명확성", v: "3/3", c: "#2F9E5E" },
                  { l: "외부 의존도", v: "2/3", c: "#D98023", n: "SRE 협업 확인" },
                  { l: "주관성 표현", v: "1건 정제", c: "#2F9E5E" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #C5D0F7", borderRadius: 9, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, color: "#5B6685" }}>{s.l}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: s.c, fontVariantNumeric: "tabular-nums", marginTop: 4, fontFamily: "var(--font-mono)" }}>{s.v}</div>
                    {s.n && <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 2 }}>{s.n}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Composer */}
          <div style={{ marginTop: 18, padding: "14px 16px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <button style={{ padding: "5px 11px", background: "#F4F7FB", color: "#3A4565", border: "1px solid #E1E5EF", borderRadius: 999, fontSize: 11.5, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>다음 KR로 넘어가기</button>
              <button style={{ padding: "5px 11px", background: "#F4F7FB", color: "#3A4565", border: "1px solid #E1E5EF", borderRadius: 999, fontSize: 11.5, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>측정 방법 한 번 더 점검</button>
              <button style={{ padding: "5px 11px", background: "#F4F7FB", color: "#3A4565", border: "1px solid #E1E5EF", borderRadius: 999, fontSize: 11.5, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>운영안 가이드 확인</button>
            </div>
            <div style={{ background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "flex-end", gap: 10 }}>
              <textarea placeholder="답변하거나 추가 질문을 입력해주세요..." rows="2" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 13, color: "#0F1A36", resize: "none", lineHeight: 1.5 }}/>
              <button style={{ width: 32, height: 32, borderRadius: 9, background: "#3B5BDB", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", flexShrink: 0 }}>↑</button>
            </div>
          </div>

          <WizardNav current={3}/>
        </div>

        {/* Right sidebar — KR candidates */}
        <div style={{ width: 320, background: "#fff", borderLeft: "1px solid #E1E5EF", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid #ECEFF5" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>현재 KR 후보</div>
            <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 3 }}>대화를 거치며 정제됩니다</div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
            {/* KR 1 - refined */}
            <div style={{ background: "#ECFAF1", border: "1px solid #BBE9CC", borderRadius: 11, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#1F5538", fontWeight: 700 }}>KR 01</span>
                <span style={{ padding: "1px 6px", borderRadius: 4, background: "#2F9E5E", color: "#fff", fontSize: 9.5, fontWeight: 700 }}>✓ 정제 완료</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#0F1A36", lineHeight: 1.5, fontWeight: 500 }}>
                결제 게이트웨이 APM p95 응답속도(월평균)를 850ms → 500ms로 단축
              </div>
            </div>

            {/* KR 2 - in progress */}
            <div style={{ background: "#F1F4FD", border: "1.5px solid #3B5BDB", borderRadius: 11, padding: "12px 14px", boxShadow: "0 0 0 3px rgba(59,91,219,.10)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#213A8C", fontWeight: 700 }}>KR 02</span>
                <span style={{ padding: "1px 6px", borderRadius: 4, background: "#3B5BDB", color: "#fff", fontSize: 9.5, fontWeight: 700 }}>● 정제 중</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#0F1A36", lineHeight: 1.5, fontWeight: 500 }}>
                결제 인증모듈 단위테스트 커버리지를 65% → 85%로 향상 (회귀 장애 영역 100% 커버)
              </div>
            </div>

            {/* KR 3 - waiting */}
            <div style={{ background: "#F9FAFC", border: "1px dashed #C8CFDF", borderRadius: 11, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#7C87A4", fontWeight: 700 }}>KR 03</span>
                <span style={{ padding: "1px 6px", borderRadius: 4, background: "#F4F7FB", color: "#7C87A4", fontSize: 9.5, fontWeight: 700 }}>○ 대기</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#5B6685", lineHeight: 1.5 }}>
                장애 알림 자동화 4단계 중 3단계까지 완료 <span style={{ color: "#A4ADC4" }}>(측정 방법 미정)</span>
              </div>
            </div>

            {/* Checklist preview */}
            <div style={{ marginTop: 8, padding: "12px 14px", background: "linear-gradient(135deg, #1B2A4E, #2C3E68)", color: "#fff", borderRadius: 11 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span>✨</span> 11항목 사전 검토 · 실시간
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 6, color: "#91A6F0" }}>
                <span>현재 통과</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#fff" }}>7 / 11</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.12)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: "64%", background: "#3FC1D1", borderRadius: 3 }}/>
              </div>
              <div style={{ fontSize: 10.5, color: "#C5D0F7", lineHeight: 1.5 }}>
                정제를 진행하면 통과 항목이 늘어나요. STEP 6에서 자세히 확인할 수 있어요.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

window.R1WriteStep3 = R1WriteStep3;
