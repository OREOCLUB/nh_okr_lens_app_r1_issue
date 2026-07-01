# OKR LENS Design System

> **OKR LENS** — 사내 OKR 평가·코칭 AI 서비스의 디자인 시스템.
>
> 2026 OKR 기반 개인평가제도를 처음 운영하는 IT 조직을 돕는 **3역할 도구** — KR을 잘 쓰게(피평가자) → 잘 검토·승인하게(평가자) → 전사 품질·위험을 보고 표준을 키우게(인사담당자).

---

## 🚀 시작 가이드 (팀원용)

압축을 풀고 아래 두 파일 중 하나를 **더블클릭**해서 열어주세요. 별도 설치 없이 브라우저에서 바로 열립니다.

### ① 전체 화면을 한눈에 보고 싶다면 ⭐ 추천
**`preview-all.html`**
- 모든 화면(14개)을 카드 형식으로 한눈에 확인
- 각 카드 클릭 시 해당 화면으로 이동
- 역할별(피평가자 / 평가자 / 인사담당자) 그룹핑

### ② 실제 사용자 흐름대로 체험하고 싶다면
**`ui_kits/web/index.html`**
- 로그인(SSO) 화면부터 시작하는 자연스러운 사용자 여정
- 역할 선택 → 각 역할별 화면으로 이동
- 사이드바 메뉴로 화면 간 자유롭게 이동 가능

---

## 0. 소스

- **`source/okr_lens_통합_빌드스펙_v3.md`** (v3.2, 2026-06-30) — R1·R2·R3 단일 진실 소스.
- 사용자 제공 참고 이미지 2장 (랜딩 페이지 + 로그인 일러스트 페이지) — 시각 방향성 기반.
- 기술 스택: Next.js 14 (App Router) + Tailwind CSS + Recharts + Supabase + Anthropic Claude.

> 🔄 **v2 리뉴얼 (2026-06-30)**: 사용자 피드백 — "엔터프라이즈 빽뺵함" → **친근한 SaaS 톤, 넉넉한 여백, 밝은 블루**로 전환. 시스템명은 **OKR LENS** 로 통일.

---

## 1. 제품 컨텍스트

### 1.1 한 줄 설명
**성과를 연결하고, 성장을 가속화합니다.** OKR 기반 평가와 AI 코칭으로 더 공정한 평가, 더 의미 있는 성장을 지원하는 사내 서비스.

### 1.2 3가지 역할

| 역할 | 컬러 | 핵심 과업 |
|------|-----|----------|
| **피평가자 (R1)** | 🔵 블루 `#3B5BDB` | 나의 OKR 달성 현황 확인, AI 코칭 받기 |
| **평가자 (R2)** | 🟢 그린 `#00A968` | 팀원 OKR 검토·승인, AI Validation, 피드백 |
| **인사담당자 (R3)** | 🟠 오렌지 `#E07A3C` | 전사 인사이트, 기준 관리, 표준 지표 |

> **2026-07 리브랜드 노트**: 브랜드 primary는 파랑(#3B5BDB)에서 **딥 잉크(#0A1F17) + 그린 액센트(#00A968)** 로 전환됨. 사이드바 다크 배경, CTA 버튼, 로고 워드마크가 새 브랜드 컬러를 사용. R1의 파란색은 "피평가자 역할 코드"로만 유지 (사이드바 컬러 아님).

> **2026-07 최종 확정사항**
> - **로고**: **03 / TYPOGRAPHIC** 채택. 심볼 없는 워드마크 `OKR • LENS` (OKR=800 / LENS=300 + 그린 도트) 로 전체 UI 통일. NH 뱃지 · 어퍼처 · 렌즈 아이콘 등 이전 시안(V1~V5)은 `assets/logo-proposals/`에 보존만.
> - **진입 흐름**: `index.html`(로그인) → `role-select.html`(역할 선택) → 각 역할 홈. 자동 리다이렉트 제거.
> - **R1 프로필 세팅 ↔ OKR 작성 분리**: 프로필 세팅은 사이드바의 "마이페이지" 로 이동. 조직/직군/자격증 등 개인 메타데이터의 **상시 최신화** 창구. OKR 작성은 저장된 프로필을 불러와 진행. 두 화면은 완전 분리.
> - **사이드바 그룹핑**: 평평한 나열 → 섹션 헤더로 dept 그룹핑. 아래 § 사이드바 구조 참고.

### 1.3 핵심 도메인 개념

- **KR (Key Result)**: 마일스톤 / 수치 / 루브릭 / 이산
- **승인 상태**: `작성중 → 제출 → (승인 | 반려 | 조정요청)`
- **위험도**: 11항목 체크리스트 → 하 / 중 / 상 (코칭 후보)
- **난이도**: 상 / 중 / 하 (가중 1.2 / 1.0 / 0.8)
- **등급**: S / A / B / C / D (강제배분)
- **업무군 9개**: 개발/요건 · 데이터/정합성 · 자동화 · 성능/튜닝 · 장애/운영안정 · 정시/납기 · 매뉴얼/표준 · 보안/권한 · 고객/사업기여

---

## 2. CONTENT FUNDAMENTALS

### 2.1 톤의 골격: 친근한 코칭 톤 ★

회사는 이전 평가체계 관련 소송 진행 중. 모든 텍스트는 **"위반/잘못"이 아니라 "코칭·기준 통일·연속 개선"** 톤. 단, 이전 v1보다 **더 친근하고 따뜻한 SaaS 톤**으로 — 엔터프라이즈 차가움 X.

| ❌ 피할 표현 | ✅ 권장 표현 |
|------------|-------------|
| "측정 불가능한 KR입니다" | "측정 방법을 함께 정해볼까요?" |
| "위험도: 높음" | "코칭 · 상" |
| "위반 사항" | "코칭 후보" / "함께 정제할 부분" |
| "잘못된 작성" | "기준과 다른 부분" |
| "반려 사유" | "조정 의견" |

### 2.2 헤드라인 예시 (실제 사용 카피)

- "성과를 연결하고, **성장**을 가속화합니다."
- "팀원 14명의 OKR을 **함께 정제합니다.**"
- "오늘의 AI 코칭 인사이트"
- "검토 대기 3건 중 측정모호·자기보고형 코칭 후보가 포함되어 있어요. AI 코칭으로 **함께 정제해볼까요?**"
- "사내 SSO 로그인은 회사 계정으로만 이용 가능합니다."

### 2.3 인칭·격식

- **존댓말** 기본 (~합니다 / ~해주세요 / ~해볼까요?)
- 나(I) vs 당신(you) 직접 지칭 안 함 → **역할로** ("팀원의 KR을", "평가자가 확인하도록")
- 친근한 권유형 어미 적극 사용: "~해볼까요?", "~보세요"

### 2.4 케이싱

- 한국어: 자연스러운 띄어쓰기, 명사형 라벨 ("OKR 검토", "코칭 후보")
- 영문: Title Case for buttons (`AI 코칭 시작`, `사내 SSO 로그인`)
- 약어: KR, OKR, AI, SSO 대문자 유지

### 2.5 숫자 표기

- 한글 단위 + 숫자: "전체 14명", "코칭 후보 3건", "달성률 72%"
- **`tabular-nums`** 항상 켜기 (테이블·대시보드 카드의 일관된 정렬)

### 2.6 이모지

이전보다 더 적극적으로 사용 (친근한 톤):
- `🎯` OKR 목표
- `✨` AI 코칭 / 인사이트
- `🔒` 로그인 / 보안
- `🛡️` 신뢰 · 권한
- `👤` 피평가자 · `👥` 평가자
- `📊` 데이터 · `📥` 검토 대기 · `📣` 공지사항
- `💡` 참고 / 팁
- `✓` 승인 · `↩` 반려 · `↻` 조정요청
- `✏️` 평가자 수정 표시

---

## 3. VISUAL FOUNDATIONS

### 3.1 비주얼 모티프

**친근한 엔터프라이즈 SaaS** — 데이터 도구의 신뢰감을 유지하되, 권위적이지 않고 따뜻한 색감. 큰 radius, 옅은 그림자, 충분한 여백.

### 3.2 컬러 시스템 (2026-07 리브랜드)

| 그룹 | 토큰 | 사용처 |
|------|------|--------|
| **Brand · Ink** | `--ink-brand #0A1F17` | 사이드바 배경, 로고 워드마크, 헤딩 |
| **Brand · Green Accent** | `--accent-500 #00A968` | Primary CTA, 활성 탭, 링크, 로고 도트 |
| **Brand · Accent Bright** | `--accent-400 #3EDDA1` | 다크 배경 위 액센트 (사이드바 활성 표시) |
| **Role · 피평가자 (R1)** | `#3B5BDB / #E5EBFB` | R1 화면 액센트, 아바타 (역할 코드 유지) |
| **Role · 평가자 (R2)** | `#00A968 / #E0F7EC` | R2 화면 액센트 |
| **Role · 인사담당자 (R3)** | `#E07A3C / #FFEDE2` | R3 화면 액센트 |
| **Data viz blue** | `--data-blue-500 #3B5BDB` | 대시보드 차트/히트맵 (브랜드 아님) |
| **Ink (Slate-Cool)** | `--ink-50 ~ 900` | 텍스트, 디바이더 |
| **Risk semantic** | red `#D14343` / amber `#D98023` / green `#2F9E5E` | "코칭 후보" — 채도 한 단계 낮춤 |
| **Status** | draft slate · submitted blue · approved green · rejected red · adjustment amber | 5상태 enum |

> **브랜드 전환 노트**: 이전 Friendly Blue(#3B5BDB)는 R1 역할 코드와 데이터 시각화 용도로만 유지. 로고/사이드바/CTA 등 브랜드 표면은 모두 **딥 잉크(#0A1F17) + 그린 액센트(#00A968)** 로 통일.

### 3.3 타이포그래피 (2026-07 상향)

- **Pretendard** (한국어 + Latin) — 본문, UI 전반
- **JetBrains Mono** — KR ID, 수치, 코드, 날짜
- **Base 16px** (v1 14 → v2 15 → v3 16px, 가독성 우선)
- Hero (랜딩) = 56px ExtraBold (Weight 800)
- Display (대시보드 hero 숫자) = 40px Bold
- 한국어 letter-spacing `-0.035em ~ -0.005em` (tight)
- 반응형: 모바일에서 hero → 36px, base → 15.5px 자동 축소

### 3.4 배경 · 표면

- **페이지 배경 = `#F5F6F4`** (뉴트럴 그레이 — 이전 페일 블루 대체)
- 카드 표면 = `#FFFFFF` + `1px solid #E5E7E4` + 아주 옅은 그림자
- 사이드바 = `--ink-brand #0A1F17` (딥 잉크) 단색
- **그라데이션**: 인사이트 카드에서만 사용 — `linear-gradient(135deg, #F1FBF6, #fff)`
- **풀 블리드 이미지/패턴/일러스트** 일러스트는 hero 영역에 한해 OK (`assets/illustration-hero.svg`), 그 외 금지

### 3.5 카드 · 컨테이너

- **Card**: `border-radius: 14px` + `1px solid #E1E5EF` + `box-shadow: 0 1px 2px rgba(31,42,74,.04)`
- **SSO 로그인 카드 / Hero 카드**: `border-radius: 20px` + 더 큰 그림자
- **내부 elements** (input, button, badge): `--radius-md 10px`
- 카드 패딩: `--sp-5 (20px)` 또는 `--sp-7 (32px)` (hero)
- **Hover 시 카드** — translateY(-2px) + 큰 그림자 (Role card 등)

### 3.6 모서리 (Radius)

- 버튼·인풋: 10px
- 카드: 14px (기본), 20px (hero), 28px (히어로 일러스트)
- 배지·필: 999px
- 아이콘 박스: 10~12px (둥근 사각형)

### 3.7 그림자 시스템

```
xs: 0 1px 2px rgba(31,42,74,.04)    — card default
sm: 0 2px 6px rgba(31,42,74,.05)    — card hover, toast
md: 0 6px 16px -4px rgba(31,42,74,.08)   — dropdown, popover
lg: 0 16px 40px -10px rgba(31,42,74,.10) — modal, side panel
xl: 0 30px 60px -16px rgba(31,42,74,.16) — fullscreen hero
```

### 3.8 모션

- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out)
- Duration: `fast 140ms` / `base 220ms` / `slow 320ms`
- Role card hover = translateY(-2px), border color 변경, shadow 강조
- 절대 over-the-top 모션 금지

### 3.9 Hover / Press

| 요소 | Hover | Press |
|------|-------|-------|
| Primary Button | `#008F58` darken | + translateY(0.5px) |
| Secondary Button | bg `#F5F6F4` | bg `#E5E7E4` |
| Card (clickable) | shadow xs → md, translateY(-2px), border `#00A968` | — |
| Table row | bg → `#FAFBFA` | bg `#F1FBF6` (selected) |
| Tab | underline `#00A968` | — |

### 3.10 레이아웃 규칙 (반응형)

- 사이드바 폭 **244px** (데스크톱) → **76px** (≤1024px, 아이콘 온리) → **오프캔버스** (≤640px)
- 탑바 높이 **68px** (데스크톱) → 60px (태블릿) → 56px (모바일)
- 페이지 패딩 **48px 좌우 / 40px 상하** (데스크톱) → clamp(16px, 3vw, 40px) 자동 축소
- 12-col grid, 카드 갭 16~20px
- max-width 1440px
- 브레이크포인트: **1200 / 1024 / 780 / 640 / 480px**
- **데이터 밀도**: 빽뺵하지 않게. 4개 stat 카드 한 줄 (6개 X), 한 화면에 핵심만

### 3.11 데이터 시각화

- Recharts
- 단일 시리즈 = `#3B5BDB`, 두 시리즈 = brand + 그린 또는 오렌지
- 히트맵: brand-50 → brand-500 (6 step)
- 그리드 라인 `#ECEFF5`, 1px
- 축 라벨 11.5px, `#7C87A4`, tabular-nums

---

## 4. ICONOGRAPHY

### 4.1 아이콘 시스템

- **Lucide Icons** (CDN: `https://unpkg.com/lucide@latest/dist/umd/lucide.js`)
- stroke 1.75px · 16/18/22px
- `currentColor` 상속

> ⚠️ 실제 코드베이스 확인 시 다른 아이콘 라이브러리 사용 가능. 사용자 검토 필요.

### 4.2 이모지 사용 (적극)

이전 v1보다 더 적극적으로 — 친근한 SaaS 톤. 카드 라벨에도 사용 OK.
- 🎯 OKR / 목표 · ✨ AI / 인사이트 · 🔒 보안 / 로그인 · 🛡️ 신뢰 · 권한
- 👤 R1 · 👥 R2 · 📊 데이터 · 📥 검토 · 📣 공지 · 💡 팁
- ✓ 승인 · ↩ 반려 · ↻ 조정 · ✏️ 수정

### 4.3 로고

**최종 확정 = 03 / TYPOGRAPHIC** (심볼 없음, 워드마크 only)

- `assets/logo.svg` — 워드마크 `OKR • LENS` (light 배경, jet ink #0A1F17)
- `assets/logo-white.svg` — 워드마크 (다크 배경, 순백)
- `assets/logo-mark.svg` — 소형/파비콘용 마크 (워드마크가 축소 한계 이하일 때만)
- `assets/logo-proposals/` — 폐기된 V1~V5 시안 (NH 뱃지 · 어퍼처 등, 참조용 · 사용 금지)
- `로고 시안 컨펌 v3 최종 확정.html` — 확정 문서 + 사용 규칙(웨이트/간격/최소 크기)
- `assets/illustration-hero.svg` — 랜딩 페이지 메인 일러스트 (참고용)

---

## 5. 사이드바 구조 (2026-07 v3 그룹핑) ★

평평한 나열 대신 dept(섹션) 헤더로 3그룹 구조.

### R1 — 피평가자

```
┌─ 개인 · MY
│   ├─ 홈
│   ├─ 마이페이지 ← 프로필 세팅 (상시 최신화)
│   └─ 이전 평가
├─ OKR
│   ├─ 나의 OKR
│   ├─ OKR 작성 ← 마이페이지의 프로필 기반
│   └─ AI 코칭
└─ 일정 · 피드백
    ├─ 평가 캘린더
    └─ 피드백
```

**프로필 세팅 ↔ OKR 작성** 관계: 프로필은 마이페이지의 상시 관리 대상. OKR 작성은 저장된 프로필을 불러와 진행 (두 화면 완전 분리).

### R2 — 평가자

```
┌─ 팀 관리
│   ├─ 대시보드
│   └─ 팀원 관리
└─ 평가 · 코칭
    ├─ OKR 검토
    ├─ 코칭 캘린더
    ├─ 피드백 작성
    └─ 이전 평가
```

### R3 — 인사담당자

```
┌─ 기준 정보           (다음 회차 규칙 세팅)
│   ├─ 평가제도 운영안
│   ├─ 평가 기준
│   ├─ 마스터 데이터
│   ├─ 표준 매트릭스
│   └─ 평가 일정 관리
├─ 평가 인사이트      (쌓인 데이터 판단·조정)
│   └─ 캘리브레이션
└─ 운영               (출력·시스템 세팅)
    ├─ 산출물
    └─ 환경 설정
```

**섹션 헤더 스타일**: `text-transform: uppercase / letter-spacing: 0.14em / color: #5F7C6E / font-size: 10.5px / padding: 6px 14px 8px`.

구현: `ui_kits/web/r1/SidebarR1.jsx` · `ui_kits/web/r2/SidebarR2.jsx` · `ui_kits/web/r3/SidebarR3.jsx`.

---

## 6. 파일 인덱스

```
okr-lens-design-system/
├── README.md                      ← (이 파일)
├── SKILL.md                       ← 디자인 시스템 메타
├── colors_and_type.css            ← CSS 변수 + semantic 클래스
├── thumbnail.png                  ← 표지 (랜딩 페이지 캡처)
│
├── fonts/                         ← Pretendard + JetBrains Mono woff2
├── assets/                        ← logo.svg, logo-mark.svg, logo-white.svg, illustration-hero.svg
├── source/                        ← okr_lens_통합_빌드스펙_v3.md
│
├── preview/                       ← Design System 탭 카드들
│   ├── colors-{brand,roles,neutral,risk,status,difficulty}.html
│   ├── type-{scale,specimen,mono}.html
│   ├── spacing-tokens.html · radius-shadow.html
│   ├── components-{button,input,badge,card,table,checklist,kr-block,heatmap}.html
│   └── brand-{logo,iconography}.html
│
└── ui_kits/web/                    ← 역할별 서브폴더 구조 (2026-07)
    ├── README.md
    ├── index.html                  ← 진입 (로그인, 대표 캡처)
    ├── role-select.html            ← 역할 선택
    │
    ├── shared/                     ← 모든 역할이 공유하는 컴포넌트
    │   ├── Landing.jsx · RoleSelect.jsx
    │   ├── TopBar.jsx · Icon.jsx · Button.jsx · Badges.jsx
    │   ├── StatCard.jsx · MemberTable.jsx · CoachCalendar.jsx
    │   ├── WizardShared.jsx        ← R1 OKR 작성 위저드 공용 UI
    │   └── auth.js · dummyData.js · notImplemented.js
    │
    ├── r1/                         ← 🔵 피평가자
    │   ├── SidebarR1.jsx
    │   ├── R1Home.jsx · R1MyOKR.jsx · R1Coaching.jsx · R1Calendar.jsx
    │   ├── R1ProfileSetup.jsx      ← 마이페이지 (상시 프로필 관리)
    │   ├── R1Write.jsx · R1WriteStep1~7.jsx  ← OKR 작성 8단계 위저드
    │   └── r1-*.html               ← 각 화면별 HTML 진입점
    │
    ├── r2/                         ← 🟢 평가자
    │   ├── SidebarR2.jsx           (구 Sidebar.jsx)
    │   ├── R2Review.jsx · R2Member.jsx · R2Calendar.jsx
    │   ├── dashboard.html          ← R2 대시보드
    │   └── r2-*.html
    │
    └── r3/                         ← 🟠 인사담당자
        ├── SidebarR3.jsx
        ├── R3Console.jsx · R3Criteria.jsx · R3Master.jsx · R3Metrics.jsx
        ├── R3Matrix.jsx · R3Operation.jsx · R3Calendar.jsx
        ├── R3Difficulty.jsx · R3Env.jsx · R3Export.jsx · R3Import.jsx
        ├── R3JobGroup.jsx · R3RiskTypes.jsx · R3Worklist.jsx
        └── r3-*.html
```

---

## 7. UI Kit 화면 (총 14개)

전체 흐름: 로그인 → 역할 선택 → 각 역할별 4개 화면 (홈/메인 + 3개 세부)

| 그룹 | 화면 | 파일 |
|------|------|------|
| **진입** | 로그인 (대표) | `ui_kits/web/index.html` |
| | 역할 선택 | `ui_kits/web/role-select.html` |
| **R1 피평가자** 🔵 | 홈 | `ui_kits/web/r1/r1-employee.html` |
| | 나의 OKR | `ui_kits/web/r1/r1-my-okr.html` |
| | OKR 작성 위저드 (4단계) | `ui_kits/web/r1/r1-write.html` |
| | AI 코칭 채팅 | `ui_kits/web/r1/r1-coaching.html` |
| **R2 평가자** 🟢 | 대시보드 | `ui_kits/web/r2/dashboard.html` |
| | OKR 검토 + AI Validation ★ | `ui_kits/web/r2/r2-review.html` |
| | 팀원 상세 | `ui_kits/web/r2/r2-member.html` |
| | 코칭 캘린더 | `ui_kits/web/r2/r2-calendar.html` |
| **R3 인사담당자** 🟠 | 캘리브레이션 인사이트 | `ui_kits/web/r3/r3-hr.html` |
| | 평가 기준 편집 | `ui_kits/web/r3/r3-criteria.html` |
| | 마스터 데이터 | `ui_kits/web/r3/r3-master.html` |
| | 표준 지표 라이브러리 | `ui_kits/web/r3/r3-metrics.html` |

각 화면의 사이드바 메뉴는 같은 역할 내 다른 화면으로 클릭 이동 가능. "역할 전환" 링크로 `role-select.html` 복귀.

---

## 7. 캐비엇 / 향후 작업

- 실제 코드베이스 / Figma 미접근 — 참고 이미지 + 명세서 기반 추론
- 일러스트(`illustration-hero.svg`)는 SVG 추정작 — 실제 일러스트레이터 작업 권장
- 추가 가능 화면: 피드백 작성/조회, 이전 평가 회고, 리포트 PDF 출력 등
- 아이콘 시스템(Lucide)은 substitute — 실제 사용 라이브러리 확인 필요
- 더미 사용자(김지훈/정태영/이수경) — 실 데이터 연동 시 교체
