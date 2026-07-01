// StatCard — 명세 6종 카드 (전체팀원/OKR수립완료/작성중/결재요청/반려/조정요청)
const STAT_ICONS = {
  total:    { ico: "👥", bg: "#F1F3F8", fg: "#5B6685" },
  approved: { ico: "✓",  bg: "#ECFAF1", fg: "#2F9E5E" },
  draft:    { ico: "✎",  bg: "#F4F7FB", fg: "#7C87A4" },
  pending:  { ico: "📥", bg: "#FFF0F0", fg: "#D14343" },  // 결재 요청 — 강조 빨강
  rejected: { ico: "↩",  bg: "#FFF7EC", fg: "#D98023" },  // 반려 — 주황
  adjust:   { ico: "↻",  bg: "#FFFAE7", fg: "#C29017" },  // 조정 요청 — 노랑
};

function StatCard({ stat, active, onClick }) {
  const icon = STAT_ICONS[stat.id] || STAT_ICONS.total;
  // tone === "high" → 강조 (테두리·dot)
  const emphasized = stat.value > 0 && (stat.id === "pending" || stat.id === "rejected" || stat.id === "adjust");

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: `1px solid ${active ? "#3B5BDB" : "#E1E5EF"}`,
        borderRadius: 12,
        padding: "13px 12px",
        boxShadow: active ? "0 0 0 4px rgba(59,91,219,.12)" : "0 1px 2px rgba(31,42,74,.04)",
        cursor: "pointer",
        transition: "all 180ms ease-out",
        position: "relative",
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = "#C5D0F7"; e.currentTarget.style.boxShadow = "0 2px 6px rgba(31,42,74,.05)"; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "#E1E5EF"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(31,42,74,.04)"; } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: icon.bg, color: icon.fg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>{icon.ico}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#5B6685", letterSpacing: "-0.015em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, flex: 1 }}>{stat.label}</div>
        {emphasized && (
          <span style={{
            marginLeft: "auto",
            width: 6, height: 6, borderRadius: "50%",
            background: icon.fg,
            flexShrink: 0,
          }}/>
        )}
      </div>
      <div style={{
        display: "flex", alignItems: "baseline", gap: 3,
        fontSize: 26, fontWeight: 700,
        color: emphasized ? icon.fg : "#0F1A36",
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.025em",
        lineHeight: 1.1,
      }}>
        {stat.value}
        <span style={{ fontSize: 12, color: emphasized ? icon.fg : "#7C87A4", fontWeight: 500, opacity: 0.8 }}>{stat.unit}</span>
      </div>
      {stat.hint && (
        <div style={{
          fontSize: 10.5, fontWeight: 500, marginTop: 5,
          color: emphasized ? icon.fg : "#7C87A4",
          letterSpacing: "-0.005em",
          opacity: emphasized ? 0.85 : 1,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {stat.hint}
        </div>
      )}
    </div>
  );
}

window.StatCard = StatCard;
