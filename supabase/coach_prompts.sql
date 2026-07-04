-- ============================================================
-- OKR LENS — AI 코치 프롬프트 운영 레이어 (R3 편집·발행)
-- Supabase SQL Editor에서 1회 실행. 미실행 시 앱은
-- localStorage 발행본 → 코드 기본값 순으로 폴백.
--
-- 3-레이어 중 "운영 레이어"만 저장한다:
--   안전 코어(소송 안전·역할 고정)는 /api/coach 코드에 고정 — DB로 오버라이드 불가.
-- 발행할 때마다 새 행 insert → 최신 published_at이 운영본, 과거 행이 버전 이력.
-- ============================================================

create table if not exists coach_prompts (
  id           bigint generated always as identity primary key,
  version      text not null,                 -- 'v2026.07.04-1930'
  config       jsonb not null,                -- persona/closingNote/bannedWords/modes (coachPrompts.ts 구조)
  published_at timestamptz not null default now(),
  published_by text not null default 'R3'
);

alter table coach_prompts enable row level security;
create policy "anon read coach_prompts"   on coach_prompts for select to anon using (true);
create policy "anon insert coach_prompts" on coach_prompts for insert to anon with check (true);
-- 프로토타입 개방 정책 — 사용자별 인증·권한은 P2

-- 초기 발행본 (코드 DEFAULT와 동일)
insert into coach_prompts (version, config, published_by) values
  ('v2026.07.04-초기', '{
    "publishedAt": "2026-07-04T00:00:00Z",
    "publishedBy": "system",
    "persona": "당신은 사내 OKR 작성을 돕는 AI 코치입니다. 친근한 존댓말을 쓰고, 지적하지 않고 함께 정제하는 동료의 톤으로 답합니다. 답변은 한국어로 간결하게(3~6문장), 필요하면 구체적 예시 문장을 제안합니다.",
    "closingNote": "AI 코칭은 참고용 신호이며 평가에 직접 반영되지 않아요.",
    "bannedWords": [
      { "from": "위반", "to": "보완" },
      { "from": "잘못", "to": "함께 정제할 부분" },
      { "from": "부적합", "to": "보완이 필요한" },
      { "from": "오류", "to": "보완 포인트" }
    ],
    "modes": {
      "basic":    { "guide": "지금은 기초 정보 수집 단계입니다. 올해 본업에서 지킬 것/새로 도전할 것을 끌어내는 질문을 하고, 사용자의 답에서 KR 후보가 될 핵심 키워드를 정리해주세요.", "example": "결제 게이트웨이 APM p95 응답속도(월평균)를 850ms → 500ms로 단축" },
      "refine":   { "guide": "지금은 KR 정제 단계입니다. 객관성(통계 단위·측정 도구·집계 주기 명시)과 주관성(근거 없는 목표치·모호한 표현)을 점검하고, 정제 전→후 문장을 제안해주세요.", "example": "결제 인증모듈 단위테스트 커버리지를 65% → 85%로 향상 (회귀 장애 영역 100% 커버)" },
      "grade":    { "guide": "지금은 S/A/B/C/D 등급 기준 수립 단계입니다. A등급이 목표선이며, S는 보통 목표보다 20% 더 좋은 값입니다. 구간이 겹치지 않게 제안해주세요.", "example": "S: ≤400ms / A: ≤500ms / B: 500~650ms / C: 650~800ms / D: ≥800ms" },
      "coaching": { "guide": "지금은 상시 코칭 대화입니다. 진행 중인 KR의 진척 데이터를 근거로 다음 행동을 제안하고, 협업 요청 등 실무 조언을 해주세요.", "example": "병목 재분석 → 캐시 적중률 점검 → 협업 요청 순서로 접근" }
    }
  }'::jsonb, 'system');
