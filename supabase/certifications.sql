-- ============================================================
-- OKR LENS — 자격증 검색 DB (R1 STEP 0 검색 · R3 등급표 관리)
-- Supabase SQL Editor에서 1회 실행. 미실행 시 앱은 로컬 시드로 동작.
--
-- company_grade: 회사가 자격증별로 분류한 등급표 (S/A/B/C).
--   R3가 값을 입력하면 R1 검색 리스트에 등급 배지가 표시되고
--   "회사 분류" 필터 검색 대상이 된다. null = 아직 미분류.
-- ============================================================

create table if not exists certifications (
  id            text primary key,          -- 'C001'
  name          text not null,
  issuer        text not null,             -- 발급 기관
  category      text not null,             -- 클라우드 / 보안 / 데이터 / PM / 인프라 / 개발 / 국가기술 …
  company_grade text,                      -- 회사 등급표 S/A/B/C (R3 관리, null = 미분류)
  aliases       jsonb not null default '[]'::jsonb  -- 검색 동의어
);

alter table certifications enable row level security;
create policy "anon read certifications" on certifications for select to anon using (true);
-- R3 등급표 편집(쓰기)은 P2에서 정책 추가

insert into certifications (id, name, issuer, category, company_grade, aliases) values
  ('C001', 'AWS Solutions Architect Professional', 'Amazon', '클라우드', 'S', '["AWS SAP","솔루션스아키텍트"]'::jsonb),
  ('C002', 'AWS Solutions Architect Associate', 'Amazon', '클라우드', 'A', '["AWS SAA"]'::jsonb),
  ('C003', 'CKA (Certified Kubernetes Administrator)', 'CNCF', '클라우드', 'A', '["CKA","쿠버네티스"]'::jsonb),
  ('C004', 'CKAD (Certified Kubernetes Application Developer)', 'CNCF', '클라우드', 'B', '["CKAD"]'::jsonb),
  ('C005', 'PMP (Project Management Professional)', 'PMI', 'PM', 'A', '["PMP","프로젝트관리"]'::jsonb),
  ('C006', '정보처리기사', '한국산업인력공단', '국가기술', 'B', '["정처기"]'::jsonb),
  ('C007', '정보보안기사', '한국산업인력공단', '보안', 'A', '["보안기사"]'::jsonb),
  ('C008', 'CISSP', 'ISC2', '보안', 'S', '["씨습"]'::jsonb),
  ('C009', 'CISA', 'ISACA', '보안', 'A', '["감사사"]'::jsonb),
  ('C010', 'SQLD (SQL 개발자)', '한국데이터산업진흥원', '데이터', 'C', '["SQLD"]'::jsonb),
  ('C011', 'SQLP (SQL 전문가)', '한국데이터산업진흥원', '데이터', 'A', '["SQLP"]'::jsonb),
  ('C012', 'ADsP (데이터분석 준전문가)', '한국데이터산업진흥원', '데이터', 'C', '["ADsP","데이터분석"]'::jsonb),
  ('C013', 'ADP (데이터분석 전문가)', '한국데이터산업진흥원', '데이터', 'S', '["ADP"]'::jsonb),
  ('C014', 'OCP (Oracle Certified Professional)', 'Oracle', '데이터', 'B', '["OCP","오라클"]'::jsonb),
  ('C015', '네트워크관리사 2급', 'ICQA', '인프라', null, '["네관사"]'::jsonb),
  ('C016', '리눅스마스터 1급', 'KAIT', '인프라', 'B', '["리눅스"]'::jsonb),
  ('C017', 'TOPCIT', 'IITP', '개발', null, '["탑싯"]'::jsonb),
  ('C018', 'Azure Administrator Associate', 'Microsoft', '클라우드', 'B', '["AZ-104","애저"]'::jsonb);
