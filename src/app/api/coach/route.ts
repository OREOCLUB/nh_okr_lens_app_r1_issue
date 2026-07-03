// /api/coach — R1 AI 코치 단일 엔드포인트 (빌드스펙 D-0: Anthropic Claude).
// ANTHROPIC_API_KEY가 있으면 Claude API를 호출하고, 없거나 실패하면
// 결정적 목 응답으로 폴백한다 — 프로토타입은 키 없이도 전 구간이 동작해야 한다.
// 응답 스키마 고정: { text: string; source: "claude" | "mock" }

import { NextRequest, NextResponse } from "next/server";

type Mode = "basic" | "refine" | "grade" | "coaching";

interface CoachRequest {
  mode: Mode;
  messages: { role: "user" | "assistant"; content: string }[];
  context?: {
    userName?: string;
    okrType?: string;
    duty?: string;
    krs?: { num: number; kr: string; baseline?: string; goal?: string }[];
  };
}

const TONE_RULES = `당신은 사내 OKR 작성을 돕는 AI 코치입니다. 규칙:
- 친근한 존댓말. "위반", "오류", "잘못" 같은 지적성 표현 금지 — 항상 "함께 정제", "보완", "코칭" 톤.
- KR은 측정 가능(수치·도구·집계 주기), 통제 가능, 도전적이어야 함을 안내.
- KR 유형은 마일스톤·수치·루브릭·이산 4가지. 운영안 비중: 운영 40 · 전략혁신 40 · 사후평가 20.
- 반응형(장애대응형) 유지보수는 OKR 대상 제외, 능동적 개선만 인정.
- 답변은 한국어로 간결하게(3~6문장), 필요하면 구체적 예시 문장을 제안.`;

const MODE_GUIDE: Record<Mode, string> = {
  basic:
    "지금은 기초 정보 수집 단계입니다. 올해 본업에서 지킬 것/새로 도전할 것을 끌어내는 질문을 하고, 사용자의 답에서 KR 후보가 될 핵심 키워드를 정리해주세요.",
  refine:
    "지금은 KR 정제 단계입니다. 객관성(통계 단위·측정 도구·집계 주기 명시)과 주관성(근거 없는 목표치·모호한 표현)을 점검하고, 정제 전→후 문장을 제안해주세요.",
  grade:
    "지금은 S/A/B/C/D 등급 기준 수립 단계입니다. A등급이 목표선이며, S는 보통 목표보다 20% 더 좋은 값입니다. 구간이 겹치지 않게 제안해주세요.",
  coaching:
    "지금은 상시 코칭 대화입니다. 진행 중인 KR의 진척 데이터를 근거로 다음 행동을 제안하고, 협업 요청 등 실무 조언을 해주세요.",
};

// ── 결정적 목 응답 (키 없음/호출 실패 폴백) ──────────────────
function mockReply(req: CoachRequest): string {
  const last = req.messages.filter((m) => m.role === "user").pop()?.content ?? "";
  const name = req.context?.userName ?? "";
  const firstKr = req.context?.krs?.[0];
  switch (req.mode) {
    case "basic":
      if (/속도|성능|ms/.test(last))
        return "좋아요! 응답속도는 측정이 명확한 좋은 목표예요. baseline과 goal을 수치로 잡아볼까요? 예: p95 850ms → 500ms. 추가로 새로 도전하고 싶은 일이 있다면 들려주세요.";
      if (/테스트|커버리지|자동화/.test(last))
        return "훌륭한 후보예요. 커버리지·자동화는 도구로 자동 측정할 수 있어서 객관성이 높아요. 목표 수치의 근거(예: 회귀 장애가 났던 영역)를 함께 적으면 더 좋아요. 협업이 필요한 팀이 있을까요?";
      return `${name ? name + " 님, " : ""}말씀해주신 내용에서 핵심 키워드를 정리했어요. 우측 패널에서 KR 초안의 재료로 쓸 키워드를 확인·선택해주세요. 더 도전하고 싶은 일이 있다면 이어서 들려주세요.`;
    case "refine":
      if (/평균|p9\d|퍼센타일/.test(last))
        return "완벽해요. 통계 단위를 명시하면 객관성이 크게 올라가요. KR 문장에 측정 도구와 집계 주기까지 넣어 정제해볼게요 — 우측 KR 후보 카드에서 정제 결과를 확인해주세요.";
      if (/근거|이유|왜/.test(last))
        return "좋은 근거예요! 목표 수치의 근거를 KR 문장에 함께 녹이면 주관적 목표가 객관적으로 바뀌어요. 그 내용을 반영해 정제안을 준비했어요.";
      return "말씀해주신 내용을 반영해 점검했어요. 측정 단위·도구·집계 주기가 명확한지, 모호한 표현(예: '확', '대폭')이 없는지 함께 봤고, 보완 포인트는 우측 사전 검토 카드에 반영했어요.";
    case "grade": {
      const g = firstKr?.goal ?? "목표값";
      return `A등급은 목표선(${g})으로 두고, S등급은 목표보다 약 20% 더 좋은 값, B는 목표의 70~99%, C는 개선 추세 확인 구간, D는 baseline 수준으로 잡는 걸 추천해요. 폼에 초안을 반영해두었으니 상황에 맞게 조정해주세요.`;
    }
    case "coaching":
      if (/정체|막혀|어려/.test(last))
        return "진척이 잠시 느려지는 구간은 자연스러워요. 병목 재분석 → 캐시 적중률 점검 → 협업 요청 순으로 접근해볼까요? 협업 요청 메시지 초안이 필요하면 말씀해주세요.";
      return "좋은 질문이에요. 관련 KR의 현재 진척과 목표 차이를 기준으로 다음 행동을 제안드릴게요: ① 최근 변화 요인 정리 ② 측정 데이터 캡처(증빙) ③ 다음 마일스톤 1개 확정. 어느 것부터 같이 볼까요?";
  }
}

// ── Claude API 호출 ─────────────────────────────────────────
async function callClaude(req: CoachRequest, apiKey: string): Promise<string | null> {
  const context = req.context
    ? `\n\n[사용자 컨텍스트]\n이름: ${req.context.userName ?? "-"}\nOKR 유형: ${req.context.okrType ?? "-"}\n업무 분장: ${req.context.duty ?? "-"}\nKR 목록:\n${(req.context.krs ?? []).map((k) => `${k.num}. ${k.kr} (${k.baseline ?? "?"} → ${k.goal ?? "?"})`).join("\n")}`
    : "";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 700,
        system: `${TONE_RULES}\n\n${MODE_GUIDE[req.mode]}${context}`,
        messages: req.messages,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n");
    return text || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: NextRequest) {
  let body: CoachRequest;
  try {
    body = (await request.json()) as CoachRequest;
  } catch {
    return NextResponse.json({ error: "요청 형식을 확인해주세요" }, { status: 400 });
  }
  if (!body.mode || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "mode와 messages가 필요해요" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    const text = await callClaude(body, apiKey);
    if (text) return NextResponse.json({ text, source: "claude" });
  }
  return NextResponse.json({ text: mockReply(body), source: "mock" });
}
