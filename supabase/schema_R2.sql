-- ============================================================
-- schema_R2.sql — R2(평가자) 기능 개발로 달라진 스키마 변경분 정리
--
-- 기준: 최초 통합 스키마(schema.sql 초기 버전, 커밋 c941d88) 대비
-- 변경 사유: R2_REQUIREMENTS.md 4단계 구현 (승인/반려 실저장 D3·D9,
--            작년 OKR·반려 타임라인 D6, 검토 상세 표시)
--
-- 사용법
--   · 신규 Supabase 프로젝트: schema.sql(최신본)만 실행하면 됨 — 아래 내용 이미 포함
--   · 초기 schema.sql만 실행했던 기존 프로젝트: 이 파일을 SQL Editor에서 1회 실행
--   · 재실행해도 안전 (add column if not exists / drop policy if exists / delete 후 insert)
--
-- 변경 요약
--   ① okr_submissions  컬럼 3개 추가 : evaluator_msg · decided_at · risk_analysis
--   ② okrs             컬럼 3개 추가 : difficulty · measure · plan
--   ③ okr_history      컬럼 7개 추가 : period · difficulty · achievement · result
--                                      · event · event_at · note  (D6 단일 소스화)
--   ④ RLS 쓰기 정책 2건 추가         : okr_submissions · okrs anon UPDATE 허용
--   ⑤ 시드 추가                      : 팀원 OKR 상세 16행 · 작년 OKR 7행 · 반려 이벤트 6행
--   ⑥ (07-04) 평가 라인 분리 시드    : 최민경(T0301) 전속 팀원 6명 신규
--                                      — R2 1명 → R1 N명 전속, 평가자 간 중복 배정 없음
--                                      — dataAccess.getMembers(evaluatorLoginId)가 employees.evaluator_id로 필터
--
-- 팀 공용 DB 적용 확인 (2026-07-04 실조회 검증)
--   · 팀 DB는 초기 스키마 상태 확인: okr_submissions/okrs/okr_history에 R2 확장 컬럼 없음,
--     okrs 3건(정태영)·okr_history 0건, 최민경 팀 미존재 → ①~⑥ 전부 필요, 이 파일 1회 실행이면 됨
--   · 이전 ⑦(employees.title 컬럼 drop — CR-1 롤백)은 팀 DB에 title 컬럼이 애초에 없어 제거함.
--     개인 DB의 title 정리는 reseed_data.sql에 이미 포함 (2026-07-04 실행 완료)
--
-- 참고: 테스트 데이터로 오염된 기존 DB의 일괄 정리는 reseed_data.sql 사용
--       (5개 테이블 delete 후 원본+⑥ 시드 재적재 — 결과는 schema.sql 최신본과 동일)
-- ============================================================

-- ── ① okr_submissions — R2 검토 처리 결과 저장 (D3·D9) ──────
-- 처리 버튼 하나가 status(기존 컬럼) + 아래 3개를 동시에 갱신한다.
alter table okr_submissions add column if not exists evaluator_msg text;   -- 반려·조정 메시지 (R1에게 전달)
alter table okr_submissions add column if not exists decided_at    text;   -- 처리 시각 '2026-07-03 14:20'
alter table okr_submissions add column if not exists risk_analysis jsonb;  -- 검토 스냅샷 { risk, items:[{no,text,tag,verdict,reason,edited}], savedAt }
                                                                            -- 임시 저장(D9)도 이 컬럼만 갱신

-- ── ② okrs — 검토 화면 중앙 아코디언 상세 표시용 ─────────────
alter table okrs add column if not exists difficulty text;                  -- '상' · '중' · '하'
alter table okrs add column if not exists measure    text;                  -- 측정 방법
alter table okrs add column if not exists plan       text;                  -- 실행 계획 요약

-- ── ③ okr_history — 작년 OKR 팝업 + 반려 이력 타임라인 (D6) ──
-- 행 구분: event 가 null 이면 "연도 적재 행"(작년 OKR), 값이 있으면 "타임라인 행"
alter table okr_history add column if not exists period      text;          -- 타임라인 행의 반기 '2026H2'
alter table okr_history add column if not exists difficulty  text;
alter table okr_history add column if not exists achievement int;           -- 달성률 %
alter table okr_history add column if not exists result      text;          -- 최종 결과 한 줄
alter table okr_history add column if not exists event       text check (event in ('submit', 'reject', 'resubmit') or event is null);
alter table okr_history add column if not exists event_at    text;          -- '05/24 09:30'
alter table okr_history add column if not exists note        text;          -- 반려 사유 등

-- ── ④ RLS 쓰기 정책 — 검토 처리 저장용 ──────────────────────
-- 프로토타입 정책: anon UPDATE 전면 허용. 실 서비스 전 역할(SSO) 기반으로 교체할 것.
drop policy if exists "anon update okr_submissions" on okr_submissions;
create policy "anon update okr_submissions" on okr_submissions for update to anon using (true) with check (true);
drop policy if exists "anon update okrs" on okrs;
create policy "anon update okrs" on okrs for update to anon using (true) with check (true);

-- ── ⑤-1 시드: 팀원 OKR 상세 (r2/review 중앙 패널 — 박정훈 팀 8명 × 2KR) ──
delete from okrs where employee_id in ('E1001','E1002','E1003','E1004','E1005','E1007','E1009','E1011') and period = '2026H2';
insert into okrs (employee_id, period, status, obj, kr, format, baseline, goal, weight, progress, difficulty, measure, plan, sort_order) values
  ('E1001', '2026H2', 'approved',  'Objective · 결제 게이트웨이 응답속도 개선', '결제 게이트웨이 APM p95 응답속도를 900ms → 550ms로 단축한다.', '수치', '900ms', '550ms', 30, 20, '중', 'APM p95 월평균', '3건 · 캐시·인덱스·쿼리 튜닝', 1),
  ('E1001', '2026H2', 'approved',  'Objective · 결제 게이트웨이 응답속도 개선', '피크타임 오류율을 0.8% → 0.3%로 낮춘다.', '수치', '0.8%', '0.3%', 20, 10, '중', '월간 오류율 리포트', '2건 · 재시도 정책·서킷브레이커', 2),
  ('E1002', '2026H2', 'rejected',  'Objective · 장애 알림 자동화', '결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축한다.', '수치', '850ms', '500ms', 30, 0, '중', 'APM p95 월평균', '3건 · 캐시·인덱스·튜닝', 1),
  ('E1002', '2026H2', 'rejected',  'Objective · 장애 알림 자동화', '장애 알림 룰 자동화 커버리지를 40% → 80%로 확대한다.', '수치', '40%', '80%', 25, 0, '상', '알림 룰 커버리지 대시보드', '4건 · 룰 정의·파이프라인·검증·롤아웃', 2),
  ('E1003', '2026H2', 'submitted', 'Objective · 운영 자동화 파이프라인', '반복 운영작업 자동화율을 35% → 70%로 끌어올린다.', '수치', '35%', '70%', 30, 0, '중', '자동화 작업 대장 집계', '3건 · 대상 선정·스크립트화·운영 이관', 1),
  ('E1003', '2026H2', 'submitted', 'Objective · 운영 자동화 파이프라인', '배포 파이프라인 수동 승인 단계를 5단계 → 2단계로 줄인다.', '마일스톤', '5단계', '2단계', 20, 0, '하', '파이프라인 정의서 비교', '2건 · 승인 규칙 정리·자동 게이트', 2),
  ('E1004', '2026H2', 'submitted', 'Objective · 메시지 큐 SLA 유지', '메시지 큐 처리 지연 p99를 3초 이내로 유지한다.', '수치', '4.2초', '3초', 30, 0, '중', 'MQ 모니터링 p99 월평균', '3건 · 컨슈머 스케일링·백프레셔·알림', 1),
  ('E1004', '2026H2', 'submitted', 'Objective · 메시지 큐 SLA 유지', '큐 적체 장애 재발 건수를 분기 0건으로 만든다.', '이산', '분기 2건', '0건', 20, 0, '상', '장애 회고 리포트', '2건 · 적체 감지 자동화·런북 정비', 2),
  ('E1005', '2026H2', 'rejected',  'Objective · 야간 배치 장애 ZERO', '야간 배치 실패율을 월 5건 → 0건으로 낮춘다.', '수치', '월 5건', '0건', 35, 0, '상', '배치 모니터링 월간 집계', '3건 · 선행 점검·재처리 자동화·알림', 1),
  ('E1005', '2026H2', 'rejected',  'Objective · 야간 배치 장애 ZERO', '배치 지연 감지 시간을 30분 → 5분으로 단축한다.', '수치', '30분', '5분', 25, 0, '중', '감지 시각 로그 분석', '2건 · 임계치 세분화·온콜 연동', 2),
  ('E1007', '2026H2', 'submitted', 'Objective · 권한 점검 자동화', '분기 권한 점검 완료율을 70% → 95%로 높인다.', '수치', '70%', '95%', 30, 0, '중', '권한 점검 대장 완료율', '3건 · 대상 자동 추출·리마인드·리포트', 1),
  ('E1007', '2026H2', 'submitted', 'Objective · 권한 점검 자동화', '수동 권한 부여 건을 월 40건 → 10건으로 줄인다.', '수치', '월 40건', '10건', 20, 0, '하', '권한 부여 로그 집계', '2건 · 셀프서비스 신청·자동 승인 룰', 2),
  ('E1009', '2026H2', 'approved',  'Objective · 결제 인증모듈 리팩토링', '인증모듈 단위테스트 커버리지를 60% → 85%로 올린다.', '수치', '60%', '85%', 30, 15, '중', '커버리지 리포트', '3건 · 핵심 경로 테스트·리팩토링·CI 게이트', 1),
  ('E1009', '2026H2', 'approved',  'Objective · 결제 인증모듈 리팩토링', '인증 응답 p95를 300ms → 200ms로 단축한다.', '수치', '300ms', '200ms', 20, 10, '하', 'APM p95 월평균', '2건 · 토큰 캐시·세션 최적화', 2),
  ('E1011', '2026H2', 'submitted', 'Objective · DB 인덱싱 개선', '주요 조회 쿼리 p95를 1.2초 → 0.5초로 단축한다.', '수치', '1.2초', '0.5초', 30, 0, '중', '슬로우쿼리 로그 p95', '3건 · 인덱스 재설계·통계 갱신·쿼리 리라이트', 1),
  ('E1011', '2026H2', 'submitted', 'Objective · DB 인덱싱 개선', '슬로우쿼리 발생 건수를 주 25건 → 5건으로 줄인다.', '수치', '주 25건', '5건', 20, 0, '중', '슬로우쿼리 주간 집계', '2건 · 임계치 알림·정기 리뷰', 2);

-- ── ⑤-2 시드: 작년 OKR (연도 적재 행 — event null) ───────────
delete from okr_history where event is null and emp_no in ('E1002','E1005','E1003','E1007','E1011');
insert into okr_history (year, emp_no, emp_name, obj, kr, grade, difficulty, achievement, result) values
  (2025, 'E1002', '강동우', '장애 대응 체계 고도화', '장애 알림 오탐율을 30% → 15%로 낮춘다.', 'B', '중', 82, '오탐율 18%까지 개선 — 목표 근접 달성'),
  (2025, 'E1002', '강동우', '장애 대응 체계 고도화', 'P1 장애 MTTR을 40분 → 25분으로 단축한다.', 'B', '상', 65, 'MTTR 30분 — 부분 달성'),
  (2024, 'E1002', '강동우', '결제 모니터링 정비', '모니터링 대시보드 핵심 지표 12종을 구축한다.', 'A', '중', 108, '14종 구축 — 초과 달성'),
  (2025, 'E1005', '박서연', '배치 안정화 1단계', '야간 배치 실패율을 월 9건 → 5건으로 낮춘다.', 'C', '하', 55, '월 7건 — 미달성, 재처리 수동 의존 지속'),
  (2025, 'E1003', '임재현', '운영 표준화', '운영 매뉴얼 표준화율을 50% → 90%로 올린다.', 'B', '중', 95, '표준화율 88% — 근접 달성'),
  (2025, 'E1007', '한지윤', '권한 관리 개선', '미사용 계정 정리율 100%를 달성한다.', 'A', '중', 100, '전량 정리 완료'),
  (2025, 'E1011', '정하은', '조회 성능 개선', '핵심 화면 응답속도를 2.0초 → 1.2초로 단축한다.', 'B', '상', 78, '1.4초 — 부분 달성');

-- ── ⑤-3 시드: 반려 이력 타임라인 (event 행 — 재상신 건) ───────
delete from okr_history where event is not null and period = '2026H2';
insert into okr_history (year, emp_no, emp_name, period, event, event_at, note) values
  (2026, 'E1002', '강동우', '2026H2', 'submit',   '05/20 09:30', '1차 제출'),
  (2026, 'E1002', '강동우', '2026H2', 'reject',   '05/22 15:10', '측정 증빙(APM 리포트) 첨부가 필요해요. Baseline·Goal 단위를 통일해주세요.'),
  (2026, 'E1002', '강동우', '2026H2', 'resubmit', '05/24 10:00', '2차 제출 — Baseline·Goal 명시, 증빙 계획 추가'),
  (2026, 'E1005', '박서연', '2026H2', 'submit',   '05/21 11:00', '1차 제출'),
  (2026, 'E1005', '박서연', '2026H2', 'reject',   '05/23 17:40', '"장애 ZERO"는 통제 밖 요인이 커요. 재처리 자동화율 같은 통제 가능한 KR로 함께 정제해요.'),
  (2026, 'E1005', '박서연', '2026H2', 'resubmit', '05/26 09:20', '2차 제출 — 감지시간 단축 KR 추가');

-- ── ⑥ 평가 라인 분리 시드 (2026-07-04) — 최민경(T0301) 전속 팀원 6명 ──
-- OKR 사상: R2 1명 → R1 N명 전속 배정, 평가자 간 팀원 중복 없음.
--   · 박정훈(T0201) 팀 8명 (E1001~E1011, 결제플랫폼팀) — 기존 유지
--   · 최민경(T0301) 팀 6명 (E1301~E1306, 인프라운영팀) — 아래 신규
-- 화면 연동: dataAccess.getMembers(evaluatorLoginId)가 login_id → 사번 해석 후
--            employees.evaluator_id 로 필터 (r2 대시보드·검토·캘린더·피드백 공통)
-- 재실행 안전: E13xx 시드를 지우고 다시 넣는다.
delete from okrs where employee_id like 'E13%' and period = '2026H2';
delete from okr_submissions where employee_id like 'E13%' and period = '2026H2';
delete from okr_history where emp_no like 'E13%';
delete from employees where id like 'E13%';

insert into employees (id, name, role, grade, job_series, dept, team, work_group, evaluator_id, sort_order) values
  ('E1301', '서준혁', 'R1', '책임', 'SM', 'IT본부', '인프라운영팀', '서버운영',   'T0301', 31),
  ('E1302', '문가영', 'R1', '차장', 'SM', 'IT본부', '인프라운영팀', '클라우드',   'T0301', 32),
  ('E1303', '배성호', 'R1', '선임', 'SE', 'IT본부', '인프라운영팀', '네트워크',   'T0301', 33),
  ('E1304', '윤소라', 'R1', '책임', 'SM', 'IT본부', '인프라운영팀', '스토리지',   'T0301', 34),
  ('E1305', '노태민', 'R1', '선임', 'SE', 'IT본부', '인프라운영팀', '가상화',     'T0301', 35),
  ('E1306', '김하늘', 'R1', '차장', 'SM', 'IT본부', '인프라운영팀', '보안인프라', 'T0301', 36);

insert into okr_submissions (employee_id, period, submit_date, status, risk, focus, coaching, obj, sort_order) values
  ('E1301', '2026H2', '05/21', 'pending',    'mid',  true,  false, '서버 프로비저닝 자동화', 11),
  ('E1302', '2026H2', '05/19', 'approved',   'low',  false, true,  '클라우드 비용 최적화', 12),
  ('E1303', '2026H2', '05/25', 'rejected',   'high', true,  false, '네트워크 장애 ZERO', 13),
  ('E1304', '2026H2', '05/26', 'pending',    null,   false, false, '스토리지 용량 예측 체계', 14),
  ('E1305', '2026H2', '05/24', 'adjustment', 'mid',  false, true,  '가상화 전환 확대', 15),
  ('E1306', '2026H2', '05/27', 'pending',    'mid',  true,  false, '방화벽 정책 정비', 16);

insert into okrs (employee_id, period, status, obj, kr, format, baseline, goal, weight, progress, difficulty, measure, plan, sort_order) values
  ('E1301', '2026H2', 'submitted', 'Objective · 서버 프로비저닝 자동화', '신규 서버 프로비저닝 소요 시간을 3일 → 4시간으로 단축한다.', '수치', '3일', '4시간', 30, 0, '상', '프로비저닝 티켓 처리 시간 집계', '3건 · IaC 템플릿·승인 자동화·셀프서비스', 1),
  ('E1301', '2026H2', 'submitted', 'Objective · 서버 프로비저닝 자동화', '수동 설정 작업 건수를 월 60건 → 15건으로 줄인다.', '수치', '월 60건', '15건', 20, 0, '중', '작업 대장 월간 집계', '2건 · 표준 이미지·구성 관리 도입', 2),
  ('E1302', '2026H2', 'approved',  'Objective · 클라우드 비용 최적화', '월 클라우드 비용을 12% 절감한다.', '수치', '월 4.2억', '월 3.7억', 30, 15, '중', '월별 청구서 비교', '3건 · 미사용 자원 정리·RI 전환·오토스케일 튜닝', 1),
  ('E1302', '2026H2', 'approved',  'Objective · 클라우드 비용 최적화', '비용 이상 감지 알림 커버리지를 0% → 90%로 구축한다.', '수치', '0%', '90%', 20, 10, '하', '비용 알림 룰 커버리지', '2건 · 예산 알림·태깅 표준화', 2),
  ('E1303', '2026H2', 'rejected',  'Objective · 네트워크 장애 ZERO', '네트워크 장애 건수를 분기 0건으로 만든다.', '이산', '분기 3건', '0건', 35, 0, '상', '장애 관리 시스템 집계', '2건 · 이중화 점검·펌웨어 일괄 업그레이드', 1),
  ('E1303', '2026H2', 'rejected',  'Objective · 네트워크 장애 ZERO', '스위치 구성 백업 자동화율을 40% → 100%로 올린다.', '수치', '40%', '100%', 25, 0, '중', '백업 스케줄러 리포트', '2건 · 백업 스크립트·검증 절차', 2),
  ('E1304', '2026H2', 'submitted', 'Objective · 스토리지 용량 예측 체계', '용량 부족 긴급 증설 건수를 연 6건 → 1건으로 줄인다.', '수치', '연 6건', '1건', 30, 0, '중', '증설 요청 티켓 집계', '3건 · 사용량 추세 대시보드·임계치 알림·분기 리뷰', 1),
  ('E1304', '2026H2', 'submitted', 'Objective · 스토리지 용량 예측 체계', '스토리지 사용률 예측 오차를 ±25% → ±10%로 낮춘다.', '수치', '±25%', '±10%', 20, 0, '상', '예측치-실측치 월간 비교', '2건 · 예측 모델 보정·데이터 정제', 2),
  ('E1305', '2026H2', 'submitted', 'Objective · 가상화 전환 확대', '물리 서버 가상화 전환율을 55% → 80%로 높인다.', '수치', '55%', '80%', 30, 0, '중', '자산 대장 전환율 집계', '3건 · 대상 선별·전환 일정·검증', 1),
  ('E1305', '2026H2', 'submitted', 'Objective · 가상화 전환 확대', 'VM 리소스 과할당률을 30% → 10%로 낮춘다.', '수치', '30%', '10%', 20, 0, '하', '리소스 모니터링 월평균', '2건 · 사이징 기준·정기 회수', 2),
  ('E1306', '2026H2', 'submitted', 'Objective · 방화벽 정책 정비', '미사용 방화벽 정책 정리율 100%를 달성한다.', '수치', '0%', '100%', 30, 0, '중', '정책 대장 정리율', '3건 · 전수 조사·소유자 확인·단계 폐기', 1),
  ('E1306', '2026H2', 'submitted', 'Objective · 방화벽 정책 정비', '정책 신청 처리 시간을 3일 → 1일로 단축한다.', '수치', '3일', '1일', 20, 0, '하', '신청 티켓 처리 시간', '2건 · 표준 템플릿·자동 검증', 2);

insert into okr_history (year, emp_no, emp_name, obj, kr, grade, difficulty, achievement, result) values
  (2025, 'E1303', '배성호', '네트워크 안정화', '코어 스위치 이중화 구성을 100% 완료한다.', 'B', '중', 90, '이중화 완료 — 페일오버 테스트 1건 이월'),
  (2025, 'E1302', '문가영', '클라우드 거버넌스', '전 계정 태깅 표준 적용률을 30% → 85%로 올린다.', 'A', '중', 102, '87% 적용 — 초과 달성');

insert into okr_history (year, emp_no, emp_name, period, event, event_at, note) values
  (2026, 'E1303', '배성호', '2026H2', 'submit',   '05/22 10:15', '1차 제출'),
  (2026, 'E1303', '배성호', '2026H2', 'reject',   '05/23 16:30', '"장애 ZERO"는 통제 밖 요인이 커요. 백업 자동화율처럼 통제 가능한 KR 중심으로 함께 정제해요.'),
  (2026, 'E1303', '배성호', '2026H2', 'resubmit', '05/25 09:40', '2차 제출 — 구성 백업 자동화 KR 보강');
