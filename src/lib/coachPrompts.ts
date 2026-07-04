// coachPrompts.ts — AI 코치 프롬프트의 "운영 레이어" (R3 관리자가 편집하는 부분).
//
// 3-레이어 구조:
//   ① 안전 코어  — /api/coach 코드에 고정 (소송 안전·역할 고정·출력 규칙) — 관리자 수정 불가
//   ② 운영 레이어 — 이 파일의 구조. R3가 /r3/coach 에서 편집·발행 (페르소나·스텝 지침·예시·금칙어)
//   ③ 컨텍스트   — criteria·사용자 프로필·KR 목록. 호출 시 자동 주입
//
// 발행본 우선순위: Supabase coach_prompts(전사) → localStorage(같은 브라우저 데모) → DEFAULT(코드 기본값)

export type CoachMode = "basic" | "refine" | "grade" | "coaching";

export interface CoachModePrompt {
  guide: string; // 스텝별 코치 지침
  example: string; // 좋은 KR 예시 (few-shot)
}

export interface BannedWord {
  from: string; // 지적성 표현
  to: string; // 코칭 톤 대체어
}

export interface CoachPromptConfig {
  version: string;
  publishedAt: string; // ISO
  publishedBy: string;
  persona: string; // 코치 페르소나·말투
  closingNote: string; // 답변 말미 안내 문구
  bannedWords: BannedWord[]; // 응답 후처리 치환 사전
  modes: Record<CoachMode, CoachModePrompt>;
}

export const MODE_LABEL: Record<CoachMode, string> = {
  basic: "STEP 2 · 기초 정보",
  refine: "STEP 3 · AI 정제",
  grade: "STEP 5 · 등급 기준",
  coaching: "상시 코칭",
};

// ── 기본값 (미발행 시 폴백) ─────────────────────────────────
export const DEFAULT_COACH_PROMPTS: CoachPromptConfig = {
  version: "기본값 (코드 내장)",
  publishedAt: "",
  publishedBy: "system",
  persona:
    "당신은 사내 OKR 작성을 돕는 AI 코치입니다. 친근한 존댓말을 쓰고, 지적하지 않고 함께 정제하는 동료의 톤으로 답합니다. 답변은 한국어로 간결하게(3~6문장), 필요하면 구체적 예시 문장을 제안합니다.",
  closingNote: "AI 코칭은 참고용 신호이며 평가에 직접 반영되지 않아요.",
  bannedWords: [
    { from: "위반", to: "보완" },
    { from: "잘못", to: "함께 정제할 부분" },
    { from: "부적합", to: "보완이 필요한" },
    { from: "오류", to: "보완 포인트" },
  ],
  modes: {
    basic: {
      guide:
        "지금은 기초 정보 수집 단계입니다. 올해 본업에서 지킬 것/새로 도전할 것을 끌어내는 질문을 하고, 사용자의 답에서 KR 후보가 될 핵심 키워드를 정리해주세요.",
      example: "결제 게이트웨이 APM p95 응답속도(월평균)를 850ms → 500ms로 단축",
    },
    refine: {
      guide:
        "지금은 KR 정제 단계입니다. 객관성(통계 단위·측정 도구·집계 주기 명시)과 주관성(근거 없는 목표치·모호한 표현)을 점검하고, 정제 전→후 문장을 제안해주세요.",
      example: "결제 인증모듈 단위테스트 커버리지를 65% → 85%로 향상 (회귀 장애 영역 100% 커버)",
    },
    grade: {
      guide:
        "지금은 S/A/B/C/D 등급 기준 수립 단계입니다. A등급이 목표선이며, S는 보통 목표보다 20% 더 좋은 값입니다. 구간이 겹치지 않게 제안해주세요.",
      example: "S: ≤400ms / A: ≤500ms / B: 500~650ms / C: 650~800ms / D: ≥800ms",
    },
    coaching: {
      guide:
        "지금은 상시 코칭 대화입니다. 진행 중인 KR의 진척 데이터를 근거로 다음 행동을 제안하고, 협업 요청 등 실무 조언을 해주세요.",
      example: "병목 재분석 → 캐시 적중률 점검 → 협업 요청 순서로 접근",
    },
  },
};

// ── 금칙어 후처리 — LLM/목 응답 공통 적용 (안전 이중화) ─────
export function applyBannedWords(text: string, banned: BannedWord[]): string {
  let out = text;
  for (const { from, to } of banned) {
    if (from.trim()) out = out.split(from).join(to);
  }
  return out;
}

// ── 발행본 저장 (프로토타입: localStorage — 같은 브라우저에서 R3 발행 → R1 즉시 반영) ──
// DB(coach_prompts) 연결 시 전사 반영으로 자동 승격 (dataAccess 경유)
const KEY = "okrlens_coach_prompts";
const HISTORY_KEY = "okrlens_coach_prompts_history";
const MAX_HISTORY = 10;

export function loadPublishedPrompts(): CoachPromptConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CoachPromptConfig) : null;
  } catch {
    return null;
  }
}

export function loadPromptHistory(): CoachPromptConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as CoachPromptConfig[]) : [];
  } catch {
    return [];
  }
}

/** 발행 — 현재 발행본은 이력으로 밀고 새 버전을 저장 */
export function publishPrompts(config: CoachPromptConfig): void {
  if (typeof window === "undefined") return;
  const prev = loadPublishedPrompts();
  if (prev) {
    const history = [prev, ...loadPromptHistory()].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
  localStorage.setItem(KEY, JSON.stringify(config));
}

export function nextVersion(by: string): Pick<CoachPromptConfig, "version" | "publishedAt" | "publishedBy"> {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    version: `v${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`,
    publishedAt: d.toISOString(),
    publishedBy: by,
  };
}
