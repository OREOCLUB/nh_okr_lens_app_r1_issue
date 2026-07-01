"use client";

import { RoleShell } from "@/components/RoleShell";
import { StatCard } from "@/components/StatCard";
import { members, r2Stats, type Member } from "@/lib/mockData";

const STATUS: Record<Member["status"], { fg: string; bg: string; label: string }> = {
  approved: { fg: "#2F9E5E", bg: "#ECFAF1", label: "승인" },
  rejected: { fg: "#D14343", bg: "#FFF0F0", label: "조정 필요" },
  adjustment: { fg: "#D98023", bg: "#FFF7EC", label: "조정요청" },
  pending: { fg: "#2B5DD9", bg: "#EFF4FE", label: "결재 대기" },
  draft: { fg: "#5B6685", bg: "#F1F3F8", label: "작성 중" },
};
const RISK: Record<string, { fg: string; label: string }> = {
  low: { fg: "#2F9E5E", label: "코칭 · 하" },
  mid: { fg: "#D98023", label: "코칭 · 중" },
  high: { fg: "#D14343", label: "코칭 · 상" },
};
const STAT_ICON: Record<string, { icon: string; bg: string; fg: string }> = {
  total: { icon: "👥", bg: "#E0F7EC", fg: "#00A968" },
  approved: { icon: "✓", bg: "#ECFAF1", fg: "#2F9E5E" },
  pending: { icon: "📥", bg: "#EFF4FE", fg: "#2B5DD9" },
  draft: { icon: "✏️", bg: "#F1F3F8", fg: "#5B6685" },
};

export default function R2HomePage() {
  const coachingCandidates = members.filter((m) => m.risk === "high" || m.risk === "mid");
  return (
    <RoleShell role="R2" title="평가자 대시보드" subtitle="박정훈 팀장 · 운영본부 · 결제플랫폼팀">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#00A968", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 하반기 · 팀 OKR 검토 기간</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>팀원 20명의 OKR을 함께 정제합니다 🌱</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14.5, color: "#5B6685" }}>검토 대기 4건 중 측정모호·자기보고형 코칭 후보가 포함되어 있어요. AI 코칭으로 함께 정제해볼까요?</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {r2Stats.map((s) => {
          const m = STAT_ICON[s.id];
          const tone = "tone" in s && s.tone === "high" ? "warn" : "hint" in s && s.hint?.startsWith("↑") ? "ok" : "muted";
          return <StatCard key={s.id} icon={m.icon} iconBg={m.bg} iconFg={m.fg} label={s.label} value={s.value} unit={s.unit} sub={"hint" in s ? s.hint : undefined} subTone={tone as "ok" | "warn" | "muted"} />;
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 20 }}>
        {/* Member table */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, boxShadow: "var(--shadow-xs)", overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>팀원 OKR 현황</div>
            <span style={{ fontSize: 12, color: "#7C87A4" }}>제출 {members.length}명</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#7C87A4", fontSize: 11.5 }}>
                  <th style={{ padding: "10px 22px", fontWeight: 600 }}>팀원</th>
                  <th style={{ padding: "10px 12px", fontWeight: 600 }}>Objective</th>
                  <th style={{ padding: "10px 12px", fontWeight: 600 }}>상태</th>
                  <th style={{ padding: "10px 22px", fontWeight: 600 }}>코칭</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const s = STATUS[m.status];
                  const r = m.risk ? RISK[m.risk] : null;
                  return (
                    <tr key={m.id} style={{ borderTop: "1px solid #F1F3F8" }}>
                      <td style={{ padding: "12px 22px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E0F7EC", color: "#00A968", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{m.name.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#0F1A36" }}>{m.name}</div>
                            <div className="mono" style={{ fontSize: 10.5, color: "#7C87A4" }}>{m.id} · {m.grade}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 12px", color: "#5B6685", maxWidth: 220 }}>{m.obj}</td>
                      <td style={{ padding: "12px 12px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.fg, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap" }}>{s.label}</span>
                      </td>
                      <td style={{ padding: "12px 22px" }}>
                        {r ? <span style={{ color: r.fg, fontSize: 12, fontWeight: 600 }}>{r.label}</span> : <span style={{ color: "#C8CFDF" }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coaching candidates */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "linear-gradient(135deg, #0A1F17 0%, #14342B 100%)", color: "#fff", borderRadius: 16, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: "#00A968", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>✨</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>함께 정제할 후보</div>
                <div style={{ fontSize: 11.5, color: "#7CE9BE", marginTop: 2 }}>측정 모호 · 자기보고형 {coachingCandidates.length}건</div>
              </div>
            </div>
            {coachingCandidates.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{m.name.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "#9DB3A9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.obj}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: m.risk === "high" ? "#FF9A9A" : "#FFD27A" }}>{m.risk && RISK[m.risk].label}</span>
              </div>
            ))}
            <button onClick={() => alert("OKR 검토 화면은 준비 중이에요 🙂")} style={{ marginTop: 14, background: "#fff", color: "#0A1F17", border: "none", borderRadius: 10, width: "100%", padding: 12, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
              📥 검토 화면으로 이동
            </button>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
