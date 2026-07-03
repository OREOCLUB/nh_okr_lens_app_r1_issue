// gemini.ts — Gemini API 호출 공용 모듈 (서버 전용 · 전 역할 공유)
//
// ⚠️ 이 파일은 R1·R2·R3 가 함께 쓰는 공용 코어입니다. 수정하지 마세요.
//    역할별 프롬프트·스키마는 각자의 Route Handler 파일에 두세요.
//    사용법: docs/GEMINI_GUIDE.md 참조.
//
// 제공 기능
//   · uploadGuide()       : 2026 OKR 가이드 PDF를 Files API에 업로드하고 47시간 캐시
//   · generateWithGuide() : 가이드 PDF를 동봉해 구조화(JSON) 응답 생성
//
// 전제: .env.local 에 GEMINI_API_KEY (서버 전용 — NEXT_PUBLIC 금지),
//       guide_docs/2026_OKR_GUIDE.pdf 존재 (gitignore — 별도 수령)
import { readFile } from "fs/promises";
import path from "path";

const API_BASE = "https://generativelanguage.googleapis.com";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GUIDE_PATH = path.join(process.cwd(), "guide_docs", "2026_OKR_GUIDE.pdf");

// 전 역할 공통 말투 규칙 (MASTER_RULE) — 시스템 지시에 이어 붙여 쓰세요
export const TONE_RULE =
  "말투 규칙: 모든 문구는 코칭 톤. '위반', '오류', '잘못됨' 같은 지적성 표현은 절대 쓰지 않는다. " +
  "'~하면 좋아요', '함께 정제해요' 같은 제안형 한국어(해요체)로 쓴다.";

// ── 가이드 PDF 업로드 캐시 (Files API 파일은 48시간 유지) ────
let guideCache: { uri: string; expiresAt: number } | null = null;

/** 업로드 캐시 무효화 — Gemini 호출이 파일 문제로 실패했을 때 호출 */
export function invalidateGuideCache() {
  guideCache = null;
}

export async function uploadGuide(key: string): Promise<string> {
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

// ── 구조화 응답 생성 ─────────────────────────────────────────
export interface GenerateArgs {
  key: string; // process.env.GEMINI_API_KEY
  system: string; // 역할별 시스템 지시 (TONE_RULE을 이어 붙일 것)
  userText: string; // 사용자 프롬프트 (판정 대상 데이터 등)
  responseSchema: unknown; // Gemini responseSchema (OpenAPI subset) — JSON 응답 강제
  temperature?: number; // 기본 0.2
}

/**
 * 가이드 PDF를 동봉해 Gemini를 호출하고, responseSchema에 맞는 JSON 문자열을 반환한다.
 * 호출부에서 JSON.parse 후 사용. 실패 시 throw — 폴백은 호출부 책임.
 */
export async function generateWithGuide({ key, system, userText, responseSchema, temperature = 0.2 }: GenerateArgs): Promise<string> {
  const guideUri = await uploadGuide(key);
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
        temperature,
        responseMimeType: "application/json",
        responseSchema,
      },
    }),
  });
  if (!res.ok) {
    invalidateGuideCache(); // 파일 만료·삭제 가능성 대비 다음 호출 때 재업로드
    throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
  if (!text) throw new Error("gemini empty response");
  return text;
}
