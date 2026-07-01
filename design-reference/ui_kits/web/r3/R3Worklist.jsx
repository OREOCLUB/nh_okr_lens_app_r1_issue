// R3Worklist.jsx — 본부별 코칭 우선순위 워크리스트 (Console 드릴다운)
function R3Worklist() {
  const rows = [
    { hq: "운영본부",   mgr: "정태영", total: 78, candidates: 23, rate: 29.5, urgent: 6, top: ["측정모호 11", "건수형 9"],      member: "김** 외 5인", recent: "2일 전", status: "warn" },
    { hq: "사업본부",   mgr: "박진수", total: 64, candidates: 18, rate: 28.1, urgent: 4, top: ["자기보고형 8", "건수형 6"],     member: "이** 외 3인", recent: "오늘",   status: "warn" },
    { hq: "DX본부",     mgr: "김지훈", total: 52, candidates: 11, rate: 21.2, urgent: 2, top: ["공모형 5", "자기보고형 4"],     member: "박** 외 1인", recent: "1일 전", status: "mid" },
    { hq: "개발본부",   mgr: "이수연", total: 92, candidates: 18, rate: 19.6, urgent: 1, top: ["건수형 8", "공모형 5"],          member: "최**",         recent: "3일 전", status: "mid" },
    { hq: "인프라본부", mgr: "최우진", total: 41, candidates: 5,  rate: 12.2, urgent: 0, top: ["도전성저하 2", "통제불가 2"],    member: "—",              recent: "5일 전", status: "ok" },
    { hq: "재무본부",   mgr: "송지원", total: 28, candidates: 3,  rate: 10.7, urgent: 0, top: ["표현모호 2"],                    member: "—",              recent: "7일 전", status: "ok" },
    { hq: "마케팅본부", mgr: "황지민", total: 35, candidates: 6,  rate: 17.1, urgent: 1, top: ["통제불가 3", "건수형 2"],        member: "정**",           recent: "4일 전", status: "mid" },
    { hq: "고객본부",   mgr: "유주현", total: 47, candidates: 9,  rate: 19.1, urgent: 1, top: ["자기보고형 4", "측정모호 3"],    member: "한**",           recent: "2일 전", status: "mid" },
  ];

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="본부별 코칭 우선순위" subtitle="14본부 · 후보율 ≥ 10% 정렬"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 40px 56px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#7C87A4", marginBottom: 14 }}>
          <a href="./r3-hr.html" style={{ color: "#3B5BDB", textDecoration: "none" }}>캘리브레이션</a>
          <Icon name="chevronRight" size={11}/>
          <span>본부별 워크리스트</span>
        </div>

        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
          본부별 코칭 우선순위
        </h1>
        <p style={{ margin: "8px 0 22px", fontSize: 13, color: "#5B6685", lineHeight: 1.6 }}>
          평가자별 코칭 후보 비율과 긴급 건을 모았어요. 후보율 30% 임계 초과 본부부터 1on1 코칭을 권장합니다.
        </p>

        {/* Filter bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <button style={chipBtn}><Icon name="sort" size={13}/> 후보율 높은 순 <Icon name="chevronDown" size={11}/></button>
          <button style={chipBtn}><Icon name="filter" size={13}/> 상태 필터 <Icon name="chevronDown" size={11}/></button>
          <button style={chipBtn}><Icon name="search" size={13}/> 본부 검색</button>
          <div style={{ flex: 1 }}/>
          <Button variant="secondary" size="sm" leftIcon={<span>📥</span>}>Excel</Button>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "32px 130px 90px 70px 70px 1.2fr 50px 1.5fr 70px 70px",
            gap: 0, alignItems: "center",
            padding: "14px 20px",
            background: "#F9FAFC",
            borderBottom: "1px solid #E1E5EF",
            fontSize: 10.5, fontWeight: 700, color: "#7C87A4",
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>
            <div></div>
            <div>본부</div>
            <div>평가자</div>
            <div style={{ textAlign: "right" }}>전체 KR</div>
            <div style={{ textAlign: "right" }}>후보</div>
            <div style={{ paddingLeft: 14 }}>후보율</div>
            <div style={{ textAlign: "center" }}>긴급</div>
            <div style={{ paddingLeft: 14 }}>주요 위험 유형</div>
            <div style={{ textAlign: "right" }}>최근 활동</div>
            <div></div>
          </div>

          {rows.map((r, i) => {
            const tone = r.status === "warn" ? "#D98023" : r.status === "mid" ? "#3B5BDB" : "#2F9E5E";
            const toneLight = r.status === "warn" ? "#FFF7EC" : r.status === "mid" ? "#E5EBFB" : "#ECFAF1";
            return (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "32px 130px 90px 70px 70px 1.2fr 50px 1.5fr 70px 70px",
                gap: 0, alignItems: "center",
                padding: "14px 20px",
                borderBottom: i === rows.length - 1 ? "none" : "1px solid #ECEFF5",
              }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#A4ADC4", fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: tone }}/>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>{r.hq}</span>
                </div>
                <span style={{ fontSize: 12.5, color: "#3A4565" }}>{r.mgr}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "#5B6685", textAlign: "right" }}>{r.total}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: tone, textAlign: "right" }}>{r.candidates}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 14 }}>
                  <div style={{ flex: 1, height: 7, background: "#F4F7FB", borderRadius: 3, overflow: "hidden", position: "relative" }}>
                    <div style={{ position: "absolute", left: "30%", top: 0, bottom: 0, width: 1.5, background: "#D14343", opacity: 0.5 }}/>
                    <div style={{ height: "100%", width: `${Math.min(r.rate, 50) * 2}%`, background: tone, borderRadius: 3 }}/>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: tone, minWidth: 42, textAlign: "right" }}>{r.rate.toFixed(1)}%</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  {r.urgent > 0 ? (
                    <span style={{ padding: "3px 8px", borderRadius: 999, background: r.urgent >= 5 ? "#FDECEC" : toneLight, color: r.urgent >= 5 ? "#D14343" : tone, fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{r.urgent}</span>
                  ) : <span style={{ color: "#A4ADC4", fontSize: 11 }}>—</span>}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingLeft: 14 }}>
                  {r.top.map((t, ti) => (
                    <span key={ti} style={{
                      padding: "2px 7px", borderRadius: 5,
                      background: "#FDECEC", color: "#D14343",
                      fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
                    }}>{t}</span>
                  ))}
                </div>
                <span style={{ fontSize: 10.5, color: "#7C87A4", textAlign: "right" }}>{r.recent}</span>
                <div style={{ textAlign: "right" }}>
                  <Button variant="secondary" size="sm">코칭 →</Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 20, padding: "16px 22px",
          background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 12,
          display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: "#7A4A14",
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div style={{ flex: 1, lineHeight: 1.6 }}>
            <b>운영본부 · 사업본부</b>가 임계 30% 근접 또는 초과예요. 평가자와 1on1 코칭 일정을 잡아주세요.
          </div>
          <Button variant="primary" size="sm" rightIcon={<Icon name="calendar" size={13}/>}>코칭 일정 잡기</Button>
        </div>

      </div>
    </main>
  );
}

const chipBtn = {
  display: "flex", alignItems: "center", gap: 7,
  padding: "8px 12px",
  background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10,
  fontSize: 12.5, color: "#1F2A4A", fontWeight: 500,
  cursor: "pointer", fontFamily: "var(--font-sans)",
};
window.R3Worklist = R3Worklist;
