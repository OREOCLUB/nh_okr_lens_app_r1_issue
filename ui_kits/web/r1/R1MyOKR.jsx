// R1MyOKR.jsx — 나의 OKR 상세 페이지

function ProgressChart() {
  // 주간 달성률 추이 (16주)
  const data = [12,15,18,22,28,32,38,42,48,52,58,62,65,68,70,72];
  const max = 100;
  return (
    <div style={{
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      padding: "22px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>주간 달성률 추이</div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 3 }}>2026 상반기 · 16주차</div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#3B5BDB" }}/>달성률</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 2, background: "#D14343" }}/>목표선</div>
        </div>
      </div>
      <div style={{ position: "relative", height: 180, paddingBottom: 22 }}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => (
          <div key={v} style={{
            position: "absolute", left: 30, right: 0,
            bottom: 22 + (v / max) * 158,
            height: 1, background: "#ECEFF5",
          }}>
            <span style={{ position: "absolute", left: -28, top: -7, fontSize: 10, color: "#A4ADC4", fontFamily: "var(--font-mono)" }}>{v}</span>
          </div>
        ))}
        {/* Target line */}
        <div style={{
          position: "absolute", left: 30, right: 0,
          bottom: 22 + (70 / max) * 158,
          height: 1.5, background: "#D14343", opacity: 0.6,
          borderTop: "1.5px dashed #D14343",
        }}/>
        {/* Bars */}
        <div style={{ position: "absolute", left: 32, right: 0, bottom: 22, top: 0, display: "flex", alignItems: "flex-end", gap: 4 }}>
          {data.map((v, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${(v / max) * 100}%`,
              background: i === data.length - 1 ? "#3B5BDB" : v >= 70 ? "#5C7AE6" : "#91A6F0",
              borderRadius: "4px 4px 0 0",
              position: "relative",
            }}>
              {i === data.length - 1 && (
                <div style={{
                  position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
                  background: "#0F1A36", color: "#fff",
                  fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
                  padding: "2px 6px", borderRadius: 4,
                  whiteSpace: "nowrap",
                }}>72%</div>
              )}
            </div>
          ))}
        </div>
        {/* X labels */}
        <div style={{ position: "absolute", left: 32, right: 0, bottom: 0, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#A4ADC4", fontFamily: "var(--font-mono)" }}>
          <span>W1</span><span>W4</span><span>W8</span><span>W12</span><span>W16</span>
        </div>
      </div>
    </div>
  );
}

function OKRDetailItem({ num, status, statusColor, obj, kr, format, baseline, current, goal, weight, progress, history, feedback }) {
  const [open, setOpen] = React.useState(num === 1);
  return (
    <div style={{
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      boxShadow: "0 1px 2px rgba(31,42,74,.04)",
      overflow: "hidden",
    }}>
      <div onClick={() => setOpen(!open)} style={{
        padding: "20px 24px",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F1F4FD", color: "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-mono)" }}>{num.toString().padStart(2, "0")}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ padding: "2px 9px", borderRadius: 999, background: statusColor.bg, border: `1px solid ${statusColor.bd}`, color: statusColor.fg, fontSize: 11, fontWeight: 600 }}>{status}</span>
            <span style={{ padding: "2px 9px", borderRadius: 999, background: "#F4F7FB", color: "#5B6685", fontSize: 10.5, fontWeight: 600, fontFamily: "var(--font-mono)" }}>{format}</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#7C87A4", fontFamily: "var(--font-mono)" }}>가중치 {weight}%</span>
          </div>
          <div style={{ fontSize: 12.5, color: "#7C87A4", marginBottom: 4 }}>{obj}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#0F1A36", lineHeight: 1.5, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kr}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: progress >= 70 ? "#2F9E5E" : progress >= 40 ? "#3B5BDB" : "#D98023", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{progress}%</div>
          <div style={{ width: 100, height: 6, background: "#F4F7FB", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: progress >= 70 ? "#2F9E5E" : progress >= 40 ? "#3B5BDB" : "#D98023", borderRadius: 3 }}/>
          </div>
        </div>
        <Icon name="chevronDown" size={18} style={{ color: "#A4ADC4", transform: open ? "rotate(180deg)" : "none", transition: "transform 180ms ease-out" }}/>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid #ECEFF5", padding: "22px 24px", background: "#F9FAFC" }}>
          {/* Metric grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div style={detailBox}>
              <div style={detailLabel}>Baseline</div>
              <div style={detailVal}>{baseline}</div>
            </div>
            <div style={detailBox}>
              <div style={detailLabel}>현재</div>
              <div style={{ ...detailVal, color: "#3B5BDB" }}>{current}</div>
              <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 3 }}>최근 업데이트 3일 전</div>
            </div>
            <div style={detailBox}>
              <div style={detailLabel}>Goal</div>
              <div style={{ ...detailVal, color: "#2F9E5E" }}>{goal}</div>
            </div>
          </div>

          {/* History */}
          {history && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3A4565", marginBottom: 10, letterSpacing: "0.02em" }}>📈 최근 업데이트</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map((h, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 12px", background: "#fff", borderRadius: 8, border: "1px solid #ECEFF5",
                  }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#7C87A4", minWidth: 70 }}>{h.date}</span>
                    <span style={{ fontSize: 12.5, color: "#3A4565", flex: 1 }}>{h.note}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: h.delta > 0 ? "#2F9E5E" : "#D98023" }}>{h.delta > 0 ? "+" : ""}{h.delta}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div style={{
              padding: "14px 16px", background: "#F1F4FD",
              border: "1px solid #C5D0F7", borderRadius: 10,
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#2F9E5E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>정</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1B2A4E", marginBottom: 3 }}>정태영 팀장 · 평가자 코멘트</div>
                <div style={{ fontSize: 12.5, color: "#3A4565", lineHeight: 1.55 }}>{feedback}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Button variant="primary" size="sm" leftIcon={<span>📈</span>}>진행률 업데이트</Button>
            <Button variant="ai" size="sm" leftIcon={<span>✨</span>}>AI 코칭 받기</Button>
            <Button variant="secondary" size="sm" leftIcon={<Icon name="edit" size={13}/>}>KR 수정</Button>
            <div style={{ flex: 1 }}/>
            <Button variant="ghost" size="sm">증빙 첨부 →</Button>
          </div>
        </div>
      )}
    </div>
  );
}

const detailBox = {
  padding: "14px 16px", background: "#fff", border: "1px solid #ECEFF5", borderRadius: 10,
};
const detailLabel = { fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase" };
const detailVal = { fontSize: 18, fontWeight: 700, color: "#0F1A36", fontVariantNumeric: "tabular-nums", marginTop: 5, fontFamily: "var(--font-mono)" };

function R1MyOKR() {
  const okrs = [
    {
      num: 1, progress: 72,
      status: "승인 완료", statusColor: { bg: "#ECFAF1", bd: "#BBE9CC", fg: "#2F9E5E" },
      obj: "Objective · 핵심 서비스 응답속도 개선",
      kr: "결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축한다.",
      format: "수치", baseline: "850ms", current: "598ms", goal: "500ms", weight: 30,
      history: [
        { date: "07/08", note: "DB 인덱스 최적화 + 캐시 적용", delta: 8 },
        { date: "06/22", note: "API 게이트웨이 connection pool 조정", delta: 5 },
        { date: "06/02", note: "초기 측정 baseline 확정", delta: 0 },
      ],
      feedback: "측정 방법이 명료해서 좋습니다. 6월 캐시 적용 결과 공유 부탁드려요!",
    },
    {
      num: 2, progress: 45,
      status: "승인 완료", statusColor: { bg: "#ECFAF1", bd: "#BBE9CC", fg: "#2F9E5E" },
      obj: "Objective · 결제 인증 모듈 안정화",
      kr: "결제 인증모듈 단위테스트 커버리지를 65% → 85%로 끌어올린다.",
      format: "수치", baseline: "65%", current: "74%", goal: "85%", weight: 25,
      history: [
        { date: "07/05", note: "인증 토큰 검증 로직 테스트 추가", delta: 4 },
        { date: "06/18", note: "리프레시 토큰 시나리오 보강", delta: 5 },
      ],
    },
    {
      num: 3, progress: 25,
      status: "제출 · 검토 대기", statusColor: { bg: "#EFF4FE", bd: "#C5D5F7", fg: "#2B5DD9" },
      obj: "Objective · 운영 자동화",
      kr: "장애 알림 룰 자동화 마일스톤 4단계 중 3단계까지 완료한다.",
      format: "마일스톤", baseline: "1/4", current: "2/4", goal: "3/4", weight: 20,
    },
  ];

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="나의 OKR" subtitle="김지훈 · 2026 상반기 · 진행률 47%"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 40px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 상반기 · OKR 3건</div>
            <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              순조롭게 나아가고 있어요 ✨
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5B6685" }}>
              평균 달성률 <b style={{ color: "#0F1A36" }}>47%</b> · 마감 D-46 · 한 KR이 목표선을 넘었어요
            </p>
          </div>
          <div style={{ flex: 1 }}/>
          <Button variant="secondary" leftIcon={<Icon name="library" size={15}/>}>이전 평가</Button>
          <Button variant="primary" leftIcon={<span>📈</span>}>진행률 업데이트</Button>
        </div>

        {/* Stats overview */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, marginBottom: 20 }}>
          <ProgressChart/>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "linear-gradient(135deg, #1B2A4E, #2C3E68)", color: "#fff", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 11.5, color: "#91A6F0", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>이번 분기 종합</div>
              <div style={{ fontSize: 36, fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.025em", lineHeight: 1.1 }}>47<span style={{ fontSize: 18, color: "#91A6F0", fontWeight: 500, marginLeft: 2 }}>%</span></div>
              <div style={{ fontSize: 12, color: "#A4ADC4", marginTop: 6 }}>평균 달성률 · 가중치 반영</div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 16, fontSize: 11.5 }}>
                <div><div style={{ color: "#91A6F0" }}>최고</div><div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginTop: 2 }}>KR 01 · 72%</div></div>
                <div><div style={{ color: "#91A6F0" }}>지원 필요</div><div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginTop: 2 }}>KR 03 · 25%</div></div>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>KR별 가중치</div>
              <div style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden", marginBottom: 12 }}>
                <div title="KR01 30%" style={{ flex: 30, background: "#3B5BDB" }}/>
                <div title="KR02 25%" style={{ flex: 25, background: "#5C7AE6" }}/>
                <div title="KR03 20%" style={{ flex: 20, background: "#7C4DD9" }}/>
                <div title="여유" style={{ flex: 35, background: "#ECEFF5" }}/>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 11.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#3A4565" }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#3B5BDB", marginRight: 6 }}/>KR 01 · 응답속도</span><b style={{ color: "#0F1A36", fontFamily: "var(--font-mono)" }}>30%</b></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#3A4565" }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#5C7AE6", marginRight: 6 }}/>KR 02 · 테스트 커버리지</span><b style={{ color: "#0F1A36", fontFamily: "var(--font-mono)" }}>25%</b></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#3A4565" }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#7C4DD9", marginRight: 6 }}/>KR 03 · 알림 자동화</span><b style={{ color: "#0F1A36", fontFamily: "var(--font-mono)" }}>20%</b></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, paddingTop: 7, borderTop: "1px dashed #ECEFF5" }}><span style={{ color: "#7C87A4" }}>합산 / 상한</span><b style={{ color: "#0F1A36", fontFamily: "var(--font-mono)" }}>75 / 110</b></div>
              </div>
            </div>
          </div>
        </div>

        {/* OKR list */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "8px 0 14px" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>OKR 상세</div>
            <div style={{ fontSize: 12.5, color: "#7C87A4", marginTop: 3 }}>각 KR을 클릭하면 진행 히스토리와 평가자 코멘트를 볼 수 있어요.</div>
          </div>
          <Button variant="primary" size="sm" leftIcon={<span>+</span>}>KR 추가</Button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {okrs.map((o, i) => <OKRDetailItem key={i} {...o}/>)}
        </div>
      </div>
    </main>
  );
}

window.R1MyOKR = R1MyOKR;
