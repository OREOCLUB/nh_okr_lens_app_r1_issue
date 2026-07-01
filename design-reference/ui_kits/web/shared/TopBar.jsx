// TopBar.jsx — 2026 리브랜드: 폰트 상향 + 반응형
function TopBar({ title, subtitle }) {
  return (
    <header className="okrlens-topbar" style={{
      minHeight: 68,
      display: "flex", alignItems: "center",
      padding: "0 32px",
      background: "#fff",
      borderBottom: "1px solid #E1E5EF",
      gap: 20,
      flexWrap: "wrap",
    }}>
      <div style={{ flex: 1, minWidth: 200, padding: "12px 0" }}>
        <div style={{ fontSize: 19, fontWeight: 700, color: "#0A1F17", letterSpacing: "-0.02em", lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 14, color: "#6B7770", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitle}</div>}
      </div>

      <div className="okrlens-search" style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#F4F7F5",
        borderRadius: 10, padding: "10px 16px",
        width: 320,
        color: "#6B7770",
      }}>
        <Icon name="search" size={16}/>
        <input
          placeholder="팀원 이름, KR ID 검색"
          style={{ background: "transparent", border: "none", outline: "none", fontSize: 14.5, color: "#0A1F17", flex: 1, fontFamily: "var(--font-sans)" }}
        />
      </div>

      <div className="okrlens-period" style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 16px",
        border: "1px solid #E1E5EF", borderRadius: 10,
        fontSize: 14, color: "#0A1F17", fontWeight: 500,
      }}>
        <Icon name="calendar" size={16} style={{ color: "#6B7770" }}/>
        2026 상반기
        <Icon name="chevronDown" size={13} style={{ color: "#8CA599" }}/>
      </div>

      <button className="okrlens-bell" style={{
        position: "relative",
        width: 44, height: 44, borderRadius: 10,
        border: "1px solid #E1E5EF", background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "#3A4565",
      }}>
        <Icon name="bell" size={18}/>
        <span style={{ position: "absolute", top: 9, right: 10, width: 9, height: 9, borderRadius: "50%", background: "#D14343", border: "1.5px solid #fff" }}/>
      </button>
    </header>
  );
}

window.TopBar = TopBar;
