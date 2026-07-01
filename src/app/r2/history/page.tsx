"use client";

import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";

const GRADE_COLOR: Record<string, { fg: string; bg: string }> = {
  S: { fg: "#6B47E0", bg: "#F0E9FB" }, A: { fg: "#3B5BDB", bg: "#E8F0FF" }, B: { fg: "#2F9E5E", bg: "#ECFAF1" }, C: { fg: "#D98023", bg: "#FFF7EC" }, D: { fg: "#7C87A4", bg: "#F1F3F8" }, "—": { fg: "#C8CFDF", bg: "#F9FAFC" },
};

// 팀원 × 최근 3개 반기 등급
const ROWS = [
  { name: "김태양", grade: "책임", grades: ["A", "A", "B"] },
  { name: "강동우", grade: "차장", grades: ["B", "B", "C"] },
  { name: "임재현", grade: "차장", grades: ["A", "B", "B"] },
  { name: "박서연", grade: "책임", grades: ["B", "A", "A"] },
  { name: "한지윤", grade: "선임", grades: ["B", "B", "B"] },
  { name: "정민재", grade: "선임", grades: ["A", "A", "A"] },
  { name: "정하은", grade: "선임", grades: ["C", "B", "B"] },
];

const PERIODS = ["2025 H2", "2025 H1", "2024 H2"];

// 최근 반기(2025 H2) 등급 분포
const DIST = [
  { grade: "S", n: 0 }, { grade: "A", n: 3 }, { grade: "B", n: 3 }, { grade: "C", n: 1 }, { grade: "D", n: 0 },
];

export default function R2HistoryPage() {
  const total = DIST.reduce((s, d) => s + d.n, 0);
  return (
    <RoleShell role="R2" title="이전 평가" subtitle="박정훈 팀장 · 팀원 등급 이력">
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#00A968", letterSpacing: "0.04em", textTransform: "uppercase" }}>팀 평가 이력</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>팀원들의 지난 반기 성과 📊</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5B6685" }}>이전 등급 추이는 이번 반기 캘리브레이션과 코칭 우선순위를 정하는 데 참고돼요.</p>
      </div>

      {/* Distribution */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>2025 하반기 등급 분포</div>
        <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 16 }}>제출 완료 {total}명 기준</div>
        <div style={{ display: "flex", gap: 12 }}>
          {DIST.map((d) => {
            const gc = GRADE_COLOR[d.grade];
            return (
              <div key={d.grade} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: 90, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  <div style={{ width: 42, height: `${(d.n / total) * 90 || 3}px`, background: gc.fg, borderRadius: "6px 6px 0 0" }} />
                </div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 800, color: gc.fg, marginTop: 6 }}>{d.grade}</div>
                <div className="mono" style={{ fontSize: 12, color: "#7C87A4" }}>{d.n}명</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-xs)" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>팀원별 등급 추이</div>
          <div style={{ flex: 1 }} />
          <Button variant="secondary" size="sm" onClick={() => alert("CSV 내보내기는 준비 중이에요 🙂")}>CSV 내보내기</Button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "11px 22px", fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", background: "#F9FAFC", borderBottom: "1px solid #E1E5EF" }}>팀원</th>
              {PERIODS.map((p) => <th key={p} style={{ textAlign: "center", padding: "11px 12px", fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", background: "#F9FAFC", borderBottom: "1px solid #E1E5EF" }}>{p}</th>)}
              <th style={{ textAlign: "center", padding: "11px 22px", fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", background: "#F9FAFC", borderBottom: "1px solid #E1E5EF" }}>추세</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => {
              const trend = r.grades[0] < r.grades[1] ? "↑" : r.grades[0] > r.grades[1] ? "↓" : "→";
              const trendColor = trend === "↑" ? "#2F9E5E" : trend === "↓" ? "#D14343" : "#7C87A4";
              return (
                <tr key={r.name} style={{ borderBottom: "1px solid #ECEFF5" }}>
                  <td style={{ padding: "12px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E0F7EC", color: "#00A968", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{r.name[0]}</div>
                      <div><div style={{ fontWeight: 600, color: "#0F1A36" }}>{r.name}</div><div style={{ fontSize: 10.5, color: "#7C87A4" }}>{r.grade}</div></div>
                    </div>
                  </td>
                  {r.grades.map((g, i) => {
                    const gc = GRADE_COLOR[g];
                    return <td key={i} style={{ textAlign: "center", padding: "12px 12px" }}><span className="mono" style={{ display: "inline-flex", width: 30, height: 30, borderRadius: 8, background: gc.bg, color: gc.fg, alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>{g}</span></td>;
                  })}
                  <td style={{ textAlign: "center", padding: "12px 22px" }}><span style={{ fontSize: 16, fontWeight: 700, color: trendColor }}>{trend}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </RoleShell>
  );
}
