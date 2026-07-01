// R1Calendar.jsx — 피평가자용 평가 캘린더 (v2 — 7월 기준, 코칭 요청 등록 기능 포함)
// - 평가 전체 일정(전사 마일스톤): 읽기 전용
// - 나에게 연동된 1on1 코칭: 평가자가 R2에서 등록 → 자동 반영
// - 본인이 등록 가능한 것: 코칭 요청 (평가자 승인 대기)
// - 이전 평가 이력 요약

// ─────────────────────────────────────────────
// 코칭 요청 등록 모달 (피평가자용)
// ─────────────────────────────────────────────
function R1RequestModal({ open, defaultDate, onClose, onSave }) {
  const [date, setDate] = React.useState(defaultDate || "2026-07-22");
  const [start, setStart] = React.useState("14:00");
  const [end, setEnd] = React.useState("15:00");
  const [topic, setTopic] = React.useState("kr-progress");
  const [memo, setMemo] = React.useState("");

  React.useEffect(() => {
    if (open && defaultDate) setDate(defaultDate);
  }, [open, defaultDate]);

  if (!open) return null;

  const times = [];
  for (let h = 8; h < 21; h++) {
    times.push(`${String(h).padStart(2, "0")}:00`);
    times.push(`${String(h).padStart(2, "0")}:30`);
  }

  const topics = [
    { id: "kr-progress",  ico: "📊", label: "KR 진척 점검",       desc: "현재 진행 중인 KR의 진척 상황 공유" },
    { id: "kr-adjust",    ico: "🔧", label: "KR 조정 협의",       desc: "환경 변화로 KR 수정이 필요한 경우" },
    { id: "career",       ico: "🌱", label: "커리어 상담",         desc: "성장·역량·다음 스텝 논의" },
    { id: "difficulty",   ico: "💭", label: "업무 고민 상담",      desc: "실무 이슈나 협업 어려움 논의" },
    { id: "etc",          ico: "📌", label: "기타",              desc: "그 외 자유 주제" },
  ];
  const t = topics.find(x => x.id === topic);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,26,54,0.42)", zIndex: 60,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, width: "min(560px, 100%)", maxHeight: "88vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 30px 80px -10px rgba(15,26,54,.40)",
      }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#F1F4FD", color: "#3B5BDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>💬</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: "#0F1A36" }}>1on1 코칭 요청</div>
            <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 1 }}>정태영 팀장에게 코칭 시간을 요청합니다</div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, background: "#F4F7FB", border: "none",
            color: "#5B6685", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit",
          }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px" }}>
          {/* 안내 */}
          <div style={{
            padding: "10px 12px", background: "#F1F4FD", border: "1px solid #DCE3F8", borderRadius: 9,
            fontSize: 12, color: "#2B5DD9", lineHeight: 1.5, marginBottom: 16,
            display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <span>💡</span>
            <span>요청 후 평가자가 승인하면 캘린더에 자동으로 등록돼요. 승인 전까지는 <b>요청 대기</b> 상태로 표시됩니다.</span>
          </div>

          {/* 코칭 주제 */}
          <div style={{ marginBottom: 16 }}>
            <label style={r1FieldLabel}>코칭 주제 <span style={{ color: "#D14343" }}>*</span></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {topics.map(x => (
                <div key={x.id} onClick={() => setTopic(x.id)} style={{
                  padding: "10px 11px",
                  border: `1px solid ${topic === x.id ? "#3B5BDB" : "#E1E5EF"}`,
                  background: topic === x.id ? "#F1F4FD" : "#fff",
                  borderRadius: 9, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 9,
                  transition: "all 140ms",
                }}>
                  <span style={{ fontSize: 15 }}>{x.ico}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>{x.label}</div>
                    <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 희망 날짜 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={r1FieldLabel}>희망 날짜 <span style={{ color: "#D14343" }}>*</span></label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={r1InputStyle}/>
            </div>
            <div>
              <label style={r1FieldLabel}>시작 시간 <span style={{ color: "#D14343" }}>*</span></label>
              <select value={start} onChange={(e) => setStart(e.target.value)} style={r1SelectStyle}>
                {times.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={r1FieldLabel}>종료 시간</label>
              <select value={end} onChange={(e) => setEnd(e.target.value)} style={r1SelectStyle}>
                {times.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label style={r1FieldLabel}>코칭 요청 사유 <span style={{ color: "#A4ADC4", fontWeight: 500 }}>(선택, 최대 200자)</span></label>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value.slice(0, 200))}
              placeholder={t.id === "kr-adjust" ? "예: 인프라 팀 이동으로 KR 03 목표치 하향 조정이 필요합니다." : "예: KR 02의 측정 방식이 명확치 않아 상의드리고 싶어요."}
              style={{
                width: "100%", minHeight: 72, padding: "10px 12px",
                background: "#fff", border: "1px solid #E1E5EF", borderRadius: 9,
                fontFamily: "var(--font-sans)", fontSize: 12.5, color: "#0F1A36",
                outline: "none", resize: "vertical", lineHeight: 1.6,
              }}/>
            <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 3, textAlign: "right", fontFamily: "var(--font-mono)" }}>{memo.length} / 200</div>
          </div>
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid #ECEFF5", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={() => { onSave && onSave({ date, start, end, topic, memo }); onClose(); }}>요청 보내기</Button>
        </div>
      </div>
    </div>
  );
}

const r1FieldLabel = { display: "block", fontSize: 11.5, fontWeight: 700, color: "#3A4565", letterSpacing: "0.02em", marginBottom: 6 };
const r1InputStyle = {
  width: "100%", padding: "9px 11px", background: "#fff",
  border: "1px solid #E1E5EF", borderRadius: 9,
  fontSize: 13, color: "#0F1A36", fontFamily: "var(--font-sans)",
  outline: "none", boxSizing: "border-box",
};
const r1SelectStyle = { ...r1InputStyle, cursor: "pointer" };

// ─────────────────────────────────────────────
// 일정 상세 팝오버
// ─────────────────────────────────────────────
function R1EventPopover({ event, anchor, onClose }) {
  if (!event || !anchor) return null;
  const types = window.OKRDummy.scheduleTypes;
  const t = types[event.type] || types.etc;
  const rect = anchor.getBoundingClientRect();
  const top = rect.bottom + 6;
  const left = Math.min(rect.left, window.innerWidth - 300);

  const isPending = event.status === "pending";

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40 }}/>
      <div style={{
        position: "fixed", top, left, width: 280, zIndex: 41,
        background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12,
        boxShadow: "0 12px 32px -6px rgba(15,26,54,.20)", padding: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: t.bg, color: t.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{t.ico}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>{event.title}</div>
            <div style={{ fontSize: 11, color: "#7C87A4" }}>{t.label}</div>
          </div>
          {event.linkedFromEvaluator && (
            <span style={{ padding: "3px 8px", background: "#F1F4FD", color: "#3B5BDB", fontSize: 10, fontWeight: 700, borderRadius: 999 }}>🔗 연동</span>
          )}
          {isPending && (
            <span style={{ padding: "3px 8px", background: "#FFF7EC", color: "#D98023", fontSize: 10, fontWeight: 700, borderRadius: 999 }}>⏱ 대기</span>
          )}
        </div>

        <div style={{ fontSize: 11.5, color: "#5B6685", lineHeight: 1.7, marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #ECEFF5" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <span style={{ color: "#A4ADC4", width: 56 }}>일시</span>
            <span style={{ color: "#0F1A36", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{event.time}</span>
          </div>
          {event.host && (
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <span style={{ color: "#A4ADC4", width: 56 }}>{isPending ? "요청" : "주관"}</span>
              <span style={{ color: "#0F1A36" }}>{event.host}</span>
            </div>
          )}
          {event.memo && (
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#A4ADC4", width: 56 }}>내용</span>
              <span style={{ color: "#3A4565", flex: 1 }}>{event.memo}</span>
            </div>
          )}
        </div>

        {isPending ? (
          <div style={{ background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 8, padding: "8px 10px", fontSize: 11, color: "#7A4A14", lineHeight: 1.5 }}>
            ⏱ 평가자 승인 대기 중입니다. 승인되면 확정 일정으로 전환돼요.
          </div>
        ) : event.linkedFromEvaluator ? (
          <div style={{ background: "#F1F4FD", border: "1px solid #DCE3F8", borderRadius: 8, padding: "8px 10px", fontSize: 11, color: "#2B5DD9", lineHeight: 1.5 }}>
            💡 평가자(정태영 팀장)가 등록한 일정이에요. 변경은 평가자에게 문의해주세요.
          </div>
        ) : (
          <div style={{ fontSize: 11, color: "#7C87A4", textAlign: "center" }}>
            전사 공지 일정입니다
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// D-Day 배너 (임박한 마감 강조)
// ─────────────────────────────────────────────
function DDayBanner() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #3B5BDB 0%, #2C49B8 100%)",
      borderRadius: 14,
      padding: "18px 22px",
      color: "#fff",
      display: "flex", alignItems: "center", gap: 20,
      boxShadow: "0 8px 20px -8px rgba(59,91,219,.4)",
      marginBottom: 18,
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: 14,
        background: "rgba(255,255,255,0.14)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.2)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, letterSpacing: "0.06em" }}>D-</div>
        <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, fontFamily: "var(--font-mono)" }}>15</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>
          🎯 지금은 KR 확정 단계예요
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>
          OKR 등록 마감까지 <span style={{ background: "rgba(255,255,255,0.18)", padding: "1px 8px", borderRadius: 6 }}>15일</span> 남았어요
        </div>
        <div style={{ fontSize: 12.5, opacity: 0.88, marginTop: 4 }}>
          7월 30일 (수) 18:00 까지 · KR 5개 중 3개 확정 완료
        </div>
      </div>
      <a href="./r1-write-step1.html" style={{ textDecoration: "none" }}>
        <button style={{
          background: "#fff", color: "#2C49B8",
          border: "none", borderRadius: 10,
          padding: "10px 18px", fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: "var(--font-sans)",
        }}>OKR 이어서 작성 →</button>
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────
// 월간 캘린더 그리드 (조회 전용, R1 톤)
// ─────────────────────────────────────────────
function R1FullCalendar({ events, onChipClick, onRequestNew }) {
  const types = window.OKRDummy.scheduleTypes;

  // 2026-07-01 = 수요일 (offset 2)
  const firstOffset = 2;
  const total = 31;
  const cells = [];
  for (let i = 0; i < firstOffset; i++) cells.push(null);
  for (let i = 1; i <= total; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const TODAY = 15; // 해커톤 시연일 = 7/15

  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 2px rgba(31,42,74,.04)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>2026 · 07월</div>
          <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2 }}>
            나의 일정 9건 · 코칭 예정 3건 · 마감 1건
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: "flex", gap: 4, marginRight: 8 }}>
          <button onClick={() => window.notYet("이전 달로 이동")} style={r1NavBtn}>‹</button>
          <button style={{ ...r1NavBtn, width: "auto", padding: "0 12px", fontSize: 12, fontWeight: 600 }}>오늘</button>
          <button onClick={() => window.notYet("다음 달로 이동")} style={r1NavBtn}>›</button>
        </div>
        <button onClick={() => onRequestNew && onRequestNew()} style={{
          padding: "8px 14px",
          background: "#3B5BDB", color: "#fff",
          border: "none", borderRadius: 9,
          fontSize: 12.5, fontWeight: 700, cursor: "pointer",
          fontFamily: "var(--font-sans)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span>💬</span> 코칭 요청
        </button>
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
          if (!d) return <div key={i} style={{ minHeight: 92, background: "#F9FAFC", borderRadius: 8, opacity: 0.4 }}/>;
          const ev = events[d];
          const isToday = d === TODAY;
          const dow = (firstOffset + d - 1) % 7;
          const dateColor = dow === 6 ? "#D14343" : dow === 5 ? "#2B5DD9" : "#3A4565";
          const isPast = d < TODAY;
          return (
            <div key={i}
              style={{
                minHeight: 92,
                background: isToday ? "#E8F0FF" : "#fff",
                border: `1px solid ${isToday ? "#3B5BDB" : "#ECEFF5"}`,
                borderRadius: 8, padding: "5px 6px",
                overflow: "hidden",
                display: "flex", flexDirection: "column",
                transition: "background 140ms",
                opacity: isPast ? 0.55 : 1,
              }}
            >
              <div style={{
                fontSize: 11.5, fontWeight: isToday ? 700 : 600,
                color: isToday ? "#3B5BDB" : dateColor,
                fontVariantNumeric: "tabular-nums",
                marginBottom: 3,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {d}
                {isToday && <span style={{ fontSize: 8.5, padding: "1px 5px", background: "#3B5BDB", color: "#fff", borderRadius: 3 }}>오늘</span>}
              </div>
              {ev && ev.slice(0, 3).map((e, j) => {
                const c = types[e.type] || types.etc;
                const isPending = e.status === "pending";
                return (
                  <div key={j}
                    onClick={(ev2) => { ev2.stopPropagation(); onChipClick && onChipClick(e, ev2.currentTarget); }}
                    style={{
                      background: isPending ? "#FFF7EC" : c.bg, color: isPending ? "#D98023" : c.fg,
                      fontSize: 9.5, fontWeight: 600,
                      padding: "2px 5px", borderRadius: 4, marginBottom: 2,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      lineHeight: 1.4, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 3,
                      position: "relative",
                      border: isPending ? "1px dashed #D98023" : "none",
                  }} title={`${e.time} ${e.title}`}>
                    <span style={{ fontSize: 9 }}>{isPending ? "⏱" : c.ico}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</span>
                    {e.linkedFromEvaluator && <span style={{ fontSize: 8, marginLeft: "auto", flexShrink: 0 }}>🔗</span>}
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
        {Object.entries(types).map(([k, t]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: t.fg }}/>
            <span style={{ fontSize: 11 }}>{t.ico}</span>
            <span>{t.label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#D98023", fontWeight: 600 }}>
          <span>⏱</span>
          <span>승인 대기</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, color: "#3B5BDB", fontWeight: 600 }}>
          <span>🔗</span>
          <span>평가자 연동</span>
        </div>
      </div>
    </div>
  );
}

const r1NavBtn = {
  width: 32, height: 32, borderRadius: 8, border: "1px solid #E1E5EF", background: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center", color: "#3A4565", cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

// ─────────────────────────────────────────────
// 다가오는 일정 리스트
// ─────────────────────────────────────────────
function UpcomingEvents({ onChipClick }) {
  const types = window.OKRDummy.scheduleTypes;
  const events = [
    { date: "07/17", type: "quarter",  title: "분기 중간 점검", time: "14:00", host: "인사팀", dDay: 2 },
    { date: "07/22", type: "oneonone", title: "1on1 코칭",      time: "15:00", host: "정태영 팀장", dDay: 7, linkedFromEvaluator: true, memo: "KR 03 진척 점검 및 다음 분기 목표 협의" },
    { date: "07/25", type: "oneonone", title: "1on1 · KR 조정 상담", time: "10:30", host: "정태영 팀장", dDay: 10, status: "pending", memo: "내가 요청한 코칭 (승인 대기)" },
    { date: "07/28", type: "oneonone", title: "1on1 코칭",      time: "11:00", host: "정태영 팀장", dDay: 13, linkedFromEvaluator: true, memo: "월간 회고" },
    { date: "07/30", type: "deadline", title: "OKR 등록 마감",  time: "18:00", host: "전사", dDay: 15 },
  ];

  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>📅 다가오는 일정</div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#7C87A4", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{events.length}건</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {events.map((e, i) => {
          const t = types[e.type];
          const isUrgent = e.dDay <= 7;
          const isPending = e.status === "pending";
          return (
            <div key={i}
              onClick={(ev) => onChipClick && onChipClick(e, ev.currentTarget)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 8, cursor: "pointer",
                border: "1px solid transparent",
              }}
              onMouseEnter={(ev) => { ev.currentTarget.style.background = "#F9FAFC"; ev.currentTarget.style.borderColor = "#ECEFF5"; }}
              onMouseLeave={(ev) => { ev.currentTarget.style.background = "transparent"; ev.currentTarget.style.borderColor = "transparent"; }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: isPending ? "#FFF7EC" : t.bg, color: isPending ? "#D98023" : t.fg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, flexShrink: 0,
                border: isPending ? "1px dashed #D98023" : "none",
              }}>{isPending ? "⏱" : t.ico}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</span>
                  {e.linkedFromEvaluator && <span style={{ fontSize: 9.5, color: "#3B5BDB", flexShrink: 0 }}>🔗</span>}
                </div>
                <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 1, fontFamily: "var(--font-mono)" }}>
                  {e.date} · {e.time} · {e.host}
                </div>
              </div>
              <div style={{
                padding: "3px 8px", borderRadius: 999,
                background: isUrgent ? "#FFF0F0" : "#F1F4FD",
                color: isUrgent ? "#D14343" : "#2B5DD9",
                fontSize: 10.5, fontWeight: 700, fontFamily: "var(--font-mono)",
                flexShrink: 0,
              }}>D-{e.dDay}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 나의 코칭 예정 (평가자 연동 + 내가 요청한 것)
// ─────────────────────────────────────────────
function MyCoachingCard({ onRequestNew }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #F1F4FD, #fff 70%)",
      border: "1px solid #DCE3F8", borderRadius: 14, padding: "16px 18px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>💬 나의 코칭</div>
        <span style={{ marginLeft: "auto", padding: "3px 8px", background: "#3B5BDB", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999 }}>3건</span>
      </div>

      {/* 확정 코칭 */}
      <div style={{ background: "#fff", border: "1px solid #DCE3F8", borderRadius: 10, padding: "12px 13px", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>정</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36", display: "flex", alignItems: "center", gap: 4 }}>
              정태영 팀장님과 1on1
              <span style={{ fontSize: 10, color: "#3B5BDB" }}>🔗</span>
            </div>
            <div style={{ fontSize: 10.5, color: "#7C87A4" }}>7/22 (화) 15:00 · 회의실 302</div>
          </div>
          <span style={{ padding: "3px 8px", background: "#F1F4FD", color: "#3B5BDB", fontSize: 10, fontWeight: 700, borderRadius: 999, fontFamily: "var(--font-mono)" }}>D-7</span>
        </div>
        <div style={{ fontSize: 11.5, color: "#5B6685", lineHeight: 1.5, background: "#F9FAFC", padding: "7px 9px", borderRadius: 7, borderLeft: "2px solid #3B5BDB" }}>
          KR 03 진척 점검 및 다음 분기 목표 협의
        </div>
      </div>

      {/* 요청 대기 */}
      <div style={{ background: "#fff", border: "1px dashed #D98023", borderRadius: 10, padding: "10px 13px", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: "#FFF7EC", color: "#D98023", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>⏱</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0F1A36" }}>KR 조정 상담 <span style={{ fontSize: 10, color: "#D98023", fontWeight: 700 }}>· 요청 대기</span></div>
            <div style={{ fontSize: 10.5, color: "#7C87A4" }}>7/25 (금) 10:30 · 내가 요청</div>
          </div>
        </div>
      </div>

      {/* 두번째 확정 */}
      <div style={{ background: "#fff", border: "1px solid #DCE3F8", borderRadius: 10, padding: "10px 13px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#F1F4FD", color: "#3B5BDB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11 }}>정</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0F1A36" }}>1on1 · 월간 회고</div>
            <div style={{ fontSize: 10.5, color: "#7C87A4" }}>7/28 (월) 11:00</div>
          </div>
          <span style={{ fontSize: 10.5, color: "#3B5BDB", fontWeight: 700, fontFamily: "var(--font-mono)" }}>D-13</span>
        </div>
      </div>

      <button onClick={() => onRequestNew && onRequestNew()} style={{
        width: "100%", padding: "10px 12px",
        background: "#3B5BDB", color: "#fff",
        border: "none", borderRadius: 9,
        fontSize: 12.5, fontWeight: 700, cursor: "pointer",
        fontFamily: "var(--font-sans)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <span>💬</span> 새 코칭 요청하기
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// 이전 평가 이력 카드
// ─────────────────────────────────────────────
function PastEvaluationHistory() {
  const history = [
    { period: "2025 하반기", grade: "A", gradeColor: "#3B5BDB", okrCount: 5, keyEvent: "12/20 최종 평가 확정", hasRetro: true },
    { period: "2025 상반기", grade: "B", gradeColor: "#5B6685", okrCount: 4, keyEvent: "06/28 최종 평가 확정", hasRetro: true },
    { period: "2024 하반기", grade: "B", gradeColor: "#5B6685", okrCount: 4, keyEvent: "12/22 최종 평가 확정", hasRetro: false },
  ];

  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>📚 이전 평가 이력</div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#7C87A4", fontFamily: "var(--font-mono)", fontWeight: 600 }}>3회</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {history.map((h, i) => (
          <div key={i}
            onClick={() => window.notYet(h.period + " 회고 화면")}
            style={{
              border: "1px solid #ECEFF5", borderRadius: 10, padding: "11px 12px",
              display: "flex", alignItems: "center", gap: 11, cursor: "pointer",
              transition: "all 140ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#F9FAFC"; e.currentTarget.style.borderColor = "#DCE3F8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#ECEFF5"; }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: h.gradeColor === "#3B5BDB" ? "#E8F0FF" : "#F1F3F8",
              color: h.gradeColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, fontFamily: "var(--font-mono)",
              flexShrink: 0,
            }}>{h.grade}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36" }}>{h.period}</div>
              <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                KR {h.okrCount}개 · {h.keyEvent}
              </div>
            </div>
            {h.hasRetro && (
              <button style={{
                padding: "5px 10px", background: "#F4F7FB", border: "1px solid #E1E5EF",
                borderRadius: 7, fontSize: 10.5, color: "#3A4565", fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-sans)", flexShrink: 0,
              }}>회고 보기</button>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => window.notYet("전체 이력 화면")} style={{
        width: "100%", marginTop: 10,
        padding: "9px", background: "#fff", border: "1px dashed #C8CFDF",
        borderRadius: 9, fontSize: 12, color: "#5B6685", fontWeight: 600,
        cursor: "pointer", fontFamily: "var(--font-sans)",
      }}>전체 이력 보기 →</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// 이번 반기 평가 프로세스 타임라인 (7월 기준)
// ─────────────────────────────────────────────
function EvaluationTimeline() {
  const phases = [
    { id: "kickoff",  label: "OKR 등록 시작", date: "07/01", status: "done" },
    { id: "writing",  label: "KR 확정",       date: "07/01 ~ 07/30", status: "current", detail: "지금 여기" },
    { id: "review",   label: "평가자 검토",   date: "08/01 ~ 08/07", status: "upcoming" },
    { id: "self",     label: "자기 평가",     date: "08/05 ~ 08/12", status: "upcoming" },
    { id: "calibration", label: "캘리브레이션", date: "08/15 ~ 08/22", status: "upcoming" },
    { id: "final",    label: "결과 공지",     date: "08/28",         status: "upcoming" },
  ];

  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 2px rgba(31,42,74,.04)" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.01em" }}>2026 하반기 평가 프로세스</div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 2 }}>총 6단계 · 현재 2단계 진행 중</div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ fontSize: 11.5, color: "#3B5BDB", fontWeight: 700, fontFamily: "var(--font-mono)" }}>2 / 6</div>
      </div>

      <div style={{ position: "relative", display: "flex", gap: 4 }}>
        {phases.map((p, i) => {
          const isDone = p.status === "done";
          const isCurrent = p.status === "current";
          const bg = isDone ? "#3B5BDB" : isCurrent ? "#E8F0FF" : "#F4F7FB";
          const border = isDone ? "#3B5BDB" : isCurrent ? "#3B5BDB" : "#E1E5EF";
          const numColor = isDone ? "#fff" : isCurrent ? "#3B5BDB" : "#A4ADC4";
          return (
            <div key={p.id} style={{ flex: 1, position: "relative" }}>
              {i < phases.length - 1 && (
                <div style={{
                  position: "absolute", top: 15, left: "50%", right: "-50%",
                  height: 2, background: isDone ? "#3B5BDB" : "#ECEFF5", zIndex: 0,
                }}/>
              )}
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: bg, border: `2px solid ${border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: numColor, fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)",
                  boxShadow: isCurrent ? "0 0 0 6px rgba(59,91,219,.14)" : "none",
                }}>
                  {isDone ? "✓" : i + 1}
                </div>
                <div style={{
                  marginTop: 8,
                  fontSize: 11.5, fontWeight: isCurrent ? 700 : 600,
                  color: isCurrent ? "#3B5BDB" : isDone ? "#0F1A36" : "#7C87A4",
                }}>{p.label}</div>
                <div style={{
                  fontSize: 10, color: "#A4ADC4", marginTop: 2, fontFamily: "var(--font-mono)",
                }}>{p.date}</div>
                {p.detail && (
                  <div style={{
                    marginTop: 4, padding: "2px 8px",
                    background: "#3B5BDB", color: "#fff",
                    fontSize: 9.5, fontWeight: 700, borderRadius: 999,
                  }}>{p.detail}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// R1Calendar 메인
// ─────────────────────────────────────────────
function R1Calendar() {
  const [popover, setPopover] = React.useState(null);
  const [modal, setModal] = React.useState(null);

  // 7월 캘린더 이벤트 (오늘 = 7/15, 시연날짜)
  const events = {
    1:  [{ type: "kickoff",  title: "OKR 등록 시작", time: "전일",  host: "인사팀", memo: "2026 하반기 OKR 등록이 시작되었습니다." }],
    8:  [{ type: "quarter",  title: "분기 미팅",     time: "10:00", host: "팀장",   memo: "3분기 목표 공유·조정" }],
    10: [{ type: "oneonone", title: "1on1 · 킥오프", time: "14:00", host: "정태영 팀장", linkedFromEvaluator: true, memo: "이번 반기 목표 정렬" }],
    15: [{ type: "oneonone", title: "1on1 · 오늘",   time: "10:00", host: "정태영 팀장", linkedFromEvaluator: true, memo: "KR 초안 함께 검토" }],
    17: [{ type: "quarter",  title: "분기 중간 점검", time: "14:00", host: "인사팀" }],
    22: [{ type: "oneonone", title: "1on1 코칭",     time: "15:00", host: "정태영 팀장", linkedFromEvaluator: true, memo: "KR 03 진척 점검 및 다음 분기 목표 협의" }],
    25: [{ type: "oneonone", title: "KR 조정 상담",   time: "10:30", host: "내가 요청", status: "pending", memo: "인프라 팀 이동으로 KR 03 목표치 조정 필요" }],
    28: [{ type: "oneonone", title: "1on1 · 월간회고", time: "11:00", host: "정태영 팀장", linkedFromEvaluator: true }],
    30: [{ type: "deadline", title: "OKR 등록 마감", time: "18:00", host: "전사", memo: "KR 5개 확정 필수" }],
  };

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="평가 캘린더" subtitle="김지훈 · 2026 하반기 · KR 확정 단계"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 하반기</div>
            <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              나의 평가 여정을 한눈에
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#5B6685" }}>
              전사 마일스톤, 평가자와의 1on1 코칭, 이전 평가 이력을 모두 확인할 수 있어요.
            </p>
          </div>
        </div>

        {/* D-Day 배너 */}
        <DDayBanner/>

        {/* 캘린더 + 사이드 */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.65fr) 340px", gap: 18, marginBottom: 18 }}>
          <R1FullCalendar
            events={events}
            onChipClick={(e, anchor) => setPopover({ event: e, anchor })}
            onRequestNew={() => setModal({ defaultDate: "2026-07-22" })}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <UpcomingEvents onChipClick={(e, anchor) => setPopover({ event: e, anchor })}/>
            <MyCoachingCard onRequestNew={() => setModal({ defaultDate: "2026-07-22" })}/>
            <PastEvaluationHistory/>
          </div>
        </div>

        {/* 하단: 평가 프로세스 타임라인 */}
        <EvaluationTimeline/>
      </div>

      {popover && <R1EventPopover event={popover.event} anchor={popover.anchor} onClose={() => setPopover(null)}/>}
      <R1RequestModal
        open={!!modal}
        defaultDate={modal?.defaultDate}
        onClose={() => setModal(null)}
        onSave={(data) => window.notYet("코칭 요청이 전송되었어요! (실제 저장은 향후 구현 예정)")}
      />
    </main>
  );
}

window.R1Calendar = R1Calendar;
