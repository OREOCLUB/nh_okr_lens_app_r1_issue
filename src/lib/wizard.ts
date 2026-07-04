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
  grades: KRGrades; // 확정된 등급 기준
  gradesDraft?: KRGrades | null; // STEP 5·7 수정 중(미확정) 등급 — 확정 시 grades로 커밋
  textDraft?: KRTextDraft | null; // STEP 7 텍스트 필드 미확정 변경 — 확정 시 본 필드로 커밋
  refined: boolean; // STEP 3 정제 완료 여부
  chosenAI: string | null; // STEP 6 채택 AI vendor id
  aiSuggestion: string; // 채택된 의견 요약
}

// STEP 7 인라인 편집 draft (measure는 도구·단위·주기를 합친 표기 문자열)
export interface KRTextDraft {
  objective?: string;
  kr?: string;
  baseline?: string;
  goal?: string;
  measure?: string;
}

/** measure 3필드의 표시용 결합 문자열 (STEP 7 편집 단위) */
export const measureText = (kr: WizardKR) =>
  [kr.measureTool, kr.measureStat, kr.measureCycle].filter(Boolean).join(" · ");

/** 등급 기준에 확정하지 않은 변경이 있는가 */
export function gradesDirty(kr: WizardKR): boolean {
  if (!kr.gradesDraft) return false;
  return (Object.keys(kr.grades) as (keyof KRGrades)[]).some((g) => kr.gradesDraft![g] !== kr.grades[g]);
}

/** 텍스트 필드에 확정하지 않은 변경이 있는가 */
export function textDirty(kr: WizardKR): boolean {
  const d = kr.textDraft;
  if (!d) return false;
  return (
    (d.objective !== undefined && d.objective !== kr.objective) ||
    (d.kr !== undefined && d.kr !== kr.kr) ||
    (d.baseline !== undefined && d.baseline !== kr.baseline) ||
    (d.goal !== undefined && d.goal !== kr.goal) ||
    (d.measure !== undefined && d.measure !== measureText(kr))
  );
}

/** 어떤 종류든 미확정 변경이 있는가 */
export const anyDirty = (kr: WizardKR) => gradesDirty(kr) || textDirty(kr);

/** 미확정 변경 전부 커밋 — 다음 단계 진행·제출 시 일괄 확정에 사용 */
export function commitDrafts(kr: WizardKR): WizardKR {
  let next = kr;
  if (kr.gradesDraft) next = { ...next, grades: kr.gradesDraft, gradesDraft: null };
  const d = kr.textDraft;
  if (d) {
    const measureChanged = d.measure !== undefined && d.measure !== measureText(kr);
    next = {
      ...next,
      objective: d.objective ?? next.objective,
      kr: d.kr ?? next.kr,
      baseline: d.baseline ?? next.baseline,
      goal: d.goal ?? next.goal,
      ...(measureChanged ? { measureTool: d.measure as string, measureStat: "", measureCycle: "" } : {}),
      textDraft: null,
    };
  }
  return next;
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
    suggestions?: string[]; // AI가 제안한 다음 답변 칩 (대화 맥락 따라 갱신)
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

// ── OKR 수립 기간 (eval_phases 'lock' 시드 기준 — 일정 테이블 실연동은 P2) ──
// 기간 경과 후에는 작성·제출·회수 전부 잠긴다 (조회만 가능).
export const WRITE_DEADLINE = new Date(2026, 6, 15, 18, 0, 0); // 2026-07-15 18:00 KST
export const writePeriodOver = (now: Date = new Date()) => now.getTime() > WRITE_DEADLINE.getTime();

// ── 제출 적합성 검사 (STEP 7 게이트) — 미통과 항목이 있으면 제출 불가 ──
import { deriveChecks, deriveRisk } from "./diagnosticEngine";
import type { CheckItem, EvalSystem } from "./criteria";

export interface ReadinessItem {
  key: string;
  label: string;
  pass: boolean;
  detail: string; // 통과/보완 사유 (코칭 톤)
}

export function submitReadiness(
  state: WizardState,
  system: EvalSystem,
  checklist: CheckItem[]
): { ok: boolean; items: ReadinessItem[] } {
  const krs = state.krs;
  const sum = weightSum(krs);
  const noFormat = krs.filter((k) => !k.format);
  const noMeasure = krs.filter((k) => !k.measureTool.trim());
  const noA = krs.filter((k) => !k.grades.A.trim());
  const highRisk = krs.filter((k) => {
    const checks = deriveChecks(
      { kr: k.kr, baseline: k.baseline, goal: k.goal, measureTool: k.measureTool, format: k.format, grades: { A: k.grades.A } },
      checklist
    );
    return deriveRisk(checks, checklist).level === "상";
  });
  const fmtKr = (list: WizardKR[]) => list.map((k) => `KR ${String(k.num).padStart(2, "0")}`).join(", ");

  const items: ReadinessItem[] = [
    {
      key: "weight",
      label: "가중치 합산",
      pass: sum > 0 && sum <= system.scoreCap,
      detail: sum > system.scoreCap ? `현재 ${sum}% — 상한 ${system.scoreCap}% 이하로 조정해주세요` : `${sum} / ${system.scoreCap}%`,
    },
    {
      key: "format",
      label: "KR 측정 형태",
      pass: noFormat.length === 0,
      detail: noFormat.length > 0 ? `${fmtKr(noFormat)}의 형태를 STEP 4에서 골라주세요` : "전체 선택 완료",
    },
    {
      key: "measure",
      label: "측정 도구",
      pass: noMeasure.length === 0,
      detail: noMeasure.length > 0 ? `${fmtKr(noMeasure)}의 측정 도구를 STEP 5에서 채워주세요` : "전체 입력 완료",
    },
    {
      key: "gradeA",
      label: "A등급(목표선) 기준",
      pass: noA.length === 0,
      detail: noA.length > 0 ? `${fmtKr(noA)}의 A등급 기준을 STEP 5에서 정해주세요` : "전체 정의 완료",
    },
    {
      key: "risk",
      label: `${checklist.length}항목 사전 검토`,
      pass: highRisk.length === 0,
      detail: highRisk.length > 0 ? `${fmtKr(highRisk)}는 보완 후보가 많아요 — STEP 3에서 함께 정제 후 제출해주세요` : "위험도 '상' KR 없음",
    },
  ];
  return { ok: items.every((i) => i.pass), items };
}
