# OKR LENS — 제품 명세 (spec.md)

> **성과를 연결하고, 성장을 가속화합니다.**
>
> OKR 기반 개인평가제도를 처음 운영하는 IT 조직을 위한 **3역할 사내 도구**.
> KR을 **잘 쓰게(R1 피평가자) → 잘 검토·승인하게(R2 평가자) → 전사 품질·표준을 관리하게(R3 인사담당자)**.

이 문서는 현재 저장소에 구현된 **Next.js(App Router) 프로토타입**의 기능·구조·도메인 명세입니다.
UI/기능의 원본 진실 소스는 [`design-reference/`](./design-reference/)이며, 이 문서는 그 명세와 실제 구현을 정합시킨 요약본입니다.

---

## 1. 목적 · 배경

- **문제**: 2026년 OKR 기반 개인평가제도를 처음 도입하는 IT 조직(직원 550명+, 팀장 50명+, 인사담당 1명)에서
  - 직원은 KR 문장·측정가능성·도전성 판단이 막막하고,
  - 팀장은 복잡한 작성 기준(운영/전략, 체크 11항목, KR 4~6개)으로 승인 시 위반 판단이 어렵고,
  - 인사담당자는 전 직원 KR을 일관되게 검토하거나 이의제기 위험을 사전 식별할 도구가 없다.
- **해결**: 입력만 하면 초안·정제·확정을 돕는 **AI 코칭 작성 위저드(R1)**, 근거 있는 **AI 사전검토·승인(R2)**, 전사 **인사이트·기준 통일·표준 축적(R3)**.
- **톤**: "위반/잘못"을 지적하지 않고 **코칭·기준 통일·함께 정제**하는 친근한 존댓말 SaaS 톤.

### 현재 단계 (범위 전제)

- 인증·데이터는 **목업(더미) 단계**. 화면 흐름과 UX 검증에 초점.
- 인증은 **더미 계정 선택 + `localStorage` 세션** (실 SSO는 P2).
- 데이터는 `src/lib/mockData.ts` 더미 (Supabase 연동은 P2).
- 멀티 AI 교차검증(Claude·GPT·Gemini)은 목데이터 (실 API는 P2).

---

## 2. 기술 스택

| 영역 | 사용 기술 |
|------|-----------|
| 프레임워크 | **Next.js 16.2** (App Router · Turbopack) |
| 언어 · UI | **React 19**, **TypeScript 5** |
| 스타일 | **Tailwind CSS 4** (`@tailwindcss/postcss`) + 인라인 스타일 토큰 |
| 폰트 | Pretendard (본문/UI) · JetBrains Mono (KR ID·수치·날짜) — `fonts/` |
| 상태 | React `useState` / props (UI 상태) |
| 데이터 (예정) | **Supabase** (`@supabase/supabase-js` 의존성 존재 · 아직 미연동) |

> ⚠️ **Next.js 버전 주의**: 이 프로젝트의 Next.js는 학습 데이터와 다른 API·규칙을 가질 수 있습니다.
> 코드 작성 전 `node_modules/next/dist/docs/`의 관련 문서와 deprecation 안내를 먼저 확인하세요 ([`AGENTS.md`](./AGENTS.md)).

### 구동

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (기본 http://localhost:3000, 점유 시 3001)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 실행
```

환경 변수(`.env.local`)는 Supabase 연동(P2)용이며, 현재 코드가 참조하지 않아 프로토타입 실행에는 **불필요**합니다.

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 3. 아키텍처 · 프로젝트 구조

```
OKR_LENS/
├── src/
│   ├── app/                     ← App Router 라우트
│   │   ├── page.tsx             ← 로그인 (더미 계정 선택)
│   │   ├── layout.tsx · globals.css
│   │   ├── role-select/         ← 역할 선택
│   │   ├── r1/                  ← 🔵 피평가자
│   │   │   ├── page.tsx (홈) · my-okr · coaching · calendar
│   │   │   ├── feedback · history · mypage
│   │   │   └── write/           ← OKR 작성 8단계 위저드
│   │   │       ├── page.tsx     ← 오케스트레이터(스텝 상태·네비)
│   │   │       └── _steps/      ← Step0~7 컴포넌트 + shared.tsx
│   │   ├── r2/                  ← 🟢 평가자 (review · member · calendar · feedback · history)
│   │   └── r3/                  ← 🟠 인사담당자 (criteria · master · metrics · env · export · schedule)
│   │
│   ├── components/              ← Button · Logo · Sidebar · RoleShell(셸) · StatCard
│   └── lib/
│       ├── auth.ts             ← 프로토타입 인증(localStorage) + 더미 계정 6명
│       ├── criteria.ts         ← 평가 기준 단일 소스(SSOT) — R1·R2·R3 공유
│       └── mockData.ts         ← 프로토타입 더미 데이터
│
├── design-reference/            ← 디자인 원본(HTML 목업·빌드스펙·디자인 시스템) — UI 수정의 진실 소스
├── fonts/ · public/
└── AGENTS.md / CLAUDE.md         ← 에이전트·기여 지침
```

- `_steps/`처럼 `_`로 시작하는 폴더는 App Router **private 폴더**로 라우팅에서 제외됩니다(URL 없음).
- **`RoleShell`** 컴포넌트가 공통 셸(사이드바 + 역할 가드)을 담당하여, 현재 세션 역할과 라우트 역할이 불일치하면 접근을 차단합니다.

---

## 4. 역할 · 화면 · 라우트 맵

| 역할 | 라우트 | 화면 |
|------|--------|------|
| 진입 | `/` · `/role-select` | 로그인(계정 선택) · 역할 선택 |
| **R1 피평가자** 🔵 | `/r1` | 홈 |
| | `/r1/write` | **OKR 작성 위저드 (STEP 0~7)** |
| | `/r1/my-okr` · `/r1/coaching` | 나의 OKR · AI 코칭 |
| | `/r1/calendar` · `/r1/feedback` · `/r1/history` · `/r1/mypage` | 캘린더 · 피드백 · 이전 평가 · 마이페이지 |
| **R2 평가자** 🟢 | `/r2` | 대시보드 |
| | `/r2/review` · `/r2/member` | OKR 검토(AI Validation) · 팀원 관리 |
| | `/r2/calendar` · `/r2/feedback` · `/r2/history` | 코칭 캘린더 · 피드백 · 이전 평가 |
| **R3 인사담당자** 🟠 | `/r3` | 콘솔/인사이트 |
| | `/r3/criteria` · `/r3/master` · `/r3/metrics` | 평가 기준 · 마스터 데이터 · 표준 지표 |
| | `/r3/env` · `/r3/export` · `/r3/schedule` | 환경 설정 · 산출물 · 일정 관리 |

### R1 — OKR 작성 위저드 (8단계)

`/r1/write`는 목업 명세를 그대로 옮긴 8단계 위저드입니다. 각 스텝은 `src/app/r1/write/_steps/`에 분리되어 있고, `page.tsx`가 스텝 상태·네비게이션을 오케스트레이션합니다.

| STEP | 내용 |
|------|------|
| 0 프로필 세팅 | 조직·직렬·근속·자격증(AI 추천)·약관 동의 입력 |
| 1 OKR 유형 | 운영 / 전략혁신 선택 |
| 2 기초 정보 | **대화형 / 직접작성 2채널** + AI 코치 채팅 + 컨텍스트 패널 |
| 3 AI 정제 대화 | 객관성·주관성 검증 + KR 후보 사이드바 + 11항목 사전검토 |
| 4 KR 형태 | 수치·마일스톤·루브릭·이산 4형태 + AI 추천 + 비교표 |
| 5 상세 수립 | 측정 방법 + S/A/B/C/D 등급 기준 + AI 코치 사이드챗 |
| 6 AI 비교 검토 | **Claude·GPT·Gemini 3개 AI** 비교(목데이터) + 의견 채택 |
| 7 최종 수정·제출 | 인라인 편집 + 채택 의견 반영 + 제출 |

### R2 — 검토(MVP 핵심)

- OKR 검토 / 승인 / 반려 / 조정요청 + **AI Validation**(11항목 자동 판정, 평가자 편집 가능)
- 작년 OKR 팝업, 반려 이력, 팀원 관리

### R3 — 인사이트·표준(전면)

- 전사 인사이트 콘솔, **평가 기준 관리**(criteria SSOT), 마스터 데이터, 표준 지표 라이브러리, 환경 설정, 산출물 내보내기, 일정 관리

---

## 5. 인증 (프로토타입)

실제 SSO 대신 **로그인 화면에서 더미 계정을 선택**하면 `localStorage`(`okrlens_current_user`)에 세션이 저장됩니다(`src/lib/auth.ts`). 선택한 계정의 역할(R1/R2/R3)에 따라 해당 홈으로 이동하고, `RoleShell`이 역할 불일치 시 접근을 차단합니다.

| 역할 | 예시 계정 |
|------|-----------|
| R1 피평가자 | 정태영 · 김수련 · 이지원 |
| R2 평가자 | 박정훈 · 최민경 |
| R3 인사담당자 | 한지영 |

각 계정은 `id · name · role · dept · team · grade · jobSeries · avatarColor` 필드를 가집니다. 정식 SSO·사용자별 RLS는 **P2** 과제입니다.

---

## 6. 핵심 도메인 개념

- **KR 형태**: 마일스톤 · 수치 · 루브릭 · 이산
- **승인 상태**: `작성중 → 제출 → (승인 | 반려 | 조정요청)`
- **위험도**: 11항목 체크리스트 → 하 / 중 / 상 (임계값 `{중:2, 상:4}` 위반 건수 기준, 코칭 후보)
- **난이도**: 상 / 중 / 하 (가중 1.2 / 1.0 / 0.8)
- **등급**: S / A / B / C / D (강제배분 5·10·75·10, D는 수동 배정)
- **비중**: 운영 40 · 전략혁신 40 · 사후평가 20 (KR 점수 상한 110%)
- **KR 개수**: 4~6개
- **제외 기준**: 반응형(장애대응형) 유지보수는 OKR 대상 제외, 능동적 개선만 인정

### 단일 진실 소스 (SSOT) — `src/lib/criteria.ts`

위 값들의 단일 소스는 `criteria.ts`입니다. **R3가 정의하고 R1(작성 가이드)·R2(AI Validation)가 같은 소스를 참조**하도록 설계되어, 한 곳을 바꾸면 전 역할 화면에 반영됩니다. 구성:

1. **`evalSystem`** — 비중·가중치·강제배분·점수상한·제외기준·KR 개수 범위
2. **`taxonomy`** — 분류체계 4종
   - **업무군**(9): 실무 도메인(bottom-up) — 캘리브레이션 공정 비교 축
   - **BSC 카테고리**(10): 경영 전략 관점(top-down) — 전략 균형 점검 축
   - **KR 유형**(4): 측정 방식 — R1 위저드 KR 형태 선택지로 노출
   - **직무체계/직렬**(SE·PM·SI·SM): 사원 마스터 직렬 필드와 연결
3. **`checklist`** — R2 AI Validation이 자동 판정하는 **11개 문항**(각 문항은 위반 시 부착되는 위험 태그 보유. 예: `측정모호`·`통제불가`·`도전성저하`·`자기보고형`·`고위험실행`)

Supabase 연동 시 이 구조를 그대로 `criteria_*` 테이블로 이관합니다.

---

## 7. 디자인 레퍼런스 · 토큰

`design-reference/`에 원본 산출물이 보존되어 있으며, **UI 수정 시 이곳이 단일 진실 소스**입니다.

- `design-reference/source/okr_lens_통합_빌드스펙_v3.md` — R1·R2·R3 통합 빌드스펙(기능 명세 + 의사결정 로그)
- `design-reference/standalone/` — 화면별 목업 HTML (OKR 작성 STEP 0~7 등)
- `design-reference/ui_kits/web/` — 역할별 UI 킷
- `design-reference/preview/` — 디자인 시스템(컬러·타이포·컴포넌트) 미리보기

### 디자인 토큰 (요약)

- **브랜드**: 딥 잉크 `#0A1F17` + 그린 액센트 `#00A968` (사이드바·로고·CTA)
- **역할 컬러**: R1 블루 `#3B5BDB` · R2 그린 `#00A968` · R3 오렌지 `#E07A3C`
- **형태**: 카드 radius 14px(기본)/20px(hero), 배지 999px, 넉넉한 여백
- **폰트**: 본문/UI Pretendard, KR ID·수치·날짜 JetBrains Mono

---

## 8. 로드맵 (P2 이후)

- **Supabase 연동** — 실제 데이터·RLS·저장 (현재 더미 데이터 / `localStorage`). 접근은 `dataAccess` 래퍼 단일 지점 경유로 DB 교체 대비.
- **사내 SSO 인증** 연동 및 사용자별 RLS
- **STEP 6 멀티 AI** (Claude·GPT·Gemini) 실 API 교차검증 (현재 목데이터, MVP는 단일 Claude 전제)
- **R2** AI Validation·연말 증빙 검증 고도화
- **R3** 산출물 내보내기·등급분포 시뮬레이션

### 데이터 보안 전제

프로토타입(Supabase·Vercel 등 외부 클라우드)에는 **더미 데이터만** 적재합니다. 실 인사데이터의 외부 클라우드 반입은 **별도 보안 검토** 사항입니다.
