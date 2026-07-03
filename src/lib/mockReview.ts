// mockReview.ts — r2/review 더미 폴백 데이터 (Supabase 미설정·조회 실패 시).
// supabase/schema.sql 시드와 동일 내용을 유지한다.
import type { ReviewOkr, HistoryOkr, HistoryEvent } from "./dataAccess";

export const mockMemberOkrs: Record<string, ReviewOkr[]> = {
  E1001: [
    { id: 101, status: "approved", obj: "Objective · 결제 게이트웨이 응답속도 개선", kr: "결제 게이트웨이 APM p95 응답속도를 900ms → 550ms로 단축한다.", format: "수치", baseline: "900ms", goal: "550ms", weight: 30, difficulty: "중", measure: "APM p95 월평균", plan: "3건 · 캐시·인덱스·쿼리 튜닝" },
    { id: 102, status: "approved", obj: "Objective · 결제 게이트웨이 응답속도 개선", kr: "피크타임 오류율을 0.8% → 0.3%로 낮춘다.", format: "수치", baseline: "0.8%", goal: "0.3%", weight: 20, difficulty: "중", measure: "월간 오류율 리포트", plan: "2건 · 재시도 정책·서킷브레이커" },
  ],
  E1002: [
    { id: 103, status: "rejected", obj: "Objective · 장애 알림 자동화", kr: "결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축한다.", format: "수치", baseline: "850ms", goal: "500ms", weight: 30, difficulty: "중", measure: "APM p95 월평균", plan: "3건 · 캐시·인덱스·튜닝" },
    { id: 104, status: "rejected", obj: "Objective · 장애 알림 자동화", kr: "장애 알림 룰 자동화 커버리지를 40% → 80%로 확대한다.", format: "수치", baseline: "40%", goal: "80%", weight: 25, difficulty: "상", measure: "알림 룰 커버리지 대시보드", plan: "4건 · 룰 정의·파이프라인·검증·롤아웃" },
  ],
  E1003: [
    { id: 105, status: "submitted", obj: "Objective · 운영 자동화 파이프라인", kr: "반복 운영작업 자동화율을 35% → 70%로 끌어올린다.", format: "수치", baseline: "35%", goal: "70%", weight: 30, difficulty: "중", measure: "자동화 작업 대장 집계", plan: "3건 · 대상 선정·스크립트화·운영 이관" },
    { id: 106, status: "submitted", obj: "Objective · 운영 자동화 파이프라인", kr: "배포 파이프라인 수동 승인 단계를 5단계 → 2단계로 줄인다.", format: "마일스톤", baseline: "5단계", goal: "2단계", weight: 20, difficulty: "하", measure: "파이프라인 정의서 비교", plan: "2건 · 승인 규칙 정리·자동 게이트" },
  ],
  E1004: [
    { id: 107, status: "submitted", obj: "Objective · 메시지 큐 SLA 유지", kr: "메시지 큐 처리 지연 p99를 3초 이내로 유지한다.", format: "수치", baseline: "4.2초", goal: "3초", weight: 30, difficulty: "중", measure: "MQ 모니터링 p99 월평균", plan: "3건 · 컨슈머 스케일링·백프레셔·알림" },
    { id: 108, status: "submitted", obj: "Objective · 메시지 큐 SLA 유지", kr: "큐 적체 장애 재발 건수를 분기 0건으로 만든다.", format: "이산", baseline: "분기 2건", goal: "0건", weight: 20, difficulty: "상", measure: "장애 회고 리포트", plan: "2건 · 적체 감지 자동화·런북 정비" },
  ],
  E1005: [
    { id: 109, status: "rejected", obj: "Objective · 야간 배치 장애 ZERO", kr: "야간 배치 실패율을 월 5건 → 0건으로 낮춘다.", format: "수치", baseline: "월 5건", goal: "0건", weight: 35, difficulty: "상", measure: "배치 모니터링 월간 집계", plan: "3건 · 선행 점검·재처리 자동화·알림" },
    { id: 110, status: "rejected", obj: "Objective · 야간 배치 장애 ZERO", kr: "배치 지연 감지 시간을 30분 → 5분으로 단축한다.", format: "수치", baseline: "30분", goal: "5분", weight: 25, difficulty: "중", measure: "감지 시각 로그 분석", plan: "2건 · 임계치 세분화·온콜 연동" },
  ],
  E1007: [
    { id: 111, status: "submitted", obj: "Objective · 권한 점검 자동화", kr: "분기 권한 점검 완료율을 70% → 95%로 높인다.", format: "수치", baseline: "70%", goal: "95%", weight: 30, difficulty: "중", measure: "권한 점검 대장 완료율", plan: "3건 · 대상 자동 추출·리마인드·리포트" },
    { id: 112, status: "submitted", obj: "Objective · 권한 점검 자동화", kr: "수동 권한 부여 건을 월 40건 → 10건으로 줄인다.", format: "수치", baseline: "월 40건", goal: "10건", weight: 20, difficulty: "하", measure: "권한 부여 로그 집계", plan: "2건 · 셀프서비스 신청·자동 승인 룰" },
  ],
  E1009: [
    { id: 113, status: "approved", obj: "Objective · 결제 인증모듈 리팩토링", kr: "인증모듈 단위테스트 커버리지를 60% → 85%로 올린다.", format: "수치", baseline: "60%", goal: "85%", weight: 30, difficulty: "중", measure: "커버리지 리포트", plan: "3건 · 핵심 경로 테스트·리팩토링·CI 게이트" },
    { id: 114, status: "approved", obj: "Objective · 결제 인증모듈 리팩토링", kr: "인증 응답 p95를 300ms → 200ms로 단축한다.", format: "수치", baseline: "300ms", goal: "200ms", weight: 20, difficulty: "하", measure: "APM p95 월평균", plan: "2건 · 토큰 캐시·세션 최적화" },
  ],
  E1011: [
    { id: 115, status: "submitted", obj: "Objective · DB 인덱싱 개선", kr: "주요 조회 쿼리 p95를 1.2초 → 0.5초로 단축한다.", format: "수치", baseline: "1.2초", goal: "0.5초", weight: 30, difficulty: "중", measure: "슬로우쿼리 로그 p95", plan: "3건 · 인덱스 재설계·통계 갱신·쿼리 리라이트" },
    { id: 116, status: "submitted", obj: "Objective · DB 인덱싱 개선", kr: "슬로우쿼리 발생 건수를 주 25건 → 5건으로 줄인다.", format: "수치", baseline: "주 25건", goal: "5건", weight: 20, difficulty: "중", measure: "슬로우쿼리 주간 집계", plan: "2건 · 임계치 알림·정기 리뷰" },
  ],
};

export const mockMemberHistory: Record<string, HistoryOkr[]> = {
  E1002: [
    { year: 2025, obj: "장애 대응 체계 고도화", kr: "장애 알림 오탐율을 30% → 15%로 낮춘다.", grade: "B", difficulty: "중", achievement: 82, result: "오탐율 18%까지 개선 — 목표 근접 달성" },
    { year: 2025, obj: "장애 대응 체계 고도화", kr: "P1 장애 MTTR을 40분 → 25분으로 단축한다.", grade: "B", difficulty: "상", achievement: 65, result: "MTTR 30분 — 부분 달성" },
    { year: 2024, obj: "결제 모니터링 정비", kr: "모니터링 대시보드 핵심 지표 12종을 구축한다.", grade: "A", difficulty: "중", achievement: 108, result: "14종 구축 — 초과 달성" },
  ],
  E1005: [
    { year: 2025, obj: "배치 안정화 1단계", kr: "야간 배치 실패율을 월 9건 → 5건으로 낮춘다.", grade: "C", difficulty: "하", achievement: 55, result: "월 7건 — 미달성, 재처리 수동 의존 지속" },
  ],
  E1003: [
    { year: 2025, obj: "운영 표준화", kr: "운영 매뉴얼 표준화율을 50% → 90%로 올린다.", grade: "B", difficulty: "중", achievement: 95, result: "표준화율 88% — 근접 달성" },
  ],
  E1007: [
    { year: 2025, obj: "권한 관리 개선", kr: "미사용 계정 정리율 100%를 달성한다.", grade: "A", difficulty: "중", achievement: 100, result: "전량 정리 완료" },
  ],
  E1011: [
    { year: 2025, obj: "조회 성능 개선", kr: "핵심 화면 응답속도를 2.0초 → 1.2초로 단축한다.", grade: "B", difficulty: "상", achievement: 78, result: "1.4초 — 부분 달성" },
  ],
};

export const mockMemberEvents: Record<string, HistoryEvent[]> = {
  E1002: [
    { event: "submit", at: "05/20 09:30", note: "1차 제출" },
    { event: "reject", at: "05/22 15:10", note: "측정 증빙(APM 리포트) 첨부가 필요해요. Baseline·Goal 단위를 통일해주세요." },
    { event: "resubmit", at: "05/24 10:00", note: "2차 제출 — Baseline·Goal 명시, 증빙 계획 추가" },
  ],
  E1005: [
    { event: "submit", at: "05/21 11:00", note: "1차 제출" },
    { event: "reject", at: "05/23 17:40", note: "\"장애 ZERO\"는 통제 밖 요인이 커요. 재처리 자동화율 같은 통제 가능한 KR로 함께 정제해요." },
    { event: "resubmit", at: "05/26 09:20", note: "2차 제출 — 감지시간 단축 KR 추가" },
  ],
};
