"use client";

import { useState } from "react";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";

interface Emp { id: string; name: string; grade: string; band: string; series: string; team: string; role: string; evaluator: string; join: string; certs: string[] }

const EMPLOYEES: Emp[] = [
  { id: "E1024", name: "김지훈", grade: "4급갑", band: "4급", series: "SE", team: "결제플랫폼팀", role: "R1", evaluator: "정태영", join: "2018", certs: ["AWS SAA", "CKA"] },
  { id: "E1037", name: "박서연", grade: "4급을", band: "4급", series: "SE", team: "결제플랫폼팀", role: "R1", evaluator: "정태영", join: "2020", certs: ["AWS SAA"] },
  { id: "E1051", name: "이도윤", grade: "3급", band: "3급", series: "PM", team: "결제플랫폼팀", role: "R1", evaluator: "정태영", join: "2015", certs: ["PMP"] },
  { id: "E1062", name: "최수아", grade: "4급갑", band: "4급", series: "SE", team: "결제플랫폼팀", role: "R1", evaluator: "정태영", join: "2019", certs: ["DBA"] },
  { id: "E1073", name: "정민재", grade: "4급을", band: "4급", series: "SE", team: "결제플랫폼팀", role: "R1", evaluator: "정태영", join: "2021", certs: [] },
  { id: "E1084", name: "한지윤", grade: "4급갑", band: "4급", series: "SE", team: "결제플랫폼팀", role: "R1", evaluator: "정태영", join: "2017", certs: ["CISSP"] },
  { id: "T0103", name: "정태영", grade: "3급", band: "3급", series: "PM", team: "결제플랫폼팀", role: "R2", evaluator: "—", join: "2012", certs: ["PMP"] },
];

interface Dept { name: string; code: string; count: number; depth: number; leader: string; sel?: boolean }
const DEPTS: Dept[] = [
  { name: "OKR LENS 본사", code: "HQ", count: 552, depth: 0, leader: "대표이사" },
  { name: "운영본부", code: "OPS", count: 142, depth: 1, leader: "김운영 본부장" },
  { name: "결제플랫폼팀", code: "OPS-PAY", count: 14, depth: 2, leader: "정태영", sel: true },
  { name: "인증플랫폼팀", code: "OPS-AUTH", count: 11, depth: 2, leader: "이인증" },
  { name: "모니터링팀", code: "OPS-MON", count: 8, depth: 2, leader: "박감시" },
  { name: "개발본부", code: "DEV", count: 186, depth: 1, leader: "최개발 본부장" },
  { name: "사업본부", code: "BIZ", count: 114, depth: 1, leader: "한사업 본부장" },
  { name: "DX본부", code: "DX", count: 68, depth: 1, leader: "오디엑스 본부장" },
  { name: "인사노무팀", code: "HR", count: 6, depth: 1, leader: "한지영" },
];

const ROLE_CHIP: Record<string, { bg: string; fg: string }> = {
  R1: { bg: "#E5EBFB", fg: "#3B5BDB" }, R2: { bg: "#E0F7EC", fg: "#00A968" }, R3: { bg: "#FFEDE2", fg: "#E07A3C" },
};

const th: React.CSSProperties = { textAlign: "left", padding: "11px 14px", fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", background: "#F9FAFC", borderBottom: "1px solid #E1E5EF", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "12px 14px", verticalAlign: "middle", color: "#1F2A4A", whiteSpace: "nowrap" };

const TABS = [
  { id: "org", label: "조직 데이터", icon: "🏢", hint: "부서 정보" },
  { id: "emp", label: "사원 정보", icon: "👥", hint: "552명" },
  { id: "import", label: "이전 OKR 가져오기", icon: "📥", hint: "Excel Import" },
];

// ── ① 조직 데이터 (부서 정보) ───────────────────────────────
function OrgTab() {
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #ECEFF5" }}>
        <span>🏢</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>조직 구조 · 부서 정보</span>
        <span className="mono" style={{ fontSize: 10.5, padding: "2px 7px", background: "#F1F4FD", color: "#213A8C", borderRadius: 6, fontWeight: 700 }}>14개 본부</span>
        <div style={{ flex: 1 }} />
        <Button variant="secondary" size="sm" leftIcon={<span>+</span>} onClick={() => alert("부서 추가는 준비 중이에요 🙂")}>부서 추가</Button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr>{["부서명", "부서코드", "부서장", "인원", ""].map((h, i) => <th key={i} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {DEPTS.map((d) => (
              <tr key={d.code} style={{ borderBottom: "1px solid #ECEFF5", background: d.sel ? "#F1F4FD" : "transparent" }}>
                <td style={{ ...td, paddingLeft: 14 + d.depth * 22 }}>
                  <span style={{ fontSize: 13, fontWeight: d.depth === 0 ? 700 : d.depth === 1 ? 600 : 500, color: d.sel ? "#1B2A4E" : "#0F1A36" }}>
                    {d.depth > 0 && <span style={{ color: "#C8CFDF", marginRight: 6 }}>{"└"}</span>}{d.name}
                  </span>
                </td>
                <td style={td}><span className="mono" style={{ fontSize: 11.5, color: "#7C87A4", fontWeight: 600 }}>{d.code}</span></td>
                <td style={{ ...td, fontSize: 12.5, color: "#3A4565" }}>{d.leader}</td>
                <td style={td}><span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>{d.count}</span><span style={{ fontSize: 11, color: "#7C87A4", marginLeft: 3 }}>명</span></td>
                <td style={{ ...td, textAlign: "right" }}>
                  <button onClick={() => alert(`"${d.name}" 편집은 준비 중이에요 🙂`)} style={{ padding: "4px 10px", fontSize: 11.5, color: "#5B6685", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 7, cursor: "pointer" }}>편집</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── ② 사원 정보 ─────────────────────────────────────────────
function EmpTab() {
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #ECEFF5" }}>
        <input placeholder="사원명 · 사번 · 업무 검색" style={{ flex: 1, maxWidth: 320, padding: "9px 12px", background: "var(--page-bg)", border: "1px solid #E1E5EF", borderRadius: 8, fontSize: 12.5, color: "#0F1A36", outline: "none", fontFamily: "var(--font-sans)" }} />
        <span style={{ fontSize: 11.5, color: "#7C87A4" }}>운영본부 · 결제플랫폼팀 — 14명</span>
        <div style={{ flex: 1 }} />
        <Button variant="secondary" size="sm" leftIcon={<span>+</span>} onClick={() => alert("사원 추가는 준비 중이에요 🙂")}>사원 추가</Button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr>{["사번", "이름", "직급/밴드", "직렬", "역할", "평가자", "입사", "자격증"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {EMPLOYEES.map((e) => {
              const rc = ROLE_CHIP[e.role];
              return (
                <tr key={e.id} style={{ borderBottom: "1px solid #ECEFF5" }}>
                  <td style={td}><span className="mono" style={{ fontSize: 11.5, color: "#7C87A4", fontWeight: 600 }}>{e.id}</span></td>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E5EBFB", color: "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11.5 }}>{e.name[0]}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36" }}>{e.name}</span>
                    </div>
                  </td>
                  <td style={td}><span className="mono" style={{ fontSize: 12.5, color: "#0F1A36" }}>{e.grade}</span></td>
                  <td style={td}><span className="mono" style={{ padding: "2px 8px", borderRadius: 999, background: "#F1F4FD", color: "#213A8C", fontSize: 11, fontWeight: 600 }}>{e.series}</span></td>
                  <td style={td}><span style={{ padding: "2px 8px", borderRadius: 6, background: rc.bg, color: rc.fg, fontSize: 10.5, fontWeight: 700 }}>{e.role}</span></td>
                  <td style={{ ...td, fontSize: 12.5, color: "#3A4565" }}>{e.evaluator}</td>
                  <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 12, color: "#5B6685" }}>{e.join}</td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {e.certs.length ? e.certs.map((c) => <span key={c} className="mono" style={{ padding: "1px 6px", borderRadius: 4, background: "var(--page-bg)", fontSize: 10, color: "#5B6685", fontWeight: 600 }}>{c}</span>) : <span style={{ color: "#C8CFDF" }}>—</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid #ECEFF5", background: "#F9FAFC" }}>
        <span style={{ fontSize: 12, color: "#5B6685" }}>1 - 8 / 14명</span>
      </div>
    </div>
  );
}

// ── ③ 이전 OKR 가져오기 (Import 전용) ───────────────────────
const IMPORT_HISTORY = [
  { file: "OKR_2025_전사.xlsx", year: "2025", rows: 552, at: "2026-06-28 14:20", by: "한지영", status: "완료" },
  { file: "OKR_2024_전사.xlsx", year: "2024", rows: 498, at: "2026-06-28 14:12", by: "한지영", status: "완료" },
  { file: "OKR_2023_전사.xlsx", year: "2023", rows: 237, at: "2026-06-28 14:05", by: "한지영", status: "완료" },
];

function ImportTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* 목적 설명 */}
      <div style={{ background: "linear-gradient(135deg, #FFEDE2, #fff 65%)", border: "1px solid #F4C9A8", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#E07A3C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📥</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.06em" }}>핵심 기능</span>
            <span style={{ padding: "2px 8px", borderRadius: 5, background: "#fff", color: "#E07A3C", fontSize: 10, fontWeight: 700, border: "1px solid #F4C9A8" }}>MUST</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>이전 OKR 데이터를 Excel에서 가져와요</div>
          <div style={{ fontSize: 12.5, color: "#5B6685", marginTop: 4, lineHeight: 1.55 }}>평가의 연속성을 만드는 기능 · R2 작년 OKR 팝업 · R1 상향/유지 의견 · R3 작년 대비 분석에 모두 활용돼요.</div>
        </div>
        <div style={{ textAlign: "right", paddingLeft: 20, borderLeft: "1px solid #F4C9A8" }}>
          <div style={{ fontSize: 10.5, color: "#7C87A4", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>현재 적재</div>
          <div className="mono ds-num" style={{ fontSize: 24, fontWeight: 700, color: "#0F1A36" }}>1,287<span style={{ fontSize: 12, color: "#7C87A4", marginLeft: 4 }}>건</span></div>
          <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 3 }}>2023~2025 · 3개년</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 18 }}>
        {/* 업로드 드롭존 */}
        <div onClick={() => alert("Excel 파일 선택은 준비 중이에요 🙂")} style={{ background: "#fff", border: "2px dashed #D3DAE8", borderRadius: 14, padding: "36px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer", minHeight: 220 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "#F1F4FD", color: "#3B5BDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 14 }}>⬆️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>Excel 파일을 끌어다 놓거나 클릭</div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 6, lineHeight: 1.5 }}>.xlsx · .csv 지원 · 표준 템플릿 양식만 인식돼요</div>
          <button onClick={(e) => { e.stopPropagation(); alert("템플릿 다운로드는 준비 중이에요 🙂"); }} style={{ marginTop: 16, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: "#3B5BDB", background: "#F1F4FD", border: "1px solid #C5D0F7", borderRadius: 8, cursor: "pointer" }}>📄 표준 템플릿 내려받기</button>
        </div>

        {/* 가져오기 이력 */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #ECEFF5", fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>가져오기 이력</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>{["파일", "연도", "건수", "일시", "상태"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {IMPORT_HISTORY.map((r) => (
                <tr key={r.file} style={{ borderBottom: "1px solid #ECEFF5" }}>
                  <td style={td}><span style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>📊 {r.file}</span></td>
                  <td style={td}><span className="mono" style={{ fontSize: 12, color: "#5B6685" }}>{r.year}</span></td>
                  <td style={td}><span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36" }}>{r.rows}</span></td>
                  <td style={td}><span className="mono" style={{ fontSize: 11, color: "#7C87A4" }}>{r.at}</span></td>
                  <td style={td}><span style={{ padding: "2px 8px", borderRadius: 999, background: "#ECFAF1", color: "#2F9E5E", fontSize: 10.5, fontWeight: 700 }}>✓ {r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ padding: "14px 18px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: 12, fontSize: 12.5, color: "#0A6B44", lineHeight: 1.6 }}>
        💡 가져온 데이터는 사번을 기준으로 사원 정보와 자동 매칭돼요. 매칭 실패한 행은 업로드 후 별도로 확인·보정할 수 있어요.
      </div>
    </div>
  );
}

export default function R3MasterPage() {
  const [tab, setTab] = useState("org");
  return (
    <RoleShell
      role="R3"
      title="마스터 데이터"
      subtitle="조직 14개 · 사원 552명 · 이전 OKR 1,287건"
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase" }}>전사 마스터</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>조직 · 사원 · 이전 OKR을 나눠서 관리해요</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5B6685" }}>부서 정보와 사원 정보는 서로 다른 탭이에요. 이전 OKR 가져오기는 평가 연속성을 위한 별도 기능입니다.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, borderBottom: "1px solid #E1E5EF", marginBottom: 18 }}>
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 16px", background: "transparent", border: "none", borderBottom: `2px solid ${on ? "#E07A3C" : "transparent"}`, fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? "#0F1A36" : "#5B6685", cursor: "pointer" }}>
              <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label} <span style={{ fontSize: 11, color: "#A4ADC4", marginLeft: 4, fontWeight: 500 }}>{t.hint}</span>
            </button>
          );
        })}
      </div>

      {tab === "org" && <OrgTab />}
      {tab === "emp" && <EmpTab />}
      {tab === "import" && <ImportTab />}
    </RoleShell>
  );
}
