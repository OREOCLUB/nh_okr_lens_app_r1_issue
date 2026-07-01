// R3JobGroup.jsx — 지표별 업무군 분류 (v3.4 신규)

const JOB_GROUPS = [
  { id: "dev",    name: "개발/요건",       color: "#3B5BDB", count: 48 },
  { id: "data",   name: "데이터/정합성",    color: "#5C7AE6", count: 32 },
  { id: "auto",   name: "자동화",          color: "#7C4DD9", count: 28 },
  { id: "perf",   name: "성능/튜닝",       color: "#2F9E5E", count: 24 },
  { id: "stab",   name: "장애/운영안정",    color: "#D98023", count: 38 },
  { id: "sched",  name: "정시/납기/처리율", color: "#E07A3C", count: 18 },
  { id: "doc",    name: "매뉴얼/표준/문서", color: "#14A5B8", count: 12 },
  { id: "sec",    name: "보안/권한/개인정보", color: "#D14343", count: 16 },
  { id: "biz",    name: "고객/사업기여/제안", color: "#7C87A4", count: 25 },
];

function JobGroupPill({ name, color, count, selected }) {
  return (
    <div style={{
      padding: "10px 14px",
      background: selected ? color : "#fff",
      border: `1.5px solid ${selected ? color : "#E1E5EF"}`,
      borderRadius: 999,
      display: "inline-flex", alignItems: "center", gap: 8,
      cursor: "pointer",
      color: selected ? "#fff" : "#3A4565",
      transition: "all 140ms ease-out",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: selected ? "#fff" : color, opacity: selected ? 0.7 : 1 }}/>
      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{name}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, opacity: 0.85 }}>{count}</span>
    </div>
  );
}

function KRClassifyRow({ id, member, dept, kr, autoGroup, autoConfidence, confirmedGroup, isBoundary }) {
  const isPending = !confirmedGroup;
  const matches = confirmedGroup === autoGroup;
  return (
    <div style={{
      padding: "18px 22px",
      background: "#fff",
      border: `1px solid ${isBoundary ? "#FFE0BA" : "#ECEFF5"}`,
      borderLeft: `4px solid ${isBoundary ? "#D98023" : "#E1E5EF"}`,
      borderRadius: 12,
      marginBottom: 12,
    }}>
      {/* Top row — id + member + boundary tag */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#A4ADC4", fontWeight: 700 }}>{id}</span>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#E5EBFB", color: "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{member[0]}</div>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1F2A4A" }}>{member}</span>
        <span style={{ fontSize: 11.5, color: "#7C87A4" }}>· {dept}</span>
        {isBoundary && (
          <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 999, background: "#FFF7EC", color: "#D98023", fontSize: 11, fontWeight: 700 }}>경계 · 확인 필요</span>
        )}
        {!isBoundary && isPending && (
          <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 999, background: "#EFF4FE", color: "#2B5DD9", fontSize: 11, fontWeight: 700 }}>대기</span>
        )}
        {!isBoundary && !isPending && matches && (
          <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 999, background: "#ECFAF1", color: "#2F9E5E", fontSize: 11, fontWeight: 700 }}>✓ 확정</span>
        )}
      </div>

      {/* KR text */}
      <div style={{ fontSize: 14, color: "#0F1A36", fontWeight: 500, lineHeight: 1.5, marginBottom: 14 }}>{kr}</div>

      {/* Classification row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr", gap: 14, alignItems: "center", padding: "12px 14px", background: "#F9FAFC", borderRadius: 10 }}>
        {/* AI auto */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>AI 자동 분류</div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: JOB_GROUPS.find(g => g.name === autoGroup)?.color || "#7C87A4" }}/>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1F2A4A" }}>{autoGroup}</span>
            <span style={{ marginLeft: "auto", padding: "1px 7px", borderRadius: 5, background: "#fff", border: "1px solid #ECEFF5", fontSize: 10, color: "#5B6685", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{autoConfidence}%</span>
          </div>
        </div>

        <div style={{ textAlign: "center", color: "#7C87A4", fontSize: 18 }}>→</div>

        {/* Confirmed */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>인사담당자 확정</div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {confirmedGroup ? (
              <>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: JOB_GROUPS.find(g => g.name === confirmedGroup)?.color || "#7C87A4" }}/>
                <span style={{ fontSize: 13, fontWeight: 700, color: matches ? "#2F9E5E" : "#D98023" }}>{confirmedGroup}</span>
                {!matches && <span style={{ fontSize: 10.5, color: "#D98023", fontWeight: 600 }}>· 재지정</span>}
              </>
            ) : (
              <span style={{ fontSize: 12.5, color: "#A4ADC4", fontStyle: "italic" }}>아직 확정되지 않음</span>
            )}
            <button style={{ marginLeft: "auto", padding: "4px 10px", background: isPending ? "#3B5BDB" : "#fff", color: isPending ? "#fff" : "#3B5BDB", border: `1px solid ${isPending ? "#3B5BDB" : "#C5D0F7"}`, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              {isPending ? "확정하기" : "수정"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function R3JobGroup() {
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="지표별 업무군 분류" subtitle="INSIGHT · 03 · 자동 분류 후 인사담당자가 확정"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 48px 48px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, color: "#5B6685" }}>
          <a href="./r3-hr.html" style={{ color: "#5B6685", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <span>←</span> 캘리브레이션 인사이트
          </a>
          <span style={{ color: "#C8CFDF" }}>/</span>
          <span style={{ color: "#0F1A36", fontWeight: 600 }}>지표별 업무군 분류</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 36, maxWidth: 820 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>INSIGHT 03 · 자동 분류</div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.25 }}>
            KR마다 어떤 업무군에 속하는지 확인해요
          </h1>
          <p style={{ margin: "14px 0 0", fontSize: 14.5, color: "#5B6685", lineHeight: 1.7 }}>
            AI가 KR · 측정방법 · S/A 기준을 읽어 9개 업무군 중 하나로 자동 분류해요. 인사담당자가 검토·확정하면 캘리브레이션 데이터에 반영됩니다.
          </p>
        </div>

        {/* Progress summary */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "26px 28px", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>확정 진행률</div>
              <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 4 }}>전체 286건 중 241건 확정 · 경계 12건 우선 검토 권장</div>
            </div>
            <div style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: "#0F1A36", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.015em" }}>
              241 <span style={{ color: "#A4ADC4", fontSize: 16 }}>/ 286</span>
            </div>
          </div>
          <div style={{ height: 12, background: "#F4F7FB", borderRadius: 6, overflow: "hidden", display: "flex" }}>
            <div title="확정 241" style={{ width: "84%", background: "#2F9E5E" }}/>
            <div title="대기 33" style={{ width: "12%", background: "#3B5BDB" }}/>
            <div title="경계 12" style={{ width: "4%", background: "#D98023" }}/>
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 12, fontSize: 11.5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: "#2F9E5E" }}/><span style={{ color: "#3A4565" }}>확정 <b style={{ color: "#0F1A36" }}>241</b></span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: "#3B5BDB" }}/><span style={{ color: "#3A4565" }}>대기 <b style={{ color: "#0F1A36" }}>33</b></span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: "#D98023" }}/><span style={{ color: "#3A4565" }}>경계/미분류 <b style={{ color: "#0F1A36" }}>12</b></span></div>
          </div>
        </div>

        {/* Job group distribution */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "26px 28px", marginBottom: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36", marginBottom: 6 }}>업무군별 분포</div>
          <div style={{ fontSize: 12.5, color: "#7C87A4", marginBottom: 18 }}>클릭하면 해당 업무군의 KR만 필터링돼요</div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <JobGroupPill name="전체" color="#5B6685" count={286} selected/>
            {JOB_GROUPS.map((g, i) => <JobGroupPill key={i} {...g}/>)}
          </div>
        </div>

        {/* Filter row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F1A36" }}>검토 필요 KR</h2>
          <span style={{ padding: "3px 9px", borderRadius: 999, background: "#FFF7EC", color: "#D98023", fontSize: 11.5, fontWeight: 700 }}>경계 12건 우선</span>
          <div style={{ flex: 1 }}/>
          <div style={{ display: "inline-flex", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, padding: 4, gap: 2 }}>
            {[
              { l: "경계 12", on: true },
              { l: "대기 33", on: false },
              { l: "재지정 5", on: false },
              { l: "확정 241", on: false },
            ].map((t, i) => (
              <button key={i} style={t.on ? {
                background: "#3B5BDB", color: "#fff", fontWeight: 700,
                border: "none", borderRadius: 7, padding: "7px 13px",
                fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)",
              } : {
                background: "transparent", color: "#5B6685", fontWeight: 500,
                border: "none", borderRadius: 7, padding: "7px 13px",
                fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)",
              }}>{t.l}</button>
            ))}
          </div>
        </div>

        {/* KR list */}
        <div style={{ marginBottom: 32 }}>
          <KRClassifyRow
            id="KR_2026_087" member="박서연" dept="운영본부 · 인증플랫폼팀"
            kr="배치 자동화 마일스톤 4단계 중 3단계 완료 · 측정은 오류율·정상종료율"
            autoGroup="장애/운영안정" autoConfidence={68}
            isBoundary
          />
          <KRClassifyRow
            id="KR_2026_104" member="유민호" dept="DX본부 · 데이터플랫폼팀"
            kr="권한 점검 자동화 도구 도입 · 점검 완료율 70% → 95%"
            autoGroup="자동화" autoConfidence={62}
            isBoundary
          />
          <KRClassifyRow
            id="KR_2026_132" member="송지원" dept="사업본부 · 결제사업팀"
            kr="FDS 룰 정확도 92% → 96% 향상 · 오탐 / 정탐 함께 측정"
            autoGroup="데이터/정합성" autoConfidence={71}
            isBoundary
          />
          <KRClassifyRow
            id="KR_2026_058" member="김지훈" dept="운영본부 · 결제플랫폼팀"
            kr="결제 게이트웨이 APM p95 응답속도(월평균)를 850ms → 500ms로 단축"
            autoGroup="성능/튜닝" autoConfidence={94}
            confirmedGroup="성능/튜닝"
          />
          <KRClassifyRow
            id="KR_2026_111" member="한지윤" dept="운영본부 · 결제플랫폼팀"
            kr="보안 점검 자동화 도구를 도입하여 사용"
            autoGroup="보안/권한/개인정보" autoConfidence={58}
            confirmedGroup="자동화"
          />
        </div>

        {/* Reference rules */}
        <div style={{
          padding: "22px 26px",
          background: "linear-gradient(135deg, #1B2A4E, #2C3E68)",
          color: "#fff", borderRadius: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(145,166,240,0.22)", color: "#C5D0F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>📐</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>업무군 재분류 규칙 (운영안 §E-3)</div>
              <div style={{ fontSize: 12, color: "#91A6F0", marginTop: 3 }}>(가) 규칙 — 9개 업무군 · 경계 허용 · 기타/복합 금지</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { ico: "✗", label: "부서·직급·시스템명만으로 분류 금지" },
              { ico: "✓", label: "KR·측정방법·S/A 기준을 읽어 산출물로 판정" },
              { ico: "↗", label: "기대효과보다 실제 산출물 우선" },
            ].map((r, i) => (
              <div key={i} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.06)", borderRadius: 10 }}>
                <div style={{ fontSize: 18, color: "#C5D0F7", marginBottom: 8 }}>{r.ico}</div>
                <div style={{ fontSize: 12, color: "#E5EBFB", lineHeight: 1.6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 11.5, color: "#91A6F0", lineHeight: 1.6 }}>
            <b style={{ color: "#fff" }}>경계 예시</b> · '배치자동화'라도 측정이 오류·정상종료율 → 장애/운영안정 · 보안 목적이라도 산출물이 개발/데이터/자동화면 그쪽 · 심사·FDS·승인·결제는 도메인이 아닌 수행방식으로 분류
          </div>
        </div>
      </div>
    </main>
  );
}

window.R3JobGroup = R3JobGroup;
