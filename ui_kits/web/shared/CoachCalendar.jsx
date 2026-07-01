// CoachCalendar — '[lite]' 월간 뷰 (표시만, 등록 모달은 P2)
function CoachCalendar() {
  const weeks = [
    [null, null, null, 1,   2,   3,   4],
    [5,    6,    7,   8,   9,   10,  11],
    [12,   13,   14,  15,  16,  17,  18],
    [19,   20,   21,  22,  23,  24,  25],
    [26,   27,   28,  29,  30,  31,  null],
  ];
  const events = {
    8:  [{ type: "kickoff",  label: "등록 시작" }],
    12: [{ type: "1on1",     label: "김지훈 1on1" }],
    15: [{ type: "demo",     label: "마감" }],
    18: [{ type: "1on1",     label: "박서연 1on1" }],
    22: [{ type: "quarter",  label: "분기 미팅" }],
    28: [{ type: "1on1",     label: "이도윤 1on1" }],
  };
  const eventColors = {
    "1on1":    { bg: "#E5E9FB", fg: "#1E2A6B" },
    quarter:   { bg: "#DCF3F6", fg: "#0D6E7E" },
    kickoff:   { bg: "#ECFDF3", fg: "#067647" },
    demo:      { bg: "#FFFAEB", fg: "#B54708" },
  };
  return (
    <div style={{ background: "#fff", border: "1px solid #DEE3EE", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0D1321" }}>코칭 캘린더</div>
        <span style={{ marginLeft: 8, fontSize: 11, fontFamily: "var(--font-mono)", color: "#6B7494" }}>2026 · 07</span>
        <div style={{ flex: 1 }}/>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={navBtn}><Icon name="chevronRight" size={12} style={{ transform: "rotate(180deg)" }}/></button>
          <button style={navBtn}><Icon name="chevronRight" size={12}/></button>
        </div>
      </div>

      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 4 }}>
        {["일","월","화","수","목","금","토"].map((d, i) => (
          <div key={i} style={{
            fontSize: 10, fontWeight: 600, color: i === 0 ? "#B42318" : "#6B7494",
            textAlign: "center", padding: "4px 0",
          }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {weeks.flat().map((d, i) => {
          if (!d) return <div key={i} style={{ aspectRatio: "1/0.7" }}/>;
          const ev = events[d];
          const isToday = d === 15;
          return (
            <div key={i} style={{
              border: "1px solid #E8ECF4",
              borderRadius: 6,
              padding: "4px 5px",
              minHeight: 48,
              background: isToday ? "#F2F4FD" : "#fff",
              borderColor: isToday ? "#3D52B8" : "#E8ECF4",
            }}>
              <div style={{
                fontSize: 10.5, fontWeight: isToday ? 700 : 500,
                color: isToday ? "#1E2A6B" : "#4A5275",
                fontVariantNumeric: "tabular-nums",
              }}>{d}</div>
              {ev && ev.map((e, j) => {
                const c = eventColors[e.type];
                return (
                  <div key={j} style={{
                    background: c.bg, color: c.fg,
                    fontSize: 9, fontWeight: 600,
                    padding: "2px 4px", borderRadius: 3, marginTop: 2,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{e.label}</div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 10, marginTop: 12, fontSize: 10.5, color: "#6B7494", flexWrap: "wrap" }}>
        <Lg c="#1E2A6B" label="1on1 코칭"/>
        <Lg c="#0D6E7E" label="분기 미팅"/>
        <Lg c="#067647" label="등록 시작/마감"/>
        <Lg c="#B54708" label="기타"/>
      </div>
    </div>
  );
}
const navBtn = {
  width: 24, height: 24, borderRadius: 5,
  border: "1px solid #DEE3EE", background: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#4A5275", cursor: "pointer",
};
function Lg({ c, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: c }}/>
      {label}
    </div>
  );
}
window.CoachCalendar = CoachCalendar;
