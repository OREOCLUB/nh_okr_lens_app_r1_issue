// R1Home.jsx — 피평가자 메인 홈

function StatCardR1({ icon, iconBg, iconFg, label, value, unit, sub, subTone }) {
  const subColor = subTone === "ok" ? "#2F9E5E" : subTone === "warn" ? "#D98023" : "#7C87A4";
  return (
    <div style={{
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      padding: "20px 22px", boxShadow: "0 1px 2px rgba(31,42,74,.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11,
          background: iconBg, color: iconFg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17,
        }}>{icon}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#5B6685" }}>{label}</div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: "#0F1A36", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {value}{unit && <span style={{ fontSize: 15, color: "#7C87A4", fontWeight: 500, marginLeft: 4 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 12, fontWeight: 500, marginTop: 8, color: subColor }}>{sub}</div>}
    </div>
  );
}

function OKRItem({ obj, kr, format, baseline, goal, weight, progress, status, evaluator }) {
  const statusMap = {
    submitted:  { bg: "#EFF4FE", bd: "#C5D5F7", fg: "#2B5DD9", label: "제출 · 검토 대기" },
    approved:   { bg: "#ECFAF1", bd: "#BBE9CC", fg: "#2F9E5E", label: "승인 완료" },
    draft:      { bg: "#F1F3F8", bd: "#E1E5EF", fg: "#5B6685", label: "작성 중" },
    rejected:   { bg: "#FFF0F0", bd: "#FFD4D4", fg: "#D14343", label: "조정 필요" },
  };
  const s = statusMap[status];
  return (
    <div style={{
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      padding: "20px 22px", boxShadow: "0 1px 2px rgba(31,42,74,.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{
          padding: "3px 10px", borderRadius: 999,
          background: s.bg, border: `1px solid ${s.bd}`, color: s.fg,
          fontSize: 11.5, fontWeight: 600,
        }}>{s.label}</span>
        <span style={{
          padding: "3px 10px", borderRadius: 999,
          background: "#F4F7FB", border: "1px solid #E1E5EF", color: "#5B6685",
          fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-mono)",
        }}>KR · {format}</span>
        <span style={{ fontSize: 11.5, color: "#7C87A4", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
          가중치 {weight}%
        </span>
      </div>
      <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 3 }}>{obj}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#0F1A36", lineHeight: 1.5, letterSpacing: "-0.01em" }}>{kr}</div>

      {/* Progress */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 11.5, color: "#5B6685", fontWeight: 500 }}>진행률</span>
          <div style={{ flex: 1, height: 8, background: "#F4F7FB", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: progress >= 70 ? "#2F9E5E" : progress >= 40 ? "#3B5BDB" : "#D98023", borderRadius: 4 }}/>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36", fontVariantNumeric: "tabular-nums", minWidth: 38, textAlign: "right" }}>{progress}%</span>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11.5, color: "#5B6685", fontFamily: "var(--font-mono)" }}>
          <div>Baseline: <span style={{ color: "#0F1A36", fontWeight: 600 }}>{baseline}</span></div>
          <div>Goal: <span style={{ color: "#3B5BDB", fontWeight: 600 }}>{goal}</span></div>
        </div>
      </div>

      {/* Evaluator note */}
      {evaluator && (
        <div style={{
          marginTop: 14, padding: "10px 12px",
          background: "#F1F4FD", borderRadius: 10,
          display: "flex", alignItems: "flex-start", gap: 8,
          fontSize: 12.5, color: "#3A4565", lineHeight: 1.55,
        }}>
          <span style={{ color: "#3B5BDB", fontSize: 14 }}>💬</span>
          <div>
            <b style={{ color: "#1B2A4E" }}>{evaluator.from} 팀장</b> · "{evaluator.msg}"
          </div>
        </div>
      )}
    </div>
  );
}

function AICoachingCard() {
  const tips = [
    { tag: "측정 명확화", msg: "Baseline과 Goal에 동일 단위(ms)를 사용하면 진행률이 더 또렷해져요.", tone: "info" },
    { tag: "도전성", msg: "전월 대비 8% 개선은 좋은 출발입니다. 마일스톤을 한 단계 더 잡아볼까요?", tone: "ok" },
    { tag: "증빙", msg: "APM 캡처를 주간 코칭 메모에 첨부하면 평가 시 더 수월합니다.", tone: "info" },
  ];
  const tones = {
    ok:   { dot: "#2F9E5E", bg: "#ECFAF1", bd: "#BBE9CC" },
    info: { dot: "#3B5BDB", bg: "#F1F4FD", bd: "#C5D0F7" },
    warn: { dot: "#D98023", bg: "#FFF7EC", bd: "#FFE0BA" },
  };
  return (
    <div style={{
      background: "linear-gradient(135deg, #1B2A4E 0%, #2C3E68 100%)",
      color: "#fff", borderRadius: 16, padding: "22px 22px",
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11,
          background: "#3B5BDB",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
        }}>✨</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>AI 코칭 인사이트</div>
          <div style={{ fontSize: 11.5, color: "#91A6F0", marginTop: 2 }}>오늘의 맞춤 제안 3건</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span style={{
            padding: "3px 8px", borderRadius: 6,
            background: "rgba(145,166,240,0.18)", color: "#C5D0F7",
            fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em",
          }}>NEW</span>
        </div>
      </div>
      {tips.map((t, i) => {
        const c = tones[t.tone];
        return (
          <div key={i} style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            padding: "11px 12px", background: "rgba(255,255,255,0.06)",
            borderRadius: 10,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, marginTop: 6, flexShrink: 0 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#91A6F0", marginBottom: 3, letterSpacing: "0.02em" }}>{t.tag}</div>
              <div style={{ fontSize: 12.5, color: "#E5EBFB", lineHeight: 1.55 }}>{t.msg}</div>
            </div>
          </div>
        );
      })}
      <a href="./r1-coaching.html" style={{ textDecoration: "none" }}>
        <button style={{
          background: "#fff", color: "#1B2A4E",
          border: "none", borderRadius: 10, width: "100%",
          padding: "12px", fontSize: 13.5, fontWeight: 700,
          cursor: "pointer", fontFamily: "var(--font-sans)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          ✨ 더 자세한 코칭 받기
        </button>
      </a>
    </div>
  );
}

function ScheduleCardR1() {
  const items = [
    { date: "07/15", day: "오늘 · 10:00", title: "정태영 팀장 1on1", tone: "info" },
    { date: "07/17", day: "이번주 목", title: "분기 중간 점검", tone: "ok" },
    { date: "07/22", day: "다음주 화", title: "정태영 팀장 1on1", tone: "info" },
    { date: "07/30", day: "7월 말", title: "OKR 등록 마감", tone: "warn" },
  ];
  const tones = {
    warn: { bg: "#FFF7EC", fg: "#D98023" },
    info: { bg: "#EFF4FE", fg: "#2B5DD9" },
    ok:   { bg: "#ECFAF1", fg: "#2F9E5E" },
  };
  return (
    <div style={{
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      padding: "18px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F1A36" }}>다가오는 일정</div>
        <a href="./r1-calendar.html" style={{ fontSize: 12, color: "#3B5BDB", fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>캘린더 ›</a>
      </div>
      {items.map((e, i) => {
        const t = tones[e.tone];
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < items.length - 1 ? "1px solid #ECEFF5" : "none" }}>
            <div style={{
              width: 52, padding: "7px 0",
              background: t.bg, color: t.fg,
              borderRadius: 10,
              textAlign: "center", flexShrink: 0,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>{e.date}</div>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F1A36" }}>{e.title}</div>
              <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2 }}>{e.day}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function R1Home() {
  const okrs = [
    {
      status: "approved",
      obj: "Objective · 핵심 서비스 응답속도 개선",
      kr: "결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축한다.",
      format: "수치", baseline: "850ms", goal: "500ms",
      weight: 30, progress: 72,
      evaluator: { from: "정태영", msg: "측정 방법이 명료해서 좋습니다. 이대로 진행해주세요." },
    },
    {
      status: "submitted",
      obj: "Objective · 결제 인증 모듈 안정화",
      kr: "결제 인증모듈 단위테스트 커버리지를 65% → 85%로 끌어올린다.",
      format: "수치", baseline: "65%", goal: "85%",
      weight: 25, progress: 45,
    },
    {
      status: "draft",
      obj: "Objective · 운영 자동화",
      kr: "장애 알림 룰 자동화 마일스톤 4단계 중 3단계까지 완료한다.",
      format: "마일스톤", baseline: "1/4", goal: "3/4",
      weight: 20, progress: 25,
    },
  ];

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="피평가자 홈" subtitle="김지훈 · 운영본부 · 결제플랫폼팀"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px 40px" }}>

        {/* Hero greeting */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 하반기 · OKR 등록 진행 중</div>
            <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              안녕하세요, 김지훈 님 👋
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14.5, color: "#5B6685" }}>
              마감까지 15일 남았어요. KR 3개 중 1개는 아직 작성 중이네요.
            </p>
          </div>
          <div style={{ flex: 1 }}/>
          <Button variant="secondary" leftIcon={<Icon name="message" size={15}/>} onClick={() => window.notYet("피드백 보기 화면")}>피드백 보기</Button>
          <a href="./r1-coaching.html" style={{ textDecoration: "none" }}>
            <Button variant="primary" leftIcon={<span>✨</span>}>AI 코칭 받기</Button>
          </a>
        </div>

        {/* ★ OKR 작성 CTA — Hero Banner (강조) */}
        <a href="./r1-write-step1.html" style={{ textDecoration: "none", display: "block", marginBottom: 24 }}>
          <div style={{
            background: "linear-gradient(135deg, #3B5BDB 0%, #2C49B8 60%, #1B2A4E 100%)",
            borderRadius: 16, padding: "24px 28px", color: "#fff",
            display: "flex", alignItems: "center", gap: 20,
            boxShadow: "0 12px 32px -12px rgba(59,91,219,.55)",
            position: "relative", overflow: "hidden",
            cursor: "pointer", transition: "transform 220ms cubic-bezier(0.16,1,0.3,1), box-shadow 220ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 20px 40px -12px rgba(59,91,219,.65)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 12px 32px -12px rgba(59,91,219,.55)"; }}
          >
            {/* Deco circle */}
            <div style={{ position: "absolute", right: -60, top: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }}/>
            <div style={{ position: "absolute", right: 40, bottom: -40, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }}/>

            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, flexShrink: 0, position: "relative", zIndex: 1,
            }}>🎯</div>

            <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, opacity: 0.85, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ padding: "3px 9px", background: "rgba(255,255,255,0.2)", borderRadius: 999 }}>지금 할 일</span>
                <span>D-15 · OKR 등록 마감까지</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 4 }}>
                이번 반기 OKR을 작성해볼까요?
              </div>
              <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.5 }}>
                8단계 위저드로 KR을 정제하고 AI 코칭과 함께 완성해요 · <b>3/8 단계 진행 중</b>
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#fff", color: "#2C49B8",
              padding: "14px 22px", borderRadius: 12,
              fontSize: 14.5, fontWeight: 800,
              flexShrink: 0, position: "relative", zIndex: 1,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}>
              OKR 이어서 작성 <span style={{ fontSize: 16 }}>→</span>
            </div>
          </div>
        </a>

        {/* Stat cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16,
          marginBottom: 24,
        }}>
          <StatCardR1 icon="🎯" iconBg="#E5EBFB" iconFg="#3B5BDB"
            label="OKR 달성률" value="72" unit="%" sub="↑ 8% 전월 대비" subTone="ok"/>
          <StatCardR1 icon="✓" iconBg="#ECFAF1" iconFg="#2F9E5E"
            label="나의 핵심결과" value="8" unit="/ 11" sub="진행 중"/>
          <StatCardR1 icon="💬" iconBg="#FFEDE2" iconFg="#E07A3C"
            label="받은 피드백" value="14" unit="건" sub="이번 분기"/>
          <StatCardR1 icon="✨" iconBg="#F0E9FB" iconFg="#7C4DD9"
            label="AI 코칭 제안" value="3" unit="건" sub="새로운 제안" subTone="ok"/>
        </div>

        {/* Two column */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
          {/* Left — OKR list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 2 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>나의 OKR</div>
                <div style={{ fontSize: 12.5, color: "#7C87A4", marginTop: 3 }}>2026 하반기 · 총 3개 · 가중치 75 / 110</div>
              </div>
              <Button variant="ai" size="sm" leftIcon={<span>+</span>}>KR 추가</Button>
            </div>
            {okrs.map((o, i) => <OKRItem key={i} {...o}/>)}
          </div>

          {/* Right — AI Coaching + Schedule */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <AICoachingCard/>
            <ScheduleCardR1/>
          </div>
        </div>

        {/* Helper */}
        <div style={{
          marginTop: 28, padding: "14px 18px",
          background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12,
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 12.5, color: "#5B6685", lineHeight: 1.55,
        }}>
          <span style={{ fontSize: 16 }}>💡</span>
          AI 코칭은 참고용 신호입니다. 평가에 직접 반영되지 않으며, 더 좋은 KR을 함께 만들기 위한 제안이에요.
        </div>
      </div>
    </main>
  );
}

window.R1Home = R1Home;
