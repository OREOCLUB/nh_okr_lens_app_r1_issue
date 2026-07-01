// criteria.ts — 평가 기준 단일 소스 (Single Source of Truth).
// R3(인사담당자)가 정의하고, R1(작성 가이드)·R2(AI Validation 검토)가 같은 소스를 참조한다.
// 프로토타입 단계에선 "구조적 연동" — 여기 한 곳을 바꾸면 전 역할 화면에 반영된다.
// Supabase 연동 시 이 구조를 그대로 테이블(criteria_*)로 이관한다.

// ───────────────────────────────────────────────────────────
// ① 평가제도 — 비중 · 가중치 · 강제배분 · 점수상한 · 제외기준
// ───────────────────────────────────────────────────────────
export interface EvalSystem {
  version: string;
  weights: { operation: number; strategy: number; post: number }; // 합계 100
  difficulty: { high: number; mid: number; low: number };
  distribution: { S: number; A: number; B: number; C: number; D: number | null }; // D는 수동 배정
  scoreCap: number; // KR 점수 상한 (%)
  exclusionRule: string; // R1 작성 가이드에 노출되는 제외 기준 문구
  krRange: { min: number; max: number };
}

export const evalSystem: EvalSystem = {
  version: "criteria v2026.1",
  weights: { operation: 40, strategy: 40, post: 20 },
  difficulty: { high: 1.2, mid: 1.0, low: 0.8 },
  distribution: { S: 5, A: 10, B: 75, C: 10, D: null },
  scoreCap: 110,
  exclusionRule: "반응형(장애대응형) 유지보수는 OKR 대상 제외, 능동적 개선만 인정",
  krRange: { min: 4, max: 6 },
};

// ───────────────────────────────────────────────────────────
// ② 분류체계 (Taxonomy) — 각 분류는 추가/삭제 대상
//    · 업무군  = 실무 도메인 (bottom-up, "무슨 일을 하는가")
//    · BSC     = 경영 전략 관점 (top-down, "어떤 전략에 기여하는가")
//    · KR 유형 = KR 측정 방식
//    · 직무체계 = 직렬 구분
// ───────────────────────────────────────────────────────────
export interface TaxonomyGroup {
  id: "workgroup" | "bsc" | "krtype" | "jobtrack";
  title: string;
  desc: string; // 정의 — 업무군/BSC 혼동 방지용 한 줄 설명
  color: string;
  items: string[];
}

export const taxonomy: TaxonomyGroup[] = [
  {
    id: "workgroup",
    title: "업무군",
    desc: "실무 도메인 — 어떤 종류의 일인지 (bottom-up). 캘리브레이션 시 비슷한 업무끼리 공정 비교하는 축.",
    color: "#3B5BDB",
    items: ["개발/요건", "데이터/정합성", "자동화", "성능/튜닝", "장애/운영안정", "정시/납기/처리율", "매뉴얼/표준/문서", "보안/권한/개인정보", "고객/사업기여/제안"],
  },
  {
    id: "bsc",
    title: "BSC 카테고리",
    desc: "경영 전략 관점 — 그 일이 걸리는 전략 바구니 (top-down). 경영 보고·전략 균형 점검 축.",
    color: "#7C4DD9",
    items: ["재무", "고객", "프로세스", "품질", "생산성", "조직/인재", "시스템 운영", "리스크", "프로젝트", "기타"],
  },
  {
    id: "krtype",
    title: "KR 유형",
    desc: "KR 측정 방식. R1 작성 위저드의 KR 형태 선택지로 그대로 노출된다.",
    color: "#E07A3C",
    items: ["마일스톤", "수치", "루브릭", "이산"],
  },
  {
    id: "jobtrack",
    title: "직무체계 (직렬)",
    desc: "직렬 구분. 사원 마스터의 직렬 필드와 연결된다.",
    color: "#2F9E5E",
    items: ["SE — System Engineer", "PM — Project Manager", "SI — System Integrator", "SM — Service Manager"],
  },
];

// ───────────────────────────────────────────────────────────
// ③ OKR 검토리스트 — R2 AI Validation이 자동 판정하는 문항
// ───────────────────────────────────────────────────────────
export interface CheckItem {
  no: number;
  text: string;
  tag: string; // 걸리면 KR에 부착되는 위험 태그
  edited?: boolean;
}

export const checklist: CheckItem[] = [
  { no: 1, text: "수치로 측정 가능한가?", tag: "측정모호" },
  { no: 2, text: "외부 의존 없이 통제 가능한가?", tag: "통제불가" },
  { no: 3, text: "유지형이 아닌 도전적 목표인가?", tag: "도전성저하" },
  { no: 4, text: "시간 내 현실적으로 달성 가능한가?", tag: "현실성낮음" },
  { no: 5, text: "명확한 언어인가? (애매한 표현이 없는가)", tag: "표현모호", edited: true },
  { no: 6, text: "타 팀 KR과 겹치지 않는가?", tag: "공모형" },
  { no: 7, text: "신기술/새 도구에 과의존하지 않는가?", tag: "신기술의존" },
  { no: 8, text: "단순 건수형이 아닌 질적 지표인가?", tag: "건수형지표" },
  { no: 9, text: "평가자가 확인 가능한 증거가 있는가?", tag: "확인불가" },
  { no: 10, text: "외부 증빙 기반인가? (자기보고 아님)", tag: "자기보고형", edited: true },
  { no: 11, text: "고위험 실행 요소가 통제되는가?", tag: "고위험실행" },
];
