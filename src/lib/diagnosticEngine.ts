// diagnosticEngine.ts — 룰 기반 결정적 진단 코어 (빌드스펙 D-3·D-6).
// criteria(체크리스트·임계값)를 주입받아 동작한다 — 항목 수·태그·기준을 하드코딩하지 않는다.
// R1 위저드의 "11항목 사전 검토" 실시간 신호와 R2 위험도 재계산이 같은 코어를 쓴다.
// LLM 자동판정(R2 AI Validation)은 이 룰의 결과를 초기값으로 쓰고 평가자가 수정한다.
// 표현 원칙(D-5): 결과는 "위반 확정"이 아니라 "함께 정제할 코칭 후보" 신호다.

import type { CheckItem } from "./criteria";

export type CheckVerdict = 0 | 1; // 1 = 통과, 0 = 보완 후보

export interface RiskThresholds {
  mid: number; // 이 건수 이상이면 '중'
  high: number; // 이 건수 이상이면 '상'
}

export const DEFAULT_THRESHOLDS: RiskThresholds = { mid: 2, high: 4 };

export interface KRSignal {
  kr: string;
  baseline: string;
  goal: string;
  measureTool: string;
  format: string;
  grades: { A: string };
}

const VAGUE_WORDS = /확\s|대폭|많이|빠르게|열심히|최대한|적극적?으?로|개선한다$|강화한다$|노력/;
const EXTERNAL_DEPENDENT = /고객\s?만족도|외부\s?평가|매출|타사|시장점유/;
const MAINTAIN_ONLY = /현행\s?유지|현상\s?유지|유지한다$/;
const COUNT_ONLY = /(회|건|횟수)\s?(이상|달성|유지)/;
const SELF_REPORT = /자체\s?평가|스스로|자기\s?보고/;
const NEW_TECH_HYPE = /최신\s?기술|신기술\s?도입만|트렌드/;
const BIG_BANG = /전면\s?교체|빅뱅|일괄\s?전환/;

const hasNumber = (s: string) => /\d/.test(s);

/** 태그별 결정적 휴리스틱 — criteria 태그가 늘거나 바뀌면 여기만 확장 */
function judgeByTag(tag: string, sig: KRSignal): CheckVerdict {
  switch (tag) {
    case "측정모호":
      return hasNumber(sig.kr) || (hasNumber(sig.baseline) && hasNumber(sig.goal)) ? 1 : 0;
    case "통제불가":
      return EXTERNAL_DEPENDENT.test(sig.kr) ? 0 : 1;
    case "도전성저하":
      return MAINTAIN_ONLY.test(sig.kr) || sig.baseline === sig.goal ? 0 : 1;
    case "현실성낮음":
      // 정량 판단이 어려운 항목 — 목표가 있으면 통과, 문장이 비면 보완
      return sig.goal.trim() ? 1 : 0;
    case "표현모호":
      return VAGUE_WORDS.test(sig.kr) ? 0 : 1;
    case "공모형":
      return 1; // 전사 KR 비교는 R3 축 — 개인 위저드에서는 통과 처리
    case "신기술의존":
      return NEW_TECH_HYPE.test(sig.kr) ? 0 : 1;
    case "건수형지표":
      return COUNT_ONLY.test(sig.kr) && !hasNumber(sig.goal) ? 0 : 1;
    case "확인불가":
      return sig.measureTool.trim() ? 1 : 0;
    case "자기보고형":
      return SELF_REPORT.test(sig.kr) || SELF_REPORT.test(sig.measureTool) ? 0 : 1;
    case "고위험실행":
      return BIG_BANG.test(sig.kr) ? 0 : 1;
    default:
      return 1; // 알 수 없는 신규 태그는 룰 코어에서 판단 보류(통과) — LLM 판정에 위임
  }
}

/** KR 신호 → 체크 배열 (길이 = criteria 체크리스트 길이) */
export function deriveChecks(sig: KRSignal, checklist: CheckItem[]): CheckVerdict[] {
  return checklist.map((item) => judgeByTag(item.tag, sig));
}

export interface RiskResult {
  score: number; // 보완 후보(=0) 건수
  level: "하" | "중" | "상";
  types: string[]; // 걸린 위험 태그
  checks: CheckVerdict[];
}

/** 체크 배열 → 위험도 (임계값은 criteria 파라미터 — D4) */
export function deriveRisk(
  checks: CheckVerdict[],
  checklist: CheckItem[],
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS
): RiskResult {
  const types = checklist.filter((_, i) => checks[i] === 0).map((c) => c.tag);
  const score = types.length;
  const level = score >= thresholds.high ? "상" : score >= thresholds.mid ? "중" : "하";
  return { score, level, types, checks };
}
