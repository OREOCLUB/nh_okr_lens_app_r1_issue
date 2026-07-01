// mockData.ts — 프로토타입 더미 데이터. Supabase 연동 시 교체.
// 원본 ui_kits/web/shared/dummyData.js 기반.

export interface Member {
  id: string;
  grade: string;
  name: string;
  series: string;
  group: string;
  submitDate: string | null;
  status: "approved" | "rejected" | "adjustment" | "pending" | "draft";
  risk: "low" | "mid" | "high" | null;
  focus: boolean;
  coaching: boolean;
  obj: string;
}

// R2 평가자 팀 요약
export const r2Stats = [
  { id: "total", label: "전체 팀원", value: 20, unit: "명" },
  { id: "approved", label: "수립 완료", value: 8, unit: "명", hint: "승인 멤버" },
  { id: "pending", label: "결재 요청", value: 4, unit: "건", tone: "high", hint: "최우선" },
  { id: "draft", label: "작성 중", value: 7, unit: "명", hint: "미제출" },
] as const;

export const members: Member[] = [
  { id: "E1001", grade: "책임", name: "김태양", series: "SE", group: "시운영", submitDate: "05/20", status: "approved", risk: "low", focus: true, coaching: true, obj: "결제 게이트웨이 응답속도 개선" },
  { id: "E1002", grade: "차장", name: "강동우", series: "SE", group: "시운영", submitDate: "05/24", status: "rejected", risk: "high", focus: true, coaching: false, obj: "장애 알림 자동화" },
  { id: "E1003", grade: "차장", name: "임재현", series: "PM", group: "인프라", submitDate: "05/25", status: "adjustment", risk: "mid", focus: false, coaching: true, obj: "운영 자동화 파이프라인" },
  { id: "E1004", grade: "차장", name: "오준서", series: "SE", group: "미들웨어", submitDate: "05/27", status: "pending", risk: null, focus: false, coaching: false, obj: "메시지 큐 SLA 유지" },
  { id: "E1005", grade: "책임", name: "박서연", series: "SE", group: "장애/운영안정", submitDate: "05/26", status: "rejected", risk: "high", focus: true, coaching: false, obj: "야간 배치 장애 ZERO" },
  { id: "E1007", grade: "선임", name: "한지윤", series: "SE", group: "보안/권한", submitDate: "05/28", status: "pending", risk: "mid", focus: true, coaching: false, obj: "권한 점검 자동화" },
  { id: "E1009", grade: "선임", name: "정민재", series: "SE", group: "개발/요건", submitDate: "05/19", status: "approved", risk: "low", focus: false, coaching: true, obj: "결제 인증모듈 리팩토링" },
  { id: "E1011", grade: "선임", name: "정하은", series: "SE", group: "성능/튜닝", submitDate: "05/23", status: "pending", risk: "mid", focus: true, coaching: false, obj: "DB 인덱싱 개선" },
];

// R1 피평가자 본인 OKR
export interface OKR {
  status: "approved" | "submitted" | "draft" | "rejected";
  obj: string;
  kr: string;
  format: string;
  baseline: string;
  goal: string;
  weight: number;
  progress: number;
  evaluator?: { from: string; msg: string };
}

export const r1Okrs: OKR[] = [
  {
    status: "approved",
    obj: "Objective · 핵심 서비스 응답속도 개선",
    kr: "결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축한다.",
    format: "수치", baseline: "850ms", goal: "500ms", weight: 30, progress: 72,
    evaluator: { from: "정태영", msg: "측정 방법이 명료해서 좋습니다. 이대로 진행해주세요." },
  },
  {
    status: "submitted",
    obj: "Objective · 결제 인증 모듈 안정화",
    kr: "결제 인증모듈 단위테스트 커버리지를 65% → 85%로 끌어올린다.",
    format: "수치", baseline: "65%", goal: "85%", weight: 25, progress: 45,
  },
  {
    status: "draft",
    obj: "Objective · 운영 자동화",
    kr: "장애 알림 룰 자동화 마일스톤 4단계 중 3단계까지 완료한다.",
    format: "마일스톤", baseline: "1/4", goal: "3/4", weight: 20, progress: 25,
  },
];

// 캘린더 일정 유형 (6종)
export interface ScheduleType { ico: string; fg: string; bg: string; bd: string; label: string; desc: string }
export const scheduleTypes: Record<string, ScheduleType> = {
  kickoff: { ico: "📋", fg: "#2B5DD9", bg: "#EFF4FE", bd: "#C5D5F7", label: "OKR 등록 시작", desc: "OKR 작성 시작 기간 (공지)" },
  deadline: { ico: "🚨", fg: "#D14343", bg: "#FFF0F0", bd: "#FFD4D4", label: "OKR 등록 마감", desc: "OKR 제출 마감일 (공지)" },
  oneonone: { ico: "💬", fg: "#7C4DD9", bg: "#F0E9FB", bd: "#DCC9F4", label: "1on1 코칭", desc: "개인별 OKR 진척 점검·피드백" },
  quarter: { ico: "📊", fg: "#2F9E5E", bg: "#ECFAF1", bd: "#BBE9CC", label: "분기 미팅", desc: "팀 전체 분기 목표 공유" },
  final: { ico: "🏁", fg: "#D98023", bg: "#FFF7EC", bd: "#FFE0BA", label: "최종 평가", desc: "연말 평가 기간 (공지)" },
  etc: { ico: "📌", fg: "#5B6685", bg: "#F1F3F8", bd: "#C8CFDF", label: "기타", desc: "간담회·비정기 면담" },
};

// R3 인사담당자 전사 인사이트 요약
export const r3Stats = [
  { id: "orgs", label: "참여 본부", value: 4, unit: "개" },
  { id: "people", label: "전체 대상자", value: 142, unit: "명", hint: "OKR 등록" },
  { id: "coaching", label: "코칭 후보", value: 18, unit: "건", tone: "warn", hint: "함께 정제" },
  { id: "rate", label: "제출 완료율", value: 76, unit: "%", tone: "ok", hint: "↑ 12%p" },
] as const;
