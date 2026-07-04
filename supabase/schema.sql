-- ============================================================
-- OKR LENS — Supabase 초기 스키마 + 더미 시드 (R3 화면 반영 통합판)
-- 새 Supabase 프로젝트의 SQL Editor에 그대로 붙여넣어 1회 실행.
-- 프로토타입 정책: 더미 데이터만 적재 (실 인사데이터 반입 금지 — spec.md 참조)
--
-- 테이블 구성
--   departments      : 부서 계층            (r3/master 조직 탭)
--   employees        : 사원 마스터 통합      (auth USERS + mockData members + r3/master EMPLOYEES)
--   okr_submissions  : 반기별 OKR 제출 현황  (r2 화면의 팀원 리스트)
--   okrs             : R1 본인 OKR 상세      (r1 화면)
--   okr_history      : 이전 OKR 적재분       (r3/master Import 결과 — 빈 테이블)
--   okr_imports      : 이전 OKR 가져오기 이력 (r3/master Import 탭)
--   eval_phases      : 평가 일정·입력 제어    (r3/schedule)
--   metrics          : 표준 지표 라이브러리   (r3/metrics)
--   criteria_system / criteria_taxonomy / criteria_checklist : 평가 기준 (r3/criteria)
-- ============================================================

-- ── 부서 계층 (r3/master 조직 탭) ───────────────────────────
create table if not exists departments (
  code        text primary key,            -- 'OPS-PAY'
  name        text not null,
  parent_code text references departments (code),
  leader      text not null,
  headcount   int  not null default 0,
  sort_order  int  not null default 0
);

-- ── 사원 마스터 (로그인 사용자 + 팀원 + R3 사원정보 통합) ────
create table if not exists employees (
  id           text primary key,           -- 사번 'E1024' / 'T0103'
  login_id     text unique,                -- 'jung.ty' — 로그인 가능한 사용자만 값 존재
  name         text not null,
  role         text not null check (role in ('R1', 'R2', 'R3')),
  grade        text not null,              -- '4급갑' · '3급' · '책임' 등 표기 그대로
  grade_band   text,                       -- '4급' (밴드)
  job_series   text not null,              -- SE / PM / SI / SM / HR
  dept         text not null,              -- 본부 표기 (denormalized)
  team         text not null,
  work_group   text,                       -- '시운영' 등 업무 그룹 (r2 화면 그룹 컬럼)
  evaluator_id text references employees (id),
  join_year    int,
  certs        jsonb not null default '[]'::jsonb,
  avatar_color text,
  sort_order   int not null default 0
);

-- ── 반기별 OKR 제출 현황 (r2 팀원 리스트의 상태·리스크·코칭) ──
create table if not exists okr_submissions (
  id          bigint generated always as identity primary key,
  employee_id text not null references employees (id),
  period      text not null default '2026H2',   -- '2026H2'
  submit_date text,                             -- '05/20' (프로토타입 표기 그대로)
  status      text not null check (status in ('approved', 'rejected', 'adjustment', 'pending', 'draft')),
  risk        text check (risk in ('low', 'mid', 'high')),
  focus       boolean not null default false,
  coaching    boolean not null default false,
  obj         text not null,                    -- 대표 Objective 요약
  evaluator_msg text,                           -- R2 처리 메시지 (반려·조정 사유)
  decided_at    text,                           -- 처리 시각 '2026-07-03 14:20'
  risk_analysis jsonb,                          -- 검토 스냅샷 { risk, items:[...], savedAt }
  sort_order  int not null default 0,
  unique (employee_id, period)
);

-- ── R1 본인 OKR 상세 (r1 화면) ──────────────────────────────
create table if not exists okrs (
  id             bigint generated always as identity primary key,
  employee_id    text not null references employees (id),
  period         text not null default '2026H2',
  status         text not null check (status in ('approved', 'submitted', 'draft', 'rejected')),
  obj            text not null,
  kr             text not null,
  format         text not null,               -- '수치' · '마일스톤' · '루브릭' · '이산'
  baseline       text not null,
  goal           text not null,
  weight         int  not null,
  progress       int  not null default 0,
  evaluator_from text,
  evaluator_msg  text,
  difficulty     text,                          -- '상' · '중' · '하' (R2 검토 상세)
  measure        text,                          -- 측정 방법
  plan           text,                          -- 실행 계획 요약
  sort_order     int  not null default 0
);

-- ── 이전 OKR 적재분 (Excel Import 결과가 쌓이는 곳) ──────────
create table if not exists okr_history (
  id          bigint generated always as identity primary key,
  year        int  not null,                  -- 2023 · 2024 · 2025 (타임라인 행은 2026)
  emp_no      text not null,                  -- 사번 기준 매칭 (매칭 실패 행도 보존)
  emp_name    text,
  obj         text,
  kr          text,
  grade       text,                           -- 당시 평가 등급
  -- 작년 OKR 팝업 · 반려 이력 타임라인 (D6: 단일 소스)
  period      text,                           -- 타임라인 행의 반기 '2026H2'
  difficulty  text,
  achievement int,                            -- 달성률 %
  result      text,                           -- 최종 결과 한 줄
  event       text check (event in ('submit', 'reject', 'resubmit') or event is null),
  event_at    text,                           -- '05/24 09:30'
  note        text                            -- 반려 사유 등
);

-- ── 이전 OKR 가져오기 이력 (r3/master Import 탭) ─────────────
create table if not exists okr_imports (
  id          bigint generated always as identity primary key,
  file_name   text not null,
  year        text not null,
  row_count   int  not null,
  imported_at text not null,                  -- '2026-06-28 14:20' (프로토타입 표기 그대로)
  imported_by text not null,
  status      text not null default '완료'
);

-- ── 평가 일정 · 입력 제어 단계 (r3/schedule) ─────────────────
create table if not exists eval_phases (
  id         text primary key,                -- 'write' · 'approve' · 'lock' …
  ico        text not null,
  name       text not null,
  start_date text not null,                   -- 'YYYY-MM-DD' (date input 값 그대로)
  end_date   text not null,
  control    text not null,                   -- 이 기간의 제어 효과 설명
  who        text not null,
  status     text not null check (status in ('done', 'active', 'up')),
  sort_order int  not null default 0
);

-- ── 표준 지표 라이브러리 (r3/metrics) ────────────────────────
create table if not exists metrics (
  id         text primary key,                -- 'M_PERF_001'
  name       text not null,
  status     text not null check (status in ('수집', '검토중', '표준승인', '비권장')),
  category   text not null,                   -- BSC 카테고리
  group_name text not null,                   -- 업무군
  definition text not null,
  formula    text not null,
  unit       text not null,
  usage      int  not null default 0,
  orgs       int  not null default 0,
  example_kr text not null,
  warnings   jsonb not null default '[]'::jsonb,
  sort_order int  not null default 0
);

-- ── 평가 기준 (r3/criteria — R3 정의, R1·R2 참조) ────────────
create table if not exists criteria_system (
  id      int primary key default 1 check (id = 1),  -- 단일 행
  version text  not null,
  config  jsonb not null                              -- weights/difficulty/distribution/scoreCap/exclusionRule/krRange
);

create table if not exists criteria_taxonomy (
  id         text primary key,               -- 'workgroup' | 'bsc' | 'krtype' | 'jobtrack'
  title      text not null,
  descr      text not null,
  color      text not null,
  items      jsonb not null,                 -- string[]
  sort_order int  not null default 0
);

create table if not exists criteria_checklist (
  no     int  primary key,
  text   text not null,
  tag    text not null,
  edited boolean not null default false
);

-- ── RLS: 익명(anon) 읽기 허용, 쓰기는 service_role 전용 ─────
-- 프로토타입은 더미 데이터 읽기만 필요. 쓰기 기능 붙일 때 정책 추가.
alter table departments        enable row level security;
alter table employees          enable row level security;
alter table okr_submissions    enable row level security;
alter table okrs               enable row level security;
alter table okr_history        enable row level security;
alter table okr_imports        enable row level security;
alter table eval_phases        enable row level security;
alter table metrics            enable row level security;
alter table criteria_system    enable row level security;
alter table criteria_taxonomy  enable row level security;
alter table criteria_checklist enable row level security;

create policy "anon read departments"        on departments        for select to anon using (true);
create policy "anon read employees"          on employees          for select to anon using (true);
create policy "anon read okr_submissions"    on okr_submissions    for select to anon using (true);
create policy "anon read okrs"               on okrs               for select to anon using (true);
create policy "anon read okr_history"        on okr_history        for select to anon using (true);
create policy "anon read okr_imports"        on okr_imports        for select to anon using (true);
create policy "anon read eval_phases"        on eval_phases        for select to anon using (true);
create policy "anon read metrics"            on metrics            for select to anon using (true);
create policy "anon read criteria_system"    on criteria_system    for select to anon using (true);
create policy "anon read criteria_taxonomy"  on criteria_taxonomy  for select to anon using (true);
create policy "anon read criteria_checklist" on criteria_checklist for select to anon using (true);

-- R2 검토 처리 쓰기 (프로토타입: anon update 허용 — 실 서비스 전 역할 기반으로 교체)
create policy "anon update okr_submissions" on okr_submissions for update to anon using (true) with check (true);
create policy "anon update okrs"            on okrs            for update to anon using (true) with check (true);

-- ============================================================
-- 시드 — 화면 인라인 더미 + lib(auth·mockData·criteria) 이관
-- ============================================================

-- 부서 (r3/master DEPTS)
insert into departments (code, name, parent_code, leader, headcount, sort_order) values
  ('HQ',       'OKR LENS 본사', null, '대표이사',       552, 1),
  ('OPS',      '운영본부',      'HQ', '김운영 본부장',  142, 2),
  ('OPS-PAY',  '결제플랫폼팀',  'OPS', '정태영',         14, 3),
  ('OPS-AUTH', '인증플랫폼팀',  'OPS', '이인증',         11, 4),
  ('OPS-MON',  '모니터링팀',    'OPS', '박감시',          8, 5),
  ('DEV',      '개발본부',      'HQ', '최개발 본부장',  186, 6),
  ('BIZ',      '사업본부',      'HQ', '한사업 본부장',  114, 7),
  ('DX',       'DX본부',        'HQ', '오디엑스 본부장', 68, 8),
  ('HR',       '인사노무팀',    'HQ', '한지영',           6, 9);

-- 사원 ① 로그인 사용자 (auth.ts USERS — login_id 보유)
insert into employees (id, login_id, name, role, grade, grade_band, job_series, dept, team, evaluator_id, join_year, certs, avatar_color, sort_order) values
  ('T0103', 'jung.ty',  '정태영', 'R1', '3급', '3급', 'SE', '운영본부',     '결제플랫폼팀',   null, 2012, '["PMP"]'::jsonb, '#3B5BDB', 1),
  ('E1101', 'kim.sr',   '김수련', 'R1', '4급', '4급', 'SE', '운영본부',     '데이터플랫폼팀', null, null, '[]'::jsonb,      '#3B5BDB', 2),
  ('E1201', 'lee.jw',   '이지원', 'R1', '3급', '3급', 'SM', 'IT본부',       '인프라운영팀',   null, null, '[]'::jsonb,      '#3B5BDB', 3),
  ('T0201', 'park.jh',  '박정훈', 'R2', '2급', '2급', 'SE', '운영본부',     '결제플랫폼팀',   null, null, '[]'::jsonb,      '#00A968', 4),
  ('T0301', 'choi.mk',  '최민경', 'R2', '2급', '2급', 'SM', 'IT본부',       '인프라운영팀',   null, null, '[]'::jsonb,      '#00A968', 5),
  ('H0001', 'hr.admin', '한지영', 'R3', '2급', '2급', 'HR', '경영지원본부', '인사노무팀',     null, null, '[]'::jsonb,      '#E07A3C', 6);

-- 사원 ② R2 화면 팀원 (mockData.ts members — 평가자 박정훈)
insert into employees (id, name, role, grade, job_series, dept, team, work_group, evaluator_id, sort_order) values
  ('E1001', '김태양', 'R1', '책임', 'SE', '운영본부', '결제플랫폼팀', '시운영',        'T0201', 11),
  ('E1002', '강동우', 'R1', '차장', 'SE', '운영본부', '결제플랫폼팀', '시운영',        'T0201', 12),
  ('E1003', '임재현', 'R1', '차장', 'PM', '운영본부', '결제플랫폼팀', '인프라',        'T0201', 13),
  ('E1004', '오준서', 'R1', '차장', 'SE', '운영본부', '결제플랫폼팀', '미들웨어',      'T0201', 14),
  ('E1005', '박서연', 'R1', '책임', 'SE', '운영본부', '결제플랫폼팀', '장애/운영안정', 'T0201', 15),
  ('E1007', '한지윤', 'R1', '선임', 'SE', '운영본부', '결제플랫폼팀', '보안/권한',     'T0201', 16),
  ('E1009', '정민재', 'R1', '선임', 'SE', '운영본부', '결제플랫폼팀', '개발/요건',     'T0201', 17),
  ('E1011', '정하은', 'R1', '선임', 'SE', '운영본부', '결제플랫폼팀', '성능/튜닝',     'T0201', 18);

-- 사원 ③ R3 마스터 사원정보 탭 (r3/master EMPLOYEES — 평가자 정태영)
insert into employees (id, name, role, grade, grade_band, job_series, dept, team, evaluator_id, join_year, certs, sort_order) values
  ('E1024', '김지훈', 'R1', '4급갑', '4급', 'SE', '운영본부', '결제플랫폼팀', 'T0103', 2018, '["AWS SAA","CKA"]'::jsonb, 21),
  ('E1037', '박서연', 'R1', '4급을', '4급', 'SE', '운영본부', '결제플랫폼팀', 'T0103', 2020, '["AWS SAA"]'::jsonb,       22),
  ('E1051', '이도윤', 'R1', '3급',   '3급', 'PM', '운영본부', '결제플랫폼팀', 'T0103', 2015, '["PMP"]'::jsonb,           23),
  ('E1062', '최수아', 'R1', '4급갑', '4급', 'SE', '운영본부', '결제플랫폼팀', 'T0103', 2019, '["DBA"]'::jsonb,           24),
  ('E1073', '정민재', 'R1', '4급을', '4급', 'SE', '운영본부', '결제플랫폼팀', 'T0103', 2021, '[]'::jsonb,                25),
  ('E1084', '한지윤', 'R1', '4급갑', '4급', 'SE', '운영본부', '결제플랫폼팀', 'T0103', 2017, '["CISSP"]'::jsonb,         26);

-- 사원 ④ R2 화면 팀원 (평가자 최민경 — 평가 라인 분리: R2 1명 → R1 N명 전속, 중복 없음)
insert into employees (id, name, role, grade, job_series, dept, team, work_group, evaluator_id, sort_order) values
  ('E1301', '서준혁', 'R1', '책임', 'SM', 'IT본부', '인프라운영팀', '서버운영',   'T0301', 31),
  ('E1302', '문가영', 'R1', '차장', 'SM', 'IT본부', '인프라운영팀', '클라우드',   'T0301', 32),
  ('E1303', '배성호', 'R1', '선임', 'SE', 'IT본부', '인프라운영팀', '네트워크',   'T0301', 33),
  ('E1304', '윤소라', 'R1', '책임', 'SM', 'IT본부', '인프라운영팀', '스토리지',   'T0301', 34),
  ('E1305', '노태민', 'R1', '선임', 'SE', 'IT본부', '인프라운영팀', '가상화',     'T0301', 35),
  ('E1306', '김하늘', 'R1', '차장', 'SM', 'IT본부', '인프라운영팀', '보안인프라', 'T0301', 36);

-- 반기 제출 현황 (mockData.ts members → r2 화면)
insert into okr_submissions (employee_id, period, submit_date, status, risk, focus, coaching, obj, sort_order) values
  ('E1001', '2026H2', '05/20', 'approved',   'low',  true,  true,  '결제 게이트웨이 응답속도 개선', 1),
  ('E1002', '2026H2', '05/24', 'rejected',   'high', true,  false, '장애 알림 자동화', 2),
  ('E1003', '2026H2', '05/25', 'adjustment', 'mid',  false, true,  '운영 자동화 파이프라인', 3),
  ('E1004', '2026H2', '05/27', 'pending',    null,   false, false, '메시지 큐 SLA 유지', 4),
  ('E1005', '2026H2', '05/26', 'rejected',   'high', true,  false, '야간 배치 장애 ZERO', 5),
  ('E1007', '2026H2', '05/28', 'pending',    'mid',  true,  false, '권한 점검 자동화', 6),
  ('E1009', '2026H2', '05/19', 'approved',   'low',  false, true,  '결제 인증모듈 리팩토링', 7),
  ('E1011', '2026H2', '05/23', 'pending',    'mid',  true,  false, 'DB 인덱싱 개선', 8);

-- 반기 제출 현황 — 최민경 팀 (평가 라인 분리)
insert into okr_submissions (employee_id, period, submit_date, status, risk, focus, coaching, obj, sort_order) values
  ('E1301', '2026H2', '05/21', 'pending',    'mid',  true,  false, '서버 프로비저닝 자동화', 11),
  ('E1302', '2026H2', '05/19', 'approved',   'low',  false, true,  '클라우드 비용 최적화', 12),
  ('E1303', '2026H2', '05/25', 'rejected',   'high', true,  false, '네트워크 장애 ZERO', 13),
  ('E1304', '2026H2', '05/26', 'pending',    null,   false, false, '스토리지 용량 예측 체계', 14),
  ('E1305', '2026H2', '05/24', 'adjustment', 'mid',  false, true,  '가상화 전환 확대', 15),
  ('E1306', '2026H2', '05/27', 'pending',    'mid',  true,  false, '방화벽 정책 정비', 16);

-- R1 본인 OKR (mockData.ts r1Okrs — 정태영)
insert into okrs (employee_id, period, status, obj, kr, format, baseline, goal, weight, progress, evaluator_from, evaluator_msg, sort_order) values
  ('T0103', '2026H2', 'approved',  'Objective · 핵심 서비스 응답속도 개선', '결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축한다.', '수치',     '850ms', '500ms', 30, 72, '정태영', '측정 방법이 명료해서 좋습니다. 이대로 진행해주세요.', 1),
  ('T0103', '2026H2', 'submitted', 'Objective · 결제 인증 모듈 안정화',     '결제 인증모듈 단위테스트 커버리지를 65% → 85%로 끌어올린다.',  '수치',     '65%',   '85%',   25, 45, null, null, 2),
  ('T0103', '2026H2', 'draft',     'Objective · 운영 자동화',               '장애 알림 룰 자동화 마일스톤 4단계 중 3단계까지 완료한다.',    '마일스톤', '1/4',   '3/4',   20, 25, null, null, 3);

-- 팀원 OKR 상세 (r2/review 중앙 패널 — 평가자 박정훈 팀)
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

-- 팀원 OKR 상세 — 최민경 팀 (평가 라인 분리)
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

-- 작년 OKR (r2/review 팝업 — 연도 적재 행, event null)
insert into okr_history (year, emp_no, emp_name, obj, kr, grade, difficulty, achievement, result) values
  (2025, 'E1002', '강동우', '장애 대응 체계 고도화', '장애 알림 오탐율을 30% → 15%로 낮춘다.', 'B', '중', 82, '오탐율 18%까지 개선 — 목표 근접 달성'),
  (2025, 'E1002', '강동우', '장애 대응 체계 고도화', 'P1 장애 MTTR을 40분 → 25분으로 단축한다.', 'B', '상', 65, 'MTTR 30분 — 부분 달성'),
  (2024, 'E1002', '강동우', '결제 모니터링 정비', '모니터링 대시보드 핵심 지표 12종을 구축한다.', 'A', '중', 108, '14종 구축 — 초과 달성'),
  (2025, 'E1005', '박서연', '배치 안정화 1단계', '야간 배치 실패율을 월 9건 → 5건으로 낮춘다.', 'C', '하', 55, '월 7건 — 미달성, 재처리 수동 의존 지속'),
  (2025, 'E1003', '임재현', '운영 표준화', '운영 매뉴얼 표준화율을 50% → 90%로 올린다.', 'B', '중', 95, '표준화율 88% — 근접 달성'),
  (2025, 'E1007', '한지윤', '권한 관리 개선', '미사용 계정 정리율 100%를 달성한다.', 'A', '중', 100, '전량 정리 완료'),
  (2025, 'E1011', '정하은', '조회 성능 개선', '핵심 화면 응답속도를 2.0초 → 1.2초로 단축한다.', 'B', '상', 78, '1.4초 — 부분 달성');

-- 반려 이력 타임라인 (r2/review — event 행, 재상신 건)
insert into okr_history (year, emp_no, emp_name, period, event, event_at, note) values
  (2026, 'E1002', '강동우', '2026H2', 'submit',   '05/20 09:30', '1차 제출'),
  (2026, 'E1002', '강동우', '2026H2', 'reject',   '05/22 15:10', '측정 증빙(APM 리포트) 첨부가 필요해요. Baseline·Goal 단위를 통일해주세요.'),
  (2026, 'E1002', '강동우', '2026H2', 'resubmit', '05/24 10:00', '2차 제출 — Baseline·Goal 명시, 증빙 계획 추가'),
  (2026, 'E1005', '박서연', '2026H2', 'submit',   '05/21 11:00', '1차 제출'),
  (2026, 'E1005', '박서연', '2026H2', 'reject',   '05/23 17:40', '"장애 ZERO"는 통제 밖 요인이 커요. 재처리 자동화율 같은 통제 가능한 KR로 함께 정제해요.'),
  (2026, 'E1005', '박서연', '2026H2', 'resubmit', '05/26 09:20', '2차 제출 — 감지시간 단축 KR 추가');

-- 최민경 팀 이력 (작년 OKR + 반려 타임라인 — E1303 반려 건)
insert into okr_history (year, emp_no, emp_name, obj, kr, grade, difficulty, achievement, result) values
  (2025, 'E1303', '배성호', '네트워크 안정화', '코어 스위치 이중화 구성을 100% 완료한다.', 'B', '중', 90, '이중화 완료 — 페일오버 테스트 1건 이월'),
  (2025, 'E1302', '문가영', '클라우드 거버넌스', '전 계정 태깅 표준 적용률을 30% → 85%로 올린다.', 'A', '중', 102, '87% 적용 — 초과 달성');

insert into okr_history (year, emp_no, emp_name, period, event, event_at, note) values
  (2026, 'E1303', '배성호', '2026H2', 'submit',   '05/22 10:15', '1차 제출'),
  (2026, 'E1303', '배성호', '2026H2', 'reject',   '05/23 16:30', '"장애 ZERO"는 통제 밖 요인이 커요. 백업 자동화율처럼 통제 가능한 KR 중심으로 함께 정제해요.'),
  (2026, 'E1303', '배성호', '2026H2', 'resubmit', '05/25 09:40', '2차 제출 — 구성 백업 자동화 KR 보강');

-- 이전 OKR 가져오기 이력 (r3/master IMPORT_HISTORY)
insert into okr_imports (file_name, year, row_count, imported_at, imported_by, status) values
  ('OKR_2025_전사.xlsx', '2025', 552, '2026-06-28 14:20', '한지영', '완료'),
  ('OKR_2024_전사.xlsx', '2024', 498, '2026-06-28 14:12', '한지영', '완료'),
  ('OKR_2023_전사.xlsx', '2023', 237, '2026-06-28 14:05', '한지영', '완료');

-- 평가 일정 (r3/schedule INITIAL_PHASES)
insert into eval_phases (id, ico, name, start_date, end_date, control, who, status, sort_order) values
  ('write',    '📝', '목표 수립',                 '2026-07-01', '2026-07-10', 'R1이 OKR을 작성·수정할 수 있어요. 이 기간에만 신규 목표 등록 가능.',        'R1 전사 552명', 'active', 1),
  ('approve',  '✅', '평가자 승인',               '2026-07-08', '2026-07-15', 'R2가 팀원 OKR을 승인·반려할 수 있어요.',                                     'R2 평가자 48명', 'up', 2),
  ('lock',     '🔒', '목표 확정 (마감)',          '2026-07-15', '2026-07-15', '마감 이후 목표 문구·KR 수정 잠금. 이후에는 달성도만 입력 가능해요.',        '전사',           'up', 3),
  ('progress', '📈', '달성도 입력',               '2026-07-16', '2026-11-30', '목표는 잠긴 상태로 달성도(진척률)만 수정 가능해요.',                         'R1 전사 552명', 'up', 4),
  ('self',     '🙋', '자기 평가',                 '2026-12-01', '2026-12-07', 'R1이 최종 자기평가를 작성해요. 달성도 수정 마감.',                           'R1 전사 552명', 'up', 5),
  ('calib',    '⚖️', '평가자 평가·캘리브레이션', '2026-12-08', '2026-12-20', 'R2 평가·R3 캘리브레이션 진행. 피평가자 입력 전면 잠금.',                    'R2·R3',          'up', 6);

-- 표준 지표 라이브러리 (r3/metrics METRICS)
insert into metrics (id, name, status, category, group_name, definition, formula, unit, usage, orgs, example_kr, warnings, sort_order) values
  ('M_PERF_001', 'APM p95 응답속도 (ms)',    '표준승인', '프로세스', '성능/튜닝',     '외부 사용자가 체감하는 응답 지연의 상위 5% 값. 단순 평균보다 사용자 경험을 더 정확히 반영합니다.', 'P95(response_time) · 월평균',            'ms', 87, 6, '결제 게이트웨이 APM p95 응답속도 850ms → 500ms', '[]'::jsonb, 1),
  ('M_QUAL_004', '단위테스트 커버리지 (%)',  '표준승인', '품질',     '개발/요건',     '실행된 코드 라인이 전체 코드 라인에서 차지하는 비율. 회귀 리스크의 대표 선행 지표입니다.',        'covered_lines / total_lines × 100',       '%',  64, 4, '결제 인증 모듈 단위테스트 커버리지 65% → 85%', '[]'::jsonb, 2),
  ('M_OPS_007',  'MTTR · 평균 복구 시간',    '표준승인', '리스크',   '장애/운영안정', '장애 발생 시점부터 정상 복구 시점까지 평균 시간. 운영 안정성의 핵심 지표.',                      'SUM(recovery_time) / 장애 건수',          '분', 58, 5, 'P1 장애 MTTR 평균 35분 → 15분 단축', '[]'::jsonb, 3),
  ('M_OPS_012',  '배포 자동화 비율 (%)',     '검토중',   '생산성',   '자동화',        '전체 배포 중 자동 파이프라인으로 진행된 비율. 운영 효율과 휴먼 에러 감소의 대표 지표.',          'auto_deploys / total_deploys × 100',      '%',  42, 3, '결제 시스템 배포 자동화 비율 60% → 90%', '[]'::jsonb, 4),
  ('M_SEC_003',  '권한 점검 완료율 (%)',     '검토중',   '리스크',   '보안/권한',     '분기 권한 점검 대상 중 점검이 완료된 비율. 보안 거버넌스 지표.',                                 'completed / scheduled × 100',             '%',  28, 2, '분기 권한 점검 자동화 도입 · 완료율 70% → 95%', '[]'::jsonb, 5),
  ('M_PROD_009', '회의 횟수 (분기)',         '비권장',   '생산성',   '고객/사업기여', '분기 동안 진행한 회의 횟수. 활동량 지표로, 결과 지표가 함께 있어야 권장됩니다.',                 'COUNT(meetings) WHERE quarter',           '회', 14, 2, '고객 미팅 횟수 분기 30회 이상 유지', '["건수형"]'::jsonb, 6);

-- 평가 기준 (lib/criteria.ts)
insert into criteria_system (id, version, config) values
  (1, 'criteria v2026.1', '{
    "weights": { "operation": 40, "strategy": 40, "post": 20 },
    "difficulty": { "high": 1.2, "mid": 1.0, "low": 0.8 },
    "distribution": { "S": 5, "A": 10, "B": 75, "C": 10, "D": null },
    "scoreCap": 110,
    "exclusionRule": "반응형(장애대응형) 유지보수는 OKR 대상 제외, 능동적 개선만 인정",
    "krRange": { "min": 4, "max": 6 }
  }'::jsonb);

insert into criteria_taxonomy (id, title, descr, color, items, sort_order) values
  ('workgroup', '업무군',          '실무 도메인 — 어떤 종류의 일인지 (bottom-up). 캘리브레이션 시 비슷한 업무끼리 공정 비교하는 축.', '#3B5BDB',
    '["개발/요건","데이터/정합성","자동화","성능/튜닝","장애/운영안정","정시/납기/처리율","매뉴얼/표준/문서","보안/권한/개인정보","고객/사업기여/제안"]'::jsonb, 1),
  ('bsc',       'BSC 카테고리',    '경영 전략 관점 — 그 일이 걸리는 전략 바구니 (top-down). 경영 보고·전략 균형 점검 축.', '#7C4DD9',
    '["재무","고객","프로세스","품질","생산성","조직/인재","시스템 운영","리스크","프로젝트","기타"]'::jsonb, 2),
  ('krtype',    'KR 유형',         'KR 측정 방식. R1 작성 위저드의 KR 형태 선택지로 그대로 노출된다.', '#E07A3C',
    '["마일스톤","수치","루브릭","이산"]'::jsonb, 3),
  ('jobtrack',  '직무체계 (직렬)', '직렬 구분. 사원 마스터의 직렬 필드와 연결된다.', '#2F9E5E',
    '["SE — System Engineer","PM — Project Manager","SI — System Integrator","SM — Service Manager"]'::jsonb, 4);

insert into criteria_checklist (no, text, tag, edited) values
  (1,  '수치로 측정 가능한가?',                   '측정모호',   false),
  (2,  '외부 의존 없이 통제 가능한가?',           '통제불가',   false),
  (3,  '유지형이 아닌 도전적 목표인가?',          '도전성저하', false),
  (4,  '시간 내 현실적으로 달성 가능한가?',       '현실성낮음', false),
  (5,  '명확한 언어인가? (애매한 표현이 없는가)', '표현모호',   true),
  (6,  '타 팀 KR과 겹치지 않는가?',               '공모형',     false),
  (7,  '신기술/새 도구에 과의존하지 않는가?',     '신기술의존', false),
  (8,  '단순 건수형이 아닌 질적 지표인가?',       '건수형지표', false),
  (9,  '평가자가 확인 가능한 증거가 있는가?',     '확인불가',   false),
  (10, '외부 증빙 기반인가? (자기보고 아님)',     '자기보고형', true),
  (11, '고위험 실행 요소가 통제되는가?',          '고위험실행', false);
