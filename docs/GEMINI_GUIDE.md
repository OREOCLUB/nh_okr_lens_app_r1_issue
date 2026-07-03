# Gemini API 연동 가이드 (R1 · R3 담당자용)

> 이 문서는 **AI 코딩 도구(Claude Code 등)에 그대로 전달**하는 것을 전제로 작성됐다.
> 담당자는 자기 AI에게 "docs/GEMINI_GUIDE.md 읽고 R1용 ○○ API 만들어줘"라고 지시하면 된다.

## 무엇이 준비되어 있나

R2 개발에서 만든 **Gemini 호출 공용 모듈**이 있다. 가이드 PDF(2026 OKR 가이드, 80p)를
Gemini Files API에 업로드·캐시하고, 매 요청에 동봉해 **가이드 문서 기준의 판정/생성**을
JSON(구조화 출력)으로 받아온다.

```
src/lib/server/gemini.ts        ← 공용 코어 (업로드·캐시·generateWithGuide)  ⚠️ 수정 금지
src/app/api/validate/route.ts   ← R2 전용 라우트 (사용 예시로만 참조)        ⚠️ 수정 금지
src/lib/aiValidation.ts         ← R2 전용 클라이언트 래퍼 (폴백 패턴 참조)   ⚠️ 수정 금지
```

## ⚠️ 소스 충돌 방지 규칙 (AI는 반드시 지킬 것)

1. **위 3개 파일은 절대 수정하지 않는다.** import만 한다.
2. 역할별 API는 **자기 소유의 새 라우트 파일**로 만든다.
   - R1 예: `src/app/api/r1-coach/route.ts`
   - R3 예: `src/app/api/r3-insight/route.ts`
   - 기존 `/api/validate`에 mode를 추가하는 방식 금지 (R2 소유 파일).
3. 프롬프트·responseSchema·응답 가공은 전부 자기 라우트 파일 안에 둔다.
4. API 키를 클라이언트 코드(`NEXT_PUBLIC_*`, 컴포넌트, fetch 헤더)에 넣지 않는다.
   키는 서버 라우트 안에서 `process.env.GEMINI_API_KEY`로만 읽는다.
5. 문구는 코칭 톤 (MASTER_RULE): "위반/오류/잘못됨" 금지. 공용 상수 `TONE_RULE`을
   시스템 지시 끝에 이어 붙이면 된다.
6. API 실패 시 화면이 죽지 않게 **폴백**을 구현한다 (더미 응답 + 코칭 톤 안내).

## 사전 준비 (사람이 할 일)

| 항목 | 내용 |
|---|---|
| API 키 | `.env.local`에 `GEMINI_API_KEY=...` 한 줄 추가 (파일은 gitignore — 커밋 안 됨) |
| 가이드 PDF | `guide_docs/2026_OKR_GUIDE.pdf` 위치에 배치 (gitignore — R2 담당자에게 파일 수령) |
| 모델 변경(선택) | `.env.local`에 `GEMINI_MODEL=gemini-2.5-pro` (기본: gemini-2.5-flash) |

## 공용 함수 계약

```ts
import { generateWithGuide, TONE_RULE, invalidateGuideCache } from "@/lib/server/gemini";

const jsonText = await generateWithGuide({
  key: process.env.GEMINI_API_KEY!, // 서버 전용
  system: "역할별 시스템 지시… " + TONE_RULE,
  userText: "판정/생성 대상 데이터를 담은 프롬프트",
  responseSchema: {                  // Gemini responseSchema (OpenAPI subset)
    type: "OBJECT",
    properties: { message: { type: "STRING" } },
    required: ["message"],
  },
  temperature: 0.2,                  // 생략 가능 (기본 0.2)
});
const data = JSON.parse(jsonText);   // responseSchema 형태의 JSON 보장
```

- 성공: `responseSchema` 형태의 JSON **문자열** 반환 → `JSON.parse` 해서 사용
- 실패: **throw** — 폴백은 호출부 책임 (아래 예제의 try/catch 패턴)
- 가이드 PDF는 자동 동봉된다 (첫 호출만 업로드로 10~20초, 이후 47시간 캐시)
- 응답 시간: 가이드 80p를 매번 읽으므로 **호출당 10~30초** → 화면에 로딩 상태 필수

## 완성 예제 ① — 서버 라우트 (R1 코칭 API)

`src/app/api/r1-coach/route.ts` (새 파일):

```ts
import { NextResponse } from "next/server";
import { generateWithGuide, TONE_RULE } from "@/lib/server/gemini";

export const runtime = "nodejs";

interface Body { kr: string; baseline: string; goal: string }

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "NO_KEY" }, { status: 503 });
  const body = (await req.json()) as Body;
  try {
    const raw = await generateWithGuide({
      key,
      system:
        "너는 OKR 작성을 돕는 코치다. 첨부된 '2026 OKR 가이드' PDF 기준으로 " +
        "작성 중인 KR의 개선 팁을 만든다. 팁은 가이드 근거(장/절/페이지)를 함께 언급한다. " + TONE_RULE,
      userText: `KR: ${body.kr}\nBaseline→Goal: ${body.baseline} → ${body.goal}\n개선 팁 3개를 제안하라.`,
      responseSchema: {
        type: "OBJECT",
        properties: {
          tips: { type: "ARRAY", items: { type: "OBJECT", properties: {
            tag: { type: "STRING" }, msg: { type: "STRING" } }, required: ["tag", "msg"] } },
        },
        required: ["tips"],
      },
    });
    return NextResponse.json({ ...JSON.parse(raw), source: "gemini" });
  } catch (e) {
    console.error("[api/r1-coach]", e);
    return NextResponse.json({ error: "UPSTREAM" }, { status: 502 });
  }
}
```

## 완성 예제 ② — 클라이언트 호출 (폴백 포함)

역할별 화면 코드 (예: `src/lib/r1Coach.ts` 등 자기 소유 파일):

```ts
export async function getCoachTips(kr: string, baseline: string, goal: string) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 90_000);
    const res = await fetch("/api/r1-coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kr, baseline, goal }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`api ${res.status}`);
    return { ...(await res.json()), source: "gemini" as const };
  } catch {
    // 폴백: API 미설정·실패 시에도 화면이 동작해야 한다 (MASTER_RULE)
    return {
      tips: [{ tag: "측정 명확화", msg: "Baseline과 Goal에 동일 단위를 쓰면 진행률이 또렷해져요." }],
      source: "mock" as const, // 화면에서 "AI 연결이 원활하지 않아 기본 안내로 보여드려요" 표기
    };
  }
}
```

## 참고: R2 실사용 예

동작하는 실제 사례는 `src/app/api/validate/route.ts`(판정·초안 2모드)와
`src/lib/aiValidation.ts`(타임아웃·목업 폴백)를 읽어보면 된다. **읽기만 하고 수정 금지.**
