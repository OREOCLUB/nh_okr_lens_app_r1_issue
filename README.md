# OKR LENS

> **성과를 연결하고, 성장을 가속화합니다.**
>
> OKR 기반 평가와 AI 코칭으로 더 공정한 평가, 더 의미 있는 성장을 지원하는 **사내 서비스**. 2026 OKR 기반 개인평가제도를 처음 운영하는 IT 조직을 위한 **3역할 도구** — KR을 잘 쓰게(피평가자) → 잘 검토·승인하게(평가자) → 전사 품질·표준을 관리하게(인사담당자).

이 저장소는 **Next.js(App Router) 프로토타입 웹 애플리케이션**입니다. 인증·데이터는 아직 목업(더미) 단계이며, 화면 흐름과 UX 검증에 초점을 둡니다.

---

## 기술 스택

| 영역 | 사용 기술 |
|------|-----------|
| 프레임워크 | **Next.js 16** (App Router · Turbopack) |
| 언어 · UI | **React 19**, **TypeScript 5** |
| 스타일 | **Tailwind CSS 4** (`@tailwindcss/postcss`) + 인라인 스타일 토큰 |
| 폰트 | Pretendard (본문/UI) · JetBrains Mono (KR ID·수치·날짜) — `fonts/` |
| 데이터 (예정) | **Supabase** (`@supabase/supabase-js` 의존성 · 아직 미연동) |

> ⚠️ **Next.js 버전 주의**: 이 프로젝트의 Next.js는 학습 데이터와 다른 API·규칙을 가질 수 있습니다. 코드 작성 전 `node_modules/next/dist/docs/`의 관련 문서와 deprecation 안내를 먼저 확인하세요. (자세한 내용은 [`AGENTS.md`](./AGENTS.md))

---

## 시작하기

```bash
# 1) 의존성 설치
npm install

# 2) 개발 서버 (기본 http://localhost:3000, 사용 중이면 자동으로 3001)
npm run dev

# 3) 프로덕션 빌드 / 실행
npm run build
npm run start
```

### 환경 변수 (`.env.local`)

Supabase 연동(P2)을 위한 키. 현재 코드는 아직 참조하지 않으므로 프로토타입 실행에는 **필수가 아닙니다**.

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 프로젝트 구조

```
OKR_LENS/
├── src/
│   ├── app/                     ← App Router 라우트
│   │   ├── page.tsx             ← 로그인 (계정 선택)
│   │   ├── layout.tsx · globals.css
│   │   ├── role-select/         ← 역할 선택
│   │   ├── r1/                  ← 🔵 피평가자
│   │   │   ├── page.tsx (홈) · my-okr · coaching · calendar
│   │   │   ├── feedback · history · mypage
│   │   │   └── write/           ← OKR 작성 8단계 위저드
│   │   │       ├── page.tsx     ← 오케스트레이터(스텝 상태·네비)
│   │   │       └── _steps/      ← STEP 0~7 컴포넌트 + shared.tsx
│   │   ├── r2/                  ← 🟢 평가자 (review · member · calendar · feedback · history)
│   │   └── r3/                  ← 🟠 인사담당자 (criteria · master · metrics · env · export · schedule)
│   │
│   ├── components/              ← Button · Logo · Sidebar · RoleShell(셸) · StatCard
│   └── lib/
│       ├── auth.ts             ← 프로토타입 인증(localStorage) + 더미 계정
│       ├── criteria.ts         ← 평가 기준 단일 소스(SSOT) — R1·R2·R3 공유
│       └── mockData.ts         ← 프로토타입 더미 데이터
│
├── design-reference/            ← 디자인 원본(HTML 목업·빌드스펙·디자인 시스템)
├── fonts/ · public/
└── AGENTS.md / CLAUDE.md         ← 에이전트·기여 지침
```

> `_steps/`처럼 `_` 로 시작하는 폴더는 Next.js App Router의 **private 폴더**로 라우팅에서 제외됩니다(URL이 생기지 않음).

---

## 화면 · 라우트 맵

| 역할 | 라우트 | 화면 |
|------|--------|------|
| 진입 | `/` · `/role-select` | 로그인(계정 선택) · 역할 선택 |
| **R1 피평가자** 🔵 | `/r1` | 홈 |
| | `/r1/write` | **OKR 작성 위저드 (STEP 0~7)** |
| | `/r1/my-okr` · `/r1/coaching` | 나의 OKR · AI 코칭 |
| | `/r1/calendar` · `/r1/feedback` · `/r1/history` · `/r1/mypage` | 캘린더 · 피드백 · 이전 평가 · 마이페이지(프로필) |
| **R2 평가자** 🟢 | `/r2` | 대시보드 |
| | `/r2/review` · `/r2/member` | OKR 검토(AI Validation) · 팀원 관리 |
| | `/r2/calendar` · `/r2/feedback` · `/r2/history` | 코칭 캘린더 · 피드백 · 이전 평가 |
| **R3 인사담당자** 🟠 | `/r3` | 콘솔/인사이트 |
| | `/r3/criteria` · `/r3/master` · `/r3/metrics` | 평가 기준 · 마스터 데이터 · 표준 지표 |
| | `/r3/env` · `/r3/export` · `/r3/schedule` | 환경 설정 · 산출물 · 일정 관리 |

### OKR 작성 위저드 (R1 · 8단계)

`/r1/write` 는 목업 명세를 그대로 옮긴 8단계 위저드입니다. 각 스텝은 `src/app/r1/write/_steps/` 에 분리되어 있습니다.

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

---

## 인증 (프로토타입)

실제 SSO 대신 **로그인 화면에서 더미 계정을 선택**하면 `localStorage`에 세션이 저장됩니다(`src/lib/auth.ts`). 선택한 계정의 역할(R1/R2/R3)에 따라 해당 홈으로 이동하고, `RoleShell`이 역할 불일치 시 접근을 차단합니다.

| 역할 | 예시 계정 |
|------|-----------|
| R1 피평가자 | 정태영 · 김수련 · 이지원 |
| R2 평가자 | 박정훈 · 최민경 |
| R3 인사담당자 | 한지영 |

> 정식 SSO 연동은 P2 과제입니다.

---

## 핵심 도메인 개념

- **KR 형태**: 마일스톤 · 수치 · 루브릭 · 이산
- **승인 상태**: `작성중 → 제출 → (승인 | 반려 | 조정요청)`
- **위험도**: 11항목 체크리스트 → 하 / 중 / 상 (코칭 후보)
- **난이도**: 상 / 중 / 하 (가중 1.2 / 1.0 / 0.8)
- **등급**: S / A / B / C / D (강제배분)
- **비중**: 운영 40 · 전략혁신 40 · 사후평가 20 (KR 점수 상한 110%)

이 값들의 **단일 소스는 `src/lib/criteria.ts`** 입니다. R3가 정의하고 R1(작성 가이드)·R2(AI Validation)가 같은 소스를 참조하도록 설계되어, 한 곳을 바꾸면 전 역할 화면에 반영됩니다. Supabase 연동 시 그대로 `criteria_*` 테이블로 이관합니다.

---

## 디자인 레퍼런스

`design-reference/` 에 원본 산출물이 보존되어 있습니다. UI를 수정할 때 **이곳이 단일 진실 소스**입니다.

- `design-reference/source/okr_lens_통합_빌드스펙_v3.md` — R1·R2·R3 통합 빌드스펙(기능 명세)
- `design-reference/standalone/` — 화면별 목업 HTML (OKR 작성 STEP 0~7 등)
- `design-reference/ui_kits/web/` — 역할별 UI 킷
- `design-reference/preview/` — 디자인 시스템(컬러·타이포·컴포넌트) 미리보기

### 디자인 토큰 (요약)

- **브랜드**: 딥 잉크 `#0A1F17` + 그린 액센트 `#00A968` (사이드바·로고·CTA)
- **역할 컬러**: R1 블루 `#3B5BDB` · R2 그린 `#00A968` · R3 오렌지 `#E07A3C`
- **톤**: "위반/잘못"이 아니라 **코칭·기준 통일·함께 정제**하는 친근한 존댓말 SaaS 톤
- 카드 radius 14px(기본)/20px(hero), 배지 999px, 넉넉한 여백

---

## 로드맵 (P2 이후)

- Supabase 연동 — 실제 데이터·RLS·저장(현재 더미 데이터/`localStorage`)
- 사내 SSO 인증 연동
- STEP 6 멀티 AI(Claude·GPT·Gemini) 실 API 교차검증(현재 목데이터)
- R2 AI Validation·연말 증빙 검증, R3 산출물 내보내기·등급분포 시뮬레이션
