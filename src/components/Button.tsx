"use client";

import type { CSSProperties, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ai" | "ghost" | "success";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, CSSProperties> = {
  primary: { background: "#00A968", color: "#fff", border: "none" },
  success: { background: "#2F9E5E", color: "#fff", border: "none" },
  ai: { background: "linear-gradient(135deg, #00A968, #14342B)", color: "#fff", border: "none" },
  secondary: { background: "#fff", color: "#3A4565", border: "1px solid #E1E5EF" },
  ghost: { background: "transparent", color: "#5B6685", border: "none" },
};

const SIZES: Record<Size, CSSProperties> = {
  sm: { padding: "8px 14px", fontSize: 13 },
  md: { padding: "11px 18px", fontSize: 14 },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  onClick,
  style,
  fullWidth,
  disabled,
}: {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  fullWidth?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
        borderRadius: 10, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
        transition: "filter 140ms",
        opacity: disabled ? 0.55 : undefined,
        width: fullWidth ? "100%" : undefined,
        ...VARIANTS[variant],
        ...SIZES[size],
        ...style,
      }}
    >
      {leftIcon}
      {children}
    </button>
  );
}
