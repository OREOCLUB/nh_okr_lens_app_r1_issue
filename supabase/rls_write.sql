-- ============================================================
-- OKR LENS — 쓰기 RLS 정책 (프로토타입 개방형)
-- schema.sql 실행 후, R1 제출·진행률 쓰기 기능을 쓰려면 이 파일을
-- Supabase SQL Editor에서 1회 실행.
--
-- 프로토타입 전제: 더미 데이터만 적재 + 단일 anon 키 사용 (빌드스펙 D1).
-- 사용자별 인증·행 단위 RLS는 P2 (사내 SSO 연동 시 재설계).
-- ============================================================

-- R1 위저드 제출: okrs 교체(delete→insert) + 진행률 update
create policy "anon insert okrs" on okrs for insert to anon with check (true);
create policy "anon update okrs" on okrs for update to anon using (true) with check (true);
create policy "anon delete okrs" on okrs for delete to anon using (true);

-- 제출 현황 upsert (R2 팀원 리스트 반영)
create policy "anon insert okr_submissions" on okr_submissions for insert to anon with check (true);
create policy "anon update okr_submissions" on okr_submissions for update to anon using (true) with check (true);
