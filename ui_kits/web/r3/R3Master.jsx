// R3Master.jsx — 마스터 데이터 페이지 (조직 + 사원)

function OrgNode({ name, count, depth = 0, expanded, hasChild, selected }) {
  return (
    <div style={{
      paddingLeft: 14 + depth * 20,
      paddingRight: 14, paddingTop: 9, paddingBottom: 9,
      background: selected ? "#F1F4FD" : "transparent",
      borderLeft: `3px solid ${selected ? "#3B5BDB" : "transparent"}`,
      cursor: "pointer",
      display: "flex", alignItems: "center", gap: 8,
      borderBottom: "1px solid #ECEFF5",
    }}>
      {hasChild ? (
        <span style={{ width: 14, color: "#7C87A4", fontSize: 9, fontFamily: "var(--font-mono)" }}>{expanded ? "▼" : "▶"}</span>
      ) : <span style={{ width: 14 }}/>}
      <span style={{ fontSize: 13, fontWeight: depth === 0 ? 700 : 500, color: selected ? "#1B2A4E" : "#3A4565" }}>{name}</span>
      <span style={{ marginLeft: "auto", fontSize: 11, color: "#7C87A4", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{count}</span>
    </div>
  );
}

function EmployeeRow({ id, name, grade, gradeBand, series, dept, team, role, evaluator, joinYear, certs }) {
  return (
    <tr style={{ borderBottom: "1px solid #ECEFF5" }}>
      <td style={tdR3Master}>
        <input type="checkbox" style={{ accentColor: "#3B5BDB" }}/>
      </td>
      <td style={tdR3Master}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#7C87A4", fontWeight: 600 }}>{id}</span>
      </td>
      <td style={tdR3Master}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E5EBFB", color: "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11.5 }}>{name[0]}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36" }}>{name}</span>
        </div>
      </td>
      <td style={tdR3Master}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 12.5, color: "#0F1A36", fontFamily: "var(--font-mono)" }}>{grade}</span>
          <span style={{ fontSize: 10.5, color: "#A4ADC4" }}>{gradeBand}</span>
        </div>
      </td>
      <td style={tdR3Master}>
        <span style={{ padding: "2px 8px", borderRadius: 999, background: "#F1F4FD", color: "#213A8C", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)" }}>{series}</span>
      </td>
      <td style={{ ...tdR3Master, whiteSpace: "normal", lineHeight: 1.3 }}>
        <div style={{ fontSize: 12.5, color: "#3A4565", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dept}</div>
        <div style={{ fontSize: 10.5, color: "#7C87A4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{team}</div>
      </td>
      <td style={tdR3Master}>
        <span style={{ padding: "2px 8px", borderRadius: 6, background: role === "R2" ? "#E3F4EA" : role === "R3" ? "#FFEDE2" : "#E5EBFB", color: role === "R2" ? "#2F9E5E" : role === "R3" ? "#E07A3C" : "#3B5BDB", fontSize: 10.5, fontWeight: 700 }}>{role}</span>
      </td>
      <td style={{ ...tdR3Master, fontSize: 12.5, color: "#3A4565" }}>{evaluator}</td>
      <td style={{ ...tdR3Master, fontFamily: "var(--font-mono)", fontSize: 12, color: "#5B6685" }}>{joinYear}</td>
      <td style={tdR3Master}>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {certs.map((c, i) => (
            <span key={i} style={{ padding: "1px 6px", borderRadius: 4, background: "#F4F7FB", fontSize: 10, color: "#5B6685", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{c}</span>
          ))}
        </div>
      </td>
      <td style={{ ...tdR3Master, textAlign: "right" }}>
        <button style={iconBtnMaster}><Icon name="more" size={13}/></button>
      </td>
    </tr>
  );
}

const tdR3Master = { padding: "12px 14px", verticalAlign: "middle", color: "#1F2A4A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const iconBtnMaster = {
  width: 28, height: 28, borderRadius: 7,
  background: "#F9FAFC", border: "1px solid #E1E5EF",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "#5B6685",
};

function R3Master() {
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="마스터 데이터" subtitle="조직 14개 · 사원 552명 · 결재선 47건"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 40px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase" }}>전사 마스터</div>
            <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              조직과 사원 정보를 한곳에서
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5B6685" }}>
              평가자·결재선·직급 밴드는 모두 여기서 관리합니다. 변경 시 R1·R2 화면에 즉시 반영돼요.
            </p>
          </div>
          <div style={{ flex: 1 }}/>
          <Button variant="secondary" leftIcon={<Icon name="library" size={15}/>}>CSV 내보내기</Button>
          <Button variant="secondary" leftIcon={<span>+</span>}>사원 추가</Button>
          <a href="./r3-import.html" style={{ textDecoration: "none" }}>
            <Button variant="primary" leftIcon={<span>📥</span>}>이전 OKR Excel 가져오기</Button>
          </a>
        </div>

        {/* 이전 OKR 이력 요약 — 핵심 데이터 소스 */}
        <a href="./r3-import.html" style={{ textDecoration: "none", display: "block", marginBottom: 18 }}>
          <div style={{
            background: "linear-gradient(135deg, #FFEDE2, #fff 65%)",
            border: "1px solid #F4C9A8", borderRadius: 14,
            padding: "22px 26px",
            display: "flex", alignItems: "center", gap: 20,
            cursor: "pointer", transition: "all 220ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 30px -10px rgba(224,122,60,.25)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#E07A3C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📥</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.06em" }}>핵심 기능</span>
                <span style={{ padding: "2px 8px", borderRadius: 5, background: "#fff", color: "#E07A3C", fontSize: 10, fontWeight: 700, border: "1px solid #F4C9A8" }}>MUST</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>이전 OKR 데이터를 Excel에서 가져오기</div>
              <div style={{ fontSize: 12.5, color: "#5B6685", marginTop: 4, lineHeight: 1.55 }}>
                평가의 연속성을 만드는 가장 중요한 기능 · R2 작년 OKR 팝업 · R1 상향/유지 의견 · R3 작년 대비 분석에 모두 활용돼요.
              </div>
            </div>
            <div style={{ textAlign: "right", paddingRight: 12, borderRight: "1px solid #F4C9A8", marginRight: 4 }}>
              <div style={{ fontSize: 10.5, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>현재 적재</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "#0F1A36", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>1,287<span style={{ fontSize: 12, color: "#7C87A4", marginLeft: 4 }}>건</span></div>
              <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 3 }}>2023~2025 · 3개년</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10.5, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>최근 가져오기</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>2026-04-12</div>
              <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 3 }}>482건 적재</div>
            </div>
            <Icon name="chevronRight" size={20} style={{ color: "#E07A3C", marginLeft: 8 }}/>
          </div>
        </a>

        {/* Two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18 }}>

          {/* Left — Org tree */}
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden", height: "fit-content" }}>
            <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #ECEFF5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Icon name="users" size={16} style={{ color: "#3B5BDB" }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>조직 구조</span>
                <span style={{ marginLeft: "auto", fontSize: 10.5, padding: "2px 7px", background: "#F1F4FD", color: "#213A8C", borderRadius: 6, fontFamily: "var(--font-mono)", fontWeight: 700 }}>14개 본부</span>
              </div>
              <div style={{ position: "relative" }}>
                <Icon name="search" size={13} style={{ position: "absolute", left: 10, top: 9, color: "#A4ADC4" }}/>
                <input placeholder="조직 검색" style={{
                  width: "100%", padding: "8px 12px 8px 30px",
                  background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 8,
                  fontSize: 12.5, color: "#0F1A36", outline: "none",
                }}/>
              </div>
            </div>
            <div>
              <OrgNode name="OKR LENS 본사" count={552} hasChild expanded depth={0}/>
              <OrgNode name="운영본부" count={142} hasChild expanded depth={1}/>
              <OrgNode name="결제플랫폼팀" count={14} hasChild={false} depth={2} selected/>
              <OrgNode name="인증플랫폼팀" count={11} hasChild={false} depth={2}/>
              <OrgNode name="모니터링팀" count={8} hasChild={false} depth={2}/>
              <OrgNode name="DBA팀" count={6} hasChild={false} depth={2}/>
              <OrgNode name="개발본부" count={186} hasChild expanded depth={1}/>
              <OrgNode name="프론트팀" count={18} hasChild={false} depth={2}/>
              <OrgNode name="백엔드팀" count={26} hasChild={false} depth={2}/>
              <OrgNode name="플랫폼팀" count={14} hasChild={false} depth={2}/>
              <OrgNode name="사업본부" count={114} hasChild depth={1}/>
              <OrgNode name="DX본부" count={68} hasChild depth={1}/>
              <OrgNode name="인사노무팀" count={6} hasChild={false} depth={1}/>
              <OrgNode name="경영지원팀" count={34} hasChild depth={1}/>
            </div>
          </div>

          {/* Right — Employee table + sub-tabs */}
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden" }}>
            {/* Sub tabs */}
            <div style={{ display: "flex", padding: "14px 20px 0", borderBottom: "1px solid #ECEFF5", gap: 4 }}>
              {[
                { label: "사원 정보", count: 14, on: true },
                { label: "결재선",   count: 47 },
                { label: "직급 밴드", count: 4 },
                { label: "이전 OKR 이력", count: "3년" },
              ].map((t, i) => (
                <button key={i} style={{
                  padding: "10px 14px", background: "transparent", border: "none",
                  borderBottom: `2px solid ${t.on ? "#3B5BDB" : "transparent"}`,
                  fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: t.on ? 700 : 500,
                  color: t.on ? "#0F1A36" : "#5B6685", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {t.label}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#A4ADC4" }}>{t.count}</span>
                </button>
              ))}
            </div>

            {/* Toolbar */}
            <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #ECEFF5" }}>
              <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
                <Icon name="search" size={14} style={{ position: "absolute", left: 12, top: 10, color: "#A4ADC4" }}/>
                <input placeholder="사원명 · 사번 · 업무 검색" style={{
                  width: "100%", padding: "9px 12px 9px 34px",
                  background: "#F4F7FB", border: "1px solid #E1E5EF", borderRadius: 8,
                  fontSize: 12.5, color: "#0F1A36", outline: "none",
                }}/>
              </div>
              <Button variant="secondary" size="sm" leftIcon={<Icon name="filter" size={13}/>}>필터</Button>
              <Button variant="ghost" size="sm" leftIcon={<Icon name="sort" size={13}/>}>정렬</Button>
              <div style={{ flex: 1 }}/>
              <span style={{ fontSize: 11.5, color: "#7C87A4" }}>운영본부 · 결제플랫폼팀 — 14명</span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: 36 }}/>
                <col style={{ width: 64 }}/>
                <col style={{ width: 100 }}/>
                <col style={{ width: 76 }}/>
                <col style={{ width: 50 }}/>
                <col/>
                <col style={{ width: 52 }}/>
                <col style={{ width: 70 }}/>
                <col style={{ width: 54 }}/>
                <col style={{ width: 130 }}/>
                <col style={{ width: 40 }}/>
              </colgroup>
              <thead>
                <tr>
                  {[null, "사번", "이름", "직급/밴드", "직렬", "조직", "역할", "평가자", "입사", "자격증", null].map((h, i) => (
                    <th key={i} style={{
                      textAlign: "left", padding: "11px 14px",
                      fontSize: 10.5, fontWeight: 700,
                      color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase",
                      background: "#F9FAFC", borderBottom: "1px solid #E1E5EF",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <EmployeeRow id="E1024" name="김지훈" grade="4급갑" gradeBand="4급" series="SE" dept="운영본부" team="결제플랫폼팀" role="R1" evaluator="정태영" joinYear="2018" certs={["AWS SAA", "CKA"]}/>
                <EmployeeRow id="E1037" name="박서연" grade="4급을" gradeBand="4급" series="SE" dept="운영본부" team="결제플랫폼팀" role="R1" evaluator="정태영" joinYear="2020" certs={["AWS SAA"]}/>
                <EmployeeRow id="E1051" name="이도윤" grade="3급" gradeBand="3급" series="PM" dept="운영본부" team="결제플랫폼팀" role="R1" evaluator="정태영" joinYear="2015" certs={["PMP"]}/>
                <EmployeeRow id="E1062" name="최수아" grade="4급갑" gradeBand="4급" series="SE" dept="운영본부" team="결제플랫폼팀" role="R1" evaluator="정태영" joinYear="2019" certs={["DBA"]}/>
                <EmployeeRow id="E1073" name="정민재" grade="4급을" gradeBand="4급" series="SE" dept="운영본부" team="결제플랫폼팀" role="R1" evaluator="정태영" joinYear="2021" certs={[]}/>
                <EmployeeRow id="E1084" name="한지윤" grade="4급갑" gradeBand="4급" series="SE" dept="운영본부" team="결제플랫폼팀" role="R1" evaluator="정태영" joinYear="2017" certs={["CISSP"]}/>
                <EmployeeRow id="E1095" name="오재현" grade="4급을" gradeBand="4급" series="SM" dept="운영본부" team="결제플랫폼팀" role="R1" evaluator="정태영" joinYear="2019" certs={["ITIL"]}/>
                <EmployeeRow id="T0103" name="정태영" grade="3급" gradeBand="3급" series="PM" dept="운영본부" team="결제플랫폼팀" role="R2" evaluator="—" joinYear="2012" certs={["PMP"]}/>
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid #ECEFF5", background: "#F9FAFC" }}>
              <span style={{ fontSize: 12, color: "#5B6685" }}>1 - 8 / 14명</span>
              <div style={{ flex: 1 }}/>
              <button style={{ padding: "6px 10px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 7, fontSize: 12, color: "#5B6685", cursor: "pointer", fontFamily: "var(--font-sans)" }}>‹ 이전</button>
              {["1", "2"].map((p, i) => (
                <button key={i} style={{
                  width: 30, height: 30, borderRadius: 7,
                  background: i === 0 ? "#3B5BDB" : "#fff",
                  border: i === 0 ? "none" : "1px solid #E1E5EF",
                  color: i === 0 ? "#fff" : "#3A4565",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-mono)",
                }}>{p}</button>
              ))}
              <button style={{ padding: "6px 10px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 7, fontSize: 12, color: "#5B6685", cursor: "pointer", fontFamily: "var(--font-sans)" }}>다음 ›</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

window.R3Master = R3Master;
