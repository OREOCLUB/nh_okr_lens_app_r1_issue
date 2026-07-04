# PROGRESS

> 세션 간 작업 인수인계 문서.
> 매 세션 종료 시 Claude에게 **"오늘 세션에서 한 작업을 PROGRESS.md에 정리해줘"** 라고 요청하고,
> 다음 세션 시작 시 **"PROGRESS.md 읽고 이어서 작업하자"** 라고 요청하면 됩니다.
> 최신 세션이 항상 맨 위에 오도록 기록합니다.

---

## 2026-07-04 (CR-1/CR-2 롤백 세션)

### 완료
- **롤백**: CR-1(직급·직책 분리)·CR-2(결재요청만 수정)·테스트 데이터 작업분 전체를 `git stash`로 보존 후 워킹 트리를 `d5c807f`로 복원
  - stash: `stash@{0} "CR-1/CR-2 + 테스트데이터 작업분 보존 (2026-07-04 롤백 전)"` — 삭제 아님, 필요 시 조각 복원 가능
- **QA §7 수정 6건 재적용** (R2_QA_REPORT.md §8 기록 기준, CR 변경 제외):
  - REV-02: `review/page.tsx` — 승인 건 열람 전용 (readOnly = approved, 카드/버튼 비활성 + 핸들러 가드 + 코칭 톤 안내)
  - FB-01: `feedback/page.tsx` — 전송분 localStorage(`okrlens_r2_feedback_sent`) 저장·병합 표시
  - CAL-01/02: `calendar/page.tsx` — demoMode `!m || !p`, 부제 `${ym.m}월`
  - REV-04: `review/page.tsx` — Objective 아코디언 접기/펼치기 (기본 펼침, 팀원 변경 시 리셋)
  - DASH-01: 대시보드·검토·캘린더 부제 `user.grade` 사용
- **검증**: `npx tsc --noEmit` 통과, R2 7개 라우트 전부 200

- **평가 라인 분리 (사용자 지시)**: OKR 사상 = R2 1명 → R1 N명 전속, 평가자 간 중복 배정 없음
  - `dataAccess.getMembers(evaluatorLoginId?)` — login_id → 사번 해석 후 `employees.evaluator_id` 필터. R2 4개 화면 모두 `getMembers(user?.id)`로 호출
  - 시드: 박정훈(T0201) 팀 8명 유지 + **최민경(T0301) 전속 팀원 6명 신규** (E1301~E1306, 인프라운영팀 — 제출현황 6건·KR 상세 12건·이력 5건 포함)
- **DB 정리 스크립트**: `supabase/reseed_data.sql` — 오염 5개 테이블(employees·okr_submissions·okrs·okr_history·okr_imports) delete 후 원본+최민경 팀 시드 재적재, CR-1의 employees.title 컬럼 drop 포함. **사용자가 SQL Editor에서 실행** (개인 DB 확인됨). 기대값: employees 26 · submissions 14 · okrs 31 · history 18 · imports 3
- **스키마 문서 정리**: schema.sql(신규 프로젝트용 통합본)에 최민경 팀 시드 반영, schema_R2.sql에 변경 내역 ⑥ 평가 라인 분리·⑦ title 컬럼 롤백 기록

- **후속 수정 2건**: ① 검토 화면 `?member=` 자동 선택을 실데이터 로드 후로 지연 (`47598ea` — 최민경 계정에서 대시보드→검토 이동 시 선택 무효화되던 버그) ② **반려(rejected) 건도 열람 전용** (`c7f600a` — R1이 재결재요청해야 하는 상태라 처리 차단, 상태별 코칭 톤 안내. 조정요청은 처리 가능 유지)
- **머지·배포**: feature/R2 → main 머지 완료 및 양 브랜치 push (`4bfd742` / main `a17cd94`). **schema.sql은 사용자 지시로 main 머지 제외** — 두 브랜치 차이는 schema.sql +43줄(최민경 시드)뿐
- **팀 공용 DB 전환 검증**: .env.local을 팀 DB로 전환(URL 오타 `supabase.conpm`→`.co` 수정). 팀 DB 실조회 결과 초기 스키마 상태 → schema_R2.sql ①~⑥ 전부 필요·누락 없음 확인, 팀 DB에 없는 title drop(⑦)은 파일에서 제거

### 이슈/결정사항
- CR-1(직급·직책 분리)은 **롤백 확정** — title 컬럼 제거, grade 단일 표기로 복귀. CR-2는 일부만 반영된 상태(승인·반려 열람 전용까지. "처리 내용 표시"는 미구현). 재추진 시 stash 참고 가능하나 재구현 권장
- stash: `stash@{0} "CR-1/CR-2 + 테스트데이터 작업분 보존 (2026-07-04 롤백 전)"`
- 개인 DB는 reseed_data.sql 실행 완료(사용자). **팀 공용 DB에는 schema_R2.sql 아직 미실행** — 팀에서 SQL Editor로 1회 실행 필요

### 다음 할 일
1. 팀 공용 DB에 schema_R2.sql 실행 (기대값: employees 26 · submissions 14 · okrs 31 · history 18) 후 화면 확인 (박정훈 8명 / 최민경 6명)
2. §5 수동 확인 체크리스트 재점검 (R1·R3 연쇄 반영 포함)
3. CR-2 잔여분("처리 내용 표시" — evaluator_msg·decided_at 조회 표시) 재추진 여부 결정

---

## 2026-07-03 (R2 요건 구현 세션)

> 기준 문서: `R2_REQUIREMENTS.md` — 4단계 커밋 단위로 진행.

### 완료
- **Gemini 공용 모듈 분리 + 팀 공유 가이드 (`69abda0`)**
  - `src/lib/server/gemini.ts` — 전 역할 공용 코어 (수정 금지, import 전용). R2 라우트는 프롬프트만 보유하도록 리팩토링
  - `docs/GEMINI_GUIDE.md` — R1·R3 담당자가 자기 AI 도구에 그대로 전달하는 연동 가이드 (충돌 방지 규칙 + 완성 예제)
  - 전달 시 별도 공유 필요: ① GEMINI_API_KEY (보안 채널) ② guide_docs/2026_OKR_GUIDE.pdf (gitignore)
- **Supabase 실연결 확인** — 키 등록 확인, 스키마 변경분 적용 확인, 쓰기 왕복(UPDATE→복원) 검증 통과. 스키마 변경분은 `supabase/schema_R2.sql`로 정리
- **Gemini API 실연동 (D2 이행)** — AI Validation·AI 초안이 실제 LLM 판정으로 동작
  - `src/app/api/validate/route.ts` 신규 — 서버 전용 라우트. `GEMINI_API_KEY`(.env.local)는 브라우저에 노출 안 됨
  - 가이드 PDF(`guide_docs/2026_OKR_GUIDE.pdf`, 80p)를 Files API로 1회 업로드·47h 캐시 후 매 요청 동봉 → 판정 사유에 가이드 페이지 근거 인용됨
  - 구조화 출력(responseSchema)으로 항목별 pass/warn/fail + 사유 + 종합 코멘트 JSON 강제, 코칭 톤 시스템 지시
  - `aiValidation.ts` — runValidation이 API 우선, 실패 시 목업 폴백(+안내 문구). ✨AI 초안도 draftMessageAI로 실생성(가이드 근거 포함)
  - 검증: API 직접 호출 14s / UI 판정 23~29s / 초안 12s 모두 gemini 소스 확인, API 차단 프로브 → 목업 폴백 정상
  - `guide_docs/`는 사내 문서라 gitignore 처리 (모델: `GEMINI_MODEL` env로 변경 가능, 기본 gemini-2.5-flash)
- **R2 4단계 — 코칭 캘린더 (`src/app/r2/calendar/page.tsx`)**
  - `eval_phases` 조회 연동(D8) — 하드코딩 EVENTS/MONTH_LIST 제거, 단계 시작/마감/당일 이벤트로 변환
  - 월 이동 ◀▶ + 오늘 버튼 (2026-07 고정 제거, 연도 경계 정상), 빈 달 코칭 톤 안내
  - 이번 달 일정 리스트 = eval_phases 기반, 1on1 미등록 팀원 카드 현행 유지
  - 로딩/데모 폴백 상태, 세션 사용자 부제. Playwright 구동 검증 6스텝 통과
- **R2 3단계 — 평가자 대시보드 재구축 (`src/app/r2/page.tsx`)**
  - 현황 카드 6종(D4: 전체/승인/작성중/결재요청/반려/조정) — 건수>0 강조, 클릭 필터·재클릭 해제
  - 팀원 테이블 컬럼 8개(직급·이름·직군·제출일·상태·AI위험도·코칭등록·액션), 기본 정렬 결재요청>반려>조정>작성중>완료, 헤더 클릭 정렬, 페이징(5행)
  - 행·액션·후보 카드 클릭 → `/r2/review?member={id}` (D1), "검토 화면으로 이동" 실라우팅 (alert 제거)
  - 헤더·부제 세션 사용자 기준 (박정훈 하드코딩 제거), 로딩/데모 폴백 상태 표시
  - Playwright 구동 검증 7스텝 통과
- **R2 2단계 — OKR 검토 화면 재구축 (`src/app/r2/review/page.tsx`)**
  - 좌측: 상태/직급/직군 필터 + 결재요청 우선 정렬, 팀원 클릭 → 중앙 실데이터 바인딩 (강동우 하드코딩 제거)
  - 중앙: Objective별 OKR 그룹(측정방법·난이도·실행계획), criteria 테이블 기반 AI Validation(항목 수 가변), 작년 OKR 팝업(연도 탭 + 💡 자동 코멘트), 반려 이력 타임라인
  - 우측: 처리 3택 + 메시지 필수 validation + ✨AI 초안, 승인 즉시/반려·조정 Confirm(D7), 처리 시 risk_analysis+status 동시 저장(D9) 후 다음 대상 자동 이동, 임시 저장·복원
  - `src/lib/aiValidation.ts` 신규 — 목업 판정 단일 지점 (P2에 Gemini API로 본문만 교체)
  - `src/lib/mockReview.ts` 신규 — 시드와 동일한 더미 폴백. `Button`에 disabled 추가
  - Playwright 구동 검증 11스텝 통과 (딥링크 D1·Confirm D7·validation·자동이동·데모 폴백)
- **R2 1단계 — 쓰기 기반 마련**
  - `supabase/migration_r2_write.sql` 신규 — 기존 프로젝트용 (컬럼 추가·쓰기 RLS·시드)
  - `supabase/schema.sql` 동기화 — okr_submissions(evaluator_msg·decided_at·risk_analysis), okrs(difficulty·measure·plan), okr_history(작년 OKR·타임라인 컬럼), anon update 정책 2건, 팀원 OKR·작년 OKR·반려 이벤트 시드
  - `src/lib/dataAccess.ts` — getMemberOkrs/getMemberHistory/getMemberEvents 조회 + saveReviewDecision(D9 통합형)/saveReviewDraft 쓰기. Supabase 미설정 시 `{ok:false, error:"NO_DB"}` 반환 → 화면 데모 모드 폴백

### 다음 할 일 (R2 관련)
1. Supabase 키를 `.env.local`에 추가 + `supabase/migration_r2_write.sql` 실행 → 승인/반려 실 DB 왕복 + R1 홈 연쇄(D3) 검증
2. ~~Gemini API 연동 (D2)~~ → **완료** (아래 참조). 남은 것: 판정 지연(20~30s) UX 개선 검토(스트리밍/부분 표시), 쿼터·비용 모니터링
3. R3 인사이트 화면이 okr_submissions 실데이터를 읽도록 전환되면 연쇄 최종 확인 (R3 담당 영역)

### 이슈/결정사항 (이번 세션)
- **`.env.local`이 현재 체크아웃에 없음** (gitignore 대상) → REST 왕복 검증 보류. 복구 후 `supabase/migration_r2_write.sql`을 SQL Editor에서 1회 실행해야 쓰기 동작
- 문서의 `okrs.approval_status`·`risk_analysis`는 실제 스키마에 없어 `okr_submissions.status`(처리 상태) + `okr_submissions.risk_analysis`(신규 jsonb)로 구현. R1 연쇄는 okrs.status(approved/rejected 매핑) + evaluator_msg로 성립
- 반려 이력 타임라인·작년 OKR은 D6대로 `okr_history` 확장(event 컬럼)으로 단일 소스화

---

## 2026-07-04 — AI 코치 관리(R3 편집형 프롬프트) + 팀 머지 정합

### 완료
- **AI 코치 프롬프트 3-레이어 체계**
  - ① 안전 코어(코드 고정 — 소송 안전·역할 고정·출력 규칙, `/api/coach` SAFETY_CORE)
  - ② 운영 레이어(R3 편집): `src/lib/coachPrompts.ts` — 페르소나·스텝별 지침·few-shot 예시·금칙어 사전, localStorage 발행/이력(최근 10), `supabase/coach_prompts.sql`(버전드 발행 테이블)
  - ③ 컨텍스트(자동 주입): 사용자 프로필·KR 목록
- **R3 "AI 코치 관리" 화면** (`/r3/coach` + 사이드바 메뉴): 편집 → 미리보기 테스트(발행 전 초안으로 실호출) → 발행(버전 자동 부여, localStorage 즉시 + DB 시도) → 버전 이력·롤백(불러오기 후 재발행)
- `/api/coach` 개편: 3-레이어 조립, 운영 레이어 우선순위(요청 발행본 → DB → 기본값), 응답 금칙어 후처리(claude·목 공통), `promptVersion` 반환
- `aiCoach.ts`: R3 발행본을 요청에 자동 첨부 → 같은 브라우저에서 R3 발행 → R1 코치 즉시 반영 데모 성립
- **팀 머지 정합**: R2 작업 머지로 `WriteResult`가 `{ok, error?}`로 변경됨 → `recallOkrs`·write/my-okr 호출부 마이그레이션 (머지 직후 빌드 깨짐 복구)

### 다음 할 일
- 코치 구조화 출력(tool use) — 정제 카드 BEFORE/AFTER·키워드·등급 초안을 LLM 실출력으로
- coach_prompts R3 편집 권한 정책(P2 인증 후), 발행 승인 워크플로
- (기존 유지) .env.local 실 키, rls_write.sql/certifications.sql/coach_prompts.sql 실행

---

## 2026-07-03 (세션 2) — R1 피평가자 전면 실기능 전환

### 완료
- **위저드 기반 레이어 신설**
  - `src/lib/wizard.ts` — 위저드 상태 단일 소스(WizardState) + localStorage 사용자별 임시저장/복원 + 스텝 진행 검증(stepBlocker)
  - `src/lib/diagnosticEngine.ts` — criteria 주입 룰 기반 진단 코어(deriveChecks/deriveRisk, 빌드스펙 D-3·D-4 — 항목 수·임계값 하드코딩 없음)
  - `src/lib/aiCoach.ts` + `src/app/api/coach/route.ts` — AI 코치 단일 엔드포인트. ANTHROPIC_API_KEY 있으면 Claude(claude-sonnet-4-6) 호출, 없으면 결정적 목 폴백 (`source: claude|mock`)
  - `dataAccess.ts` — 쓰기 함수 추가: `submitOkrs()`(okrs 교체 + okr_submissions upsert), `updateOkrProgress()`. DB 미연결 시 `saved:"local"` 반환
  - `supabase/rls_write.sql` — okrs·okr_submissions anon 쓰기 정책 (Supabase SQL Editor에서 1회 실행 필요)
- **위저드 STEP 0~7 목업 → 실기능**
  - `write/page.tsx` 오케스트레이터: 세션 사용자 반영, 상태 소유·자동 임시저장, 스텝 검증(필수 약관·업무분장·형태·A등급), maxStep 기반 점프 제한, 제출 확인→Supabase 쓰기→홈 이동 (실패 시 로컬 보존 + 코칭 톤 안내)
  - Step0 프로필 / Step1 유형(criteria 비중 표기) / Step2 기초정보(실 AI 채팅+키워드 자동 추출) / Step3 정제(실 AI 채팅 + criteria 11항목 실시간 진단) / Step4 형태(결정적 추천+일괄 적용) / Step5 상세(측정방법·가중치·등급 입력 + AI 자동생성 + 사이드챗) / Step6 비교검토(채택→상태 저장, 멀티 AI는 목데이터 유지 = P2) / Step7 최종(인라인 편집→상태 저장, 가중치 상한·미채택 실검증)
- **R1 화면 MASTER_RULE 준수 정리** ("준비 중" alert 전부 제거)
  - 홈: 세션 사용자·D-day 계산·위저드 진행 반영 CTA·통계 실계산·로딩 표시
  - 나의 OKR: DB 데이터 + 진행률 업데이트 모달(DB 쓰기+폴백), KR수정/AI코칭 라우팅
  - 코칭: 주제별 실 AI 채팅 + 새 코칭 시작 / 피드백: 답글 실동작·읽음 처리 / 이력: 회고 펼침 / 마이페이지: 위저드 프로필과 저장소 공유·실저장 / 캘린더: 코칭 요청 등록
- `npx tsc --noEmit` · `npm run build` 통과, dev 서버에서 /r1/write·/api/coach 스모크 테스트 완료

### 다음 할 일
- `.env.local` 실 키 설정 (이 PC에는 Supabase·Claude 키 없음 → 현재 더미 폴백/목 AI 모드로 동작. 키 넣으면 즉시 실연동)
- Supabase에 `supabase/rls_write.sql` 실행 → R1 제출·진행률 쓰기 활성화
- R2 승인·반려 쓰기, R3 기준/일정 저장 (기존 계획 유지)
- STEP 3 정제 대화 → KR 문장 자동 반영(정제안 적용 버튼), STEP 6 실 Claude 검토 연동
>>>>>>> 9560fd8 (feat(r1): 피평가자 전면 실기능 전환 — 위저드 상태·AI 코치·제출·진단 엔진)

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
