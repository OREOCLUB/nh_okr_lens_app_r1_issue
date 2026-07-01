// R3Calendar.jsx — 인사담당자용 평가 일정 관리 (전사 마일스톤 관장)
// - 전사 평가 일정 등록/수정/삭제 (모든 R1/R2에 자동 전파)
// - 참여자 그룹: 전사·본부별·팀별·역할별
// - 진행 상태 트래킹 (완료/진행중/예정)
// - 알림 발송 히스토리

// ─────────────────────────────────────────────
// 전사 일정 등록 모달
// ─────────────────────────────────────────────
function R3EventModal({ open, defaultDate, onClose, onSave }) {
  const [type, setType] = React.useState("deadline");
  const [title, setTitle] = React.useState("");
  const [date, setDate] = React.useState(defaultDate || "2026-07-30");
  const [scope, setScope] = React.useState("all");
  const [notify, setNotify] = React.useState(true);
  const [memo, setMemo] = React.useState("");

  React.useEffect(() => { if (open && defaultDate) setDate(defaultDate); }, [open, defaultDate]);
  if (!open) return null;

  const types = window.OKRDummy.scheduleTypes;
  const scopes = [
    { id: "all",       ico: "🌐", label: "전사",       desc: "모든 임직원 (552명)" },
    { id: "division",  ico: "🏢", label: "본부별",     desc: "특정 본부 선택" },
    { id: "team",      ico: "👥", label: "팀별",       desc: "특정 팀 선택" },
    { id: "role-r1",   ico: "👤", label: "피평가자만", desc: "R1 그룹 (420명)" },
    { id: "role-r2",   ico: "👔", label: "평가자만",   desc: "R2 그룹 (128명)" },
  ];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,26,54,0.42)", zIndex: 60,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, width: "min(600px, 100%)", maxHeight: "88vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 30px 80px -10px rgba(15,26,54,.40)",
      }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#FFEDE2", color: "#E07A3C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: "#0F1A36" }}>전사 평가 일정 등록</div>
            <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 1 }}>등록 시 지정한 대상 그룹에게 자동 알림이 발송돼요</div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, background: "#F4F7FB", border: "none",
            color: "#5B6685", cursor: "pointer", fontSize: 16, fontFamily: "inherit",
          }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px" }}>
          {/* 일정 유형 */}
          <div style={{ marginBottom: 16 }}>
            <label style={r3FieldLabel}>일정 유형 <span style={{ color: "#D14343" }}>*</span></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {Object.entries(types).filter(([k]) => k !== "oneonone" && k !== "etc").map(([k, t]) => (
                <div key={k} onClick={() => setType(k)} style={{
                  padding: "10px 11px",
                  border: `1px solid ${type === k ? "#E07A3C" : "#E1E5EF"}`,
                  background: type === k ? "#FFF7F1" : "#fff",
                  borderRadius: 9, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 9,
                }}>
                  <span style={{ fontSize: 15 }}>{t.ico}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>{t.label}</div>
                    <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div style={{ marginBottom: 14 }}>
            <label style={r3FieldLabel}>일정 제목 <span style={{ color: "#D14343" }}>*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2026 하반기 OKR 등록 마감"
              style={r3InputStyle}/>
          </div>

          {/* 날짜 */}
          <div style={{ marginBottom: 14 }}>
            <label style={r3FieldLabel}>날짜 <span style={{ color: "#D14343" }}>*</span></label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={r3InputStyle}/>
          </div>

          {/* 대상 그룹 */}
          <div style={{ marginBottom: 14 }}>
            <label style={r3FieldLabel}>대상 그룹 <span style={{ color: "#D14343" }}>*</span></label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {scopes.map(s => (
                <label key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  border: `1px solid ${scope === s.id ? "#E07A3C" : "#E1E5EF"}`,
                  background: scope === s.id ? "#FFF7F1" : "#fff",
                  borderRadius: 9, cursor: "pointer",
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: `2px solid ${scope === s.id ? "#E07A3C" : "#C8CFDF"}`,
                    background: "#fff", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {scope === s.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E07A3C" }}/>}
                  </div>
                  <span style={{ fontSize: 15 }}>{s.ico}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: "#7C87A4" }}>{s.desc}</div>
                  </div>
                  <input type="radio" checked={scope === s.id} onChange={() => setScope(s.id)} style={{ display: "none" }}/>
                </label>
              ))}
            </div>
          </div>

          {/* 알림 발송 */}
          <div style={{ marginBottom: 14 }}>
            <label style={{
              display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
              background: notify ? "#F1F4FD" : "#F9FAFC",
              border: `1px solid ${notify ? "#C5D0F7" : "#E1E5EF"}`,
              borderRadius: 9, cursor: "pointer",
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 5,
                background: notify ? "#3B5BDB" : "#fff",
                border: `1.5px solid ${notify ? "#3B5BDB" : "#C8CFDF"}`,
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>{notify && "✓"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>📣 등록과 동시에 알림 발송</div>
                <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 2 }}>대상 그룹에게 사내 알림 + 이메일 자동 발송</div>
              </div>
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} style={{ display: "none" }}/>
            </label>
          </div>

          {/* 상세 안내 */}
          <div>
            <label style={r3FieldLabel}>상세 안내 <span style={{ color: "#A4ADC4", fontWeight: 500 }}>(선택)</span></label>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 2026년 하반기 OKR을 7월 30일 18:00까지 제출해주세요. 미제출 시 익월 조치가 있을 수 있습니다."
              style={{
                width: "100%", minHeight: 72, padding: "10px 12px",
                background: "#fff", border: "1px solid #E1E5EF", borderRadius: 9,
                fontFamily: "var(--font-sans)", fontSize: 12.5, color: "#0F1A36",
                outline: "none", resize: "vertical", lineHeight: 1.6,
              }}/>
          </div>
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid #ECEFF5", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <button onClick={() => { onSave && onSave({ type, title, date, scope, notify, memo }); onClose(); }} style={{
            padding: "10px 18px", background: "#E07A3C", color: "#fff",
            border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "var(--font-sans)",
          }}>등록 · 알림 발송</button>
        </div>
      </div>
    </div>
  );
}

const r3FieldLabel = { display: "block", fontSize: 11.5, fontWeight: 700, color: "#3A4565", letterSpacing: "0.02em", marginBottom: 6 };
const r3InputStyle = {
  width: "100%", padding: "10px 12px", background: "#fff",
  border: "1px solid #E1E5EF", borderRadius: 9,
  fontSize: 13, color: "#0F1A36", fontFamily: "var(--font-sans)",
  outline: "none", boxSizing: "border-box",
};

// ─────────────────────────────────────────────
// KPI 카드
// ─────────────────────────────────────────────
function R3KpiCard({ icon, iconBg, iconFg, label, value, unit, sub, subTone }) {
  const subColor = subTone === "ok" ? "#2F9E5E" : subTone === "warn" ? "#D98023" : "#7C87A4";
  return (
    <div style={{
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      padding: "18px 20px", boxShadow: "0 1px 2px rgba(31,42,74,.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: iconBg, color: iconFg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#5B6685" }}>{label}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#0F1A36", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {value}{unit && <span style={{ fontSize: 13, color: "#7C87A4", fontWeight: 500, marginLeft: 4 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 11.5, fontWeight: 500, marginTop: 6, color: subColor }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// 월간 캘린더 그리드 (R3 오렌지 톤)
// ─────────────────────────────────────────────
function R3FullCalendar({ events, onDayClick, onChipClick }) {
  const types = window.OKRDummy.scheduleTypes;

  // 2026-07-01 = 수요일 (offset 2)
  const firstOffset = 2;
  const total = 31;
  const cells = [];
  for (let i = 0; i < firstOffset; i++) cells.push(null);
  for (let i = 1; i <= total; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const TODAY = 15;

  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 2px rgba(31,42,74,.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>2026 · 07월</div>
          <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2 }}>전사 마일스톤 6건 · 진행 중 2건 · 다가옴 3건</div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => window.notYet("이전 달로 이동")} style={r3NavBtn}>‹</button>
          <button style={{ ...r3NavBtn, width: "auto", padding: "0 12px", fontSize: 12, fontWeight: 600 }}>오늘</button>
          <button onClick={() => window.notYet("다음 달로 이동")} style={r3NavBtn}>›</button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {["월","화","수","목","금","토","일"].map((d, i) => (
          <div key={i} style={{
            fontSize: 10.5, fontWeight: 700,
            color: i === 5 ? "#2B5DD9" : i === 6 ? "#D14343" : "#7C87A4",
            textAlign: "center", padding: "8px 0",
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} style={{ minHeight: 90, background: "#F9FAFC", borderRadius: 8, opacity: 0.4 }}/>;
          const ev = events[d];
          const isToday = d === TODAY;
          const dow = (firstOffset + d - 1) % 7;
          const dateColor = dow === 6 ? "#D14343" : dow === 5 ? "#2B5DD9" : "#3A4565";
          const isPast = d < TODAY;
          return (
            <div key={i}
              onClick={() => onDayClick && onDayClick(d, ev)}
              style={{
                minHeight: 90,
                background: isToday ? "#FFEDE2" : "#fff",
                border: `1px solid ${isToday ? "#E07A3C" : "#ECEFF5"}`,
                borderRadius: 8, padding: "5px 6px",
                overflow: "hidden",
                display: "flex", flexDirection: "column",
                cursor: "pointer",
                transition: "background 140ms",
                opacity: isPast ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!isToday) e.currentTarget.style.background = "#F9FAFC"; }}
              onMouseLeave={(e) => { if (!isToday) e.currentTarget.style.background = "#fff"; }}
            >
              <div style={{
                fontSize: 11.5, fontWeight: isToday ? 700 : 600,
                color: isToday ? "#E07A3C" : dateColor,
                fontVariantNumeric: "tabular-nums",
                marginBottom: 3,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {d}
                {isToday && <span style={{ fontSize: 8.5, padding: "1px 5px", background: "#E07A3C", color: "#fff", borderRadius: 3 }}>오늘</span>}
              </div>
              {ev && ev.slice(0, 3).map((e, j) => {
                const c = types[e.type];
                return (
                  <div key={j}
                    onClick={(ev2) => { ev2.stopPropagation(); onChipClick && onChipClick(e, ev2.currentTarget); }}
                    style={{
                      background: c.bg, color: c.fg,
                      fontSize: 9.5, fontWeight: 600,
                      padding: "2px 5px", borderRadius: 4, marginBottom: 2,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      lineHeight: 1.4, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 3,
                  }} title={`${e.time || ""} ${e.title}`}>
                    <span style={{ fontSize: 9 }}>{c.ico}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</span>
                  </div>
                );
              })}
              {ev && ev.length > 3 && <div style={{ fontSize: 9, color: "#7C87A4", fontWeight: 600 }}>+{ev.length - 3}</div>}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, marginTop: 14, paddingTop: 12, borderTop: "1px solid #ECEFF5", flexWrap: "wrap", fontSize: 11, color: "#5B6685", alignItems: "center" }}>
        {Object.entries(types).filter(([k]) => k !== "oneonone").map(([k, t]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: t.fg }}/>
            <span style={{ fontSize: 11 }}>{t.ico}</span>
            <span>{t.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#7C87A4" }}>
          날짜 클릭 → 해당 일자에 일정 등록
        </div>
      </div>
    </div>
  );
}

const r3NavBtn = {
  width: 32, height: 32, borderRadius: 8, border: "1px solid #E1E5EF", background: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center", color: "#3A4565", cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

// ─────────────────────────────────────────────
// 하반기 마일스톤 리스트 (진행 상태별)
// ─────────────────────────────────────────────
function MilestoneTracker() {
  const milestones = [
    { phase: "01", label: "OKR 등록 시작",   date: "07/01", status: "done",    target: "전사 552명", metric: "발송 완료" },
    { phase: "02", label: "분기 미팅",       date: "07/08", status: "done",    target: "전사 552명", metric: "참여율 92%" },
    { phase: "03", label: "분기 중간 점검",  date: "07/17", status: "current", target: "R1 · R2",    metric: "D-2 · 알림 예약" },
    { phase: "04", label: "OKR 등록 마감",   date: "07/30", status: "upcoming", target: "전사 552명", metric: "D-15 · 348명 완료 (63%)" },
    { phase: "05", label: "평가자 검토",     date: "08/01 ~ 08/07", status: "upcoming", target: "R2 128명", metric: "D-17" },
    { phase: "06", label: "자기 평가",       date: "08/05 ~ 08/12", status: "upcoming", target: "R1 420명", metric: "D-21" },
    { phase: "07", label: "캘리브레이션",    date: "08/15 ~ 08/22", status: "upcoming", target: "R3 · R2",   metric: "D-31" },
    { phase: "08", label: "결과 공지",       date: "08/28",         status: "upcoming", target: "전사 552명", metric: "D-44" },
  ];

  const statusMap = {
    done:    { bg: "#ECFAF1", fg: "#2F9E5E", label: "완료" },
    current: { bg: "#FFEDE2", fg: "#E07A3C", label: "진행 중" },
    upcoming: { bg: "#F1F3F8", fg: "#5B6685", label: "예정" },
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F1A36" }}>🗓 2026 하반기 마일스톤</div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#7C87A4", fontFamily: "var(--font-mono)", fontWeight: 600 }}>8단계 · 2/8 완료</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {milestones.map((m, i) => {
          const s = statusMap[m.status];
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 11,
              padding: "10px 12px", borderRadius: 10,
              border: `1px solid ${m.status === "current" ? "#FFE0BA" : "#ECEFF5"}`,
              background: m.status === "current" ? "linear-gradient(135deg, #FFF7EC, #fff 70%)" : "#fff",
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: m.status === "done" ? "#2F9E5E" : m.status === "current" ? "#E07A3C" : "#F1F3F8",
                color: m.status === "done" || m.status === "current" ? "#fff" : "#7C87A4",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", flexShrink: 0,
              }}>{m.status === "done" ? "✓" : m.phase}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>{m.label}</div>
                  <span style={{
                    padding: "2px 8px", borderRadius: 999,
                    background: s.bg, color: s.fg,
                    fontSize: 10, fontWeight: 700,
                  }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 11, color: "#7C87A4", fontFamily: "var(--font-mono)" }}>{m.date} · {m.target}</div>
              </div>
              <div style={{ fontSize: 11, color: "#5B6685", fontWeight: 600, textAlign: "right", flexShrink: 0 }}>{m.metric}</div>
              <button onClick={() => window.notYet(m.label + " 상세 편집")} style={{
                padding: "5px 10px", background: "#F4F7FB", border: "1px solid #E1E5EF",
                borderRadius: 7, fontSize: 10.5, color: "#3A4565", fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-sans)", flexShrink: 0,
              }}>편집</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 알림 발송 히스토리
// ─────────────────────────────────────────────
function NotificationHistory() {
  const items = [
    { date: "07/13 09:00", event: "분기 중간 점검 안내", target: "전사 552명", channel: "사내 알림 + 이메일", status: "sent",  clicks: 348 },
    { date: "07/10 10:00", event: "OKR 등록 마감 D-20 알림", target: "미제출자 204명", channel: "사내 알림", status: "sent",  clicks: 156 },
    { date: "07/08 08:30", event: "분기 미팅 참석 안내", target: "전사 552명", channel: "이메일", status: "sent",  clicks: 480 },
    { date: "07/01 09:00", event: "2026 하반기 OKR 등록 시작 안내", target: "전사 552명", channel: "사내 알림 + 이메일", status: "sent",  clicks: 552 },
  ];
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F1A36" }}>📣 최근 알림 발송</div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#7C87A4", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{items.length}건</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 10px", borderRadius: 8,
            borderBottom: i < items.length - 1 ? "1px solid #F4F7FB" : "none",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "#ECFAF1", color: "#2F9E5E",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, flexShrink: 0,
            }}>✓</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.event}</div>
              <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 1, fontFamily: "var(--font-mono)" }}>
                {it.date} · {it.target} · {it.channel}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#2F9E5E", fontFamily: "var(--font-mono)" }}>열람 {it.clicks}</div>
              <div style={{ fontSize: 9.5, color: "#7C87A4" }}>클릭 수</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// R3Calendar 메인
// ─────────────────────────────────────────────
function R3Calendar() {
  const [modal, setModal] = React.useState(null);

  // 7월 전사 마일스톤 이벤트
  const events = {
    1:  [{ type: "kickoff",  title: "OKR 등록 시작", time: "전일" }],
    8:  [{ type: "quarter",  title: "분기 미팅",     time: "10:00" }],
    17: [{ type: "quarter",  title: "분기 중간 점검", time: "14:00" }],
    30: [{ type: "deadline", title: "OKR 등록 마감", time: "18:00" }],
  };

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="평가 일정 관리" subtitle="이수경 · 인사노무팀 · 2026 하반기"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px 40px" }}>

        {/* Hero */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 하반기 평가 운영</div>
            <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              전사 평가 일정을 관장합니다
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#5B6685" }}>
              등록·수정한 일정은 대상 그룹의 캘린더에 자동 전파돼요. 지금은 <b>OKR 등록 마감 D-15</b>입니다.
            </p>
          </div>
          <div style={{ flex: 1 }}/>
          <button onClick={() => window.notYet("일정 CSV 내보내기")} style={{
            padding: "10px 16px", background: "#fff", border: "1px solid #E1E5EF",
            borderRadius: 10, fontSize: 13, color: "#3A4565", fontWeight: 600, cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}>📥 CSV 내보내기</button>
          <button onClick={() => setModal({ defaultDate: "2026-07-20" })} style={{
            padding: "10px 18px", background: "#E07A3C", color: "#fff",
            border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "var(--font-sans)", boxShadow: "0 4px 12px -4px rgba(224,122,60,.5)",
          }}>+ 전사 일정 등록</button>
        </div>

        {/* KPI 카드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          <R3KpiCard icon="📅" iconBg="#FFEDE2" iconFg="#E07A3C" label="이번 반기 마일스톤" value="8" unit="단계" sub="2단계 완료"/>
          <R3KpiCard icon="⏳" iconBg="#FFF7EC" iconFg="#D98023" label="다음 마감까지" value="15" unit="일" sub="OKR 등록 마감" subTone="warn"/>
          <R3KpiCard icon="✓" iconBg="#ECFAF1" iconFg="#2F9E5E" label="OKR 등록률" value="63" unit="%" sub="348 / 552명" subTone="ok"/>
          <R3KpiCard icon="📣" iconBg="#F1F4FD" iconFg="#3B5BDB" label="이달 알림 발송" value="4" unit="건" sub="열람률 78%" subTone="ok"/>
        </div>

        {/* 캘린더 + 마일스톤 */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) 1fr", gap: 18, marginBottom: 18 }}>
          <R3FullCalendar events={events}
            onDayClick={(d) => setModal({ defaultDate: `2026-07-${String(d).padStart(2, "0")}` })}
            onChipClick={(e) => window.notYet(e.title + " 상세 편집")}/>
          <MilestoneTracker/>
        </div>

        {/* 알림 히스토리 */}
        <NotificationHistory/>
      </div>

      <R3EventModal
        open={!!modal}
        defaultDate={modal?.defaultDate}
        onClose={() => setModal(null)}
        onSave={(data) => window.notYet("일정이 등록되었어요! 대상 그룹에게 알림이 자동 발송됩니다. (실제 저장은 향후 구현 예정)")}
      />
    </main>
  );
}

window.R3Calendar = R3Calendar;
