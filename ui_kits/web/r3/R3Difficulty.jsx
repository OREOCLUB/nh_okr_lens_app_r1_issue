// R3Difficulty.jsx — 난이도별 지표 확인 (v3.4 신규)

function DifficultyTab({ label, count, percentage, color, active }) {
  return (
    <div style={{
      padding: "20px 22px",
      background: active ? "#fff" : "#F9FAFC",
      border: `2px solid ${active ? color : "#E1E5EF"}`,
      borderRadius: 14,
      cursor: "pointer",
      transition: "all 180ms ease-out",
      boxShadow: active ? `0 8px 20px -6px ${color}25` : "none",
      flex: 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ width: 11, height: 11, borderRadius: 4, background: color }}/>
        <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#0F1A36" : "#5B6685" }}>난이도 · {label}</span>
        {active && <span style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 5, background: color, color: "#fff", fontSize: 10, fontWeight: 700 }}>선택</span>}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: active ? color : "#0F1A36", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{count}</div>
        <div style={{ fontSize: 12.5, color: "#7C87A4" }}>건 · {percentage}%</div>
      </div>
      <div style={{ marginTop: 12, height: 6, background: "#F4F7FB", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${percentage}%`, background: color, borderRadius: 3 }}/>
      </div>
    </div>
  );
}

function KRDifficultyRow({ id, member, dept, group, kr, sBasis, weight, flags }) {
  return (
    <div style={{
      padding: "18px 22px",
      background: "#fff",
      border: "1px solid #ECEFF5",
      borderRadius: 12,
      marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#A4ADC4", fontWeight: 700 }}>{id}</span>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#E5EBFB", color: "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{member[0]}</div>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1F2A4A" }}>{member}</span>
        <span style={{ fontSize: 11.5, color: "#7C87A4" }}>· {dept}</span>
        <span style={{ marginLeft: 4, padding: "2px 8px", borderRadius: 5, background: "#F1F4FD", color: "#213A8C", fontSize: 10.5, fontWeight: 600 }}>{group}</span>
        <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 999, background: "#F0E9FB", color: "#7C4DD9", fontSize: 11, fontWeight: 600 }}>난이도 · 상</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#7C87A4", fontWeight: 600 }}>가중치 {weight}%</span>
      </div>

      <div style={{ fontSize: 14, color: "#0F1A36", fontWeight: 500, lineHeight: 1.55, marginBottom: 12 }}>{kr}</div>

      <div style={{ padding: "12px 14px", background: "#F9FAFC", borderRadius: 9, marginBottom: 10 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 5 }}>S등급 근거</div>
        <div style={{ fontSize: 12, color: "#3A4565", lineHeight: 1.55 }}>{sBasis}</div>
      </div>

      {flags && flags.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {flags.map((f, i) => (
            <span key={i} style={{
              padding: "3px 9px", borderRadius: 6,
              background: f.warn ? "#FFF7EC" : "#F4F7FB",
              color: f.warn ? "#D98023" : "#5B6685",
              fontSize: 10.5, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              {f.warn && <span>!</span>}
              {f.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function R3Difficulty() {
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="난이도별 지표 확인" subtitle="INSIGHT · 04 · 본부·직급·업무군 드릴다운"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 48px 48px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, color: "#5B6685" }}>
          <a href="./r3-hr.html" style={{ color: "#5B6685", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <span>←</span> 캘리브레이션 인사이트
          </a>
          <span style={{ color: "#C8CFDF" }}>/</span>
          <span style={{ color: "#0F1A36", fontWeight: 600 }}>난이도별 지표 확인</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 32, maxWidth: 820 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#7C4DD9", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>INSIGHT 04 · 드릴다운</div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.25 }}>
            난이도가 어떻게 분포되어 있나요?
          </h1>
          <p style={{ margin: "14px 0 0", fontSize: 14.5, color: "#5B6685", lineHeight: 1.7 }}>
            상/중/하 난이도별 KR 분포를 본부·직급·업무군 필터로 드릴다운해요. "상" 등급은 ④⑥의존 플래그도 함께 확인합니다.
          </p>
        </div>

        {/* Difficulty distribution */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
          <DifficultyTab label="상" count={76} percentage={27} color="#7C4DD9" active/>
          <DifficultyTab label="중" count={168} percentage={59} color="#3B5BDB"/>
          <DifficultyTab label="하" count={42} percentage={15} color="#7C87A4"/>
        </div>

        {/* Filters */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Icon name="filter" size={15} style={{ color: "#5B6685" }}/>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>필터</span>
            <span style={{ marginLeft: "auto", fontSize: 11.5, color: "#7C87A4" }}>모든 필터 해제</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>본부</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {["전체", "운영본부", "개발본부", "사업본부", "DX본부"].map((b, i) => (
                  <button key={i} style={i === 1 ? {
                    padding: "5px 11px", background: "#3B5BDB", color: "#fff", border: "1px solid #3B5BDB",
                    borderRadius: 999, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)",
                  } : {
                    padding: "5px 11px", background: "#fff", color: "#5B6685", border: "1px solid #E1E5EF",
                    borderRadius: 999, fontSize: 11.5, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)",
                  }}>{b}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>직급</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {["전체", "3급", "4급갑", "4급을", "5급"].map((g, i) => (
                  <button key={i} style={{
                    padding: "5px 11px", background: i === 0 ? "#3B5BDB" : "#fff", color: i === 0 ? "#fff" : "#5B6685",
                    border: `1px solid ${i === 0 ? "#3B5BDB" : "#E1E5EF"}`,
                    borderRadius: 999, fontSize: 11.5, fontWeight: i === 0 ? 600 : 500, cursor: "pointer", fontFamily: "var(--font-mono)",
                  }}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>업무군</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <button style={{ padding: "5px 11px", background: "#3B5BDB", color: "#fff", border: "1px solid #3B5BDB", borderRadius: 999, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>전체</button>
                <button style={{ padding: "5px 11px", background: "#fff", color: "#5B6685", border: "1px solid #E1E5EF", borderRadius: 999, fontSize: 11.5, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 5 }}>9개 업무군 <Icon name="chevronDown" size={11}/></button>
              </div>
            </div>
          </div>
        </div>

        {/* List header */}
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F1A36" }}>난이도 "상" KR · 운영본부</h2>
          <span style={{ marginLeft: 10, padding: "3px 10px", borderRadius: 999, background: "#F0E9FB", color: "#7C4DD9", fontSize: 11.5, fontWeight: 700 }}>18건</span>
          <span style={{ marginLeft: 8, padding: "3px 10px", borderRadius: 999, background: "#FFF7EC", color: "#D98023", fontSize: 11.5, fontWeight: 600 }}>④⑥의존 플래그 3건</span>
          <div style={{ flex: 1 }}/>
          <Button variant="ghost" size="sm" leftIcon={<Icon name="sort" size={13}/>}>가중치 ↓</Button>
        </div>

        {/* KR list */}
        <div style={{ marginBottom: 32 }}>
          <KRDifficultyRow
            id="KR_2026_058" member="김지훈" dept="결제플랫폼팀" group="성능/튜닝"
            kr="결제 게이트웨이 APM p95 응답속도(월평균)를 850ms → 500ms로 단축"
            sBasis="≤400ms · 외부 캐시 추가 도입 완료까지 포함된 산출물 기준"
            weight={30}
            flags={[{ label: "측정 명확" }, { label: "외부 증빙 보강 필요", warn: true }]}
          />
          <KRDifficultyRow
            id="KR_2026_087" member="박서연" dept="인증플랫폼팀" group="장애/운영안정"
            kr="배치 자동화 마일스톤 4단계 중 4단계 완료 · 오류율 0건 + 정상 종료율 99.9%"
            sBasis="4/4 완료 + 30일 무장애 운영 · 정상 종료율 99.95% 이상"
            weight={25}
            flags={[{ label: "산출물 명확" }, { label: "경계 케이스", warn: true }]}
          />
          <KRDifficultyRow
            id="KR_2026_124" member="이도윤" dept="결제플랫폼팀" group="자동화"
            kr="운영 자동화 파이프라인 — 신기술 IaC 전면 도입 · 전사 표준화 기여"
            sBasis="전사 IaC 표준 채택 + 도입 사례 3건 이상 + 컨퍼런스 발표"
            weight={20}
            flags={[{ label: "신기술 의존", warn: true }, { label: "④⑥의존 플래그", warn: true }]}
          />
          <KRDifficultyRow
            id="KR_2026_142" member="한지윤" dept="결제플랫폼팀" group="보안/권한/개인정보"
            kr="권한 점검 자동화 도구 도입 · 분기 점검 완료율 70% → 95%"
            sBasis="≥98% 완료율 + 점검 자동 리포트 발행 시스템 구축"
            weight={20}
            flags={[{ label: "산출물 명확" }]}
          />
        </div>

        {/* Reference */}
        <div style={{
          padding: "20px 22px",
          background: "#fff", border: "1px solid #FFE0BA", borderRadius: 14,
          background: "linear-gradient(135deg, #FFF7EC, #fff 80%)",
          display: "flex", alignItems: "flex-start", gap: 14,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "#D98023", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>!</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#7A4A14", marginBottom: 6 }}>④⑥의존 플래그란?</div>
            <div style={{ fontSize: 12.5, color: "#9C5E26", lineHeight: 1.7 }}>
              체크리스트 ④(현실성) ⑥(타 팀 공모) 만으로 "상" 난이도를 받은 KR은 ⑦(신기술) ⑧(질적 지표) 근거가 부족할 가능성이 있어요. 산출물 중심으로 다시 확인하시면 더 명료한 평가가 가능합니다. — 운영안 §E-3 (나) 쟁점 태그
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

window.R3Difficulty = R3Difficulty;
