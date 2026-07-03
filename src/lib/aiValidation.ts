// aiValidation.ts — R2 AI Validation 판정 생성 단일 지점 (D2).
// 지금은 목업 판정(휴리스틱 + 결정적 해시)이며, 전체 개발 완료 후
// 이 파일의 runValidation() 내부만 Gemini API 호출로 교체한다.
// 호출부(r2/review)는 이 시그니처만 의존하므로 교체 시 화면 수정이 없다.
import type { CheckItem } from "./criteria";
import type { ReviewOkr } from "./dataAccess";

export type Verdict = "pass" | "warn" | "fail";

export interface ValidationItem {
  no: number;
  text: string;
  tag: string;
  verdict: Verdict;
  reason?: string;
  edited?: boolean;
}

export interface ValidationResult {
  items: ValidationItem[];
  comment: string; // 종합 코멘트 (코칭 톤)
}

// 위험도 기준값 — criteria 체계와 정합 유지 (코칭 후보 ≥4 상 / ≥2 중 / 그 외 하)
export const RISK_THRESHOLD = { high: 4, mid: 2 } as const;

export function riskOf(items: { verdict: Verdict }[]): "low" | "mid" | "high" {
  const fails = items.filter((i) => i.verdict === "fail").length;
  if (fails >= RISK_THRESHOLD.high) return "high";
  if (fails >= RISK_THRESHOLD.mid) return "mid";
  return "low";
}

/** 결정적 해시 — 같은 팀원·같은 항목이면 항상 같은 목업 판정이 나오게 한다 */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// 태그별 목업 판정 휴리스틱 — KR 원문에서 근거를 찾아 코칭 톤 사유를 만든다
function judge(tag: string, text: string, okrs: ReviewOkr[], seed: number): { verdict: Verdict; reason?: string } {
  const all = okrs.map((o) => `${o.kr} ${o.goal} ${o.measure ?? ""}`).join(" ");
  const hasNumbers = /\d/.test(all);
  switch (tag) {
    case "측정모호":
      return hasNumbers
        ? { verdict: "pass" }
        : { verdict: "fail", reason: "Baseline → Goal 수치를 명시하면 진행 점검이 수월해져요" };
    case "통제불가":
      if (/0건|ZERO|zero/.test(all)) return { verdict: "warn", reason: "'0건' 목표는 외부 요인 영향이 커요. 통제 가능한 선행지표를 함께 두면 좋아요" };
      return { verdict: "pass" };
    case "도전성저하":
      if (/유지/.test(all)) return { verdict: "warn", reason: "유지형 표현이 보여요. 개선 폭을 한 단계 더 잡아볼까요?" };
      return { verdict: "pass" };
    case "현실성낮음":
      if (okrs.some((o) => o.difficulty === "상")) return { verdict: "warn", reason: "난이도 '상' KR이 있어요. 분기 마일스톤을 두면 진행 점검이 수월해요" };
      return { verdict: "pass" };
    case "건수형지표":
      if (/건수|횟수/.test(all)) return { verdict: "warn", reason: "건수형 지표가 보여요. 질적 지표를 함께 두면 더 단단해져요" };
      return { verdict: "pass" };
    case "확인불가":
      return okrs.every((o) => o.measure)
        ? { verdict: seed % 3 === 0 ? "fail" : "pass", reason: seed % 3 === 0 ? "측정 증빙(리포트·캡처) 첨부 계획을 코칭 메모에 남겨주세요" : undefined }
        : { verdict: "fail", reason: "측정 방법이 비어 있어요. 확인 가능한 증거를 함께 정해요" };
    case "자기보고형":
      if (/대장|자체|수동/.test(all)) return { verdict: "warn", reason: "자기 집계 기반 측정이에요. 시스템 추출값으로 바꾸면 더 신뢰도가 높아요" };
      return { verdict: "pass" };
    default:
      // 나머지 항목은 결정적 해시로 간헐적 주의 부여 (목업 다양성)
      return seed % 5 === 0
        ? { verdict: "warn", reason: `'${text.replace(/\?.*$/, "")}' 관점에서 한 번 더 살펴보면 좋아요` }
        : { verdict: "pass" };
  }
}

/**
 * 목업 AI 검토 실행 (D2).
 * TODO(P2): 이 함수 본문을 Gemini API 호출로 교체 — 입력(checklist·okrs)과
 * 출력(ValidationResult) 계약은 유지한다.
 */
export async function runValidation(checklist: CheckItem[], okrs: ReviewOkr[], memberId: string): Promise<ValidationResult> {
  // 실제 API 지연을 흉내내 로딩 상태를 확인할 수 있게 한다
  await new Promise((r) => setTimeout(r, 600));
  const items: ValidationItem[] = checklist.map((c) => {
    const seed = hash(`${memberId}:${c.tag}`);
    const { verdict, reason } = judge(c.tag, c.text, okrs, seed);
    return { no: c.no, text: c.text, tag: c.tag, verdict, reason };
  });
  const fails = items.filter((i) => i.verdict === "fail");
  const warns = items.filter((i) => i.verdict === "warn");
  const comment =
    fails.length === 0 && warns.length === 0
      ? "전 항목이 잘 갖춰졌어요. 이대로 승인해도 좋겠어요 👍"
      : fails.length === 0
        ? `전반적으로 잘 정리됐어요. 주의 ${warns.length}건은 1on1에서 가볍게 다뤄보세요.`
        : `코칭 후보 ${fails.length}건이 보여요. ${fails.map((f) => f.tag).join("·")} 항목을 팀원과 함께 정제해보면 좋겠어요.`;
  return { items, comment };
}

// ✨ AI 초안 — 조정요청·반려 메시지 목업 문구 (코칭 톤)
export function draftMessage(kind: "adjustment" | "rejected", memberName: string, items: ValidationItem[]): string {
  const focus = items.filter((i) => i.verdict !== "pass").slice(0, 2);
  const points = focus.length > 0
    ? focus.map((f, i) => `${i + 1}. ${f.reason ?? f.text}`).join("\n")
    : "1. 측정 방법과 증빙 계획을 한 번 더 구체화해주세요";
  return kind === "adjustment"
    ? `${memberName} 님, 제출해주신 OKR 잘 확인했어요. 아래 부분만 함께 보완해볼까요?\n\n${points}\n\n다음 1on1에서 같이 정리해요 :)`
    : `${memberName} 님, 고민해주신 방향은 좋아요. 다만 아래 내용을 반영해 다시 정리해보면 좋겠어요.\n\n${points}\n\n정리되면 재상신해주세요. 필요하면 언제든 찾아와요 :)`;
}
