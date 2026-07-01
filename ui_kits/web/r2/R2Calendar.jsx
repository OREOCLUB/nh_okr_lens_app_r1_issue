// R2Calendar.jsx — 코칭 캘린더
// 명세: 6종 일정 유형 / 날짜 클릭 → 등록 팝업 / 칩 클릭 → 상세 팝오버

// ─────────────────────────────────────────────
// 일정 등록 / 수정 팝업
// ─────────────────────────────────────────────
function EventModal({ open, date, mode, initial, onClose, onSave }) {
  const types = window.OKRDummy.scheduleTypes;
  const allMembers = window.OKRDummy.members.filter(m => m.status !== "draft").slice(0, 12);

  const [type, setType] = React.useState(initial?.type || "oneonone");
  const [start, setStart] = React.useState(initial?.time || "09:00");
  const [end, setEnd] = React.useState(initial?.endTime || "10:00");
  const [participants, setParticipants] = React.useState(initial?.participants || []);
  const [memo, setMemo] = React.useState(initial?.memo || "");
  const [typeOpen, setTypeOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setType(initial?.type || "oneonone");
    setStart(initial?.time || "09:00");
    setEnd(initial?.endTime || "10:00");
    setParticipants(initial?.participants || []);
    setMemo(initial?.memo || "");
  }, [open, initial]);

  if (!open) return null;

  // 30분 단위 시간 옵션
  const times = [];
  for (let h = 8; h < 21; h++) {
    times.push(`${String(h).padStart(2, "0")}:00`);
    times.push(`${String(h).padStart(2, "0")}:30`);
  }

  // 공지 성격 유형 — 참여자 입력 숨김
  const noticeTypes = ["kickoff", "deadline", "final"];
  const showParticipants = !noticeTypes.includes(type);
  const t = types[type];

  const toggleParticipant = (id) => {
    setParticipants(participants.includes(id)
      ? participants.filter(x => x !== id)
      : [...participants, id]);
  };

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
          <span style={{ fontSize: 16 }}>📅</span>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: "#0F1A36" }}>{date}</div>
          <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 999, background: t.bg, color: t.fg, fontSize: 11, fontWeight: 700 }}>{t.ico} {t.label}</span>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, background: "#F4F7FB", border: "none",
            color: "#5B6685", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px" }}>
          {/* 등록된 일정 (mode === edit 일 때만) */}
          {mode === "list" && initial?.events && (
            <>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>등록된 일정</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                {initial.events.map((e, i) => {
                  const et = types[e.type];
                  return (
                    <div key={i} style={{ padding: "10px 12px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 9, display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: et.bg, color: et.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{et.ico}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>{e.title} <span style={{ color: "#7C87A4", fontWeight: 500, fontSize: 11 }}>· {e.time}</span></div>
                        {e.participants && e.participants.length > 0 && (
                          <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 1 }}>참여자 {e.participants.length}명</div>
                        )}
                      </div>
                      <button style={{ padding: "3px 8px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 6, fontSize: 11, color: "#3A4565", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>수정</button>
                      <button style={{ padding: "3px 8px", background: "#fff", border: "1px solid #FFD4D4", borderRadius: 6, fontSize: 11, color: "#D14343", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>삭제</button>
                    </div>
                  );
                })}
              </div>
              <div style={{ paddingTop: 14, borderTop: "1px solid #ECEFF5" }}/>
            </>
          )}

          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>
            + 새 일정 등록
          </div>

          {/* 일정 유형 */}
          <div style={{ marginBottom: 14 }}>
            <label style={fieldLabel}>일정 유형 <span style={{ color: "#D14343" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <button onClick={() => setTypeOpen(!typeOpen)} style={{
                width: "100%", padding: "10px 12px", background: "#fff",
                border: "1px solid #E1E5EF", borderRadius: 9,
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 13, color: "#0F1A36", cursor: "pointer", fontFamily: "var(--font-sans)",
                textAlign: "left",
              }}>
                <span style={{ fontSize: 14 }}>{t.ico}</span>
                <span style={{ fontWeight: 600 }}>{t.label}</span>
                <span style={{ marginLeft: "auto", color: "#A4ADC4", fontSize: 11 }}>▾</span>
              </button>
              {typeOpen && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
                  background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10,
                  boxShadow: "0 8px 24px -4px rgba(15,26,54,.16)", padding: 4, zIndex: 10,
                }}>
                  {Object.entries(types).map(([k, tt]) => (
                    <div key={k} onClick={() => { setType(k); setTypeOpen(false); }} style={{
                      padding: "9px 12px", borderRadius: 7, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10,
                      background: type === k ? "#F4F7FB" : "transparent",
                    }} onMouseEnter={(e) => e.currentTarget.style.background = "#F4F7FB"}
                       onMouseLeave={(e) => e.currentTarget.style.background = type === k ? "#F4F7FB" : "transparent"}>
                      <span style={{ fontSize: 13 }}>{tt.ico}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>{tt.label}</div>
                        <div style={{ fontSize: 10.5, color: "#7C87A4" }}>{tt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 시간 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={fieldLabel}>시작 시간 <span style={{ color: "#D14343" }}>*</span></label>
              <select value={start} onChange={(e) => setStart(e.target.value)} style={selectStyle}>
                {times.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabel}>종료 시간</label>
              <select value={end} onChange={(e) => setEnd(e.target.value)} style={selectStyle}>
                {times.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* 참여자 (공지가 아닐 때만) */}
          {showParticipants && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <label style={{ ...fieldLabel, margin: 0 }}>참여자 <span style={{ color: "#A4ADC4", fontWeight: 500 }}>(선택)</span></label>
                <button onClick={() => setParticipants(allMembers.map(m => m.id))} style={smallBtn}>전체 선택</button>
                <button onClick={() => setParticipants([])} style={smallBtn}>전체 해제</button>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#5B6685", fontFamily: "var(--font-mono)" }}>{participants.length}명 선택</span>
              </div>
              <div style={{
                border: "1px solid #E1E5EF", borderRadius: 9, padding: 8,
                maxHeight: 130, overflowY: "auto",
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4,
                background: "#fff",
              }}>
                {allMembers.map(m => {
                  const checked = participants.includes(m.id);
                  return (
                    <label key={m.id} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "5px 6px", borderRadius: 6, cursor: "pointer",
                      fontSize: 12, color: "#3A4565",
                      background: checked ? "#F1F4FD" : "transparent",
                    }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleParticipant(m.id)}
                        style={{ accentColor: "#3B5BDB" }}/>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, minWidth: 0 }}>
                        {m.focus && <span style={{ fontSize: 10 }}>🎯</span>}
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {type === "oneonone" && participants.length === 0 && (
                <div style={{ fontSize: 11, color: "#D98023", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
                  💡 1on1 코칭은 팀원 1명 선택을 권장해요.
                </div>
              )}
            </div>
          )}

          {/* 메모 */}
          <div>
            <label style={fieldLabel}>메모 <span style={{ color: "#A4ADC4", fontWeight: 500 }}>(선택, 최대 200자)</span></label>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value.slice(0, 200))} placeholder="예: KR 03 진척 점검 + 다음 분기 도전성 협의"
              style={{
                width: "100%", minHeight: 60, padding: "9px 11px",
                background: "#fff", border: "1px solid #E1E5EF", borderRadius: 9,
                fontFamily: "var(--font-sans)", fontSize: 12.5, color: "#0F1A36",
                outline: "none", resize: "vertical", lineHeight: 1.55,
              }}/>
            <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 3, textAlign: "right", fontFamily: "var(--font-mono)" }}>{memo.length} / 200</div>
          </div>
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid #ECEFF5", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={() => { onSave && onSave({ type, start, end, participants, memo }); onClose(); }}>저장</Button>
        </div>
      </div>
    </div>
  );
}

const fieldLabel = { display: "block", fontSize: 11.5, fontWeight: 700, color: "#3A4565", letterSpacing: "0.02em", marginBottom: 6 };
const selectStyle = {
  width: "100%", padding: "9px 11px", background: "#fff",
  border: "1px solid #E1E5EF", borderRadius: 9,
  fontSize: 13, color: "#0F1A36", fontFamily: "var(--font-sans)",
  cursor: "pointer", outline: "none",
};
const smallBtn = {
  padding: "3px 8px", background: "#F4F7FB", border: "1px solid #E1E5EF",
  borderRadius: 6, fontSize: 10.5, color: "#3A4565", fontWeight: 600, cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

// ─────────────────────────────────────────────
// 칩 클릭 시 상세 팝오버 (위치는 click target 기준 fixed)
// ─────────────────────────────────────────────
function EventPopover({ event, anchor, onClose, onEdit }) {
  if (!event || !anchor) return null;
  const types = window.OKRDummy.scheduleTypes;
  const t = types[event.type];
  const rect = anchor.getBoundingClientRect();
  const top = rect.bottom + 6;
  const left = Math.min(rect.left, window.innerWidth - 280);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40 }}/>
      <div style={{
        position: "fixed", top, left, width: 260, zIndex: 41,
        background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12,
        boxShadow: "0 12px 32px -6px rgba(15,26,54,.20)", padding: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: t.bg, color: t.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{t.ico}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>{event.title}</div>
            <div style={{ fontSize: 11, color: "#7C87A4" }}>{t.label}</div>
          </div>
          {event.focus && <span style={{ fontSize: 12 }}>🎯</span>}
        </div>
        <div style={{ fontSize: 11.5, color: "#5B6685", lineHeight: 1.55, marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #ECEFF5" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 3 }}>
            <span style={{ color: "#A4ADC4", width: 50 }}>시간</span>
            <span style={{ color: "#0F1A36", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{event.time}</span>
          </div>
          {event.participants && (
            <div style={{ display: "flex", gap: 6, marginBottom: 3 }}>
              <span style={{ color: "#A4ADC4", width: 50 }}>참여자</span>
              <span style={{ color: "#0F1A36" }}>{event.participants}</span>
            </div>
          )}
          {event.memo && (
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ color: "#A4ADC4", width: 50 }}>메모</span>
              <span style={{ color: "#3A4565", flex: 1 }}>{event.memo}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => { onEdit && onEdit(); onClose(); }} style={{
            flex: 1, padding: "6px 10px", background: "#F4F7FB", border: "1px solid #E1E5EF",
            borderRadius: 7, fontSize: 11.5, color: "#3A4565", fontWeight: 600, cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}>수정</button>
          <button style={{
            flex: 1, padding: "6px 10px", background: "#fff", border: "1px solid #FFD4D4",
            borderRadius: 7, fontSize: 11.5, color: "#D14343", fontWeight: 600, cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}>삭제</button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// FullCalendar (월간 뷰)
// ─────────────────────────────────────────────
function FullCalendar({ onDayClick, onChipClick }) {
  const types = window.OKRDummy.scheduleTypes;

  // 2026년 7월 — 1일 = 수요일 (offset 2)
  // 이벤트 데이터 (날짜 = 일자)
  const events = {
    1:  [{ type: "kickoff",  title: "OKR 등록 시작", time: "전일",  focus: false }],
    8:  [{ type: "quarter",  title: "분기 미팅",     time: "10:00", focus: false, participants: "팀 전체 20명", memo: "3분기 목표 공유·조정" }],
    10: [{ type: "oneonone", title: "1on1 — 김지훈", time: "10:00", focus: true,  participants: "김지훈", memo: "KR 초안 검토" }],
    14: [{ type: "oneonone", title: "1on1 — 김태양", time: "14:00", focus: true,  participants: "김태양", memo: "KR 01 진척 점검" }],
    15: [{ type: "oneonone", title: "1on1 — 강동우", time: "10:00", focus: true,  participants: "강동우", memo: "재상신 KR 함께 검토" }],
    17: [{ type: "quarter",  title: "분기 중간 점검", time: "14:00", focus: false }],
    20: [{ type: "oneonone", title: "1on1 — 임재현", time: "15:00", focus: false }],
    22: [{ type: "oneonone", title: "1on1 — 박서연", time: "10:30", focus: true }, { type: "oneonone", title: "1on1 — 한지윤", time: "14:00", focus: true }],
    23: [{ type: "etc",      title: "팀 간담회",     time: "15:00", focus: false, memo: "분기 회고 및 친목" }],
    28: [{ type: "oneonone", title: "1on1 — 정하은", time: "11:00", focus: true }],
    30: [{ type: "deadline", title: "OKR 등록 마감", time: "18:00", focus: false }],
  };

  // 2026-07-01 = 수요일
  const firstOffset = 2; // 수=2 (월=0)
  const total = 31;
  const cells = [];
  for (let i = 0; i < firstOffset; i++) cells.push(null);
  for (let i = 1; i <= total; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const TODAY = 15; // 시연일 = 7/15

  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 2px rgba(31,42,74,.04)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>2026 · 07월</div>
          <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2 }}>등록 일정 12건 · 1on1 7건 · 분기 미팅 2건</div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={navBtn}>‹</button>
          <button style={{ ...navBtn, width: "auto", padding: "0 12px", fontSize: 12, fontWeight: 600 }}>오늘</button>
          <button style={navBtn}>›</button>
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
          if (!d) return <div key={i} style={{ minHeight: 88, background: "#F9FAFC", borderRadius: 8, opacity: 0.4 }}/>;
          const ev = events[d];
          const isToday = d === TODAY;
          const dow = (firstOffset + d - 1) % 7;
          const dateColor = dow === 6 ? "#D14343" : dow === 5 ? "#2B5DD9" : "#3A4565";
          return (
            <div key={i}
              onClick={() => onDayClick && onDayClick(d, ev)}
              style={{
                minHeight: 88,
                background: isToday ? "#F1F4FD" : "#fff",
                border: `1px solid ${isToday ? "#3B5BDB" : "#ECEFF5"}`,
                borderRadius: 8, padding: "5px 6px",
                overflow: "hidden",
                display: "flex", flexDirection: "column",
                cursor: "pointer",
                transition: "background 140ms",
              }}
              onMouseEnter={(e) => { if (!isToday) e.currentTarget.style.background = "#F9FAFC"; }}
              onMouseLeave={(e) => { if (!isToday) e.currentTarget.style.background = "#fff"; }}
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
                  }} title={`${e.time} ${e.title}`}>
                    <span style={{ fontSize: 9 }}>{c.ico}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</span>
                    {e.focus && <span style={{ width: 4, height: 4, borderRadius: "50%", background: c.fg, marginLeft: "auto", flexShrink: 0 }}/>}
                  </div>
                );
              })}
              {ev && ev.length > 3 && <div style={{ fontSize: 9, color: "#7C87A4", fontWeight: 600 }}>+{ev.length - 3}</div>}
            </div>
          );
        })}
      </div>

      {/* Legend — 6종 명세 */}
      <div style={{ display: "flex", gap: 14, marginTop: 14, paddingTop: 12, borderTop: "1px solid #ECEFF5", flexWrap: "wrap", fontSize: 11, color: "#5B6685" }}>
        {Object.entries(types).map(([k, t]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: t.fg }}/>
            <span style={{ fontSize: 11 }}>{t.ico}</span>
            <span>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const navBtn = {
  width: 32, height: 32, borderRadius: 8, border: "1px solid #E1E5EF", background: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center", color: "#3A4565", cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

// ─────────────────────────────────────────────
// 우측 사이드바
// ─────────────────────────────────────────────
function MonthEventList() {
  const types = window.OKRDummy.scheduleTypes;
  const events = [
    { date: "07/01", type: "kickoff",  title: "OKR 등록 시작",  time: "전일",   target: null },
    { date: "07/08", type: "quarter",  title: "분기 미팅",       time: "10:00", target: "팀 전체" },
    { date: "07/14", type: "oneonone", title: "1on1 코칭",       time: "14:00", target: "김태양", focus: true },
    { date: "07/15", type: "oneonone", title: "1on1 코칭",       time: "10:00", target: "강동우", focus: true },
    { date: "07/17", type: "quarter",  title: "분기 중간 점검",  time: "14:00", target: "팀 전체" },
    { date: "07/22", type: "oneonone", title: "1on1 코칭",       time: "10:30", target: "박서연", focus: true },
    { date: "07/23", type: "etc",      title: "팀 간담회",       time: "15:00", target: null },
    { date: "07/30", type: "deadline", title: "OKR 등록 마감",   time: "18:00", target: null },
  ];

  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>이번 달 일정</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {events.map((e, i) => {
          const t = types[e.type];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 8, cursor: "pointer" }}
              onMouseEnter={(ev) => ev.currentTarget.style.background = "#F9FAFC"}
              onMouseLeave={(ev) => ev.currentTarget.style.background = "transparent"}>
              <div style={{ fontSize: 14 }}>{t.ico}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 700, color: t.fg, width: 36 }}>{e.date}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0F1A36" }}>{e.title}</span>
                  {e.target && <span style={{ fontSize: 11, color: "#7C87A4" }}>· {e.target}</span>}
                  {e.focus && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#D98023", marginLeft: 2 }}/>}
                </div>
              </div>
              <div style={{ fontSize: 10.5, color: "#A4ADC4", fontFamily: "var(--font-mono)" }}>{e.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UnregisteredList({ onPickMember }) {
  const members = window.OKRDummy.members;
  const focusMembers = members.filter(m => m.focus && !m.coaching);
  const others = members.filter(m => !m.focus && !m.coaching && m.status !== "draft");

  return (
    <div style={{ background: "linear-gradient(135deg, #FFF7EC, #fff 70%)", border: "1px solid #FFE0BA", borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "#D98023", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>!</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#7A4A14" }}>1on1 미등록 팀원</div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#9C5E26", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{focusMembers.length + others.length}명</span>
      </div>

      <div style={{ fontSize: 10.5, color: "#7A4A14", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>🎯 집중 코칭 우선</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
        {focusMembers.map((m, i) => (
          <div key={i} onClick={() => onPickMember && onPickMember(m)}
            style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", background: "#fff", border: "1px solid #FFE0BA", borderRadius: 8, cursor: "pointer" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#FFEDE2", color: "#E07A3C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11 }}>{m.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#0F1A36" }}>{m.name} <span style={{ color: "#7C87A4", fontWeight: 500, fontSize: 11 }}>{m.grade}</span></div>
              <div style={{ fontSize: 10, color: "#9C5E26" }}>{m.group}</div>
            </div>
            <span style={{ padding: "3px 8px", background: "#D98023", border: "none", borderRadius: 6, color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-sans)" }}>+ 1on1</span>
          </div>
        ))}
      </div>

      {others.length > 0 && (
        <>
          <div style={{ fontSize: 10.5, color: "#9C5E26", fontWeight: 600, marginBottom: 5 }}>그 외 {others.length}명</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {others.map((m, i) => (
              <span key={i} onClick={() => onPickMember && onPickMember(m)}
                style={{ padding: "3px 8px", background: "#fff", border: "1px solid #FFE0BA", borderRadius: 999, fontSize: 11, color: "#7A4A14", fontWeight: 600, cursor: "pointer" }}>{m.name}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// R2Calendar 메인
// ─────────────────────────────────────────────
function R2Calendar() {
  const [modal, setModal] = React.useState(null);   // { date, mode, initial }
  const [popover, setPopover] = React.useState(null); // { event, anchor }

  const handleDayClick = (day, events) => {
    setModal({
      date: `2026년 6월 ${day}일 (${["일","월","화","수","목","금","토"][((day + 0) % 7)]})`,
      mode: events ? "list" : "create",
      initial: events ? { events } : null,
    });
  };
  const handleChipClick = (event, anchor) => {
    setPopover({ event, anchor });
  };

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="코칭 캘린더" subtitle="정태영 팀장 · 이번 달 1on1 7건"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 하반기 · 7월</div>
            <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              팀원과의 일정을 한눈에
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#5B6685" }}>
              오늘은 강동우 님 1on1이 오전 10시에 잡혀있어요. 김지훈 님의 코칭 요청 1건이 대기 중이에요.
            </p>
          </div>
          <div style={{ flex: 1 }}/>
          <Button variant="primary" leftIcon={<span style={{ fontSize: 14 }}>+</span>}
            onClick={() => setModal({ date: "2026년 7월 15일 (화)", mode: "create" })}>일정 등록</Button>
        </div>

        {/* Two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.65fr) 320px", gap: 18 }}>
          <FullCalendar onDayClick={handleDayClick} onChipClick={handleChipClick}/>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <MonthEventList/>
            <UnregisteredList onPickMember={(m) => setModal({
              date: "2026년 7월 15일 (화)", mode: "create",
              initial: { type: "oneonone", participants: [m.id] },
            })}/>
          </div>
        </div>
      </div>

      <EventModal open={!!modal}
        date={modal?.date}
        mode={modal?.mode}
        initial={modal?.initial}
        onClose={() => setModal(null)}/>

      {popover && <EventPopover event={popover.event} anchor={popover.anchor}
        onClose={() => setPopover(null)}
        onEdit={() => { setModal({ date: "2026년 6월", mode: "create", initial: popover.event }); setPopover(null); }}/>}
    </main>
  );
}

window.R2Calendar = R2Calendar;
