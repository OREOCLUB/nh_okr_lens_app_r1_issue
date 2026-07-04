// aiCoach.ts — /api/coach 클라이언트 헬퍼.
// 화면은 이 함수만 호출한다. 서버가 Claude/목 여부를 결정하므로
// 클라이언트는 로딩·실패 상태만 다루면 된다 (MASTER_RULE: API 성공/실패 처리).
import { loadPublishedPrompts, loadLlmSettings } from "./coachPrompts";

export type CoachMode = "basic" | "refine" | "grade" | "coaching";

export interface CoachTurn {
  role: "user" | "assistant";
  content: string;
}

export interface CoachContext {
  userName?: string;
  okrType?: string;
  duty?: string;
  krs?: { num: number; kr: string; baseline?: string; goal?: string }[];
}

export interface CoachReply {
  text: string;
  source: "gemini" | "claude" | "mock";
  promptVersion?: string;
  /** basic 모드: 대화에서 새로 추출된 KR 후보 키워드 */
  keywords?: string[];
  /** basic 모드: 다음 답변 추천 칩 (대화 맥락 기반) */
  suggestions?: string[];
  /** refine 모드: 기존 KR 정제안 (사용자가 적용 버튼으로 확정) */
  refinement?: { num: number; after: string; reason: string };
  /** refine 모드: 신규 KR 초안 제안 */
  newKrs?: { kr: string; baseline: string; goal: string }[];
}

// LLM에 보내는 대화 이력 상한 — 오래된 턴은 토큰만 쓰고 코칭 품질에 기여가 적다
const MAX_TURNS_TO_LLM = 12;
// 화면·localStorage에 보관하는 대화 상한 (스텝별 채팅 저장 시 사용)
export const MAX_CHAT_STORE = 30;

// 12개를 넘긴 앞부분 대화는 사용자 발화 중심의 압축 요약으로 기억을 유지한다
function summarizeDropped(dropped: CoachTurn[]): string {
  if (dropped.length === 0) return "";
  const userPoints = dropped
    .filter((m) => m.role === "user")
    .map((m) => m.content.replace(/\s+/g, " ").trim().slice(0, 60))
    .filter(Boolean);
  if (userPoints.length === 0) return "";
  return `사용자가 앞서 언급한 내용 (${userPoints.length}건): ${userPoints.join(" / ")}`.slice(0, 600);
}

export async function askCoach(
  mode: CoachMode,
  messages: CoachTurn[],
  context?: CoachContext
): Promise<CoachReply> {
  // R3가 발행한 프롬프트 운영본 + LLM 연동 설정(Gemini 키)을 함께 전송
  // (같은 브라우저 데모 반영 — 서버 환경 변수 설정 시 서버 값이 기본)
  const promptConfig = loadPublishedPrompts() ?? undefined;
  const llm = loadLlmSettings() ?? undefined;
  const recent = messages.slice(-MAX_TURNS_TO_LLM); // 최근 12개 메시지만 전송
  const historySummary = summarizeDropped(messages.slice(0, -MAX_TURNS_TO_LLM)) || undefined; // 초과분은 요약으로
  const res = await fetch("/api/coach", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode, messages: recent, context, promptConfig, llm, historySummary }),
  });
  if (!res.ok) throw new Error(`코치 응답을 받지 못했어요 (${res.status})`);
  return (await res.json()) as CoachReply;
}

export const nowTime = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};
