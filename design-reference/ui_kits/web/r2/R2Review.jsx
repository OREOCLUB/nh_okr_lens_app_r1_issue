// R2Review.jsx — OKR 검토 + AI Validation (사전 검토)
// 명세 기반: 9개 체크 항목 / 반려 이력 타임라인 / 작년 OKR 모달 / 집중 코칭 토글

// ─────────────────────────────────────────────
// 1. 팀원 목록 아코디언 아이템
// ─────────────────────────────────────────────
function MemberListItem({ m, selected, onClick }) {
  const statusConfig = {
    pending:    { label: "결재 요청", bg: "#FFF0F0", fg: "#D14343" },
    rejected:   { label: "반려",      bg: "#FFF7EC", fg: "#D98023" },
    adjustment: { label: "조정",      bg: "#FFFAE7", fg: "#C29017" },
    draft:      { label: "작성 중",   bg: "#F1F3F8", fg: "#5B6685" },
    approved:   { label: "승인",      bg: "#ECFAF1", fg: "#2F9E5E" },
  };
  const sc = statusConfig[m.status];

  return (
    <div onClick={onClick} style={{
      padding: "11px 14px",
      background: selected ? "#F1F4FD" : "transparent",
      borderLeft: m.focus
        ? `3px solid #D98023`
        : selected ? "3px solid #3B5BDB" : "3px solid transparent",
      borderBottom: "1px solid #ECEFF5",
      cursor: "pointer",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: m.focus ? "#FFF7EC" : "#E5EBFB",
        color: m.focus ? "#D98023" : "#213A8C",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: 12, flexShrink: 0,
      }}>{m.name[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {m.focus && <span style={{ fontSize: 11 }}>🎯</span>}
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36" }}>{m.name}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#A4ADC4", fontWeight: 500 }}>{m.grade}·{m.series}</span>
        </div>
        <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.group} · {m.submitDate || "—"}</div>
      </div>
      <span style={{ padding: "2px 7px", borderRadius: 999, background: sc.bg, color: sc.fg, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{sc.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. AI Validation 체크 항목
// ─────────────────────────────────────────────
function AIVCheckItem({ no, text, verdict, reason, edited, onChange }) {
  const verdicts = {
    pass: { bg: "#ECFAF1", bd: "#BBE9CC", fg: "#2F9E5E", ico: "✓", label: "통과" },
    warn: { bg: "#FFF7EC", bd: "#FFE0BA", fg: "#D98023", ico: "!", label: "주의" },
    fail: { bg: "#FFF0F0", bd: "#FFD4D4", fg: "#D14343", ico: "✗", label: "위반" },
  };
  const v = verdicts[verdict];
  return (
    <div style={{
      padding: "11px 14px",
      background: "#fff",
      border: `1px solid ${edited ? "#FFE0BA" : "#ECEFF5"}`,
      borderRadius: 10,
      display: "flex", gap: 11, alignItems: "flex-start",
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: 7,
        background: v.bg, color: v.fg, border: `1px solid ${v.bd}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>{v.ico}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: reason ? 4 : 0 }}>
          <span style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "#A4ADC4", fontWeight: 600 }}>{no.toString().padStart(2, "0")}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>{text}</span>
          {edited && <span style={{ fontSize: 10, color: "#D98023", fontWeight: 600 }}>✏️ 수정됨</span>}
        </div>
        {reason && <div style={{ fontSize: 11.5, color: "#5B6685", lineHeight: 1.5 }}>{reason}</div>}
      </div>
      <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
        {["pass", "warn", "fail"].map((k) => {
          const vv = verdicts[k];
          const active = verdict === k;
          return (
            <button key={k} onClick={(e) => { e.stopPropagation(); onChange && onChange(k); }} style={{
              width: 26, height: 26, borderRadius: 6,
              background: active ? vv.bg : "#fff",
              border: `1px solid ${active ? vv.bd : "#E1E5EF"}`,
              color: active ? vv.fg : "#A4ADC4",
              fontSize: 11.5, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }} title={vv.label}>{vv.ico}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. 작년 OKR 모달
// ─────────────────────────────────────────────
function PrevOKRModal({ open, onClose }) {
  const [year, setYear] = React.useState("2025-H2");
  if (!open) return null;

  const data = {
    "2025-H2": {
      objective: "장애 운영 안정화 (안정성 그룹)",
      krs: [
        { kr: "MTTR(평균 복구 시간) 22분 → 15분 단축", diff: "중", grade: "A", achievement: 92, result: "MTTR 13.4분 달성. 분기 후반 자동화 알림 룰 효과." },
        { kr: "야간 장애 자동 알림 룰 신설 5건", diff: "중", grade: "A", achievement: 100, result: "5건 등록 완료. 운영팀 야간 대응 시간 30% 감소." },
      ],
      insight: { tone: "ok", text: "작년 대비 목표 수준 상향 — 전년 90% 이상 달성하셨으니 도전성 +1단계 검토 권장." },
    },
    "2025-H1": {
      objective: "배포 자동화",
      krs: [
        { kr: "배포 시간 25분 → 8분 단축", diff: "중", grade: "A", achievement: 88, result: "배포 시간 9.2분으로 단축. 일부 수동 단계 잔존." },
      ],
      insight: { tone: "ok", text: "전년 88% 달성 — 이번 목표는 측정 지표가 비슷한 수준입니다. 도전성 검토 여지 있어요." },
    },
    "2024-H2": {
      objective: "DB 성능 개선",
      krs: [
        { kr: "쿼리 평균 응답 220ms → 130ms", diff: "중", grade: "B", achievement: 75, result: "평균 응답 158ms. 일부 복합 쿼리 미개선." },
      ],
      insight: { tone: "warn", text: "전년도 75% 부분 미달성 이력 — 이번 KR의 현실성을 함께 검토해주세요." },
    },
  };
  const cur = data[year];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,26,54,0.42)", zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, width: "min(800px, 100%)", maxHeight: "85vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 30px 80px -10px rgba(15,26,54,.40)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 0", borderBottom: "1px solid #ECEFF5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Icon name="library" size={18} style={{ color: "#3B5BDB" }}/>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36" }}>김태양 님의 이전 OKR</div>
            <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 999, background: "#FFEDE2", color: "#E07A3C", fontSize: 11, fontWeight: 600 }}>💡 참고용 · 평가에 비공개</span>
            <button onClick={onClose} style={{
              width: 28, height: 28, borderRadius: 8, background: "#F4F7FB", border: "none",
              color: "#5B6685", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          </div>
          {/* Year tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {Object.keys(data).map(y => (
              <button key={y} onClick={() => setYear(y)} style={{
                padding: "9px 16px",
                background: "transparent", border: "none",
                fontSize: 13, fontWeight: 600,
                color: year === y ? "#3B5BDB" : "#7C87A4",
                cursor: "pointer", fontFamily: "var(--font-sans)",
                borderBottom: `2px solid ${year === y ? "#3B5BDB" : "transparent"}`,
                marginBottom: -1,
              }}>{y}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {/* Objective */}
          <div style={{ marginBottom: 14, padding: "12px 14px", background: "#F4F7FB", borderRadius: 10 }}>
            <div style={{ fontSize: 10.5, color: "#7C87A4", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>Objective</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: "#0F1A36" }}>{cur.objective}</div>
          </div>

          {/* KR rows */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 50px 80px", gap: 12, padding: "8px 14px", background: "#F9FAFC", borderRadius: 8, fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
            <span>Key Result</span>
            <span style={{ textAlign: "center" }}>난이도</span>
            <span style={{ textAlign: "center" }}>등급</span>
            <span style={{ textAlign: "right" }}>달성률</span>
          </div>
          {cur.krs.map((k, i) => {
            const gradeColors = { S: "#6B47E0", A: "#3B5BDB", B: "#2F9E5E", C: "#D98023", D: "#7C87A4" };
            return (
              <div key={i} style={{ padding: "12px 14px", borderBottom: "1px solid #ECEFF5" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 50px 80px", gap: 12, alignItems: "center" }}>
                  <div style={{ fontSize: 13, color: "#0F1A36", fontWeight: 500, lineHeight: 1.5 }}>{k.kr}</div>
                  <span style={{ padding: "2px 8px", borderRadius: 999, background: "#F4F7FB", color: "#5B6685", fontSize: 11, fontWeight: 600, textAlign: "center" }}>{k.diff}</span>
                  <span style={{ padding: "3px 0", borderRadius: 6, background: gradeColors[k.grade], color: "#fff", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, textAlign: "center" }}>{k.grade}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#0F1A36", textAlign: "right", fontSize: 13 }}>{k.achievement}%</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 11.5, color: "#5B6685", lineHeight: 1.55, paddingLeft: 0 }}>
                  <span style={{ color: "#A4ADC4" }}>결과 · </span>{k.result}
                </div>
              </div>
            );
          })}

          {/* Insight */}
          <div style={{
            marginTop: 14, padding: "12px 14px",
            background: cur.insight.tone === "ok" ? "#ECFAF1" : "#FFF7EC",
            border: `1px solid ${cur.insight.tone === "ok" ? "#BBE9CC" : "#FFE0BA"}`,
            borderRadius: 10,
            fontSize: 12.5, color: cur.insight.tone === "ok" ? "#1F5C3B" : "#7A4A14",
            lineHeight: 1.55,
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 14 }}>💡</span>
            <div><b>참고 포인트 · </b>{cur.insight.text}</div>
          </div>
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid #ECEFF5", display: "flex", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose}>닫기</Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 4. 반려 이력 타임라인
// ─────────────────────────────────────────────
function RejectHistoryTimeline() {
  const events = [
    {
      kind: "submit", label: "1차 제출", date: "05/18", color: "#5B6685",
      detail: <>KR: 결제 게이트웨이 응답속도 800ms 이하 유지<br/>난이도: 하</>
    },
    {
      kind: "reject", label: "1차 반려", date: "05/20", color: "#D14343",
      detail: "유지형 KR — 도전 목표가 아님. 측정 기준이 모호하고 baseline 수치가 빠져 있어요. 도전적 수치 목표와 측정 방법을 명시해주세요."
    },
    {
      kind: "submit", label: "2차 제출 (현재)", date: "05/24", color: "#3B5BDB", current: true,
      detail: <>KR: 결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축<br/>난이도: 중 · baseline 명시 추가</>
    },
  ];
  return (
    <div style={{ background: "#fff", border: "1px solid #FFE0BA", borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 14 }}>↩</span>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>반려 이력 (재상신)</div>
        <span style={{ marginLeft: "auto", padding: "2px 9px", borderRadius: 999, background: "#FFF7EC", color: "#D98023", fontSize: 10.5, fontWeight: 700 }}>2차 검토 중</span>
      </div>
      <div style={{ position: "relative", paddingLeft: 0 }}>
        <div style={{ position: "absolute", left: 6, top: 10, bottom: 14, width: 2, background: "#ECEFF5", zIndex: 0 }}/>
        {events.map((e, i) => (
          <div key={i} style={{ display: "flex", gap: 14, position: "relative", marginBottom: i < events.length - 1 ? 14 : 0 }}>
            <div style={{
              width: 14, height: 14, borderRadius: "50%",
              background: e.color, marginTop: 3,
              border: "2px solid #fff", boxShadow: e.current ? `0 0 0 3px ${e.color}33` : "none",
              flexShrink: 0, zIndex: 1,
            }}/>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: e.current ? e.color : "#0F1A36" }}>{e.label}</span>
                <span style={{ fontSize: 11, color: "#7C87A4", fontFamily: "var(--font-mono)" }}>{e.date}</span>
              </div>
              <div style={{
                fontSize: 11.5, color: e.kind === "reject" ? "#7A2020" : "#3A4565",
                lineHeight: 1.55,
                padding: e.kind === "reject" ? "8px 10px" : "0",
                background: e.kind === "reject" ? "#FFF0F0" : "transparent",
                borderRadius: e.kind === "reject" ? 8 : 0,
              }}>{e.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 5. R2Review 메인
// ─────────────────────────────────────────────
function R2Review() {
  const allMembers = window.OKRDummy.members;
  // 검토 대상: 결재요청/반려/조정 + 작성중 + 승인 (탭으로 구분)
  const [tab, setTab] = React.useState("review"); // review (대기/반려/조정) | all
  const [selectedId, setSelectedId] = React.useState("E1002"); // 강동우 — 재상신 검토 중
  const [showPrevModal, setShowPrevModal] = React.useState(false);
  const [verdict, setVerdict] = React.useState("adjust"); // null | approve | adjust | reject
  const [focus, setFocus] = React.useState(true);
  const [aiRun, setAiRun] = React.useState(true);  // AI 검토 실행 여부

  const reviewMembers = allMembers.filter(m => ["pending", "rejected", "adjustment"].includes(m.status));
  const visible = tab === "review" ? reviewMembers : allMembers.filter(m => m.status !== "draft");

  // 9개 AI Validation 체크 항목 (명세)
  const [checks, setChecks] = React.useState([
    { no: 1, text: "수치로 측정 가능한가?", verdict: "pass" },
    { no: 2, text: "외부 의존성 없이 통제 가능한가?", verdict: "pass" },
    { no: 3, text: "유지형이 아닌 도전적인 목표인가?", verdict: "pass", reason: "재상신 시 baseline·target 명시되어 도전성 확보됨", edited: true },
    { no: 4, text: "시간 내 현실적으로 달성 가능한가?", verdict: "warn", reason: "6개월 내 41% 개선은 도전적 — 분기 마일스톤 권장" },
    { no: 5, text: "명확한 언어인가?", verdict: "pass" },
    { no: 6, text: "타 팀 KR과 겹치지 않는가?", verdict: "pass" },
    { no: 7, text: "신기술/새 도구에 과도히 의존하지 않는가?", verdict: "pass" },
    { no: 8, text: "단순 건수형이 아닌 질적 지표인가?", verdict: "pass" },
    { no: 9, text: "평가자가 확인 가능한 증거가 있는가?", verdict: "fail", reason: "APM 캡처·리포트 첨부가 필요해요" },
  ]);
  const violations = checks.filter(c => c.verdict === "fail").length;
  const warns = checks.filter(c => c.verdict === "warn").length;
  const editedCount = checks.filter(c => c.edited).length;
  const riskLevel = violations >= 4 ? "high" : violations >= 2 ? "mid" : "low";
  const riskInfo = {
    high: { label: "상", bg: "#FFF0F0", fg: "#D14343", ico: "🔴" },
    mid:  { label: "중", bg: "#FFF7EC", fg: "#D98023", ico: "🟡" },
    low:  { label: "하", bg: "#ECFAF1", fg: "#2F9E5E", ico: "🟢" },
  }[riskLevel];

  const updateCheck = (i, v) => {
    const next = [...checks];
    next[i] = { ...next[i], verdict: v, edited: true };
    setChecks(next);
  };

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="OKR 검토" subtitle="정태영 팀장 · 결제요청 4건 / 반려 2건 / 조정 1건"/>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Left — 팀원 목록 ── */}
        <div style={{ width: 280, minWidth: 280, background: "#fff", borderRight: "1px solid #E1E5EF", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #ECEFF5" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>검토 대상</div>
            <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 2 }}>{reviewMembers.length}명 · 결재요청 우선</div>
            <div style={{ marginTop: 10, display: "flex", background: "#F4F7FB", borderRadius: 8, padding: 3 }}>
              <button onClick={() => setTab("review")} style={tab === "review" ? selectedTab : unselectedTab}>검토 대기 {reviewMembers.length}</button>
              <button onClick={() => setTab("all")} style={tab === "all" ? selectedTab : unselectedTab}>전체 {allMembers.filter(m=>m.status!=="draft").length}</button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {visible.map((m) => (
              <MemberListItem key={m.id} m={m}
                selected={selectedId === m.id}
                onClick={() => setSelectedId(m.id)}/>
            ))}
          </div>
        </div>

        {/* ── Center — KR 상세 검토 ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", minWidth: 0 }}>

          {/* Member header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FFF7EC", color: "#D98023", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>강</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em" }}>🎯 강동우</h2>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#7C87A4" }}>차장 · SE</span>
                <span style={{ padding: "2px 9px", borderRadius: 999, background: "#FFF7EC", border: "1px solid #FFE0BA", color: "#D98023", fontSize: 11, fontWeight: 600 }}>재상신 · 2차 검토</span>
                {focus && <span style={{ padding: "2px 9px", borderRadius: 999, background: "#FFEDE2", color: "#E07A3C", fontSize: 11, fontWeight: 700 }}>🎯 집중 코칭 대상</span>}
              </div>
              <div style={{ fontSize: 12.5, color: "#5B6685", marginTop: 3 }}>운영본부 · 결제플랫폼팀 · 시운영 · 제출일 05/24</div>
            </div>
            <Button variant="secondary" size="sm" leftIcon={<Icon name="library" size={13}/>}
              onClick={() => setShowPrevModal(true)}>📂 작년 OKR 보기</Button>
          </div>

          {/* 집중 코칭 + 미등록 경고 */}
          {focus && (
            <div style={{
              padding: "10px 14px", marginBottom: 14,
              background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 15 }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#7A4A14" }}>집중 코칭 대상이지만 1on1 코칭이 미등록 상태예요.</div>
                <div style={{ fontSize: 11, color: "#9C5E26", marginTop: 1 }}>이번 주 안에 1on1을 잡아주세요.</div>
              </div>
              <Button variant="primary" size="sm">+ 1on1 등록</Button>
            </div>
          )}

          {/* 반려 이력 타임라인 */}
          <div style={{ marginBottom: 16 }}>
            <RejectHistoryTimeline/>
          </div>

          {/* KR 카드 */}
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#7C87A4" }}>KR_2026_002</span>
              <span style={{ padding: "2px 9px", borderRadius: 999, background: "#E5EBFB", color: "#213A8C", fontSize: 11, fontWeight: 600 }}>난이도 · 중</span>
              <span style={{ padding: "2px 9px", borderRadius: 999, background: "#F4F7FB", color: "#5B6685", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)" }}>KR · 수치</span>
              <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 12, color: "#7C87A4" }}>가중치 30%</span>
            </div>
            <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 4 }}>Objective · 핵심 서비스 응답속도 개선</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#0F1A36", lineHeight: 1.55, marginBottom: 14, letterSpacing: "-0.01em" }}>
              결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축한다.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, paddingTop: 12, borderTop: "1px solid #ECEFF5" }}>
              <div><div style={{ fontSize: 10.5, color: "#7C87A4", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 3 }}>측정 방법</div><div style={{ fontSize: 12.5, color: "#0F1A36", fontWeight: 500 }}>APM p95 월평균</div></div>
              <div><div style={{ fontSize: 10.5, color: "#7C87A4", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 3 }}>Baseline → Goal</div><div style={{ fontSize: 12.5, color: "#0F1A36", fontWeight: 500, fontFamily: "var(--font-mono)" }}>850ms → 500ms</div></div>
              <div><div style={{ fontSize: 10.5, color: "#7C87A4", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 3 }}>실행 계획</div><div style={{ fontSize: 12.5, color: "#0F1A36", fontWeight: 500 }}>3건 · 캐시·인덱스·튜닝</div></div>
            </div>
          </div>

          {/* AI Validation */}
          {!aiRun ? (
            <div style={{
              background: "linear-gradient(135deg, #F1F4FD, #fff 60%)",
              border: "1px dashed #C5D0F7", borderRadius: 12,
              padding: "32px 24px", textAlign: "center", marginBottom: 14,
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "#3B5BDB", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>✨</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>AI 사전 검토를 실행할까요?</div>
              <div style={{ fontSize: 12.5, color: "#5B6685", marginBottom: 16 }}>9개 항목을 자동 판정해 폼에 입력합니다. 각 항목은 평가자가 수정할 수 있어요.</div>
              <button onClick={() => setAiRun(true)} style={{
                padding: "10px 20px", background: "#3B5BDB", color: "#fff", border: "none",
                borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "var(--font-sans)",
                display: "inline-flex", alignItems: "center", gap: 6,
                boxShadow: "0 4px 12px -2px rgba(59,91,219,.30)",
              }}>🤖 AI 검토 실행하기</button>
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg, #F1F4FD, #fff 40%)", border: "1px solid #C5D0F7", borderRadius: 12, padding: "18px 20px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✨</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F1A36" }}>AI Validation · 9항목 자동 검토</div>
                  <div style={{ fontSize: 11.5, color: "#5B6685", marginTop: 2 }}>
                    위험도 <b style={{ color: riskInfo.fg }}>{riskInfo.ico} {riskInfo.label}</b> ·
                    위반 <b style={{ color: "#D14343" }}>{violations}건</b> ·
                    주의 <b style={{ color: "#D98023" }}>{warns}건</b>
                    {editedCount > 0 && <> · <b style={{ color: "#D98023" }}>{editedCount}건 수정</b></>}
                  </div>
                </div>
                <button onClick={() => {
                  setChecks(checks.map(c => ({ ...c, edited: false })));
                }} style={{
                  padding: "6px 12px", background: "#fff", border: "1px solid #C5D0F7",
                  borderRadius: 8, fontSize: 11.5, color: "#2C49B8", fontWeight: 600, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-sans)",
                }}>🔄 AI 재검토</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {checks.map((c, i) => (
                  <AIVCheckItem key={i} {...c} onChange={(v) => updateCheck(i, v)}/>
                ))}
              </div>

              {/* 종합 코멘트 */}
              <div style={{
                marginTop: 14, padding: "12px 14px",
                background: "#fff", border: "1px solid #C5D0F7", borderRadius: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#213A8C" }}>✨ AI 종합 코멘트</div>
                  <span style={{ fontSize: 10, color: "#5B6685", fontWeight: 500 }}>자유롭게 수정 가능</span>
                </div>
                <textarea defaultValue="재상신 후 baseline 명시와 도전성이 보강되었습니다. 다만 APM 측정 증빙 첨부가 필요하며, 6개월 41% 개선은 분기 마일스톤으로 쪼개 진행 점검을 수월하게 할 것을 권장합니다."
                  style={{
                    width: "100%", minHeight: 60, padding: "8px 10px",
                    background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 8,
                    fontFamily: "var(--font-sans)", fontSize: 12.5, color: "#3A4565",
                    outline: "none", resize: "vertical", lineHeight: 1.55,
                  }}/>
              </div>
            </div>
          )}
        </div>

        {/* ── Right — Actions ── */}
        <div style={{ width: 320, minWidth: 320, background: "#fff", borderLeft: "1px solid #E1E5EF", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>검토 처리</div>
              <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 2 }}>의견을 작성하고 처리해주세요.</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* 집중 코칭 토글 */}
            <div style={{
              padding: "12px 14px",
              background: focus ? "#FFF7EC" : "#F4F7FB",
              border: `1px solid ${focus ? "#FFE0BA" : "#E1E5EF"}`,
              borderRadius: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: focus ? "#7A4A14" : "#0F1A36" }}>🎯 집중 코칭 대상자 지정</span>
                <div onClick={() => setFocus(!focus)} style={{
                  marginLeft: "auto", width: 36, height: 22, borderRadius: 999,
                  background: focus ? "#D98023" : "#C8CFDF",
                  position: "relative", cursor: "pointer", transition: "background 200ms",
                }}>
                  <div style={{ position: "absolute", top: 2, left: focus ? 16 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.18)", transition: "left 200ms" }}/>
                </div>
              </div>
              <div style={{ fontSize: 11, color: focus ? "#9C5E26" : "#7C87A4", marginTop: 6, lineHeight: 1.5 }}>지정 시 캘린더 · OKR 목록 · 미등록 목록에 자동 연동됩니다.</div>
            </div>

            {/* 처리 방향 */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#3A4565", marginBottom: 8, letterSpacing: "0.02em" }}>처리 방향</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { key: "approve", label: "✓ 승인",       desc: "KR이 충분히 정제되었어요",  color: "#2F9E5E", bg: "#ECFAF1", bd: "#BBE9CC" },
                  { key: "adjust",  label: "↻ 조정 요청",  desc: "함께 보완할 부분이 있어요",  color: "#D98023", bg: "#FFF7EC", bd: "#FFE0BA" },
                  { key: "reject",  label: "↩ 반려",       desc: "전체 재작성이 필요해요",     color: "#D14343", bg: "#FFF0F0", bd: "#FFD4D4" },
                ].map((v) => {
                  const active = verdict === v.key;
                  return (
                    <div key={v.key} onClick={() => setVerdict(v.key)} style={{
                      padding: "11px 13px",
                      background: active ? v.bg : "#fff",
                      border: `1.5px solid ${active ? v.color : "#E1E5EF"}`,
                      borderRadius: 10, cursor: "pointer",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: active ? v.color : "#0F1A36" }}>{v.label}</div>
                      <div style={{ fontSize: 11.5, color: active ? v.color : "#7C87A4", marginTop: 1, opacity: active ? 0.85 : 1 }}>{v.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Message */}
            {verdict !== "approve" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#3A4565", letterSpacing: "0.02em" }}>
                    {verdict === "reject" ? "반려 사유" : "조정 요청 메시지"}
                  </div>
                  <button style={{
                    marginLeft: "auto",
                    padding: "4px 9px", background: "#F1F4FD", border: "1px solid #C5D0F7",
                    borderRadius: 7, fontSize: 11, color: "#2C49B8", fontWeight: 600, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-sans)",
                  }}>✨ AI 초안</button>
                </div>
                <textarea defaultValue={verdict === "reject"
                  ? "강동우 님, 재상신해주신 KR을 확인했어요. 다만 아래 항목은 추가 보완이 필요해 보입니다.\n\n- APM 측정 증빙(캡처/리포트) 첨부가 누락되었어요.\n- 6개월 41% 개선의 분기 마일스톤을 KR 본문에 명시해주세요.\n\n전면 재작성보다는 부분 보완 후 조정요청으로 전환할 수 있어요."
                  : "강동우 님, 재상신해주신 부분 잘 확인했어요. 두 가지만 함께 보완해볼까요?\n\n1. APM 캡처·리포트를 주간 코칭 메모에 첨부해주세요 (외부 증빙)\n2. 6개월 41% 개선은 도전적이에요. 3·6월 분기 마일스톤을 추가하면 진행 점검이 수월할 거예요.\n\n화요일 1on1에서 함께 정리해요 :)"}
                  style={{
                    width: "100%", minHeight: 120, padding: "10px 12px",
                    background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 10,
                    fontFamily: "var(--font-sans)", fontSize: 12.5, color: "#0F1A36",
                    outline: "none", resize: "vertical", lineHeight: 1.55,
                  }}/>
                <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 4, textAlign: "right" }}>178 / 500자</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "14px 20px", borderTop: "1px solid #ECEFF5", display: "flex", flexDirection: "column", gap: 8 }}>
            <Button variant="primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
              {verdict === "approve" ? "승인하기" : verdict === "reject" ? "반려 보내기" : "조정요청 보내기"} →
            </Button>
            <Button variant="ghost" style={{ width: "100%", justifyContent: "center", padding: "9px", fontSize: 12 }}>임시 저장 후 다음 팀원 →</Button>
          </div>
        </div>
      </div>

      <PrevOKRModal open={showPrevModal} onClose={() => setShowPrevModal(false)}/>
    </main>
  );
}

const selectedTab = { flex: 1, padding: "6px", background: "#fff", border: "none", borderRadius: 6, fontSize: 11.5, fontWeight: 700, color: "#0F1A36", cursor: "pointer", fontFamily: "var(--font-sans)", boxShadow: "0 1px 2px rgba(31,42,74,.06)" };
const unselectedTab = { flex: 1, padding: "6px", background: "transparent", border: "none", fontSize: 11.5, fontWeight: 500, color: "#5B6685", cursor: "pointer", fontFamily: "var(--font-sans)" };

window.R2Review = R2Review;
