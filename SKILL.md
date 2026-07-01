---
name: okr-lens-design
description: OKR LENS 사내 OKR 평가·코칭 AI 서비스 디자인 시스템. 3역할(피평가자/평가자/인사담당자) 반응형 웹앱, 친근한 SaaS 톤, 딥 잉크(#0A1F17) + 그린 액센트(#00A968) 브랜드, Pretendard + JetBrains Mono, 큰 radius와 넉넉한 여백, 타이포그래피 중심 로고, 코칭 중심 카피("위반"이 아닌 "코칭 후보").
user-invocable: true
---

# OKR LENS Design System

사내 OKR 평가·코칭 AI 서비스. 피평가자(R1) / 평가자(R2) / 인사담당자(R3) 3역할 웹앱.

## Quick Map

- `README.md` — 제품 컨텍스트, content fundamentals, visual foundations, iconography
- `colors_and_type.css` — CSS 변수 단일 출처. `<link rel="stylesheet" href="colors_and_type.css">` 로 import
- `fonts/` — Pretendard + JetBrains Mono woff2
- `assets/` — logo.svg, logo-mark.svg, logo-white.svg, illustration-hero.svg
- `preview/` — 토큰 카드 (Colors / Type / Spacing / Components / Brand)
- `ui_kits/web/` — 역할별 서브폴더 구조: `shared/` (공통 컴포넌트) + `r1/` (피평가자) + `r2/` (평가자) + `r3/` (인사담당자). 진입은 `index.html`.
- `standalone/` — 31개 화면 (로그인 / 역할선택 / R1·R2·R3 실사용 화면)
- `source/okr_lens_통합_빌드스펙_v3.md` — 원본 빌드 스펙

## 브랜드 핵심 규칙 (2026-07 리브랜드)

### 1. 톤 — 친근한 코칭 톤 ★
회사가 이전 평가체계 관련 소송 진행 중. 모든 텍스트는 **"위반/잘못"이 아니라 "코칭·함께 정제·연속 개선"** 톤. 더불어 **친근한 SaaS 톤** (엔터프라이즈 차가움 X).

- ❌ "측정 불가능", "위반", "잘못된" / ✅ "함께 정해볼까요", "코칭 후보", "함께 정제할 부분"
- 권유형 어미 적극: "~해볼까요?", "~보세요"
- 헤드라인 예시: "성과를 연결하고, **성장**을 가속화합니다.", "팀원 20명의 OKR을 **함께 정제합니다.**"

### 2. 시각 핵심 (리브랜드 후)
- **로고 (최종 확정 · 2026-07)**: **03 / TYPOGRAPHIC** — `OKR • LENS` 워드마크로 전체 통일. OKR=800 / LENS=300 웨이트 대비 + 그린 도트(#00A968) 하나가 유일한 액센트. **심볼 없음**. 파일: `assets/logo.svg` (밝은 배경) · `assets/logo-white.svg` (어두운 배경) · `assets/logo-mark.svg` (초소형 · 파비콘). NH 뱃지/어퍼처 등 이전 시안(V1~V5)은 `assets/logo-proposals/`에 보존만, 사용 금지.
- **페이지 배경 = `#F5F6F4`** (뉴트럴 그레이, 이전 페일 블루 대체)
- Primary Ink = **`#0A1F17`** (딥 잉크 그린 톤, 사이드바 배경 · 로고 워드마크)
- Primary Accent = **`#00A968`** (그린, CTA · 활성 · 링크)
- 사이드바 = **`#0A1F17`** 딥 잉크 (이전 #1B2A4E 네이비 대체)
- **큰 radius**: 카드 14px / hero 카드 20px / 일러스트 박스 28px
- **부드럽고 옅은 그림자**: `0 1px 2px rgba(31,42,74,.04)` 기본
- **base font 16px** (v1 14 → v2 15 → v3 16px, 가독성 우선)
- **반응형**: 사이드바 축소(1024px 이하) → 오프캔버스(640px 이하), 폰트/여백 clamp 자동 조정
- **데이터 밀도 절제**: 한 줄 stat 카드는 4개까지 (6개 X). 여백을 채우려고 컨텐츠 늘리지 않음

### 3. 역할별 컬러 (역할 코드는 유지)
- 피평가자(R1) = `#3B5BDB` / `#E5EBFB` (블루, 역할 코드로만 사용, 사이드바 아님)
- 평가자(R2) = `#00A968` / `#E0F7EC` (그린, 새 브랜드와 자연스럽게 통일)
- 인사담당자(R3) = `#E07A3C` / `#FFEDE2` (오렌지)
- Role card는 동그란 컬러 아이콘 박스 + hover 시 translateY(-2px) + 컬러 보더
- **사이드바는 모든 역할이 딥 잉크(#0A1F17) 단일 컬러**, 역할 표시는 role chip으로만 구분

### 4. 색 사용 규칙
- 브랜드 표면(로고/사이드바/CTA) = 잉크 + 그린 액센트만
- Data viz 파랑(`--data-blue-500 #3B5BDB`)은 대시보드 차트/히트맵에만
- Risk와 Difficulty 컬러 혼동 금지 — Risk(red/amber/green) vs Difficulty(보라/인디고/슬레이트)

### 5. 도메인 어휘
- **승인 enum**: 작성중 / 제출 / 승인 / 반려 / 조정요청
- **위험도**: 상 / 중 / 하 (단, UI 라벨은 "코칭 · 상" 같은 톤)
- **난이도**: 상 / 중 / 하
- **등급**: S / A / B / C / D

### 6. 이모지 (적극 사용)
친근한 톤에 맞춰 이전보다 더 자유롭게:
- 🎯 OKR · ✨ AI 코칭 · 🔒 로그인 · 🛡️ 신뢰 · 👤 R1 · 👥 R2
- 📊 데이터 · 📥 검토 · 📣 공지 · 💡 팁 · ✓ 승인 · ↩ 반려 · ↻ 조정

### 7. 아이콘
Lucide stroke 1.75px (`ui_kits/web/Icon.jsx` 참조)

### 8. 폰트
- Pretendard (한국어 SaaS 표준) — 본문
- JetBrains Mono — KR ID, 수치, 날짜, 표 데이터 (tabular-nums)
- 로고 워드마크: Pretendard 800/300 웨이트 대비

### 9. 사이드바 그룹핑 (2026-07 v3) ★
평평한 나열은 금지. 각 역할별로 **섹션 헤더 + 3~5개 항목**의 3그룹 구조로 정리.

**R1 (피평가자)**
- `개인 · MY` — 홈 / 마이페이지(=프로필 세팅) / 이전 평가
- `OKR` — 나의 OKR / OKR 작성 / AI 코칭
- `일정 · 피드백` — 평가 캘린더 / 피드백

**R2 (평가자)** — 2그룹
- `팀 관리` — 대시보드 / 팀원 관리
- `평가 · 코칭` — OKR 검토 / 코칭 캘린더 / 피드백 작성 / 이전 평가

**R3 (인사담당자)**
- `기준 정보` — 평가제도 운영안 / 평가 기준 / 마스터 데이터 / 표준 매트릭스 / 평가 일정 관리
- `평가 인사이트` — 캘리브레이션
- `운영` — 산출물 / 환경 설정

섹션 헤더는 `text-transform: uppercase / letter-spacing: 0.14em / color: #5F7C6E / font-size: 10.5px`.

### 10. 프로필 세팅 ↔ OKR 작성 관계
- **프로필 세팅 = 마이페이지**의 상시 최신화 상태 (조직/직군/역할/스킬 등 개인 메타데이터). 완료 시점이 별도로 없음, 상시 업데이트.
- **OKR 작성**은 마이페이지의 프로필을 **불러와서** 그 기반으로 진행. 두 화면은 UI/URL 완전 분리.
- 프로필이 비어있는 상태에서 OKR 작성 진입 시 → 마이페이지로 안내하는 배너 노출.
