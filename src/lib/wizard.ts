// wizard.ts — R1 OKR 작성 위저드의 상태 단일 소스.
// STEP 0~7이 이 상태를 공유하고, localStorage에 사용자별로 임시 저장된다.
// 제출 시 dataAccess.submitOkrs()로 Supabase에 기록한다 (미연결 시 로컬 보존).

export type OkrType = "ops" | "strategy";
export type WorkType = "onsite" | "dispatch" | "remote";

export interface WizardProfile {
  mainDuty: string; // 주요 업무 분장 (필수)
  systems: string; // 담당 시스템/도메인
  collaborators: string; // 주요 협업 대상
  prevExperience: string; // 이전 직무 경험
  jobSeries: string; // 직렬 (SE/DE/PM …)
  workType: WorkType;
  certs: string[];
  agree: boolean[]; // 약관 [필수, 필수, 선택]
}

export interface KRGrades {
  S: string;
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface WizardKR {
  id: string; // "kr1"
  num: number;
  objective: string;
  kr: string; // 정제된 KR 문장
  before?: string; // 정제 전 문장
  format: string; // criteria KR유형 — 수치 | 마일스톤 | 루브릭 | 이산
  baseline: string;
  goal: string;
  measureTool: string;
  measureStat: string;
  measureCycle: string;
  weight: number;
  grades: KRGrades;
  refined: boolean; // STEP 3 정제 완료 여부
  chosenAI: string | null; // STEP 6 채택 AI vendor id
  aiSuggestion: string; // 채택된 의견 요약
}

export interface ChatMsg {
  from: "ai" | "user";
  text: string;
  time: string;
}

export interface WizardState {
  version: 1;
  step: number; // 현재 스텝
  maxStep: number; // 도달한 최대 스텝 (이하로만 점프 허용)
  profile: WizardProfile;
  okrType: OkrType;
  basic: {
    mode: "chat" | "form";
    objective: string;
    duty: string;
    freeText: string;
    collaborators: string;
    krCount: number;
    keywords: Record<string, boolean>;
    chat: ChatMsg[];
  };
  refineChat: ChatMsg[]; // STEP 3 정제 대화
  krs: WizardKR[];
  submitted: boolean;
  savedAt: number | null;
}

// ── 데모 시드 (기존 목업 스토리를 초기값으로 유지) ──────────
export function initialWizardState(): WizardState {
  return {
    version: 1,
    step: 0,
    maxStep: 0,
    profile: {
      mainDuty: "결제플랫폼 백엔드 성능/튜닝, 인증모듈 안정화",
      systems: "결제 게이트웨이 · 인증모듈",
      collaborators: "",
      prevExperience: "인프라 운영 (2018~2022)",
      jobSeries: "SE",
      workType: "onsite",
      certs: ["AWS SAA", "CKA"],
      agree: [false, false, false],
    },
    okrType: "ops",
    basic: {
      mode: "chat",
      objective: "결제 게이트웨이 성능 개선",
      duty: "결제플랫폼 백엔드 성능/튜닝",
      freeText:
        "• 결제 게이트웨이 p95 응답속도를 일정 수준 이하로 유지\n• 결제 인증 모듈 단위테스트 커버리지 향상\n• 야간 배치 장애 알림 자동화 마일스톤 진행",
      collaborators: "",
      krCount: 5,
      keywords: {
        "APM p95 응답속도": true,
        "단위테스트 커버리지": true,
        "장애 알림 자동화": true,
        "SRE 협업": true,
        "결제 안정성": false,
      },
      chat: [],
    },
    refineChat: [],
    krs: [
      {
        id: "kr1",
        num: 1,
        objective: "핵심 서비스 응답속도 개선",
        kr: "결제 게이트웨이 APM p95 응답속도(월평균)를 850ms → 500ms로 단축",
        before: "결제 게이트웨이 응답속도를 빠르게 개선한다.",
        format: "수치",
        baseline: "850ms",
        goal: "500ms",
        measureTool: "APM (Datadog)",
        measureStat: "p95",
        measureCycle: "월평균",
        weight: 30,
        grades: {
          S: "≤400ms — 목표 초과 20%, 캐시 추가 도입 완료",
          A: "≤500ms — 목표 달성 (월평균 기준)",
          B: "500~650ms — 목표의 70-99% 달성",
          C: "650~800ms — 목표의 50-70% 달성, 개선 추세 확인",
          D: "≥800ms — 개선 없음 (baseline 수준)",
        },
        refined: true,
        chosenAI: null,
        aiSuggestion: "",
      },
      {
        id: "kr2",
        num: 2,
        objective: "결제 인증 모듈 안정화",
        kr: "결제 인증모듈 단위테스트 커버리지를 65% → 85%로 향상 (회귀 장애 영역 100% 커버)",
        before: "결제 인증모듈 테스트를 강화한다.",
        format: "수치",
        baseline: "65%",
        goal: "85%",
        measureTool: "Jest coverage report",
        measureStat: "line coverage",
        measureCycle: "월 1회",
        weight: 25,
        grades: {
          S: "≥90% — Mutation testing 도입 완료",
          A: "≥85% — 회귀 장애 영역 100% 커버",
          B: "75~84% — 주요 영역 커버",
          C: "65~74% — baseline 유지",
          D: "<65% — baseline 미달",
        },
        refined: true,
        chosenAI: null,
        aiSuggestion: "",
      },
      {
        id: "kr3",
        num: 3,
        objective: "장애 대응 자동화",
        kr: "장애 알림 룰 자동화 4단계 중 3단계까지 완료",
        before: "장애 알림을 자동화한다.",
        format: "마일스톤",
        baseline: "1/4",
        goal: "3/4",
        measureTool: "단계별 산출물 검토",
        measureStat: "완료 단계 수",
        measureCycle: "분기",
        weight: 20,
        grades: {
          S: "4단계 전체 완료 (onCall 자동화 포함)",
          A: "3단계 완료 (노이즈 필터링까지)",
          B: "2단계 완료 (알림 채널 통합)",
          C: "1단계 완료 (룰 정의)",
          D: "미착수",
        },
        refined: false,
        chosenAI: null,
        aiSuggestion: "",
      },
    ],
    submitted: false,
    savedAt: null,
  };
}

// ── localStorage 저장/복원 (사용자별) ───────────────────────
const KEY_PREFIX = "okrlens_wizard_";

export function loadWizard(userId: string): WizardState {
  if (typeof window === "undefined") return initialWizardState();
  try {
    const raw = localStorage.getItem(KEY_PREFIX + userId);
    if (!raw) return initialWizardState();
    const parsed = JSON.parse(raw) as WizardState;
    if (parsed.version !== 1) return initialWizardState();
    return parsed;
  } catch {
    return initialWizardState();
  }
}

export function saveWizard(userId: string, state: WizardState): WizardState {
  const next = { ...state, savedAt: Date.now() };
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(next));
  }
  return next;
}

export function clearWizard(userId: string) {
  if (typeof window !== "undefined") localStorage.removeItem(KEY_PREFIX + userId);
}

// ── 스텝 진행 검증 — 통과 못 하면 코칭 톤 안내 문구 반환 ─────
export function stepBlocker(state: WizardState, step: number): string | null {
  switch (step) {
    case 0: {
      if (!state.profile.mainDuty.trim())
        return "주요 업무 분장을 입력해주세요. STEP 3 객관성 검증에서 KR과 비교하는 기준이 돼요.";
      if (!state.profile.agree[0] || !state.profile.agree[1])
        return "필수 약관 2건에 동의해주시면 다음 단계로 진행할 수 있어요.";
      return null;
    }
    case 2: {
      const hasKeyword = Object.values(state.basic.keywords).some(Boolean);
      if (!hasKeyword && !state.basic.freeText.trim())
        return "핵심 키워드를 1개 이상 선택하거나 기초 정보를 입력해주세요. 다음 단계 KR 초안의 재료가 돼요.";
      return null;
    }
    case 4: {
      const missing = state.krs.filter((k) => !k.format);
      if (missing.length > 0)
        return `KR ${missing.map((k) => k.num).join(", ")}의 측정 형태를 골라주세요.`;
      return null;
    }
    case 5: {
      const missing = state.krs.filter((k) => !k.measureTool.trim() || !k.grades.A.trim());
      if (missing.length > 0)
        return `KR ${missing.map((k) => k.num).join(", ")}의 측정 도구와 A등급(목표선) 기준을 채워주세요.`;
      return null;
    }
    default:
      return null;
  }
}

export const weightSum = (krs: WizardKR[]) => krs.reduce((a, k) => a + (k.weight || 0), 0);
