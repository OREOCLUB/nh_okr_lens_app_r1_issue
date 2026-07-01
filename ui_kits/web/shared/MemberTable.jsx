// MemberTable — 명세 컬럼: 직급 | 이름 | 직군 | 제출일 | 상태 | 위험도 | 코칭 등록 | 액션
// 집중 코칭 대상자: 이름 앞 🎯 / 코칭 미등록 + 집중코칭: ⚠️
function MemberTable({ members, filter, onRowClick, selectedId, onClearFilter }) {
  // 정렬: 결재요청 > 반려 > 조정요청 > 작성중 > 완료 (집중코칭은 같은 상태 그룹 내 최상단)
  const ORDER = { pending: 0, rejected: 1, adjustment: 2, draft: 3, approved: 4 };
  const FILTER_MAP = {
    pending:  "pending",
    rejected: "rejected",
    adjust:   "adjustment",
    approved: "approved",
    draft:    "draft",
  };

  const filterStatus = filter && filter !== "total" ? FILTER_MAP[filter] : null;
  const filtered = filterStatus
    ? members.filter((m) => m.status === filterStatus)
    : members;

  const sorted = [...filtered].sort((a, b) => {
    const o = (ORDER[a.status] ?? 99) - (ORDER[b.status] ?? 99);
    if (o !== 0) return o;
    // 집중코칭 우선
    return (b.focus ? 1 : 0) - (a.focus ? 1 : 0);
  });

  const filterLabel = {
    pending:  "결재 요청",
    rejected: "반려",
    adjust:   "조정 요청",
    approved: "OKR 수립 완료",
    draft:    "작성 중",
    total:    "전체 팀원",
  }[filter];

  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 2px rgba(31,42,74,.04)" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "16px 22px",
        borderBottom: "1px solid #ECEFF5",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>팀원별 OKR 현황</div>
        <span style={{
          padding: "2px 9px", borderRadius: 999,
          background: "#F1F4FD", color: "#213A8C",
          fontSize: 11.5, fontWeight: 600, fontVariantNumeric: "tabular-nums",
        }}>{sorted.length}명</span>

        {filterLabel && filter !== "total" && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px 4px 12px", borderRadius: 999,
            background: "#EFF4FE", color: "#2B5DD9",
            fontSize: 11.5, fontWeight: 600,
            border: "1px solid #C5D5F7",
          }}>
            <span>{filterLabel} 필터 적용</span>
            <button onClick={(e) => { e.stopPropagation(); onClearFilter && onClearFilter(); }} style={{
              background: "transparent", border: "none", color: "#2B5DD9",
              cursor: "pointer", padding: 0, fontSize: 14, lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          </span>
        )}

        <div style={{ flex: 1 }}/>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 12px", border: "1px solid #E1E5EF", background: "#fff",
          borderRadius: 8, fontSize: 12.5, color: "#3A4565", fontWeight: 500, cursor: "pointer",
        }}>
          <Icon name="filter" size={14}/> 필터
        </button>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 12px", border: "1px solid #E1E5EF", background: "#fff",
          borderRadius: 8, fontSize: 12.5, color: "#3A4565", fontWeight: 500, cursor: "pointer",
        }}>
          <Icon name="sort" size={14}/> 정렬
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: 52 }}/>     {/* 직급 */}
          <col style={{ minWidth: 180 }}/>  {/* 이름 */}
          <col style={{ width: 100 }}/>     {/* 직군 */}
          <col style={{ width: 70 }}/>      {/* 제출일 */}
          <col style={{ width: 92 }}/>      {/* OKR 상태 */}
          <col style={{ width: 80 }}/>      {/* AI 위험도 */}
          <col style={{ width: 86 }}/>      {/* 코칭 등록 */}
          <col style={{ width: 86 }}/>      {/* 액션 */}
        </colgroup>
        <thead>
          <tr>
            {["직급", "이름", "직군", "제출일", "OKR 상태", "AI 위험도", "코칭 등록", ""].map((h, i) => (
              <th key={i} style={{
                textAlign: i === 7 ? "right" : "left",
                fontSize: 11, fontWeight: 700,
                color: "#7C87A4", letterSpacing: "0.04em",
                textTransform: "uppercase",
                padding: "12px 14px",
                background: "#F9FAFC",
                borderBottom: "1px solid #ECEFF5",
                whiteSpace: "nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: "40px 0", textAlign: "center", color: "#A4ADC4", fontSize: 13 }}>
                필터 조건에 해당하는 팀원이 없어요.
              </td>
            </tr>
          ) : sorted.map((m) => {
            const selected = selectedId === m.id;
            const focusUnregistered = m.focus && !m.coaching;
            return (
              <tr
                key={m.id}
                onClick={() => onRowClick && onRowClick(m)}
                style={{
                  background: selected ? "#F1F4FD" : "transparent",
                  cursor: "pointer",
                  borderLeft: m.focus ? "3px solid #D98023" : "3px solid transparent",
                }}
                onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "#F9FAFC"; }}
                onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
              >
                <td style={{ ...td, color: "#5B6685", fontSize: 12.5, fontWeight: 600 }}>{m.grade}</td>
                <td style={td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    {m.focus && <span style={{ fontSize: 13 }}>🎯</span>}
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: m.focus ? "#FFF7EC" : "#E5EBFB",
                      color: m.focus ? "#D98023" : "#213A8C",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 12, flexShrink: 0,
                    }}>{m.name[0]}</div>
                    <div style={{ minWidth: 0, overflow: "hidden" }}>
                      <div style={{ fontWeight: 600, color: "#0F1A36", fontSize: 13.5 }}>{m.name}</div>
                      {m.obj && m.obj !== "—" && (
                        <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.obj}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ ...td, color: "#3A4565", fontSize: 12.5 }}>{m.group}</td>
                <td style={{ ...td, fontVariantNumeric: "tabular-nums", color: m.submitDate ? "#5B6685" : "#A4ADC4", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
                  {m.submitDate || "—"}
                </td>
                <td style={td}><StatusBadge status={m.status}/></td>
                <td style={td}>{m.risk ? <RiskBadge level={m.risk}/> : <span style={{ color: "#C8CFDF", fontSize: 12 }}>—</span>}</td>
                <td style={td}>
                  {m.coaching ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#2F9E5E", fontWeight: 600 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2F9E5E" }}/>
                      등록
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: focusUnregistered ? "#D14343" : "#7C87A4", fontWeight: focusUnregistered ? 700 : 500 }}>
                      {focusUnregistered && <span style={{ fontSize: 13 }}>⚠️</span>}
                      미등록
                    </span>
                  )}
                </td>
                <td style={{ ...td, textAlign: "right", paddingRight: 18 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRowClick && onRowClick(m); }}
                    style={{
                      padding: "5px 11px",
                      background: m.status === "approved" ? "#F4F7FB" : "#EFF4FE",
                      color: m.status === "approved" ? "#5B6685" : "#2B5DD9",
                      border: "none",
                      borderRadius: 7,
                      fontSize: 11.5, fontWeight: 600, cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                      display: "inline-flex", alignItems: "center", gap: 4,
                    }}
                  >
                    {m.status === "approved" ? "상세" : "검토"}
                    <span style={{ fontFamily: "var(--font-sans)" }}>→</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const td = {
  padding: "13px 14px",
  borderBottom: "1px solid #ECEFF5",
  color: "#1F2A4A",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

window.MemberTable = MemberTable;
