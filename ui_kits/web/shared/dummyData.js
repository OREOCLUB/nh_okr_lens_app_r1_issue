// dummyData.js — 평가자(R2) 화면 통합 더미 데이터
// 명세 기준: 전체 팀원 20명 가정
window.OKRDummy = {
  evaluator: {
    name: "정태영", role: "팀장",
    dept: "운영본부 · 결제플랫폼팀",
    avatar: "정"
  },

  // 명세 — 요약 카드 6종
  stats: [
    { id: "total",     label: "전체 팀원",     value: 20, unit: "명" },
    { id: "approved",  label: "수립 완료",     value: 8,  unit: "명",  hint: "승인 멤버" },
    { id: "draft",     label: "작성 중",       value: 7,  unit: "명",  hint: "미제출" },
    { id: "pending",   label: "결재 요청",     value: 4,  unit: "건",  tone: "high",  hint: "최우선" },
    { id: "rejected",  label: "반려",          value: 2,  unit: "건",  tone: "mid",   hint: "재상신 추적" },
    { id: "adjust",    label: "조정 요청",     value: 1,  unit: "건",  tone: "warn",  hint: "응답 대기" },
  ],

  // 팀원 목록 (집중코칭 대상자 = focus: true)
  members: [
    { id: "E1001", grade: "책임",  name: "김태양", series: "SE", group: "시운영",   submitDate: "05/20", status: "approved",   risk: "low",  focus: true,  coaching: true,  obj: "결제 게이트웨이 응답속도 개선" },
    { id: "E1002", grade: "차장",  name: "강동우", series: "SE", group: "시운영",   submitDate: "05/24", status: "rejected",   risk: "high", focus: true,  coaching: false, obj: "장애 알림 자동화" },
    { id: "E1003", grade: "차장",  name: "임재현", series: "PM", group: "인프라",   submitDate: "05/25", status: "adjustment", risk: "mid",  focus: false, coaching: true,  obj: "운영 자동화 파이프라인" },
    { id: "E1004", grade: "차장",  name: "오준서", series: "SE", group: "미들웨어", submitDate: "05/27", status: "pending",    risk: null,   focus: false, coaching: false, obj: "메시지 큐 SLA 유지" },
    { id: "E1005", grade: "책임",  name: "박서연", series: "SE", group: "장애/운영안정", submitDate: "05/26", status: "rejected", risk: "high", focus: true,  coaching: false, obj: "야간 배치 장애 ZERO" },
    { id: "E1006", grade: "차장",  name: "이도윤", series: "PM", group: "자동화",   submitDate: "05/22", status: "pending",    risk: "mid",  focus: false, coaching: false, obj: "운영 자동화 도입" },
    { id: "E1007", grade: "선임",  name: "한지윤", series: "SE", group: "보안/권한", submitDate: "05/28", status: "pending",    risk: "mid",  focus: true,  coaching: false, obj: "권한 점검 자동화" },
    { id: "E1008", grade: "선임",  name: "오재현", series: "SM", group: "정시/납기", submitDate: "05/21", status: "approved",   risk: "low",  focus: false, coaching: true,  obj: "SLA 99.95% 유지" },
    { id: "E1009", grade: "선임",  name: "정민재", series: "SE", group: "개발/요건", submitDate: "05/19", status: "approved",   risk: "low",  focus: false, coaching: true,  obj: "결제 인증모듈 리팩토링" },
    { id: "E1010", grade: "선임",  name: "임예린", series: "PM", group: "고객/사업기여", submitDate: "05/20", status: "approved", risk: "low", focus: false, coaching: true,  obj: "신규 고객사 도입 지원" },
    { id: "E1011", grade: "선임",  name: "정하은", series: "SE", group: "성능/튜닝", submitDate: "05/23", status: "pending",    risk: "mid",  focus: true,  coaching: false, obj: "DB 인덱싱 개선" },
    { id: "E1012", grade: "주임",  name: "신예린", series: "SE", group: "보안/권한", submitDate: "05/27", status: "approved",   risk: "low",  focus: false, coaching: true,  obj: "접근 권한 감사 자동화" },
    { id: "E1013", grade: "주임",  name: "최수아", series: "PM", group: "개발/요건", submitDate: null,    status: "draft",      risk: null,   focus: false, coaching: false, obj: "—" },
    { id: "E1014", grade: "주임",  name: "조민서", series: "SE", group: "인프라",   submitDate: null,    status: "draft",      risk: null,   focus: false, coaching: false, obj: "—" },
    { id: "E1015", grade: "주임",  name: "유나래", series: "SM", group: "장애/운영안정", submitDate: null, status: "draft",     risk: null,   focus: false, coaching: false, obj: "—" },
    { id: "E1016", grade: "주임",  name: "박지호", series: "SE", group: "자동화",   submitDate: null,    status: "draft",      risk: null,   focus: false, coaching: false, obj: "—" },
    { id: "E1017", grade: "주임",  name: "이서진", series: "PM", group: "고객/사업기여", submitDate: null, status: "draft",     risk: null,   focus: false, coaching: false, obj: "—" },
    { id: "E1018", grade: "주임",  name: "윤도현", series: "SE", group: "미들웨어", submitDate: null,    status: "draft",      risk: null,   focus: false, coaching: false, obj: "—" },
    { id: "E1019", grade: "주임",  name: "정시우", series: "SE", group: "성능/튜닝", submitDate: null,    status: "draft",      risk: null,   focus: false, coaching: false, obj: "—" },
    { id: "E1020", grade: "선임",  name: "강서윤", series: "SE", group: "시운영",   submitDate: "05/25", status: "approved",   risk: "low",  focus: false, coaching: true,  obj: "운영 알림 룰 정제" },
  ],

  // 캘린더 — 6종 일정 유형 (명세 정의)
  scheduleTypes: {
    kickoff:  { ico: "📋", color: "blue",   fg: "#2B5DD9", bg: "#EFF4FE", bd: "#C5D5F7", label: "OKR 등록 시작", desc: "OKR 작성 시작 기간 (공지)" },
    deadline: { ico: "🚨", color: "red",    fg: "#D14343", bg: "#FFF0F0", bd: "#FFD4D4", label: "OKR 등록 마감", desc: "OKR 제출 마감일 (공지)" },
    oneonone: { ico: "💬", color: "purple", fg: "#7C4DD9", bg: "#F0E9FB", bd: "#DCC9F4", label: "1on1 코칭",     desc: "개인별 OKR 진척 점검·피드백" },
    quarter:  { ico: "📊", color: "green",  fg: "#2F9E5E", bg: "#ECFAF1", bd: "#BBE9CC", label: "분기 미팅",      desc: "팀 전체 분기 목표 공유" },
    final:    { ico: "🏁", color: "orange", fg: "#D98023", bg: "#FFF7EC", bd: "#FFE0BA", label: "최종 평가",      desc: "연말 평가 기간 (공지)" },
    etc:      { ico: "📌", color: "gray",   fg: "#5B6685", bg: "#F1F3F8", bd: "#C8CFDF", label: "기타",          desc: "간담회·비정기 면담" },
  },
};
