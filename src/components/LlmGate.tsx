"use client";

// LlmGate — 모든 코치 대화 앞단의 API 키 게이트.
// 흐름: 마운트 시 키 유효성 검사 →
//   live    : 정상 대화 (서버 env 키 또는 R3 브라우저 키 유효)
//   blocked : 키 없음/무효 + 목업 미선택 → 대화 차단 + "API 키를 점검하세요" + [목업모드] 버튼
//   mock    : 사용자가 목업모드 선택 → 목 응답으로 대화 허용
// 키가 다시 유효해지면 자동으로 live 복귀(recovered=true) — 화면은 대화를 초기화해 처음부터 시작.
import { useEffect, useState } from "react";
import { loadLlmSettings } from "@/lib/coachPrompts";

export type LlmGateState = "checking" | "live" | "mock" | "blocked";

const OPTIN_KEY = "okrlens_llm_mock_optin";

export interface LlmGate {
  gate: LlmGateState;
  reason: string;
  /** 목업모드였다가 키가 정상화되어 live로 복귀한 직후 true — 화면은 대화 초기화 */
  recovered: boolean;
  optInMock: () => void;
}

export function useLlmGate(): LlmGate {
  const [gate, setGate] = useState<LlmGateState>("checking");
  const [reason, setReason] = useState("");
  const [recovered, setRecovered] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const optin = typeof window !== "undefined" && localStorage.getItem(OPTIN_KEY) === "1";
      const finishLive = () => {
        if (!alive) return;
        if (optin) {
          localStorage.removeItem(OPTIN_KEY);
          setRecovered(true);
        }
        setGate("live");
      };
      const finishBlocked = (why: string) => {
        if (!alive) return;
        setReason(why);
        setGate(optin ? "mock" : "blocked");
      };
      // ① 서버 환경 변수 키가 있으면 통과
      try {
        const st = (await fetch("/api/coach").then((r) => r.json())) as { serverLlm?: boolean };
        if (st.serverLlm) return finishLive();
      } catch {
        /* 서버 확인 실패 → 브라우저 키로 계속 */
      }
      // ② R3 브라우저 저장 키 검증 (모델 목록 조회 = 키 유효성 검사)
      const s = loadLlmSettings();
      if (!s?.apiKey) return finishBlocked("Gemini API 키가 설정되지 않았어요. R3 → AI 코치 관리에서 키를 등록해주세요.");
      try {
        const res = await fetch("/api/coach/models", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ apiKey: s.apiKey }),
        });
        const data = (await res.json()) as { error?: string };
        if (data.error) return finishBlocked(`API 키를 점검해주세요 — ${data.error}`);
        finishLive();
      } catch {
        finishBlocked("API 키 확인 중 연결이 원활하지 않았어요. 잠시 후 새로고침해주세요.");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  function optInMock() {
    if (typeof window !== "undefined") localStorage.setItem(OPTIN_KEY, "1");
    setGate("mock");
  }

  return { gate, reason, recovered, optInMock };
}

/** 대화 입력창 자리에 띄우는 차단 안내 (blocked 상태 전용) */
export function LlmGateNotice({ gate, reason, onMock }: { gate: LlmGateState; reason: string; onMock: () => void }) {
  if (gate === "checking") {
    return (
      <div style={{ padding: "12px 16px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 12, fontSize: 12.5, color: "#7C87A4", textAlign: "center" }}>
        AI 연결 상태를 확인하는 중이에요…
      </div>
    );
  }
  if (gate !== "blocked") return null;
  return (
    <div style={{ padding: "14px 18px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <span style={{ fontSize: 18 }}>🔑</span>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#7A4A14" }}>API 키를 점검하세요</div>
        <div style={{ fontSize: 11.5, color: "#9C5E26", marginTop: 3, lineHeight: 1.5 }}>{reason}</div>
      </div>
      <button
        onClick={onMock}
        style={{ padding: "9px 16px", background: "#fff", border: "1.5px solid #D98023", color: "#B85C1F", borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", flexShrink: 0 }}
      >
        🧪 목업모드로 계속
      </button>
    </div>
  );
}

/** mock 상태 표시 — 시연자만 알아볼 수 있는 은은한 앰버 불빛 점 (툴팁으로만 설명) */
export function MockBadge({ gate }: { gate: LlmGateState }) {
  if (gate !== "mock") return null;
  return (
    <span
      title="목업모드 — 키 정상화 시 자동 복귀"
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "#F59E0B",
        display: "inline-block",
        flexShrink: 0,
        animation: "mock-glow 2.4s ease-in-out infinite",
      }}
    />
  );
}
