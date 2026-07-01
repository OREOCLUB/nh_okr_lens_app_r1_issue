# OKR LENS — Web UI Kit

> 단일 Next.js 14 (App Router) 웹 앱. 3역할(R1·R2·R3)이 한 코드베이스에서 동작.
> 파일은 **역할별 서브폴더 구조**로 정리됨 (`shared/` + `r1/` + `r2/` + `r3/`).

## 폴더 구조 (2026-07 재구성)

```
ui_kits/web/
├── index.html              ← 진입 (로그인)
├── role-select.html        ← 역할 선택
│
├── shared/                 ← 모든 역할이 사용하는 공통 컴포넌트
│   ├── Landing.jsx · RoleSelect.jsx
│   ├── TopBar.jsx · Icon.jsx · Button.jsx · Badges.jsx
│   ├── StatCard.jsx · MemberTable.jsx · CoachCalendar.jsx
│   ├── WizardShared.jsx    (R1 OKR 작성 위저드 공용 UI)
│   ├── auth.js · dummyData.js · notImplemented.js
│
├── r1/                     ← 🔵 피평가자
│   ├── SidebarR1.jsx
│   ├── R1Home.jsx · R1MyOKR.jsx · R1Coaching.jsx · R1Calendar.jsx
│   ├── R1ProfileSetup.jsx  (마이페이지)
│   ├── R1Write.jsx · R1WriteStep1~7.jsx
│   └── r1-*.html
│
├── r2/                     ← 🟢 평가자
│   ├── SidebarR2.jsx       (구 Sidebar.jsx)
│   ├── R2Review.jsx · R2Member.jsx · R2Calendar.jsx
│   ├── dashboard.html · r2-*.html
│
└── r3/                     ← 🟠 인사담당자
    ├── SidebarR3.jsx
    ├── R3Console.jsx · R3Criteria.jsx · R3Master.jsx · R3Metrics.jsx
    ├── R3Matrix.jsx · R3Operation.jsx · R3Calendar.jsx
    ├── R3Difficulty.jsx · R3Env.jsx · R3Export.jsx · R3Import.jsx
    ├── R3JobGroup.jsx · R3RiskTypes.jsx · R3Worklist.jsx
    └── r3-*.html · r3-flow.html
```

## 전체 사용자 흐름

```
index.html (로그인)
   ↓ [사내 SSO 로그인 클릭]
role-select.html (역할 선택)
   ↓ [3개 카드 중 선택]
┌────────────────────────┬────────────────────────┬────────────────────────┐
│ R1 피평가자 (블루)      │ R2 평가자 (그린)         │ R3 인사담당자 (오렌지)  │
├────────────────────────┼────────────────────────┼────────────────────────┤
│ r1/r1-employee   (홈)  │ r2/dashboard (대시보드) │ r3/r3-hr (캘리브레이션) │
│ r1/r1-my-okr           │ r2/r2-review (검토)     │ r3/r3-criteria (기준)   │
│ r1/r1-write            │ r2/r2-member (팀원)     │ r3/r3-master (마스터)   │
│ r1/r1-coaching         │ r2/r2-calendar          │ r3/r3-metrics (지표)    │
└────────────────────────┴────────────────────────┴────────────────────────┘
   ↑ 사이드바 "역할 전환"으로 언제든 role-select 복귀, 메뉴는 같은 역할 내 화면 이동
```

## 전체 화면 (진입 2 + R1 8 + R2 4 + R3 15)

### 진입 (2)
| 화면 | 파일 | 설명 |
|------|------|------|
| 로그인 (대표) | `index.html` | Hero + 3-feature + 다크 신뢰 카드 + 큰 SSO 카드 |
| 역할 선택 | `role-select.html` | 환영 + 사용자 chip + 3개 큰 역할 카드 (hover 컬러 보더) |

### R1 피평가자
| 화면 | 파일 | 핵심 콘텐츠 |
|------|------|-------------|
| **홈** | `r1/r1-employee.html` | 인사 + 4 stat + 나의 OKR 3개 + AI 코칭 다크 카드 + 일정 |
| **나의 OKR** | `r1/r1-my-okr.html` | 16주 주간 차트 + 종합 다크카드 + 가중치 비율 + KR 펼침 |
| **OKR 작성** | `r1/r1-write.html` (→ step1) | 8단계 위저드 (STEP0 프로필세팅 + STEP1~7) |
| **AI 코칭** | `r1/r1-coaching.html` | 3컬럼 채팅 (주제 리스트 + 채팅 + 컨텍스트 + 액션 아이템) |
| **평가 캘린더** | `r1/r1-calendar.html` | 개인 OKR 관련 일정 |
| **마이페이지** | `r1/r1-profile-setup.html` | 조직/직군/자격증 등 개인 메타데이터 상시 최신화 |

### R2 평가자
| 화면 | 파일 | 핵심 콘텐츠 |
|------|------|-------------|
| **대시보드** | `r2/dashboard.html` | 4 stat + AI 인사이트 + 팀원 테이블 + 위험유형 차트 |
| **OKR 검토 ★** | `r2/r2-review.html` | 3컬럼 · 11항목 AI Validation + 작년 이력 + 승인/조정/반려 |
| **팀원 상세** | `r2/r2-member.html` | 프로필 + 5 metric + OKR + 6분기 등급 + AI 인사이트 + 타임라인 |
| **코칭 캘린더** | `r2/r2-calendar.html` | 월간 캘린더 + 오늘 일정 + 1on1 대기 팀원 알림 |

### R3 인사담당자
| 화면 | 파일 | 핵심 콘텐츠 |
|------|------|-------------|
| **캘리브레이션** | `r3/r3-hr.html` | 4 KPI + 본부×직급 히트맵 + 사후조정 비중 + 사례 카드 |
| **평가 기준** | `r3/r3-criteria.html` | 활성 버전 + 5탭 + 11항목 체크리스트 + 임계값 |
| **마스터 데이터** | `r3/r3-master.html` | 조직 트리 + 사원 테이블 + 결재선/직급 밴드 탭 |
| **표준 지표** | `r3/r3-metrics.html` | 5 KPI + 검색·필터 + 지표 카드 그리드 + 플라이휠 |
| **평가 매트릭스** | `r3/r3-matrix.html` | 등급 매트릭스 + 강제 배분 |
| **운영안** | `r3/r3-operation.html` | 회차 운영안 (KR 유형/승인 게이트/코칭 정책) |
| **평가 일정 관리** | `r3/r3-calendar.html` | 전사 평가 일정 |
| **난이도 지표** | `r3/r3-difficulty.html` |  |
| **환경 설정** | `r3/r3-env.html` |  |
| **산출물** | `r3/r3-export.html` |  |
| **이전 OKR 가져오기** | `r3/r3-import.html` |  |
| **업무군 분류** | `r3/r3-jobgroup.html` |  |
| **위험유형** | `r3/r3-risk-types.html` |  |
| **본부별 워크리스트** | `r3/r3-worklist.html` |  |
| **화면 흐름 안내** | `r3/r3-flow.html` | R3 화면 간 이동 안내 |

## 컴포넌트

### shared/ — 모든 역할이 공유
- `Icon.jsx` — Lucide-style inline SVG (stroke 1.75)
- `Button.jsx` — Primary · Secondary · Ghost · Danger · Success · AI 6 variants
- `Badges.jsx` — StatusBadge · RiskBadge · DifficultyBadge
- `TopBar.jsx` — 64px 헤더
- `StatCard.jsx` · `MemberTable.jsx` · `CoachCalendar.jsx`
- `WizardShared.jsx` — R1 OKR 작성 위저드 공용 (진행 표시, prev/next)
- `Landing.jsx` / `RoleSelect.jsx` — 진입
- `auth.js` — 세션 mock (ROLE_HOME에 각 역할 홈 경로 정의)
- `dummyData.js` — 14명 시드
- `notImplemented.js` — 미구현 링크 안내 토스트

### 사이드바 (역할별 컬러 chip)
- `r1/SidebarR1.jsx` — 블루 Role chip + `개인·MY / OKR / 일정·피드백` 3그룹
- `r2/SidebarR2.jsx` — 그린 Role chip + `팀 관리 / 평가·코칭` 2그룹
- `r3/SidebarR3.jsx` — 오렌지 Role chip + `기준 정보 / 평가 인사이트 / 운영` 3그룹

## 디자인 일관성 규칙

- **모든 사이드바**: 딥 잉크 `#0A1F17`, 244px 폭, 역할별 컬러 Role chip 상단 + 섹션 헤더 그룹핑
- **모든 TopBar**: 64px 높이, 좌측 페이지 타이틀, 우측 검색·기간·알림
- **모든 페이지 패딩**: `32px 40px` 상하/좌우
- **모든 카드**: `border-radius: 14px`, `1px solid #E1E5EF`, 옅은 그림자
- **모든 stat 카드**: 한 줄 최대 4-5개 (밀도 절제)
- **소송 안전 톤**: "위반" 아닌 "코칭 후보", "함께 정제" 어휘
- **이모지 적극**: 🎯✨🔒🛡️👤👥📊💡 등 친근한 SaaS 톤

## 경로 규칙 (다른 파일에서 참조할 때)

- **root HTML** (`index.html`, `role-select.html`): `./shared/*`, `./r1/*`, `./r2/*`, `./r3/*`
- **r{n}/ 폴더 안 HTML**: 공통 = `../shared/*`, 같은 역할 = `./*`, 다른 역할 = `../r{n}/*`
- **`colors_and_type.css`**: root HTML은 `../../colors_and_type.css`, `r{n}/` HTML은 `../../../colors_and_type.css`
