"use client";

// Toast — 전 구간 공통 안내 팝업 (검증 안내·스텝 이동·저장 결과).
// 사용: const { showToast, toastNode } = useToast(); … {toastNode}
import { useCallback, useRef, useState, type ReactNode } from "react";

export type ToastTone = "info" | "warn" | "success";

const TONE: Record<ToastTone, { bg: string; bd: string; fg: string; ico: string }> = {
  info: { bg: "#F1F4FD", bd: "#C5D0F7", fg: "#213A8C", ico: "💡" },
  warn: { bg: "#FFF7EC", bd: "#FFE0BA", fg: "#7A4A14", ico: "💡" },
  success: { bg: "#ECFAF1", bd: "#BBE9CC", fg: "#1F6B45", ico: "✅" },
};

interface ToastItem {
  key: number;
  msg: string;
  tone: ToastTone;
}

export function useToast(durationMs = 3200): { showToast: (msg: string, tone?: ToastTone) => void; toastNode: ReactNode } {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (msg: string, tone: ToastTone = "info") => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ key: Date.now(), msg, tone });
      timer.current = setTimeout(() => setToast(null), durationMs);
    },
    [durationMs]
  );

  const toastNode: ReactNode = toast ? (
    <div
      key={toast.key}
      className="toast-pop"
      role="status"
      onClick={() => setToast(null)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        maxWidth: 480,
        padding: "13px 18px",
        background: TONE[toast.tone].bg,
        border: `1px solid ${TONE[toast.tone].bd}`,
        borderRadius: 12,
        color: TONE[toast.tone].fg,
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.55,
        cursor: "pointer",
        whiteSpace: "pre-line",
      }}
    >
      <span style={{ fontSize: 15, flexShrink: 0 }}>{TONE[toast.tone].ico}</span>
      <span>{toast.msg}</span>
    </div>
  ) : null;

  return { showToast, toastNode };
}
