// Sidebar.jsx — R2 평가자 사이드바 (2026-07 v3 그룹핑)
//
// 그룹 설계:
//  1) 팀 관리        — 대시보드 / 팀원 관리
//  2) 평가 · 코칭    — OKR 검토 / 코칭 캘린더 / 피드백 작성
//  3) 기록           — 이전 평가

function Sidebar({ active = "dashboard" }) {
  const groups = [
    {
      id: "team",
      label: "팀 관리",
      items: [
        { id: "dashboard", label: "대시보드",   icon: "dashboard", href: "./dashboard.html" },
        { id: "team",      label: "팀원 관리",  icon: "users",     href: "./r2-member.html" },
      ],
    },
    {
      id: "review",
      label: "평가 · 코칭",
      items: [
        { id: "review",    label: "OKR 검토",     icon: "clipboard", href: "./r2-review.html" },
        { id: "coaching",  label: "코칭 캘린더",  icon: "calendar",  href: "./r2-calendar.html" },
        { id: "feedback",  label: "피드백 작성",  icon: "message" },
        { id: "history",   label: "이전 평가",    icon: "library" },
      ],
    },
  ];

  return (
    <aside className="okrlens-sidebar" style={{
      width: 244, minWidth: 244,
      background: "#0A1F17", color: "#8CA599",
      display: "flex", flexDirection: "column",
      height: "100%", padding: "22px 14px", gap: 4,
      overflowY: "auto",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "4px 8px 22px", borderBottom: "1px solid #14342B", marginBottom: 14 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.035em" }}>OKR</span>
        <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#3EDDA1", margin: "0 6px 2px 4px" }}/>
        <span style={{ fontSize: 20, fontWeight: 300, color: "#fff", letterSpacing: "-0.015em" }}>LENS</span>
      </div>

      <div style={{
        margin: "0 4px 10px",
        background: "rgba(62,221,161,0.10)",
        border: "1px solid rgba(62,221,161,0.24)",
        borderRadius: 10,
        padding: "11px 13px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#00A968", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>👥</div>
        <div>
          <div style={{ fontSize: 11.5, color: "#7CE9BE", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>현재 역할</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>평가자</div>
        </div>
      </div>

      {groups.map((group, gi) => (
        <div key={group.id} style={{ marginTop: gi === 0 ? 8 : 14 }}>
          <div style={{
            padding: "6px 14px 8px",
            fontSize: 10.5, fontWeight: 700,
            color: "#5F7C6E",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}>
            {group.label}
          </div>
          {group.items.map((it) => {
            const on = it.id === active;
            const inner = (
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 9,
                fontSize: 14, fontWeight: on ? 600 : 500,
                color: on ? "#fff" : "#B7D1C4",
                background: on ? "rgba(62,221,161,0.14)" : "transparent",
                cursor: "pointer", transition: "background 140ms ease-out",
                whiteSpace: "nowrap",
                borderLeft: on ? "2px solid #3EDDA1" : "2px solid transparent",
              }}>
                <Icon name={it.icon} size={17}/>
                <span>{it.label}</span>
              </div>
            );
            return it.href
              ? <a key={it.id} href={it.href} style={{ textDecoration: "none" }}>{inner}</a>
              : <div key={it.id} onClick={() => window.notYet && window.notYet(it.label + " 화면은 준비 중이에요.")}>{inner}</div>;
          })}
        </div>
      ))}

      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #14342B" }}>
        <a href="../role-select.html" style={{ textDecoration: "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 13px", borderRadius: 9,
            fontSize: 13.5, color: "#8CA599", cursor: "pointer",
          }}>
            <Icon name="refresh" size={16}/>
            <span>역할 전환</span>
          </div>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 8px", marginTop: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#00A968", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>정</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>정태영 팀장</div>
            <div style={{ fontSize: 12, color: "#8CA599" }}>운영본부 · 결제플랫폼팀</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
window.Sidebar = Sidebar;
