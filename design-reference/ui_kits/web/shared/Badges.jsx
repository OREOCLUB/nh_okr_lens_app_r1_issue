// Status / Risk / Difficulty badges — new palette

const STATUS = {
  draft:      { label: "작성중",   bg: "#F1F3F8", bd: "#E1E5EF", fg: "#5B6685", dot: "#7C87A4" },
  submitted:  { label: "제출",     bg: "#EFF4FE", bd: "#C5D5F7", fg: "#2B5DD9", dot: "#2B5DD9" },
  approved:   { label: "승인",     bg: "#ECFAF1", bd: "#BBE9CC", fg: "#2F9E5E", dot: "#2F9E5E" },
  rejected:   { label: "반려",     bg: "#FFF0F0", bd: "#FFD4D4", fg: "#D14343", dot: "#D14343" },
  adjustment: { label: "조정요청", bg: "#FFF7EC", bd: "#FFE0BA", fg: "#D98023", dot: "#D98023" },
};

function StatusBadge({ status }) {
  const s = STATUS[status];
  if (!s) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: 999,
      fontSize: 11.5, fontWeight: 600,
      border: `1px solid ${s.bd}`, background: s.bg, color: s.fg,
      letterSpacing: "-0.005em", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }}/>
      {s.label}
    </span>
  );
}

const RISK = {
  high: { label: "코칭 · 상", bg: "#FFF0F0", bd: "#FFD4D4", fg: "#D14343", dot: "#D14343" },
  mid:  { label: "코칭 · 중", bg: "#FFF7EC", bd: "#FFE0BA", fg: "#D98023", dot: "#D98023" },
  low:  { label: "양호 · 하", bg: "#ECFAF1", bd: "#BBE9CC", fg: "#2F9E5E", dot: "#2F9E5E" },
};

function RiskBadge({ level }) {
  const r = RISK[level];
  if (!r) return <span style={{ color: "#A4ADC4", fontSize: 12 }}>—</span>;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999,
      fontSize: 11.5, fontWeight: 600,
      border: `1px solid ${r.bd}`, background: r.bg, color: r.fg,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: r.dot }}/>
      {r.label}
    </span>
  );
}

const DIFF = {
  high: { label: "난이도 · 상", bg: "#F0E9FB", bd: "#D8C5F2", fg: "#7C4DD9" },
  mid:  { label: "난이도 · 중", bg: "#E5EBFB", bd: "#C5D0F7", fg: "#213A8C" },
  low:  { label: "난이도 · 하", bg: "#F1F3F8", bd: "#E1E5EF", fg: "#5B6685" },
};

function DifficultyBadge({ level }) {
  const d = DIFF[level];
  if (!d) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 999,
      fontSize: 11.5, fontWeight: 600,
      border: `1px solid ${d.bd}`, background: d.bg, color: d.fg,
    }}>{d.label}</span>
  );
}

Object.assign(window, { StatusBadge, RiskBadge, DifficultyBadge, STATUS, RISK, DIFF });
