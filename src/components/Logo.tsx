// Logo.tsx — 03 TYPOGRAPHIC 워드마크 (심볼 없음). OKR=800 / 그린 도트 / LENS=300.
export function Logo({ size = 22, dark = false }: { size?: number; dark?: boolean }) {
  const ink = dark ? "#FFFFFF" : "#0A1F17";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      <span style={{ fontSize: size, fontWeight: 800, color: ink, letterSpacing: "-0.035em", lineHeight: 1 }}>
        OKR
      </span>
      <span
        style={{
          display: "inline-block",
          width: size * 0.23,
          height: size * 0.23,
          borderRadius: "50%",
          background: "#00A968",
          margin: `0 ${size * 0.32}px ${size * 0.09}px ${size * 0.23}px`,
        }}
      />
      <span style={{ fontSize: size, fontWeight: 300, color: ink, letterSpacing: "-0.015em", lineHeight: 1 }}>
        LENS
      </span>
    </span>
  );
}
