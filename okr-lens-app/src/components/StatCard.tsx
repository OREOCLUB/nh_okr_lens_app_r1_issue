// StatCard.tsx — 한 줄 4개까지 (SKILL §데이터 밀도)
export function StatCard({
  icon,
  iconBg,
  iconFg,
  label,
  value,
  unit,
  sub,
  subTone = "muted",
}: {
  icon: string;
  iconBg: string;
  iconFg: string;
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  subTone?: "ok" | "warn" | "muted";
}) {
  const subColor =
    subTone === "ok" ? "#2F9E5E" : subTone === "warn" ? "#D98023" : "#7C87A4";
  return (
    <div style={{ background: "#fff", border: "1px solid var(--ink-200)", borderRadius: 14, padding: "20px 22px", boxShadow: "var(--shadow-xs)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: iconBg, color: iconFg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
          {icon}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-600)" }}>{label}</div>
      </div>
      <div className="ds-num" style={{ fontSize: 30, fontWeight: 700, color: "var(--ink-900)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {value}
        {unit && <span style={{ fontSize: 15, color: "var(--ink-500)", fontWeight: 500, marginLeft: 4 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 12, fontWeight: 500, marginTop: 8, color: subColor }}>{sub}</div>}
    </div>
  );
}
