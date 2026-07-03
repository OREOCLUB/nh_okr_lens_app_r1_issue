// /api/validate — Gemini 기반 AI Validation · AI 초안 생성 (서버 전용)
// GEMINI_API_KEY는 .env.local에만 존재하며 클라이언트에 노출되지 않는다.
// 가이드 PDF(guide_docs/2026_OKR_GUIDE.pdf)를 Files API로 1회 업로드해 캐시하고,
// 매 판정 요청에 file_uri로 동봉해 "가이드 문서 기준" 판정을 강제한다 (D2).
import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE = "https://generativelanguage.googleapis.com";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GUIDE_PATH = path.join(process.cwd(), "guide_docs", "2026_OKR_GUIDE.pdf");

// ── 가이드 PDF 업로드 캐시 (Files API 파일은 48시간 유지) ────
let guideCache: { uri: string; expiresAt: number } | null = null;

async function uploadGuide(key: string): Promise<string> {
  if (guideCache && Date.now() < guideCache.expiresAt) return guideCache.uri;
  const bytes = await readFile(GUIDE_PATH);
  // resumable 업로드 2단계: start → upload+finalize
  const start = await fetch(`${API_BASE}/upload/v1beta/files?key=${key}`, {
    method: "POST",
    headers: {
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(bytes.byteLength),
      "X-Goog-Upload-Header-Content-Type": "application/pdf",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: { display_name: "2026_OKR_GUIDE.pdf" } }),
  });
  const uploadUrl = start.headers.get("x-goog-upload-url");
  if (!start.ok || !uploadUrl) throw new Error(`guide upload start failed: ${start.status}`);
  const up = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "X-Goog-Upload-Command": "upload, finalize",
      "X-Goog-Upload-Offset": "0",
      "Content-Length": String(bytes.byteLength),
    },
    body: new Uint8Array(bytes),
  });
  if (!up.ok) throw new Error(`guide upload failed: ${up.status}`);
  const meta = (await up.json()) as { file: { name: string; uri: string; state: string } };
  // PDF 처리 완료(ACTIVE) 대기
  let state = meta.file.state;
  for (let i = 0; state === "PROCESSING" && i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const chk = await fetch(`${API_BASE}/v1beta/${meta.file.name}?key=${key}`);
    state = ((await chk.json()) as { state: string }).state;
  }
  if (state !== "ACTIVE") throw new Error(`guide file not active: ${state}`);
  guideCache = { uri: meta.file.uri, expiresAt: Date.now() + 47 * 60 * 60 * 1000 };
  return meta.file.uri;
}

// ── Gemini 호출 공통 ─────────────────────────────────────────
interface GenArgs {
  key: string;
  system: string;
  userText: string;
  guideUri: string;
  responseSchema: unknown;
}

async function generate({ key, system, userText, guideUri, responseSchema }: GenArgs): Promise<string> {
  const res = await fetch(`${API_BASE}/v1beta/models/${MODEL}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{
        role: "user",
        parts: [
          { fileData: { fileUri: guideUri, mimeType: "application/pdf" } },
          { text: userText },
        ],
      }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema,
      },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
  if (!text) throw new Error("gemini empty response");
  return text;
}

const TONE_RULE =
  "말투 규칙: 모든 문구는 코칭 톤. '위반', '오류', '잘못됨' 같은 지적성 표현은 절대 쓰지 않는다. " +
  "'~하면 좋아요', '함께 정제해요' 같은 제안형 한국어(해요체)로 쓴다.";

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
    const guideUri = await uploadGuide(key);

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
      const raw = JSON.parse(await generate({ key, system, userText, guideUri, responseSchema: schema })) as {
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
      const raw = JSON.parse(await generate({ key, system, userText, guideUri, responseSchema: schema })) as { message: string };
      return NextResponse.json({ message: raw.message, source: "gemini" });
    }

    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  } catch (e) {
    // 실패 상세는 서버 로그로만 남기고, 클라이언트는 목업 폴백으로 전환한다
    console.error("[api/validate]", e);
    guideCache = null; // 파일 만료·삭제 가능성 대비 다음 호출 때 재업로드
    return NextResponse.json({ error: "UPSTREAM" }, { status: 502 });
  }
}
