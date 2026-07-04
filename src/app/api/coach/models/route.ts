// /api/coach/models — 입력한 Gemini API 키로 사용 가능한 모델 목록 조회 (서버 프록시).
// R3 "LLM 연동 설정"에서 모델명을 직접 입력하지 않고 드롭다운으로 고르게 한다.
// 키가 잘못됐으면 Google의 에러 메시지를 그대로 전달해 원인 파악을 돕는다.

import { NextRequest, NextResponse } from "next/server";

interface GeminiModel {
  name: string; // "models/gemini-2.0-flash"
  displayName?: string;
  supportedGenerationMethods?: string[];
}

export async function POST(request: NextRequest) {
  let apiKey = "";
  try {
    const body = (await request.json()) as { apiKey?: string };
    apiKey = body.apiKey?.trim() ?? "";
  } catch {
    /* fallthrough */
  }
  if (!apiKey) return NextResponse.json({ error: "API 키를 입력해주세요." });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}&pageSize=100`,
      { signal: controller.signal }
    );
    const data = (await res.json()) as { models?: GeminiModel[]; error?: { message?: string; status?: string } };
    if (!res.ok || data.error) {
      return NextResponse.json({
        error: `Google 응답: ${data.error?.status ?? res.status} — ${data.error?.message ?? "알 수 없는 오류"}`,
      });
    }
    const models = (data.models ?? [])
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("gemini"))
      .map((m) => ({
        id: m.name.replace(/^models\//, ""),
        displayName: m.displayName ?? m.name.replace(/^models\//, ""),
      }))
      // flash 계열(빠르고 저렴)을 앞으로, 이후 이름 역순(최신 우선)
      .sort((a, b) => {
        const af = a.id.includes("flash") ? 0 : 1;
        const bf = b.id.includes("flash") ? 0 : 1;
        return af - bf || b.id.localeCompare(a.id);
      });
    if (models.length === 0) return NextResponse.json({ error: "이 키로 사용할 수 있는 Gemini 대화 모델이 없어요." });
    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ error: "Google API에 연결하지 못했어요. 네트워크를 확인해주세요." });
  } finally {
    clearTimeout(timer);
  }
}
