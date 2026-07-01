// SidebarR3.jsx — R3 인사담당자 사이드바 (2026-07 v3 그룹핑)
//
// 그룹 설계 (사용자 피드백 반영):
//  1) 기준 정보    — 평가제도 운영안 / 평가 기준 / 마스터 데이터 / 표준 매트릭스 / 평가 일정 관리
//     "다음 평가 회차의 규칙을 세팅하는 카테고리"
//  2) 평가 인사이트 — 캘리브레이션
//     "쌓인 데이터를 보고 판단·조정하는 관점"
//  3) 운영         — 산출물 / 환경 설정
//     "출력·시스템 세팅"

function SidebarR3({ active = "operation" }) {
  const groups = [
    {
      id: "baseline",
      label: "기준 정보",
      items: [
        { id: "operation", label: "평가제도 운영안", icon: "settings",  href: "./r3-operation.html" },
        { id: "criteria",  label: "평가 기준",        icon: "sliders",   href: "./r3-criteria.html" },
        { id: "master",    label: "마스터 데이터",    icon: "users",     href: "./r3-master.html" },
        { id: "metrics",   label: "표준 매트릭스",    icon: "library",   href: "./r3-matrix.html" },
        { id: "calendar",  label: "평가 일정 관리",   icon: "calendar",  href: "./r3-calendar.html" },
      ],
    },
    {
      id: "insight",
      label: "평가 인사이트",
      items: [
        { id: "insights",  label: "캘리브레이션",     icon: "barchart",  href: "./r3-hr.html" },
        // 향후 추가 예정 — 현재는 "준비 중" 배지로 노출
        { id: "reports",   label: "조직별 리포트",    icon: "piechart",  soon: true },
        { id: "anomalies", label: "이상치 분석",      icon: "alert",     soon: true },
      ],
    },
    {
      id: "ops",
      label: "운영",
      items: [
        { id: "export",    label: "산출물",           icon: "clipboard", href: "./r3-export.html" },
        { id: "env",       label: "환경 설정",        icon: "settings",  href: "./r3-env.html" },
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
        background: "rgba(224,122,60,0.14)",
        border: "1px solid rgba(224,122,60,0.30)",
        borderRadius: 10,
        padding: "11px 13px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#E07A3C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🛡️</div>
        <div>
          <div style={{ fontSize: 11.5, color: "#F4C9A8", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>현재 역할</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>인사담당자</div>
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
            const soon = it.soon === true;
            const inner = (
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 9,
                fontSize: 14, fontWeight: on ? 600 : 500,
                color: on ? "#fff" : (soon ? "#5F7C6E" : "#B7D1C4"),
                background: on ? "rgba(224,122,60,0.18)" : "transparent",
                cursor: soon ? "default" : "pointer",
                transition: "background 140ms ease-out",
                whiteSpace: "nowrap",
                borderLeft: on ? "2px solid #E07A3C" : "2px solid transparent",
                opacity: soon ? 0.72 : 1,
              }}>
                <Icon name={it.icon} size={17}/>
                <span style={{ flex: 1 }}>{it.label}</span>
                {soon && (
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em",
                    padding: "2px 6px", borderRadius: 4,
                    background: "rgba(224,122,60,0.14)", color: "#E07A3C",
                    textTransform: "uppercase",
                  }}>SOON</span>
                )}
              </div>
            );
            if (soon) return <div key={it.id} title="곧 추가될 화면이에요">{inner}</div>;
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
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E07A3C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>이</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>이수경</div>
            <div style={{ fontSize: 12, color: "#8CA599" }}>인사노무팀</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
window.SidebarR3 = SidebarR3;
