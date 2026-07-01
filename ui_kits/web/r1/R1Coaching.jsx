// R1Coaching.jsx — AI 코칭 채팅 페이지

function ChatBubble({ from, message, time, suggestions }) {
  const isAI = from === "ai";
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 18, flexDirection: isAI ? "row" : "row-reverse" }}>
      <div style={{
        width: 36, height: 36, borderRadius: 11,
        background: isAI ? "linear-gradient(135deg, #3B5BDB, #5C7AE6)" : "#E5EBFB",
        color: isAI ? "#fff" : "#213A8C",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0,
      }}>{isAI ? "✨" : "김"}</div>
      <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: 5, alignItems: isAI ? "flex-start" : "flex-end" }}>
        <div style={{ fontSize: 11.5, color: "#7C87A4", fontWeight: 600 }}>{isAI ? "AI 코치" : "김지훈"} · <span style={{ color: "#A4ADC4", fontWeight: 500 }}>{time}</span></div>
        <div style={{
          padding: "12px 16px",
          background: isAI ? "#fff" : "#3B5BDB",
          color: isAI ? "#1F2A4A" : "#fff",
          border: isAI ? "1px solid #E1E5EF" : "none",
          borderRadius: isAI ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
          fontSize: 14, lineHeight: 1.6,
          boxShadow: "0 1px 2px rgba(31,42,74,.04)",
        }}>{message}</div>
        {suggestions && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {suggestions.map((s, i) => (
              <button key={i} style={{
                padding: "6px 12px", background: "#F1F4FD", color: "#213A8C",
                border: "1px solid #C5D0F7", borderRadius: 999,
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)",
              }}>{s}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CoachingTopic({ icon, iconBg, iconFg, title, desc, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: active ? "#fff" : "#F9FAFC",
      border: `1px solid ${active ? "#3B5BDB" : "#E1E5EF"}`,
      borderRadius: 12, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      cursor: "pointer",
      boxShadow: active ? "0 0 0 3px rgba(59,91,219,.10)" : "none",
      transition: "all 140ms ease-out",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: iconBg, color: iconFg,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F1A36" }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{desc}</div>
      </div>
    </div>
  );
}

function ContextCard() {
  return (
    <div style={{ background: "linear-gradient(135deg, #F1F4FD, #fff 90%)", border: "1px solid #C5D0F7", borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>📎 함께 보는 KR</div>
      <div style={{ fontSize: 11, color: "#7C87A4", marginBottom: 4, fontFamily: "var(--font-mono)" }}>KR_2026_001</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36", lineHeight: 1.5, marginBottom: 10 }}>
        결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축한다.
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 11.5, color: "#5B6685", fontFamily: "var(--font-mono)", paddingTop: 10, borderTop: "1px dashed #C5D0F7" }}>
        <span>📍 현재: <b style={{ color: "#3B5BDB" }}>598ms</b></span>
        <span>🎯 목표: <b style={{ color: "#2F9E5E" }}>500ms</b></span>
        <span style={{ marginLeft: "auto" }}>진행 <b style={{ color: "#0F1A36" }}>72%</b></span>
      </div>
    </div>
  );
}

function R1Coaching() {
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="AI 코칭" subtitle="김지훈 · 누적 코칭 23회"/>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left sidebar - topics */}
        <div style={{ width: 320, borderRight: "1px solid #E1E5EF", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid #ECEFF5" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36", marginBottom: 10 }}>코칭 주제</div>
            <Button variant="primary" size="sm" leftIcon={<span>+</span>} style={{ width: "100%" }}>새 코칭 시작</Button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 4px 6px" }}>오늘</div>
            <CoachingTopic icon="🎯" iconBg="#E5EBFB" iconFg="#3B5BDB"
              title="KR 01 진행 점검" desc="응답속도 개선 진행 정체에 대해..." active/>
            <CoachingTopic icon="📈" iconBg="#ECFAF1" iconFg="#2F9E5E"
              title="진행률 업데이트 방법" desc="주간 업데이트를 어떻게 기록..."/>

            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", padding: "10px 4px 6px" }}>이번주</div>
            <CoachingTopic icon="💬" iconBg="#FFEDE2" iconFg="#E07A3C"
              title="평가자 피드백 해석" desc="정태영 팀장님의 코멘트 의미를..."/>
            <CoachingTopic icon="✨" iconBg="#F0E9FB" iconFg="#7C4DD9"
              title="KR 03 측정 방법 보완" desc="마일스톤 산출물을 더 구체적으로..."/>

            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", padding: "10px 4px 6px" }}>지난주</div>
            <CoachingTopic icon="🔍" iconBg="#F4F7FB" iconFg="#5B6685"
              title="이전 OKR 회고" desc="2025 하반기 OKR 결과를 바탕..."/>
            <CoachingTopic icon="🎯" iconBg="#F4F7FB" iconFg="#5B6685"
              title="가중치 분배 상담" desc="3개 KR의 가중치를 어떻게..."/>
          </div>
        </div>

        {/* Main chat area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#F4F7FB" }}>

          {/* Chat header */}
          <div style={{
            padding: "18px 28px",
            background: "#fff", borderBottom: "1px solid #E1E5EF",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>KR 01 진행 점검</div>
              <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2F9E5E" }}/>
                AI 코치 활성 · 응답 평균 1.2초
              </div>
            </div>
            <Button variant="secondary" size="sm" leftIcon={<Icon name="library" size={13}/>}>코칭 내보내기</Button>
            <Button variant="ghost" size="sm" leftIcon={<Icon name="more" size={13}/>}/>
          </div>

          {/* Chat scroll area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            <div style={{ maxWidth: 820, margin: "0 auto" }}>

              {/* Context */}
              <div style={{ marginBottom: 22 }}>
                <ContextCard/>
              </div>

              {/* Date separator */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <div style={{ flex: 1, height: 1, background: "#E1E5EF" }}/>
                <span style={{ fontSize: 11.5, color: "#7C87A4", fontWeight: 600, fontFamily: "var(--font-mono)" }}>오늘 · 2026-07-15</span>
                <div style={{ flex: 1, height: 1, background: "#E1E5EF" }}/>
              </div>

              <ChatBubble from="user" time="14:18"
                message="KR 01 응답속도 개선이 6월 이후로 정체된 느낌이에요. 어떻게 진행해야 좋을까요?"/>

              <ChatBubble from="ai" time="14:18"
                message={<>
                  좋은 질문이에요. 데이터를 보니 <b style={{ color: "#0F1A36" }}>850ms → 598ms</b>까지 와 있고, 목표인 <b style={{ color: "#2F9E5E" }}>500ms</b>까지는 약 <b>16% 추가 개선</b>이 필요해요. 진행률 72%는 좋은 진척이지만, 후반부 개선이 더 어려운 게 일반적입니다.<br/><br/>
                  보통 이 구간에서는 세 가지 접근이 효과적이에요:
                </>}/>

              <div style={{ marginLeft: 48, marginBottom: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { num: "1", title: "병목 재분석", desc: "APM trace에서 가장 큰 segment 3개를 다시 확인" },
                  { num: "2", title: "캐시 적중률 점검", desc: "최근 캐시 적용 효과가 6/22 이후 둔화되었는지 확인" },
                  { num: "3", title: "P99 동향 병행 관측", desc: "P95만 보면 놓치는 outlier가 있을 수 있어요" },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10,
                    padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12,
                  }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: "#F1F4FD", color: "#3B5BDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", flexShrink: 0 }}>{s.num}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36" }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: "#5B6685", marginTop: 2, lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <ChatBubble from="user" time="14:21"
                message="병목 재분석은 SRE팀 도움이 필요한데, 어떻게 협업 요청을 하면 좋을까요?"/>

              <ChatBubble from="ai" time="14:21"
                message={<>
                  SRE팀에 협업 요청을 할 때는 <b style={{ color: "#0F1A36" }}>"무엇을 / 왜 / 언제까지"</b>를 명확히 하면 좋아요. 메시지 초안을 만들어 드릴게요. 어떤 톤이 좋을까요?
                </>}
                suggestions={["공식 요청 메일", "팀 채널에 캐주얼하게", "정태영 팀장님 통해 전달"]}
              />

              {/* Coaching summary card */}
              <div style={{
                margin: "18px 0", padding: "16px 18px",
                background: "linear-gradient(135deg, #ECFAF1, #fff 70%)",
                border: "1px solid #BBE9CC", borderRadius: 12,
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "#2F9E5E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💡</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1F5538", letterSpacing: "0.02em" }}>이번 코칭의 액션 아이템 (자동 추출)</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                    {["APM trace에서 상위 segment 3개 재확인 (이번주)", "캐시 적중률 6/22 이후 변동 분석 (이번주)", "SRE팀 협업 요청 메일 발송 (오늘)"].map((a, i) => (
                      <div key={i} style={{ fontSize: 12.5, color: "#1F5538", display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ color: "#2F9E5E", fontWeight: 700 }}>□</span> {a}
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="success" size="sm">코칭 메모 저장</Button>
              </div>

            </div>
          </div>

          {/* Composer */}
          <div style={{
            padding: "16px 28px 20px",
            background: "#fff", borderTop: "1px solid #E1E5EF",
          }}>
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
              {/* Quick suggestions */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                {["📊 진행률 분석해줘", "✍️ KR 다시 정제해줘", "💬 평가자에게 메시지 초안", "📈 다음 마일스톤 추천"].map((s, i) => (
                  <button key={i} style={{
                    padding: "6px 12px", background: "#F4F7FB", color: "#3A4565",
                    border: "1px solid #E1E5EF", borderRadius: 999,
                    fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)",
                  }}>{s}</button>
                ))}
              </div>
              <div style={{
                background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 14,
                padding: "10px 14px", display: "flex", alignItems: "flex-end", gap: 10,
              }}>
                <textarea placeholder="궁금한 점이나 코칭받고 싶은 주제를 입력해주세요…" rows="2" style={{
                  flex: 1, border: "none", outline: "none", background: "transparent",
                  fontFamily: "var(--font-sans)", fontSize: 14, color: "#0F1A36",
                  resize: "none", lineHeight: 1.5,
                }}/>
                <button style={{ width: 30, height: 30, borderRadius: 8, background: "#F4F7FB", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#5B6685", flexShrink: 0 }}>📎</button>
                <button style={{
                  width: 36, height: 36, borderRadius: 10, background: "#3B5BDB", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff",
                  fontSize: 14, flexShrink: 0,
                }}>↑</button>
              </div>
              <div style={{ fontSize: 11, color: "#A4ADC4", marginTop: 8, textAlign: "center" }}>
                AI 코칭 응답은 참고용이에요. 평가에 직접 반영되지 않으며, 코칭 내용은 본인만 볼 수 있어요.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

window.R1Coaching = R1Coaching;
