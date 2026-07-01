"use client";

import { RoleShell } from "@/components/RoleShell";
import { StatCard } from "@/components/StatCard";
import { r3Stats } from "@/lib/mockData";

const STAT_ICON: Record<string, { icon: string; bg: string; fg: string }> = {
  orgs: { icon: "🏢", bg: "#FFEDE2", fg: "#E07A3C" },
  people: { icon: "👥", bg: "#E5EBFB", fg: "#3B5BDB" },
  coaching: { icon: "✨", bg: "#FFF7EC", fg: "#D98023" },
  rate: { icon: "📊", bg: "#ECFAF1", fg: "#2F9E5E" },
};

// 본부별 제출/코칭 요약 (더미)
const orgRows = [
  { org: "운영본부", people: 48, submitted: 41, coaching: 6 },
  { org: "IT본부", people: 39, submitted: 30, coaching: 5 },
  { org: "경영지원본부", people: 31, submitted: 24, coaching: 4 },
  { org: "사업본부", people: 24, submitted: 13, coaching: 3 },
];

const gradeDist = [
  { grade: "S", pct: 10, color: "#6B47E0" },
  { grade: "A", pct: 20, color: "#3B5BDB" },
  { grade: "B", pct: 40, color: "#2F9E5E" },
  { grade: "C", pct: 20, color: "#D98023" },
  { grade: "D", pct: 10, color: "#7C87A4" },
];

export default function R3HomePage() {
  return (
    <RoleShell role="R3" title="캘리브레이션 인사이트" subtitle="한지영 · 경영지원본부 · 인사노무팀">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 하반기 · 전사 캘리브레이션</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>전사 OKR 품질을 한눈에 살펴봅니다 📊</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14.5, color: "#5B6685" }}>제출 완료율이 전 분기 대비 12%p 올랐어요. 코칭 후보 18건은 본부별로 함께 정제할 부분을 안내하고 있어요.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {r3Stats.map((s) => {
          const m = STAT_ICON[s.id];
          const tone = "tone" in s && s.tone === "warn" ? "warn" : "tone" in s && s.tone === "ok" ? "ok" : "muted";
          return <StatCard key={s.id} icon={m.icon} iconBg={m.bg} iconFg={m.fg} label={s.label} value={s.value} unit={s.unit} sub={"hint" in s ? s.hint : undefined} subTone={tone as "ok" | "warn" | "muted"} />;
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        {/* 본부별 현황 */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, boxShadow: "var(--shadow-xs)", overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #ECEFF5", fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>본부별 OKR 제출 현황</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#7C87A4", fontSize: 11.5 }}>
                <th style={{ padding: "10px 22px", fontWeight: 600 }}>본부</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>대상</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>제출률</th>
                <th style={{ padding: "10px 22px", fontWeight: 600 }}>코칭 후보</th>
              </tr>
            </thead>
            <tbody>
              {orgRows.map((r) => {
                const pct = Math.round((r.submitted / r.people) * 100);
                return (
                  <tr key={r.org} style={{ borderTop: "1px solid #F1F3F8" }}>
                    <td style={{ padding: "12px 22px", fontWeight: 600, color: "#0F1A36" }}>{r.org}</td>
                    <td className="mono" style={{ padding: "12px 12px", color: "#5B6685" }}>{r.people}명</td>
                    <td style={{ padding: "12px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 90, height: 7, background: "#F1F3F8", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "#2F9E5E" : pct >= 60 ? "#E07A3C" : "#D14343", borderRadius: 4 }} />
                        </div>
                        <span className="ds-num" style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36" }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 22px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 999, background: "#FFF7EC", color: "#D98023", fontSize: 11.5, fontWeight: 600 }}>{r.coaching}건</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 등급 분포 */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, boxShadow: "var(--shadow-xs)", padding: 22 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>등급 분포 가이드</div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 18 }}>S/A/B/C/D 권장 배분 (강제배분 아님)</div>
          {gradeDist.map((g) => (
            <div key={g.grade} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ width: 22, height: 22, borderRadius: 7, background: `${g.color}18`, color: g.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{g.grade}</span>
              <div style={{ flex: 1, height: 8, background: "#F1F3F8", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${g.pct * 2}%`, background: g.color, borderRadius: 4 }} />
              </div>
              <span className="ds-num" style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36", minWidth: 34, textAlign: "right" }}>{g.pct}%</span>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: "12px 14px", background: "#F1FBF6", borderRadius: 10, fontSize: 12, color: "#5B6685", lineHeight: 1.55 }}>
            💡 분포는 참고용 가이드예요. 본부별 맥락을 함께 고려해 조정할 수 있어요.
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
