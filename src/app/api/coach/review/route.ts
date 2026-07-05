// /api/coach/review — R1 STEP 6 최종 검토 (MVP: 단일 모델 실검토 · 멀티 AI 교차검증은 P2)
// 공용 모듈(src/lib/server/gemini.ts)로 2026 OKR 가이드 PDF를 동봉해 근거 있는 검토를 생성한다.
// 가이드 PDF/키가 없으면 일반 Gemini JSON 호출로 폴백, 그것도 안 되면 { error } 반환
// (클라이언트가 결정적 목 검토로 폴백).
import { NextResponse } from "next/server";
import { generateWithGuide, TONE_RULE } from "@/lib/server/gemini";
import { DEFAULT_LLM_MODEL } from "@/lib/coachPrompts";

export const runtime = "nodejs";

interface ReviewBody {
  kr: {
    num: number;
    kr: string;
    format: string;
    baseline: string;
    goal: string;
    measure: string;
    weight: number;
    grades: Record<string, string>;
  };
  checklist: { no: number; text: string; tag: string }[];
  llm?: { apiKey?: string; model?: string };
}

interface ReviewOut {
  score: number;
  verdict: "pass" | "warn" | "fail";
  summary: string;
  items: { c: string; v: "pass" | "warn" | "fail"; note: string }[];
  suggestion: string;
}

const SCHEMA = {
  type: "OBJECT",
  properties: {
    score: { type: "NUMBER" },
    verdict: { type: "STRING", enum: ["pass", "warn", "fail"] },
    summary: { type: "STRING" },
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          c: { type: "STRING" },
          v: { type: "STRING", enum: ["pass", "warn", "fail"] },
          note: { type: "STRING" },
        },
        required: ["c", "v", "note"],
      },
    },
    suggestion: { type: "STRING" },
  },
  required: ["score", "verdict", "summary", "items", "suggestion"],
};

function buildPrompts(body: ReviewBody): { system: string; userText: string } {
  const k = body.kr;
  const system =
    "너는 OKR 최종 검토 어시스턴트다. 아래 KR 1건을 검토한다. " +
    "score는 0~10 (소수 1자리), verdict는 종합 판정(pass=이대로 제출 가능, warn=보완 권장, fail=보완 필수). " +
    "items는 3~4개 관점(측정성/도전성/증빙/의존성/변별력 중 선택)별 판정과 짧은 note. " +
    "summary는 2문장 이내 총평, suggestion은 가장 효과적인 보완 1가지를 구체적으로. " +
    TONE_RULE;
  const userText =
    `[검토 대상 KR ${String(k.num).padStart(2, "0")}]\n` +
    `KR: ${k.kr}\n유형: ${k.format || "-"} · 가중치 ${k.weight}%\nBaseline→Goal: ${k.baseline} → ${k.goal}\n측정 방법: ${k.measure || "-"}\n` +
    `등급 기준: ${Object.entries(k.grades).map(([g, v]) => `${g}=${v || "-"}`).join(" / ")}\n\n` +
    `[참고 체크리스트]\n${body.checklist.map((c) => `${c.no}. ${c.text} (${c.tag})`).join("\n")}`;
  return { system, userText };
}

// 가이드 PDF 없이도 동작하는 일반 JSON 호출 폴백
async function generatePlain(key: string, model: string, system: string, userText: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userText }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json", responseSchema: SCHEMA },
      }),
    }
  );
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
  if (!text) throw new Error("empty");
  return text;
}

export async function POST(req: Request) {
  let body: ReviewBody;
  try {
    body = (await req.json()) as ReviewBody;
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }
  if (!body.kr?.kr || !body.checklist?.length) return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });

  const key = body.llm?.apiKey || process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "NO_KEY" });

  const { system, userText } = buildPrompts(body);
  const model = body.llm?.model || process.env.GEMINI_MODEL || DEFAULT_LLM_MODEL;

  let raw: string | null = null;
  try {
    // ① 가이드 PDF 동봉 검토 (근거 인용 가능)
    raw = await generateWithGuide({ key, system, userText, responseSchema: SCHEMA });
  } catch {
    try {
      // ② 가이드 없이 일반 JSON 검토
      raw = await generatePlain(key, model, system, userText);
    } catch (e) {
      console.error("[api/coach/review]", e);
      return NextResponse.json({ error: "UPSTREAM" });
    }
  }

  try {
    const review = JSON.parse(raw) as ReviewOut;
    const score = Math.max(0, Math.min(10, Math.round(review.score * 10) / 10));
    return NextResponse.json({
      review: {
        ...review,
        score,
        scoreLabel: score >= 8.5 ? "Strong" : score >= 7.5 ? "Good" : score >= 6.5 ? "Acceptable" : "Needs Work",
      },
      source: "gemini",
    });
  } catch {
    return NextResponse.json({ error: "PARSE" });
  }
}
