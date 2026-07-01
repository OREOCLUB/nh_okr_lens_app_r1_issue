// R3Console.jsx — 인사담당자 캘리브레이션 인사이트 (v4 · 데이터-rich)
// 이전 두루뭉술한 "5 카드 메뉴" → 실제 분석 위젯으로 교체:
// 01 본부×직급 히트맵 · 02 위험유형 TOP 분포 · 03 본부별 코칭 워크리스트
// 04 사후조정 비중 · 05 분기 추세 · 06 사례카드 (AI 추출)

// ============ Tokens ============
const C = {
  ink: "#0F1A36", ink2: "#3A4565", ink3: "#5B6685", ink4: "#7C87A4", ink5: "#A4ADC4",
  brand: "#3B5BDB", brandLight: "#E5EBFB",
  green: "#2F9E5E", greenLight: "#ECFAF1",
  amber: "#D98023", amberLight: "#FFF7EC",
  red: "#D14343", redLight: "#FDECEC",
  purple: "#7C4DD9", purpleLight: "#F0E9FB",
  orange: "#E07A3C", orangeLight: "#FFEDE2",
  border: "#E1E5EF", borderLight: "#ECEFF5",
  bg: "#F4F7FB", bg2: "#F9FAFC",
};

// ============ Atoms ============
function CardShell({ children, padding = "24px 26px", hoverable = false, accent }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => hoverable && setHover(true)}
      onMouseLeave={() => hoverable && setHover(false)}
      style={{
        background: "#fff", border: `1px solid ${hover && accent ? accent : C.border}`,
        borderRadius: 16, padding, boxShadow: hover ? "0 12px 28px -10px rgba(31,42,74,.12)" : "0 1px 2px rgba(31,42,74,.04)",
        transition: "all 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: hoverable ? "pointer" : "default",
      }}
    >{children}</div>
  );
}

function SectionHeader({ num, title, hint, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: C.ink5, fontWeight: 700, letterSpacing: "0.08em" }}>{num}</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.ink, letterSpacing: "-0.015em" }}>{title}</h2>
        {hint && <span style={{ fontSize: 12, color: C.ink4 }}>· {hint}</span>}
      </div>
      <div style={{ flex: 1, height: 1, background: C.borderLight }}/>
      {action}
    </div>
  );
}

function MonoNum({ children, size = 16, color = C.ink, weight = 700 }) {
  return <span style={{ fontFamily: "var(--font-mono)", fontSize: size, fontWeight: weight, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.015em" }}>{children}</span>;
}

function Pill({ label, color, bg, size = 11 }) {
  return <span style={{ padding: "3px 9px", borderRadius: 999, background: bg, color, fontSize: size, fontWeight: 700, letterSpacing: "0.02em" }}>{label}</span>;
}

// ============ Hero Stats — 데이터-rich KPI ============
function HeroKpi() {
  // 4 KPI but each has a sparkline + delta + benchmark
  const kpis = [
    {
      label: "검토 완료율", value: 64, unit: "%", delta: "+12", deltaTone: "ok",
      sub: "552명 중 354명", spark: [42, 48, 51, 55, 58, 64], color: C.brand,
      bench: "목표 80%", benchProgress: 80, current: 64,
    },
    {
      label: "코칭 후보 (위험도 ≥ 중)", value: 40, unit: "건", delta: "-8", deltaTone: "ok",
      sub: "전체 286건 중 14%", spark: [62, 58, 53, 48, 44, 40], color: C.amber,
      bench: "임계 50건", benchProgress: 100, current: 80,
    },
    {
      label: "사후조정 가능 비중", value: 28.4, unit: "%", delta: "+3.1", deltaTone: "warn",
      sub: "공모형 · 건수형 · 자기보고형", spark: [22, 23, 25, 26, 27, 28.4], color: C.red,
      bench: "임계 30%", benchProgress: 100, current: 95,
    },
    {
      label: "기준 통일도", value: 87, unit: "%", delta: "+5", deltaTone: "ok",
      sub: "평가자 11항목 일치율", spark: [76, 79, 81, 83, 85, 87], color: C.green,
      bench: "목표 90%", benchProgress: 90, current: 87,
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
      {kpis.map((k, i) => {
        const max = Math.max(...k.spark), min = Math.min(...k.spark);
        const norm = (v) => 1 - (v - min) / (max - min || 1);
        const W = 100, H = 28;
        const points = k.spark.map((v, idx) => `${(idx / (k.spark.length - 1)) * W},${norm(v) * H}`).join(" ");
        return (
          <div key={i} style={{
            background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14,
            padding: "18px 20px", boxShadow: "0 1px 2px rgba(31,42,74,.04)",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: C.ink3, lineHeight: 1.4, flex: 1 }}>{k.label}</div>
              <span style={{
                padding: "2px 7px", borderRadius: 6,
                background: k.deltaTone === "ok" ? C.greenLight : C.amberLight,
                color: k.deltaTone === "ok" ? C.green : C.amber,
                fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
              }}>{k.delta}{k.unit === "%" ? "%p" : ""}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div>
                <MonoNum size={30} color={C.ink}>{k.value}</MonoNum>
                <span style={{ fontSize: 14, color: C.ink4, marginLeft: 4, fontWeight: 500 }}>{k.unit}</span>
              </div>
              <svg width={W} height={H} style={{ overflow: "visible" }}>
                <polyline points={points} fill="none" stroke={k.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx={W} cy={norm(k.spark[k.spark.length - 1]) * H} r="2.5" fill={k.color}/>
              </svg>
            </div>
            <div style={{ fontSize: 11, color: C.ink4 }}>{k.sub}</div>
            {/* Progress vs benchmark */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10.5, color: C.ink4 }}>{k.bench}</span>
                <MonoNum size={10.5} color={C.ink4} weight={600}>{Math.round((k.current / k.benchProgress) * 100)}%</MonoNum>
              </div>
              <div style={{ height: 4, background: C.bg2, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(k.current / k.benchProgress) * 100}%`, background: k.color, borderRadius: 2 }}/>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ 01 본부×직급 난이도 히트맵 (drill-down) ============
function HqGradeHeatmap() {
  const rows = [
    { name: "운영본부", cells: [42, 28, 18, 12], total: 78 },
    { name: "개발본부", cells: [36, 34, 22, 8], total: 92 },
    { name: "사업본부", cells: [18, 24, 31, 27], total: 64 },
    { name: "DX본부",   cells: [22, 29, 30, 14], total: 52 },
  ];
  const cols = ["3급", "4급갑", "4급을", "5급"];
  const heat = (v) => {
    if (v >= 40) return { bg: "#1F3FB8", fg: "#fff" };
    if (v >= 30) return { bg: C.brand, fg: "#fff" };
    if (v >= 22) return { bg: "#8FA1E5", fg: "#0F1A36" };
    if (v >= 15) return { bg: "#B7C4F0", fg: "#0F1A36" };
    return { bg: "#DCE3F8", fg: "#0F1A36" };
  };
  return (
    <CardShell padding="22px 24px">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>본부 × 직급 · 난이도 "상" 비중</div>
          <div style={{ fontSize: 11.5, color: C.ink4, marginTop: 3 }}>난이도 통일도가 낮은 셀에 코칭 후보가 몰려 있어요.</div>
        </div>
        <div style={{ flex: 1 }}/>
        <Pill label="평균 25.8% · 표준편차 9.2" color={C.ink2} bg={C.bg2}/>
      </div>

      {/* Heatmap */}
      <div style={{ display: "grid", gridTemplateColumns: "92px repeat(4, 1fr) 60px", gap: 5 }}>
        <div></div>
        {cols.map((g) => <div key={g} style={{ fontSize: 10.5, fontWeight: 700, color: C.ink4, letterSpacing: "0.04em", textTransform: "uppercase", textAlign: "center", padding: "4px 0" }}>{g}</div>)}
        <div style={{ fontSize: 10.5, fontWeight: 700, color: C.ink4, letterSpacing: "0.04em", textTransform: "uppercase", textAlign: "center", padding: "4px 0" }}>합계</div>
        {rows.map((r) => (
          <React.Fragment key={r.name}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, textAlign: "right", paddingRight: 10, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{r.name}</div>
            {r.cells.map((v, j) => {
              const c = heat(v);
              const outlier = v >= 40 || v <= 12;
              return (
                <div key={j} style={{
                  background: c.bg, color: c.fg, position: "relative",
                  aspectRatio: "1/0.5", borderRadius: 7,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  outline: outlier ? `2px solid ${C.amber}` : "none", outlineOffset: -2,
                }}>
                  {v}%
                  {outlier && <span style={{ position: "absolute", top: -5, right: -5, width: 14, height: 14, borderRadius: "50%", background: C.amber, color: "#fff", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "var(--font-sans)" }}>!</span>}
                </div>
              );
            })}
            <div style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MonoNum size={12} color={C.ink3}>{r.total}건</MonoNum>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Coaching note */}
      <div style={{
        marginTop: 16, padding: "12px 14px",
        background: C.amberLight, border: `1px solid #FFE0BA`, borderRadius: 10,
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <span style={{ fontSize: 14 }}>⚠️</span>
        <div style={{ fontSize: 11.5, color: "#7A4A14", lineHeight: 1.55, flex: 1 }}>
          <b>운영본부 3급 (42%)</b> · <b>사업본부 5급 (27%)</b> · <b>개발본부 5급 (8%)</b> 셀이 평균 대비 ±2σ 밖이에요.
          업무군과 별개로 난이도 판정 기준이 셀별로 다를 가능성이 있어요. 사례 카드를 확인해주세요.
        </div>
        <a href="./r3-difficulty.html" style={{ color: C.amber, fontSize: 11.5, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>드릴다운 →</a>
      </div>
    </CardShell>
  );
}

// ============ 02 위험유형 TOP 분포 ============
function RiskTypeDistribution() {
  // 11개 위험태그 중 발생 건수 상위 (소송 톤: "코칭 후보")
  const types = [
    { name: "측정모호",   code: "C05", count: 38, pct: 13.3, trend: "+3",  color: C.red,    severity: "high" },
    { name: "자기보고형", code: "C10", count: 32, pct: 11.2, trend: "+5",  color: C.red,    severity: "high" },
    { name: "건수형지표", code: "C08", count: 27, pct: 9.4,  trend: "-2",  color: C.amber,  severity: "mid" },
    { name: "통제불가",   code: "C02", count: 24, pct: 8.4,  trend: "0",   color: C.amber,  severity: "mid" },
    { name: "공모형",     code: "C06", count: 19, pct: 6.6,  trend: "-4",  color: C.amber,  severity: "mid" },
    { name: "도전성저하", code: "C03", count: 15, pct: 5.2,  trend: "-1",  color: C.purple, severity: "low" },
    { name: "표현모호",   code: "C04", count: 14, pct: 4.9,  trend: "+1",  color: C.purple, severity: "low" },
    { name: "현실성낮음", code: "C04b", count: 11, pct: 3.8, trend: "0",   color: C.purple, severity: "low" },
  ];
  const maxCount = Math.max(...types.map(t => t.count));

  return (
    <CardShell padding="22px 24px">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>위험 유형별 코칭 후보 분포 · TOP 8</div>
          <div style={{ fontSize: 11.5, color: C.ink4, marginTop: 3 }}>R2 평가자 11항목 자동판정 집계 · 전 분기 대비 추세 포함</div>
        </div>
        <div style={{ flex: 1 }}/>
        <a href="./r3-risk-types.html" style={{ fontSize: 12, color: C.brand, textDecoration: "none", fontWeight: 600 }}>전체 11개 보기 →</a>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {types.map((t) => (
          <div key={t.code} style={{ display: "grid", gridTemplateColumns: "32px 105px 1fr 56px 52px 40px", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: C.ink5, fontWeight: 700 }}>{t.code}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>{t.name}</span>
            <div style={{ position: "relative", height: 22, background: C.bg2, borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                position: "absolute", inset: 0, width: `${(t.count / maxCount) * 100}%`,
                background: `linear-gradient(90deg, ${t.color}dd, ${t.color})`,
                borderRadius: 6,
              }}/>
            </div>
            <MonoNum size={12.5} color={C.ink}>{t.count}건</MonoNum>
            <MonoNum size={11.5} color={C.ink4} weight={500}>{t.pct.toFixed(1)}%</MonoNum>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 700,
              padding: "2px 5px", borderRadius: 4, textAlign: "center",
              background: t.trend.startsWith("-") ? C.greenLight : t.trend === "0" ? C.bg2 : C.redLight,
              color: t.trend.startsWith("-") ? C.green : t.trend === "0" ? C.ink4 : C.red,
            }}>{t.trend}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "space-between", fontSize: 11, color: C.ink4 }}>
        <span>총 코칭 후보 <MonoNum size={12} color={C.ink2}>180건</MonoNum> · 평균 1KR당 <MonoNum size={12} color={C.ink2}>0.63개</MonoNum> 태그</span>
        <span>※ 1KR이 여러 태그를 가질 수 있어요</span>
      </div>
    </CardShell>
  );
}

// ============ 03 본부별 코칭 워크리스트 ============
function HqWorklist() {
  const rows = [
    { hq: "운영본부", mgr: "정태영",   total: 78, candidates: 23, rate: 29.5, urgent: 6, recent: "2일 전", status: "warn" },
    { hq: "사업본부", mgr: "박진수",   total: 64, candidates: 18, rate: 28.1, urgent: 4, recent: "오늘",  status: "warn" },
    { hq: "DX본부",   mgr: "김지훈",   total: 52, candidates: 11, rate: 21.2, urgent: 2, recent: "1일 전", status: "mid" },
    { hq: "개발본부", mgr: "이수연",   total: 92, candidates: 18, rate: 19.6, urgent: 1, recent: "3일 전", status: "mid" },
    { hq: "인프라본부", mgr: "최우진", total: 41, candidates: 5,  rate: 12.2, urgent: 0, recent: "5일 전", status: "ok" },
  ];
  return (
    <CardShell padding="22px 24px">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>본부별 코칭 우선순위</div>
          <div style={{ fontSize: 11.5, color: C.ink4, marginTop: 3 }}>코칭 후보율 높은 순 · 평가자 1on1 권장 대상</div>
        </div>
        <div style={{ flex: 1 }}/>
        <a href="./r3-worklist.html" style={{ fontSize: 12, color: C.brand, textDecoration: "none", fontWeight: 600 }}>전체 14본부 →</a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "100px 70px 64px 70px 1fr 50px 60px", gap: 0, fontSize: 10.5, fontWeight: 700, color: C.ink4, letterSpacing: "0.04em", textTransform: "uppercase", padding: "8px 0", borderBottom: `1px solid ${C.borderLight}` }}>
        <div>본부</div>
        <div>평가자</div>
        <div style={{ textAlign: "right" }}>전체 KR</div>
        <div style={{ textAlign: "right" }}>코칭 후보</div>
        <div style={{ paddingLeft: 16 }}>후보율</div>
        <div style={{ textAlign: "center" }}>긴급</div>
        <div style={{ textAlign: "right" }}>최근 활동</div>
      </div>

      {rows.map((r, i) => {
        const tone = r.status === "warn" ? C.amber : r.status === "mid" ? C.brand : C.green;
        const toneLight = r.status === "warn" ? C.amberLight : r.status === "mid" ? C.brandLight : C.greenLight;
        return (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "100px 70px 64px 70px 1fr 50px 60px",
            gap: 0, alignItems: "center", padding: "12px 0",
            borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.borderLight}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: tone }}/>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>{r.hq}</span>
            </div>
            <div style={{ fontSize: 12, color: C.ink2 }}>{r.mgr}</div>
            <MonoNum size={12.5} color={C.ink3}>{r.total}</MonoNum>
            <MonoNum size={13} color={tone}>{r.candidates}</MonoNum>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 16 }}>
              <div style={{ flex: 1, height: 6, background: C.bg2, borderRadius: 3, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", left: "30%", top: 0, bottom: 0, width: 1, background: C.red, opacity: 0.5 }}/>
                <div style={{ height: "100%", width: `${Math.min(r.rate, 50) * 2}%`, background: tone, borderRadius: 3 }}/>
              </div>
              <MonoNum size={12} color={tone} weight={700}>{r.rate.toFixed(1)}%</MonoNum>
            </div>
            <div style={{ textAlign: "center" }}>
              {r.urgent > 0 ? (
                <span style={{ padding: "2px 7px", borderRadius: 999, background: r.urgent >= 5 ? C.redLight : toneLight, color: r.urgent >= 5 ? C.red : tone, fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{r.urgent}</span>
              ) : <span style={{ color: C.ink5, fontSize: 11 }}>—</span>}
            </div>
            <div style={{ fontSize: 10.5, color: C.ink4, textAlign: "right" }}>{r.recent}</div>
          </div>
        );
      })}
    </CardShell>
  );
}

// ============ 04 사후조정 가능 비중 ============
function PostAdjustment() {
  const orgs = [
    { name: "운영본부", value: 42, total: 78, top: ["공모형 11", "건수형 9"] },
    { name: "사업본부", value: 31, total: 64, top: ["자기보고형 8", "건수형 6"] },
    { name: "DX본부",   value: 24, total: 52, top: ["공모형 5", "자기보고형 4"] },
    { name: "개발본부", value: 18, total: 92, top: ["건수형 8", "공모형 5"] },
  ];
  return (
    <CardShell padding="22px 24px">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>사후조정 가능 지표 비중</div>
          <div style={{ fontSize: 11.5, color: C.ink4, marginTop: 3 }}>공모형 · 건수형 · 자기보고형 태그 ≥1 KR 비율</div>
        </div>
        <div style={{ flex: 1 }}/>
        <Pill label="임계 30%" color={C.red} bg={C.redLight}/>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {orgs.map((o, i) => {
          const isWarn = o.value > 30;
          const c = isWarn ? C.amber : C.green;
          return (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>{o.name}</span>
                <span style={{ fontSize: 11, color: C.ink4, marginLeft: 8 }}>전체 {o.total}건</span>
                <span style={{ marginLeft: "auto" }}>
                  <MonoNum size={15} color={c}>{o.value}</MonoNum>
                  <span style={{ fontSize: 11, color: C.ink4, fontWeight: 500, marginLeft: 2 }}>%</span>
                </span>
              </div>
              <div style={{ height: 7, background: C.bg2, borderRadius: 4, overflow: "hidden", position: "relative", marginBottom: 6 }}>
                <div style={{ position: "absolute", top: 0, bottom: 0, left: "30%", width: 1.5, background: C.red, opacity: 0.6 }}/>
                <div style={{ height: "100%", width: `${o.value}%`, background: c, borderRadius: 4 }}/>
              </div>
              <div style={{ fontSize: 10.5, color: C.ink4, display: "flex", gap: 8 }}>
                <span>주요 태그:</span>
                {o.top.map((t, ti) => <MonoNum key={ti} size={10.5} color={C.ink3} weight={500}>{t}</MonoNum>)}
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

// ============ 05 분기 추세 ============
function QuarterTrend() {
  const series = [
    { label: "코칭 후보율", values: [22.1, 19.4, 16.8, 14.2], color: C.amber, target: 10 },
    { label: "기준 통일도", values: [76, 81, 85, 87], color: C.green, target: 90, unit: "%" },
    { label: "검토 완료율", values: [42, 51, 58, 64], color: C.brand, target: 80, unit: "%" },
  ];
  const labels = ["25.Q3", "25.Q4", "26.Q1", "26.Q2"];
  const W = 380, H = 140, P = 28;

  return (
    <CardShell padding="22px 24px">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>핵심 지표 4분기 추세</div>
          <div style={{ fontSize: 11.5, color: C.ink4, marginTop: 3 }}>전 분기 대비 모든 지표 개선 추세 · 목표선 도달까지 한 분기 남음</div>
        </div>
      </div>

      <svg width={W} height={H} style={{ display: "block", margin: "0 auto" }}>
        {/* Y grid */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line key={y} x1={P} x2={W - 10} y1={H - P - (y / 100) * (H - P * 1.5)} y2={H - P - (y / 100) * (H - P * 1.5)} stroke="#ECEFF5" strokeWidth="1"/>
        ))}
        {/* X labels */}
        {labels.map((l, i) => (
          <text key={l} x={P + (i / (labels.length - 1)) * (W - P - 10)} y={H - 8} fontSize="10" fill="#7C87A4" textAnchor="middle" fontFamily="var(--font-mono)">{l}</text>
        ))}
        {/* Lines */}
        {series.map((s) => {
          const max = Math.max(...s.values, s.target);
          const pts = s.values.map((v, i) => `${P + (i / (s.values.length - 1)) * (W - P - 10)},${H - P - (v / max) * (H - P * 1.5)}`).join(" ");
          return (
            <g key={s.label}>
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              {s.values.map((v, i) => (
                <circle key={i} cx={P + (i / (s.values.length - 1)) * (W - P - 10)} cy={H - P - (v / max) * (H - P * 1.5)} r="3" fill="#fff" stroke={s.color} strokeWidth="2"/>
              ))}
            </g>
          );
        })}
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
        {series.map((s) => {
          const last = s.values[s.values.length - 1];
          const first = s.values[0];
          const delta = (last - first).toFixed(1);
          const isImproving = (s.label === "코칭 후보율") ? delta < 0 : delta > 0;
          return (
            <div key={s.label} style={{ display: "grid", gridTemplateColumns: "12px 1fr 60px 56px", alignItems: "center", gap: 8, fontSize: 11.5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color }}/>
              <span style={{ color: C.ink2 }}>{s.label}</span>
              <MonoNum size={12} color={C.ink}>{last}{s.unit || "%"}</MonoNum>
              <MonoNum size={11} color={isImproving ? C.green : C.red} weight={600}>{delta > 0 ? "+" : ""}{delta}</MonoNum>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

// ============ 06 AI 코칭 사례 카드 ============
function CaseCards() {
  const cases = [
    {
      hq: "운영본부", member: "정**", role: "5급",
      kr: "월 이슈 대응 50건 이상 처리",
      tags: ["건수형지표 C08", "측정모호 C05"],
      coach: "건수보다 'p95 응답속도 < 800ms 유지' 같은 질적 지표로 함께 정제해볼까요?",
      severity: "high",
    },
    {
      hq: "사업본부", member: "박**", role: "4급갑",
      kr: "고객 만족도 향상에 기여",
      tags: ["통제불가 C02", "표현모호 C04"],
      coach: "외부 만족도는 통제 밖이에요. '응답 SLA 24h 내 95%' 같은 통제 가능 측정으로 바꿔보세요.",
      severity: "high",
    },
    {
      hq: "DX본부", member: "김**", role: "4급을",
      kr: "데이터 거버넌스 체계 수립 (자체 평가)",
      tags: ["자기보고형 C10"],
      coach: "외부 증빙(감사 통과 · 시스템 적용 건수)으로 함께 보완해볼까요?",
      severity: "mid",
    },
  ];
  const sev = (s) => s === "high" ? { c: C.red, bg: C.redLight, label: "코칭 · 상" } : { c: C.amber, bg: C.amberLight, label: "코칭 · 중" };

  return (
    <CardShell padding="22px 24px">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>AI 추출 코칭 사례 · 3건</div>
          <div style={{ fontSize: 11.5, color: C.ink4, marginTop: 3 }}>경계/극단 KR을 사례로 정리 · 평가자와 함께 보세요 (개인정보 마스킹)</div>
        </div>
        <div style={{ flex: 1 }}/>
        <Pill label="✨ AI 자동 추출" color={C.brand} bg={C.brandLight}/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {cases.map((c, i) => {
          const s = sev(c.severity);
          return (
            <div key={i} style={{
              background: "#fff", border: `1px solid ${C.border}`, borderRadius: 11,
              padding: "14px 16px", borderLeft: `4px solid ${s.c}`,
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Pill label={s.label} color={s.c} bg={s.bg}/>
                <span style={{ fontSize: 10.5, color: C.ink4, fontFamily: "var(--font-mono)" }}>{c.hq} · {c.member} · {c.role}</span>
              </div>
              <div style={{
                padding: "10px 12px", background: C.bg2,
                border: `1px solid ${C.borderLight}`, borderRadius: 8,
                fontSize: 12.5, color: C.ink, lineHeight: 1.5,
                fontStyle: "italic",
              }}>"{c.kr}"</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {c.tags.map((t) => (
                  <span key={t} style={{
                    padding: "2px 7px", borderRadius: 5,
                    background: C.redLight, color: C.red,
                    fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
                  }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: C.ink2, lineHeight: 1.55, paddingTop: 4 }}>
                <span style={{ color: C.brand, fontWeight: 700 }}>💡 코칭 권고: </span>{c.coach}
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

// ============ 11항목별 위반율 ============
function CheckItemBreakdown() {
  // 11항목 미니 막대
  const items = [
    { no: 1, name: "수치 측정 가능", rate: 17 },
    { no: 2, name: "외부 의존 통제", rate: 11 },
    { no: 3, name: "도전적 목표", rate: 7 },
    { no: 4, name: "현실적 달성", rate: 5 },
    { no: 5, name: "명확한 언어", rate: 14 },
    { no: 6, name: "타 팀 중복 없음", rate: 9 },
    { no: 7, name: "신기술 비의존", rate: 3 },
    { no: 8, name: "질적 지표", rate: 13 },
    { no: 9, name: "확인 가능 증거", rate: 6 },
    { no: 10, name: "외부 증빙", rate: 16 },
    { no: 11, name: "고위험 통제", rate: 4 },
  ];
  return (
    <CardShell padding="22px 24px">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>체크리스트 11항목별 위반율</div>
          <div style={{ fontSize: 11.5, color: C.ink4, marginTop: 3 }}>전체 286건 중 각 항목 위반(체크 N) 비율</div>
        </div>
        <div style={{ flex: 1 }}/>
        <a href="./r3-criteria.html" style={{ fontSize: 12, color: C.brand, textDecoration: "none", fontWeight: 600 }}>기준 편집 →</a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 6, alignItems: "end", height: 110 }}>
        {items.map((it) => {
          const h = (it.rate / 20) * 100;
          const tone = it.rate >= 14 ? C.red : it.rate >= 8 ? C.amber : C.green;
          return (
            <div key={it.no} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <MonoNum size={10.5} color={tone} weight={700}>{it.rate}%</MonoNum>
              <div style={{ height: 88, width: "100%", display: "flex", alignItems: "flex-end" }}>
                <div style={{ width: "100%", height: `${Math.max(h, 4)}%`, background: tone, borderRadius: "5px 5px 0 0", opacity: 0.85 }}/>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 6, marginTop: 8 }}>
        {items.map((it) => (
          <div key={it.no} style={{ textAlign: "center", fontSize: 9.5, color: C.ink4, lineHeight: 1.3 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: C.ink3 }}>{String(it.no).padStart(2, "0")}</div>
            <div style={{ marginTop: 2 }}>{it.name}</div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ============ MAIN ============
function R3Console() {
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg, overflow: "hidden" }}>
      <TopBar title="캘리브레이션 인사이트" subtitle="2026 상반기 · 전사 OKR 진단 (Step 05/06)"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px 56px" }}>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: "0.06em" }}>STEP 05 / 06</span>
          <div style={{ flex: 1, height: 2, background: C.border, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: "83%", height: "100%", background: C.orange }}/>
          </div>
          <a href="./r3-export.html" style={{ fontSize: 12, color: C.brand, textDecoration: "none", fontWeight: 600 }}>다음: 산출물 →</a>
        </div>

        {/* Hero */}
        <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 22 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              2026 상반기 캘리브레이션 진단
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: 13.5, color: C.ink3, lineHeight: 1.65 }}>
              평가자와 함께 코칭할 후보를 알려드려요. 확정된 위반이 아니라, <b style={{ color: C.ink }}>기준을 함께 정제하는 출발점</b>입니다.
            </p>
          </div>
          {/* Filter chips */}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={chipBtn}><Icon name="calendar" size={13} style={{ color: C.ink3 }}/> 2026 상반기 <Icon name="chevronDown" size={11} style={{ color: C.ink5 }}/></button>
            <button style={chipBtn}><Icon name="filter" size={13} style={{ color: C.ink3 }}/> 전 본부 <Icon name="chevronDown" size={11} style={{ color: C.ink5 }}/></button>
            <button style={chipBtn}><Icon name="sliders" size={13} style={{ color: C.ink3 }}/> 전 직급 <Icon name="chevronDown" size={11} style={{ color: C.ink5 }}/></button>
            <a href="./r3-export.html" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="sm" leftIcon={<span>📥</span>}>Excel</Button>
            </a>
          </div>
        </div>

        {/* HERO KPI 4종 */}
        <HeroKpi/>

        {/* SECTION A — 본부·직급별 진단 */}
        <SectionHeader num="A" title="조직별 코칭 분포" hint="어디에 코칭이 필요한가"/>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18, marginBottom: 30 }}>
          <HqGradeHeatmap/>
          <PostAdjustment/>
        </div>

        {/* SECTION B — 어떤 항목이 문제인가 */}
        <SectionHeader num="B" title="위험 유형 진단" hint="어떤 기준이 가장 자주 부합하지 않는가"/>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, marginBottom: 30 }}>
          <RiskTypeDistribution/>
          <QuarterTrend/>
        </div>

        {/* SECTION C — 누구를 코칭할 것인가 */}
        <SectionHeader num="C" title="실행 가능한 액션" hint="누구와 어떻게 코칭할 것인가"/>
        <div style={{ marginBottom: 18 }}>
          <HqWorklist/>
        </div>
        <div style={{ marginBottom: 30 }}>
          <CheckItemBreakdown/>
        </div>

        {/* SECTION D — 사례 */}
        <SectionHeader num="D" title="코칭 사례 카드" hint="AI 자동 추출 · 평가자 회의용"/>
        <div style={{ marginBottom: 28 }}>
          <CaseCards/>
        </div>

        {/* Footer note */}
        <div style={{
          padding: "16px 22px",
          background: C.brandLight, border: `1px solid #C5D0F7`, borderRadius: 12,
          display: "flex", alignItems: "center", gap: 14,
          fontSize: 13, color: "#1B2A4E", lineHeight: 1.6,
        }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <span style={{ flex: 1 }}>
            모든 인사이트는 <b>"코칭 후보"</b>를 알려주는 신호입니다. 확정된 위반이 아니에요.
            기준을 바꾸려면 <a href="./r3-criteria.html" style={{ color: C.brand, fontWeight: 700, textDecoration: "none" }}>평가 기준 편집 →</a>에서 11항목을 조정해주세요.
          </span>
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

window.R3Console = R3Console;
