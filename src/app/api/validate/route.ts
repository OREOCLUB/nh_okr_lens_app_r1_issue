// /api/validate — R2 전용: AI Validation · AI 초안 생성 (서버 전용)
// Gemini 호출·가이드 PDF 동봉은 공용 모듈(src/lib/server/gemini.ts)을 사용한다.
// 이 파일에는 R2의 프롬프트·스키마·응답 가공만 둔다 (역할별 소유 경계).
import { NextResponse } from "next/server";
import { generateWithGuide, TONE_RULE } from "@/lib/server/gemini";

export const runtime = "nodejs";

// ── 요청 타입 ────────────────────────────────────────────────
interface OkrIn { obj: string; kr: string; format: string; baseline: string; goal: string; weight: number; difficulty: string | null; measure: string | null; plan: string | null }
interface CheckIn { no: number; text: string; tag: string }
interface ValidateBody { mode: "validate"; memberName: string; okrs: OkrIn[]; checklist: CheckIn[] }
interface DraftBody { mode: "draft"; kind: "adjustment" | "rejected"; memberName: string; okrs: OkrIn[]; findings: { text: string; verdict: string; reason?: string }[] }

function okrBlock(okrs: OkrIn[]): string {
  return okrs.map((o, i) =>
    `[KR ${i + 1}] Objective: ${o.obj}\n  KR: ${o.kr}\n  유형: ${o.format} · 난이도: ${o.difficulty ?? "-"} · 가중치: ${o.weight}%\n  Baseline→Goal: ${o.baseline} → ${o.goal}\n  측정 방법: ${o.measure ?? "-"}\n  실행 계획: ${o.plan ?? "-"}`,
  ).join("\n");
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "NO_KEY" }, { status: 503 });

  let body: ValidateBody | DraftBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  try {
    if (body.mode === "validate") {
      if (!body.okrs?.length || !body.checklist?.length) return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
      const system =
        "너는 OKR 평가를 돕는 검토 어시스턴트다. 첨부된 '2026 OKR 가이드' PDF가 유일한 판정 기준이다. " +
        "체크리스트 각 항목을 가이드 기준으로 판정한다: pass(통과) / warn(주의) / fail(코칭 후보). " +
        "warn·fail에는 반드시 reason을 쓴다. reason은 2문장 이내, 가능하면 가이드의 근거(장/절/페이지)를 함께 언급한다. " +
        "pass는 reason을 생략해도 된다. comment는 전체 총평 2~3문장. " + TONE_RULE;
      const userText =
        `다음은 팀원 "${body.memberName}"의 OKR이다.\n\n${okrBlock(body.okrs)}\n\n` +
        `아래 체크리스트 전 항목을 가이드 기준으로 판정하라. 항목 번호(no)를 그대로 반환할 것.\n` +
        body.checklist.map((c) => `${c.no}. ${c.text} (관련 태그: ${c.tag})`).join("\n");
      const schema = {
        type: "OBJECT",
        properties: {
          items: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                no: { type: "INTEGER" },
                verdict: { type: "STRING", enum: ["pass", "warn", "fail"] },
                reason: { type: "STRING" },
              },
              required: ["no", "verdict"],
            },
          },
          comment: { type: "STRING" },
        },
        required: ["items", "comment"],
      };
      const raw = JSON.parse(await generateWithGuide({ key, system, userText, responseSchema: schema })) as {
        items: { no: number; verdict: "pass" | "warn" | "fail"; reason?: string }[];
        comment: string;
      };
      // 체크리스트 원본(no 기준)에 판정 병합 — 누락 항목은 pass 처리
      const byNo = new Map(raw.items.map((i) => [i.no, i]));
      const items = body.checklist.map((c) => {
        const j = byNo.get(c.no);
        return { no: c.no, text: c.text, tag: c.tag, verdict: j?.verdict ?? "pass", reason: j?.reason || undefined };
      });
      return NextResponse.json({ items, comment: raw.comment, source: "gemini" });
    }

    if (body.mode === "draft") {
      const system =
        "너는 OKR 평가자(팀장)의 피드백 메시지 초안을 쓰는 어시스턴트다. 첨부된 '2026 OKR 가이드' PDF의 기준·용어를 따른다. " +
        "팀원에게 보내는 조정요청/반려 메시지를 작성한다: 인사 1줄 → 보완 포인트 번호 목록(2~3개, 가이드 근거 포함) → 마무리 1줄. 전체 6줄 이내. " + TONE_RULE;
      const findings = body.findings.filter((f) => f.verdict !== "pass").map((f) => `- ${f.text}: ${f.reason ?? ""}`).join("\n");
      const userText =
        `팀원 "${body.memberName}"에게 보낼 ${body.kind === "adjustment" ? "조정 요청" : "반려"} 메시지 초안을 작성하라.\n\n` +
        `[OKR]\n${okrBlock(body.okrs)}\n\n[검토에서 확인된 보완 포인트]\n${findings || "- (평가자가 직접 판단)"}`;
      const schema = { type: "OBJECT", properties: { message: { type: "STRING" } }, required: ["message"] };
      const raw = JSON.parse(await generateWithGuide({ key, system, userText, responseSchema: schema })) as { message: string };
      return NextResponse.json({ message: raw.message, source: "gemini" });
    }

    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  } catch (e) {
    // 실패 상세는 서버 로그로만 남기고, 클라이언트는 목업 폴백으로 전환한다
    console.error("[api/validate]", e);
    return NextResponse.json({ error: "UPSTREAM" }, { status: 502 });
  }
}
