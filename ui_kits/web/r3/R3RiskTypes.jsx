// R3RiskTypes.jsx — 위험 유형 11종 상세 분석 (Console 드릴다운)
function R3RiskTypes() {
  const types = [
    { no: 1, code: "C01", name: "측정모호",   desc: "수치로 측정 불가능하거나 측정 방법이 모호", count: 38, pct: 13.3, trend: "+3", samples: 12, hq: "운영 11 · 사업 9 · DX 7" },
    { no: 2, code: "C10", name: "자기보고형", desc: "외부 증빙 없이 본인 보고에만 의존",       count: 32, pct: 11.2, trend: "+5", samples: 10, hq: "사업 12 · 운영 8 · DX 6" },
    { no: 3, code: "C08", name: "건수형지표", desc: "건수만으로 평가 (질적 지표 결여)",        count: 27, pct: 9.4,  trend: "-2", samples: 9,  hq: "개발 9 · 운영 8 · 인프라 5" },
    { no: 4, code: "C02", name: "통제불가",   desc: "외부 의존도가 커 본인이 통제 불가",       count: 24, pct: 8.4,  trend: "0",  samples: 8,  hq: "사업 11 · DX 6 · 운영 4" },
    { no: 5, code: "C06", name: "공모형",     desc: "타 팀 KR과 겹치거나 협업 명확성 부족",    count: 19, pct: 6.6,  trend: "-4", samples: 7,  hq: "운영 8 · 개발 6 · DX 3" },
    { no: 6, code: "C03", name: "도전성저하", desc: "전년 유지형이거나 도전성 부족",           count: 15, pct: 5.2,  trend: "-1", samples: 5,  hq: "운영 6 · 개발 5 · 인프라 4" },
    { no: 7, code: "C04", name: "표현모호",   desc: "용어가 애매하거나 해석 여지가 큼",        count: 14, pct: 4.9,  trend: "+1", samples: 5,  hq: "사업 6 · DX 4 · 운영 3" },
    { no: 8, code: "C04b", name: "현실성낮음", desc: "기간·자원 대비 비현실적",                count: 11, pct: 3.8,  trend: "0",  samples: 4,  hq: "DX 5 · 사업 3 · 운영 2" },
    { no: 9, code: "C09", name: "확인불가",   desc: "평가자가 결과를 확인할 증거 없음",        count: 9,  pct: 3.1,  trend: "-1", samples: 3,  hq: "사업 4 · 운영 3 · 개발 2" },
    { no: 10, code: "C07", name: "신기술의존", desc: "검증되지 않은 신기술에 과도 의존",       count: 6,  pct: 2.1,  trend: "-2", samples: 2,  hq: "DX 4 · 개발 2" },
    { no: 11, code: "C11", name: "고위험실행", desc: "실패 시 영향이 크나 통제 방안 부재",     count: 4,  pct: 1.4,  trend: "+1", samples: 2,  hq: "운영 2 · 개발 1 · 사업 1" },
  ];
  const maxCount = Math.max(...types.map(t => t.count));

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="위험 유형 상세" subtitle="11항목별 코칭 후보 발생 분포"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 40px 56px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#7C87A4", marginBottom: 14 }}>
          <a href="./r3-hr.html" style={{ color: "#3B5BDB", textDecoration: "none" }}>캘리브레이션</a>
          <Icon name="chevronRight" size={11}/>
          <span>위험 유형 상세</span>
        </div>

        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
          위험 유형 11종 · 발생 분포
        </h1>
        <p style={{ margin: "8px 0 22px", fontSize: 13, color: "#5B6685", lineHeight: 1.6 }}>
          286건 KR 중 검출된 위험 태그를 유형별로 집계했어요. 확정 위반이 아닌 코칭 후보입니다.
        </p>

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 26 }}>
          {[
            { label: "총 검출 태그", value: "199", unit: "개", sub: "1KR당 0.69개", color: "#3B5BDB" },
            { label: "고위험 유형 (TOP3)", value: "97", unit: "개", sub: "측정모호 · 자기보고형 · 건수형", color: "#D14343" },
            { label: "전 분기 대비", value: "-8.2", unit: "%", sub: "전체 감소 추세", color: "#2F9E5E" },
            { label: "AI 자동판정 정확도", value: "94.1", unit: "%", sub: "평가자 수정률 5.9%", color: "#7C4DD9" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "18px 20px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: "#5B6685", marginBottom: 8 }}>{s.label}</div>
              <div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: s.color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{s.value}</span>
                <span style={{ fontSize: 13, color: "#7C87A4", marginLeft: 4 }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 6 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "36px 60px 100px 1.5fr 90px 50px 55px 1fr 70px",
            gap: 0, alignItems: "center",
            padding: "14px 22px",
            background: "#F9FAFC",
            borderBottom: "1px solid #E1E5EF",
            fontSize: 10.5, fontWeight: 700, color: "#7C87A4",
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>
            <div>#</div>
            <div>CODE</div>
            <div>위험 유형</div>
            <div>설명</div>
            <div>발생 분포</div>
            <div style={{ textAlign: "right" }}>건수</div>
            <div style={{ textAlign: "right" }}>비율</div>
            <div style={{ paddingLeft: 12 }}>본부별</div>
            <div style={{ textAlign: "right" }}>추세</div>
          </div>

          {types.map((t, i) => (
            <div key={t.code} style={{
              display: "grid",
              gridTemplateColumns: "36px 60px 100px 1.5fr 90px 50px 55px 1fr 70px",
              gap: 0, alignItems: "center",
              padding: "14px 22px",
              borderBottom: i === types.length - 1 ? "none" : "1px solid #ECEFF5",
              cursor: "pointer", transition: "background 140ms",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFC"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#A4ADC4", fontWeight: 700 }}>{String(t.no).padStart(2, "0")}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#D14343", fontWeight: 700 }}>{t.code}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36" }}>{t.name}</span>
              <span style={{ fontSize: 12, color: "#5B6685", lineHeight: 1.5 }}>{t.desc}</span>
              <div style={{ height: 6, background: "#F4F7FB", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(t.count / maxCount) * 100}%`, background: t.count >= 25 ? "#D14343" : t.count >= 15 ? "#D98023" : "#7C4DD9", borderRadius: 3 }}/>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#0F1A36", textAlign: "right" }}>{t.count}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#7C87A4", textAlign: "right" }}>{t.pct.toFixed(1)}%</span>
              <span style={{ fontSize: 10.5, color: "#5B6685", paddingLeft: 12 }}>{t.hq}</span>
              <span style={{
                textAlign: "right",
                fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                color: t.trend.startsWith("-") ? "#2F9E5E" : t.trend === "0" ? "#A4ADC4" : "#D14343",
              }}>{t.trend}</span>
            </div>
          ))}
        </div>

        {/* Action callout */}
        <div style={{
          marginTop: 20, padding: "16px 20px",
          background: "#F1F4FD", border: "1px solid #C5D0F7", borderRadius: 12,
          display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: "#1B2A4E",
        }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <div style={{ flex: 1, lineHeight: 1.6 }}>
            <b>측정모호 · 자기보고형</b> 두 유형이 전체의 24.5%를 차지해요. 평가 기준 편집에서 이 두 항목의 가이드 문구를 강화하면 효과가 클 거예요.
          </div>
          <a href="./r3-criteria.html" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm" rightIcon={<Icon name="chevronRight" size={13}/>}>기준 편집</Button>
          </a>
        </div>

      </div>
    </main>
  );
}
window.R3RiskTypes = R3RiskTypes;
