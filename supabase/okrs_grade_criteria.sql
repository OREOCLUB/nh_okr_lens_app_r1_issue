-- ============================================================
-- OKR LENS — okrs.grade_criteria 컬럼 추가 (P0-1 제출 데이터 완전화)
-- Supabase SQL Editor에서 1회 실행.
--
-- R1 위저드 STEP 5에서 확정한 S/A/B/C/D 등급 기준을 제출 시 함께 저장한다.
-- R2 검토·연말 평가에서 등급 판정 근거로 사용 (스펙 D-1 KRSchema.grade_criteria).
-- okr_history 쓰기(제출/재제출 이벤트)용 정책도 함께 추가.
-- ============================================================

alter table okrs add column if not exists grade_criteria jsonb; -- { "S": "...", "A": "...", ... }

-- R1 제출 이벤트 기록 (okr_history — R2 반려 이력 타임라인 연결)
create policy "anon insert okr_history" on okr_history for insert to anon with check (true);
