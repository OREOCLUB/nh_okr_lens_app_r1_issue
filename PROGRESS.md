# PROGRESS

> 세션 간 작업 인수인계 문서.
> 매 세션 종료 시 Claude에게 **"오늘 세션에서 한 작업을 PROGRESS.md에 정리해줘"** 라고 요청하고,
> 다음 세션 시작 시 **"PROGRESS.md 읽고 이어서 작업하자"** 라고 요청하면 됩니다.
> 최신 세션이 항상 맨 위에 오도록 기록합니다.

---

## 2026-07-03 (R2 요건 구현 세션)

> 기준 문서: `R2_REQUIREMENTS.md` — 4단계 커밋 단위로 진행.

### 완료
- **R2 1단계 — 쓰기 기반 마련**
  - `supabase/migration_r2_write.sql` 신규 — 기존 프로젝트용 (컬럼 추가·쓰기 RLS·시드)
  - `supabase/schema.sql` 동기화 — okr_submissions(evaluator_msg·decided_at·risk_analysis), okrs(difficulty·measure·plan), okr_history(작년 OKR·타임라인 컬럼), anon update 정책 2건, 팀원 OKR·작년 OKR·반려 이벤트 시드
  - `src/lib/dataAccess.ts` — getMemberOkrs/getMemberHistory/getMemberEvents 조회 + saveReviewDecision(D9 통합형)/saveReviewDraft 쓰기. Supabase 미설정 시 `{ok:false, error:"NO_DB"}` 반환 → 화면 데모 모드 폴백

### 이슈/결정사항 (이번 세션)
- **`.env.local`이 현재 체크아웃에 없음** (gitignore 대상) → REST 왕복 검증 보류. 복구 후 `supabase/migration_r2_write.sql`을 SQL Editor에서 1회 실행해야 쓰기 동작
- 문서의 `okrs.approval_status`·`risk_analysis`는 실제 스키마에 없어 `okr_submissions.status`(처리 상태) + `okr_submissions.risk_analysis`(신규 jsonb)로 구현. R1 연쇄는 okrs.status(approved/rejected 매핑) + evaluator_msg로 성립
- 반려 이력 타임라인·작년 OKR은 D6대로 `okr_history` 확장(event 컬럼)으로 단일 소스화

---

## 2026-07-03

### 완료
- README를 Next.js 앱 기준으로 재작성 (`415f25d`)
- R1 OKR 작성 위저드를 전달받은 목업에 맞게 재구축 (`9daa4ca`)
- 제품 명세 문서 `spec.md` 작성 (Next.js 프로토타입 기능·구조·도메인 정리)
- **Supabase 신규 프로젝트 연동 완료 (P2)**
  - `supabase/schema.sql` — R3 화면 변경을 반영한 통합 스키마 11개 테이블 + 더미 시드
    (departments · employees 통합 사원마스터 · okr_submissions · okrs · okr_history · okr_imports · eval_phases · metrics · criteria_* 3종, 전 테이블 RLS anon 읽기 전용)
  - `src/lib/supabase.ts` (클라이언트) · `src/lib/dataAccess.ts` (데이터 접근 단일 지점, 조회 실패 시 더미 폴백)
  - 10개 화면 DB 조회 전환: 로그인, r1 홈, r2 홈/review/feedback/calendar, r3 master/schedule/metrics/criteria
  - `auth.ts`에 `loginAs()` 추가 — DB 사용자 객체로 로그인
  - 사용자 본인 Supabase 프로젝트에 schema.sql 실행·`.env.local` 설정 완료, REST 조회로 연결 검증됨
- **R3 인사담당자 화면 목업** (`design-reference/standalone/`)
  - 수정: 01_인사이트, 02_평가기준, 03_마스터데이터, 04_표준지표, 08_산출물내보내기
  - 신규: 05_평가일정, 06_환경설정 (구 05~13 목업 삭제·재편)

### 다음 할 일
- 쓰기 기능 연동: R3 기준/일정 저장, R2 승인·반려, R1 OKR 제출 (현재 읽기 전용 — 쓰기는 RLS 정책 추가 필요)
- MASTER_RULE.md 준수 점검: 미구현 버튼(alert 처리) 정리, 세션 체크, API 로딩/실패 상태 표시
- 이전 OKR Excel Import 실제 업로드 → `okr_history` 적재 구현

### 이슈/결정사항
- 기존 `.env.local`의 Supabase 주소는 타인 소유 프로젝트였음 → 본인 계정 신규 프로젝트로 교체 (`.env*`는 gitignore)
- 더미 불일치: 정태영이 auth에선 R1, R3 목업에선 R2 → 통합 시드는 로그인 기준 R1로 통일
- 인증은 아직 더미 계정 + `localStorage` 세션 (실 SSO는 P2)
- 멀티 AI 교차검증(Claude·GPT·Gemini)은 목데이터 (실 API는 P2)
