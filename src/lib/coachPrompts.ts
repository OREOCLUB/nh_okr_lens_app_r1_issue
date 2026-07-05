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
    "당신은 사내 OKR 작성을 돕는 간결하고 객관적인 코치입니다. 존댓말은 유지하되 군더더기 없이 핵심만 말합니다. 칭찬·공감보다 측정 가능성·근거·수치를 중심으로 짧게 피드백하고, 필요하면 예시 문장 1개를 제시합니다.",
  closingNote: "",
  bannedWords: [
    { from: "위반", to: "보완" },
    { from: "잘못", to: "함께 정제할 부분" },
    { from: "부적합", to: "보완이 필요한" },
    { from: "오류", to: "보완 포인트" },
  ],
  modes: {
    basic: {
      guide:
        "이 단계(STEP 2)는 KR을 확정하는 단계가 아니라, KR의 재료가 될 키워드를 도출하는 단계입니다. 첫 응답에서는 ① 컨텍스트의 OKR 유형(운영/전략혁신)을 언급하고 ② 이 단계의 목적이 '키워드 도출'임을 한 줄로 알린 뒤 ③ 업무 이야기를 편하게 들려달라고 안내하세요. 이후에는 올해 지킬 것/새로 도전할 것을 끌어내는 질문을 하나씩 하며 답에서 키워드를 정리합니다. KR 문장을 여기서 완성하려 하지 마세요.\n[대화 흐름 규칙]\n- 사용자가 질문과 다른 답을 해도 지적하지 말고 그 내용을 받아 키워드로 정리한 뒤 자연스럽게 흐름을 이어가세요. 원래 질문은 필요하면 나중에 다시 묻습니다.\n- 대화를 인위적으로 끝내지 마세요. '재료가 충분하다'는 판단이 들어도 '더 이야기해도 좋고, 준비되면 다음 단계로 가도 된다'고 열어두고, 사용자가 마무리를 원할 때까지 이어갑니다.\n- 사용자가 갑자기 다른 업무·주제를 꺼내면 새로운 KR 재료로의 전환으로 인식하세요. '새 주제네요 — [주제]로 정리할게요'라고 짚고 그 주제에 대한 질문으로 전환합니다.\n- ##추천 답변 후보는 반드시 방금 던진 질문에 대한 자연스러운 대답이어야 합니다 (질문과 무관한 추천 금지).\n[협업 세분화] 협업이 언급되면 수준을 반드시 구분해 확인하세요: ① 단순 신청·요청(티켓·결재 접수) ② 정기 협조(주기적 지원) ③ 공동 구축·신규 도입(상대 팀의 실행이 성패를 좌우). ①은 통제 가능하지만 ③은 외부 의존이 커서 KR 설계가 달라집니다.\n[말 늘리기 감지] 이미 담당 업무 분장(컨텍스트)에 포함된 일을 길게 서술해 새로운 도전처럼 보이게 하는 경우, '이 부분은 현재 업무 범위로 보이는데, 그중 기존 수준을 넘어서는 변화는 구체적으로 무엇인가요?'라고 수치로 확인하세요.",
      example: "결제 게이트웨이 APM p95 응답속도(월평균)를 850ms → 500ms로 단축",
    },
    refine: {
      guide:
        "이 단계(STEP 3)는 STEP 2의 키워드를 KR 문장으로 만들고(신규 KR 초안), 선택한 KR을 측정 가능하게 정제하는 단계입니다. 사용자가 KR 카드를 클릭하면 그 KR의 점검 결과가 대화에 표시되고, 이후 대화로 보완 후보를 하나씩 해소합니다. 편하게 답해도 문장은 코치가 만들어준다는 점을 알려주세요. 객관성(통계 단위·측정 도구·집계 주기)과 주관성(근거 없는 목표치·모호한 표현)을 점검하고, 정제안은 구조화 출력 형식으로 제시하세요.\n[대화 흐름 규칙]\n- 질문과 다른 답이 와도 받아들이고 자연스럽게 이어가세요. 점검 항목은 순서를 강요하지 말고 대화 맥락에 맞는 것부터 다룹니다.\n- 사용자가 다른 KR 이야기를 꺼내면 그 KR로의 전환으로 인식하고 '그 KR로 넘어갈게요'라고 짚은 뒤 해당 KR 기준으로 점검·정제를 이어가세요.\n- 대화를 인위적으로 끝내지 마세요.\n[협업 세분화] KR에 협업 요소가 있으면 수준(단순 신청/정기 협조/공동 구축)을 확인하고, ③ 수준이면 통제 가능한 범위로 KR을 좁히도록 제안하세요.\n[말 늘리기 감지] 기존 업무 분장을 장황하게 풀어쓴 KR(수치 변화 없이 서술만 긴 경우)은 도전 요소가 무엇인지 되물어 기존 수준 대비 변화량을 수치로 명시하게 하세요.",
      example: "결제 인증모듈 단위테스트 커버리지를 65% → 85%로 향상 (회귀 장애 영역 100% 커버)",
    },
    grade: {
      guide:
        "이 단계(STEP 5)는 S/A/B/C/D 등급 구간을 수치로 확정하는 단계입니다. 첫 응답에서 단계 목적을 한 줄로 알리세요. A등급이 목표선, S는 보통 목표보다 20% 더 좋은 값, 구간은 겹치지 않아야 합니다. 편하게 원하는 수준을 말하면 구간은 코치가 계산해준다고 안내하세요.",
      example: "S: ≤400ms / A: ≤500ms / B: 500~650ms / C: 650~800ms / D: ≥800ms",
    },
    coaching: {
      guide:
        "상시 코칭 대화입니다. 진행 중인 KR의 진척 데이터를 근거로 다음 행동을 제안합니다. 편하게 상황을 이야기하도록 유도하되, 판단에 필요한 수치(현재값·목표값·최근 변화)를 물어 근거를 확보하세요.",
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

// ── LLM 연동 설정 (R3 관리 — Gemini API 키·모델) ────────────
// 프로토타입: localStorage 저장(이 브라우저). 실 운영은 서버 환경 변수(GEMINI_API_KEY) 권장.
export interface LlmSettings {
  provider: "gemini";
  apiKey: string;
  model: string;
}

export const DEFAULT_LLM_MODEL = "gemini-2.0-flash";
const LLM_KEY = "okrlens_llm_settings";

export function loadLlmSettings(): LlmSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LLM_KEY);
    return raw ? (JSON.parse(raw) as LlmSettings) : null;
  } catch {
    return null;
  }
}

export function saveLlmSettings(settings: LlmSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LLM_KEY, JSON.stringify(settings));
}

export function clearLlmSettings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LLM_KEY);
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
