// aiCoach.ts — /api/coach 클라이언트 헬퍼.
// 화면은 이 함수만 호출한다. 서버가 Claude/목 여부를 결정하므로
// 클라이언트는 로딩·실패 상태만 다루면 된다 (MASTER_RULE: API 성공/실패 처리).

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
  source: "claude" | "mock";
}

export async function askCoach(
  mode: CoachMode,
  messages: CoachTurn[],
  context?: CoachContext
): Promise<CoachReply> {
  const res = await fetch("/api/coach", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode, messages, context }),
  });
  if (!res.ok) throw new Error(`코치 응답을 받지 못했어요 (${res.status})`);
  return (await res.json()) as CoachReply;
}

export const nowTime = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};
