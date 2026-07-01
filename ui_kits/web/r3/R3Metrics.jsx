// R3Metrics.jsx — 표준 지표 라이브러리

function MetricStatusPill({ status }) {
  const map = {
    "수집":     { bg: "#F1F3F8", bd: "#E1E5EF", fg: "#5B6685" },
    "검토중":   { bg: "#FFF7EC", bd: "#FFE0BA", fg: "#D98023" },
    "표준승인": { bg: "#ECFAF1", bd: "#BBE9CC", fg: "#2F9E5E" },
    "비권장":   { bg: "#FFF0F0", bd: "#FFD4D4", fg: "#D14343" },
  };
  const s = map[status];
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 999,
      background: s.bg, border: `1px solid ${s.bd}`, color: s.fg,
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>{status}</span>
  );
}

function MetricCard({ id, name, category, group, status, definition, formula, unit, usage, orgs, exampleKR, warnings }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      padding: "20px 22px", boxShadow: "0 1px 2px rgba(31,42,74,.04)",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#7C87A4" }}>{id}</span>
            <MetricStatusPill status={status}/>
            {warnings && warnings.map((w, i) => (
              <span key={i} style={{ padding: "2px 7px", borderRadius: 5, background: "#FFF0F0", color: "#D14343", fontSize: 10, fontWeight: 700 }}>{w}</span>
            ))}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.01em", lineHeight: 1.4 }}>{name}</div>
          <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ padding: "1px 7px", borderRadius: 5, background: "#F1F4FD", color: "#213A8C", fontSize: 10, fontWeight: 600 }}>{category}</span>
            <span style={{ padding: "1px 7px", borderRadius: 5, background: "#FFEDE2", color: "#E07A3C", fontSize: 10, fontWeight: 600 }}>{group}</span>
          </div>
        </div>
        <button style={iconBtnMetrics}><Icon name="more" size={14}/></button>
      </div>

      {/* Definition */}
      <div style={{ fontSize: 12.5, color: "#5B6685", lineHeight: 1.55, paddingTop: 8, borderTop: "1px solid #ECEFF5" }}>
        {definition}
      </div>

      {/* Formula */}
      <div style={{
        padding: "10px 12px", background: "#F9FAFC", borderRadius: 8,
        fontFamily: "var(--font-mono)", fontSize: 12, color: "#1F2A4A",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ color: "#7C87A4", fontSize: 11 }}>📐</span>
        <span>{formula}</span>
        <span style={{ marginLeft: "auto", color: "#7C87A4", fontSize: 11 }}>· 단위 {unit}</span>
      </div>

      {/* Usage stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 11.5 }}>
        <div>
          <div style={{ color: "#7C87A4", marginBottom: 3 }}>사용 빈도</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ flex: 1, height: 5, background: "#F4F7FB", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(usage, 100)}%`, background: "#3B5BDB", borderRadius: 3 }}/>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#0F1A36" }}>{usage}</span>
          </div>
        </div>
        <div>
          <div style={{ color: "#7C87A4", marginBottom: 3 }}>사용 조직</div>
          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#0F1A36" }}>{orgs}개 본부</div>
        </div>
      </div>

      {/* Example KR */}
      <div style={{
        padding: "10px 12px", background: "#F1F4FD", border: "1px solid #C5D0F7", borderRadius: 8,
        fontSize: 11.5, color: "#3A4565", lineHeight: 1.5,
      }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: "#213A8C", letterSpacing: "0.04em", marginBottom: 3 }}>📌 대표 KR 예시</div>
        {exampleKR}
      </div>
    </div>
  );
}

const iconBtnMetrics = {
  width: 28, height: 28, borderRadius: 7,
  background: "#F9FAFC", border: "1px solid #E1E5EF",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "#5B6685", flexShrink: 0,
};

function R3Metrics() {
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="표준 지표 라이브러리" subtitle="284개 지표 · 47개 표준 승인"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 40px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase" }}>플라이휠 · 수집 → 정규화 → 큐레이션 → 배포</div>
            <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              평가 지표의 표준을 함께 쌓아갑니다
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5B6685" }}>
              KR 안의 측정지표만 추출·정규화해요. KR 자체를 재작성하지는 않습니다.
            </p>
          </div>
          <div style={{ flex: 1 }}/>
          <Button variant="secondary" leftIcon={<Icon name="library" size={15}/>}>분석 리포트</Button>
          <Button variant="ai" leftIcon={<span>✨</span>}>AI 정규화 실행</Button>
          <Button variant="primary" leftIcon={<span>+</span>}>지표 추가</Button>
        </div>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 22 }}>
          {[
            { ico: "📊", bg: "#E5EBFB", fg: "#3B5BDB", label: "전체 지표",     val: "284", sub: "수집 완료" },
            { ico: "✓",  bg: "#ECFAF1", fg: "#2F9E5E", label: "표준 승인",     val: "47",  sub: "배포 가능" },
            { ico: "⏱", bg: "#FFF7EC", fg: "#D98023", label: "검토 중",       val: "32",  sub: "큐레이션 대기" },
            { ico: "!",  bg: "#FFF0F0", fg: "#D14343", label: "비권장",        val: "18",  sub: "건수형·자기보고" },
            { ico: "🔄", bg: "#F0E9FB", fg: "#7C4DD9", label: "중복 추정",     val: "12",  sub: "통합 검토 권장" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: s.bg, color: s.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>{s.ico}</div>
                <div style={{ fontSize: 12, color: "#5B6685", fontWeight: 500 }}>{s.label}</div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#0F1A36", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 380 }}>
            <Icon name="search" size={14} style={{ position: "absolute", left: 12, top: 10, color: "#A4ADC4" }}/>
            <input placeholder="지표명 · 정의 · 동의어 검색" style={{
              width: "100%", padding: "9px 12px 9px 34px",
              background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 8,
              fontSize: 12.5, color: "#0F1A36", outline: "none",
            }}/>
          </div>
          <div style={{ display: "inline-flex", background: "#F4F7FB", borderRadius: 9, padding: 3, gap: 2 }}>
            {[
              { label: "전체", count: 284, on: true },
              { label: "표준승인", count: 47 },
              { label: "검토중", count: 32 },
              { label: "비권장", count: 18 },
            ].map((t, i) => (
              <button key={i} style={t.on ? {
                background: "#fff", color: "#0F1A36", fontWeight: 700,
                border: "none", borderRadius: 7, padding: "7px 12px",
                fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)",
                boxShadow: "0 1px 2px rgba(31,42,74,.06)",
                display: "flex", alignItems: "center", gap: 5,
              } : {
                background: "transparent", color: "#5B6685", fontWeight: 500,
                border: "none", borderRadius: 7, padding: "7px 12px",
                fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                {t.label}
                <span style={{ fontFamily: "var(--font-mono)", color: t.on ? "#7C87A4" : "#A4ADC4", fontSize: 10.5, fontWeight: 600 }}>{t.count}</span>
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }}/>
          <Button variant="secondary" size="sm" leftIcon={<Icon name="filter" size={13}/>}>category</Button>
          <Button variant="secondary" size="sm" leftIcon={<Icon name="filter" size={13}/>}>업무군</Button>
          <Button variant="ghost" size="sm" leftIcon={<Icon name="sort" size={13}/>}>사용 빈도 ↓</Button>
        </div>

        {/* Metric grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <MetricCard
            id="M_PERF_001" name="APM p95 응답속도 (ms)" status="표준승인"
            category="프로세스" group="성능/튜닝"
            definition="외부 사용자가 체감하는 응답 지연의 상위 5% 값. 단순 평균보다 사용자 경험을 더 정확히 반영합니다."
            formula="P95(response_time) · 월평균" unit="ms"
            usage={87} orgs={6}
            exampleKR="결제 게이트웨이 APM p95 응답속도 850ms → 500ms"
          />
          <MetricCard
            id="M_QUAL_004" name="단위테스트 커버리지 (%)" status="표준승인"
            category="품질" group="개발/요건"
            definition="실행된 코드 라인이 전체 코드 라인에서 차지하는 비율. 회귀 리스크의 대표 선행 지표입니다."
            formula="covered_lines / total_lines × 100" unit="%"
            usage={64} orgs={4}
            exampleKR="결제 인증 모듈 단위테스트 커버리지 65% → 85%"
          />
          <MetricCard
            id="M_OPS_007" name="MTTR · 평균 복구 시간" status="표준승인"
            category="리스크" group="장애/운영안정"
            definition="장애 발생 시점부터 정상 복구 시점까지 평균 시간. 운영 안정성의 핵심 지표."
            formula="SUM(recovery_time) / 장애 건수" unit="분"
            usage={58} orgs={5}
            exampleKR="P1 장애 MTTR 평균 35분 → 15분 단축"
          />
          <MetricCard
            id="M_OPS_012" name="배포 자동화 비율 (%)" status="검토중"
            category="생산성" group="자동화"
            definition="전체 배포 중 자동 파이프라인으로 진행된 비율. 운영 효율과 휴먼 에러 감소의 대표 지표."
            formula="auto_deploys / total_deploys × 100" unit="%"
            usage={42} orgs={3}
            exampleKR="결제 시스템 배포 자동화 비율 60% → 90%"
          />
          <MetricCard
            id="M_SEC_003" name="권한 점검 완료율 (%)" status="검토중"
            category="리스크" group="보안/권한/개인정보"
            definition="분기 권한 점검 대상 중 점검이 완료된 비율. 보안 거버넌스 지표."
            formula="completed / scheduled × 100" unit="%"
            usage={28} orgs={2}
            exampleKR="분기 권한 점검 자동화 도입 · 완료율 70% → 95%"
          />
          <MetricCard
            id="M_PROD_009" name="회의 횟수 (분기)" status="비권장"
            category="생산성" group="고객/사업기여"
            definition="분기 동안 진행한 회의 횟수. 활동량 지표로, 결과 지표가 함께 있어야 권장됩니다."
            formula="COUNT(meetings) WHERE quarter" unit="회"
            usage={14} orgs={2}
            warnings={["건수형"]}
            exampleKR="고객 미팅 횟수 분기 30회 이상 유지"
          />
        </div>

        {/* Flywheel banner */}
        <div style={{
          marginTop: 22, padding: "22px 24px",
          background: "linear-gradient(135deg, #1B2A4E, #2C3E68)", color: "#fff",
          borderRadius: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(224,122,60,0.22)", color: "#F4C9A8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🔄</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>지표 표준화 플라이휠</div>
              <div style={{ fontSize: 11.5, color: "#91A6F0", marginTop: 2 }}>4단계 라이프사이클로 표준을 키워갑니다</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { num: "1", label: "수집",   desc: "KR에서 측정지표만 추출", count: "284건" },
              { num: "2", label: "정규화", desc: "5체크: 의미·계산식·출처·실제·통합", count: "237건" },
              { num: "3", label: "큐레이션", desc: "표준 명칭 · 건수형/자기보고 비권장", count: "65건" },
              { num: "4", label: "배포",   desc: "R1 추천 지표로 라이브러리 연계", count: "47건" },
            ].map((p, i) => (
              <div key={i} style={{ padding: "14px 14px", background: "rgba(255,255,255,0.06)", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, fontFamily: "var(--font-mono)" }}>{p.num}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{p.label}</div>
                </div>
                <div style={{ fontSize: 11.5, color: "#C5D0F7", lineHeight: 1.5, marginBottom: 8 }}>{p.desc}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#fff" }}>{p.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

window.R3Metrics = R3Metrics;
