"use client";

// R3 · AI 코치 관리 — 프롬프트 운영 레이어 편집 → 미리보기 → 발행 → 이력·롤백.
// 3-레이어 중 "운영 레이어"만 편집 가능. 안전 코어(소송 안전·역할 고정)는 코드 고정으로 읽기만 노출.
// 발행: Supabase coach_prompts(전사) 시도 + localStorage(같은 브라우저 즉시 반영) 동시 기록.

import { useEffect, useState, type CSSProperties } from "react";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { getCurrentUser, type Session } from "@/lib/auth";
import { getCoachPrompts, saveCoachPrompts } from "@/lib/dataAccess";
import {
  DEFAULT_COACH_PROMPTS,
  DEFAULT_LLM_MODEL,
  MODE_LABEL,
  loadPublishedPrompts,
  loadPromptHistory,
  publishPrompts,
  nextVersion,
  loadLlmSettings,
  saveLlmSettings,
  clearLlmSettings,
  type CoachMode,
  type CoachPromptConfig,
} from "@/lib/coachPrompts";

const label: CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#3A4565", marginBottom: 7 };
const input: CSSProperties = { width: "100%", padding: "11px 14px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, fontSize: 13.5, color: "#0F1A36", fontFamily: "var(--font-sans)", outline: "none" };
const cardStyle: CSSProperties = { background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 24px", boxShadow: "var(--shadow-xs)" };

const MODES: CoachMode[] = ["basic", "refine", "grade", "coaching"];

// 미리보기 테스트용 샘플 발화 (mode별)
const PREVIEW_SAMPLE: Record<CoachMode, string> = {
  basic: "올해는 결제 응답속도를 확 줄이고 싶어요.",
  refine: "응답속도를 많이 개선한다로 쓰면 될까요?",
  grade: "S등급 기준을 어떻게 잡을까요?",
  coaching: "KR 진행이 요즘 정체된 느낌이에요.",
};

// 안전 코어 요약 (route.ts SAFETY_CORE와 동일 취지 — 표시용)
const SAFETY_SUMMARY = [
  "역할 고정 — OKR 코치 외 역할 수행·규칙 무시 요청 거부",
  "지적성 표현(위반·잘못·오류·부적합) 금지 — 항상 코칭 톤",
  "평가 결과·등급 확정 예측 및 타 직원 비교 금지",
  "KR 원칙(측정 가능·통제 가능·도전적) 및 제외 기준 안내 유지",
];

export default function R3CoachPage() {
  const [user, setUser] = useState<Session | null>(null);
  const [draft, setDraft] = useState<CoachPromptConfig>(DEFAULT_COACH_PROMPTS);
  const [source, setSource] = useState<"db" | "local" | "default">("default");
  const [activeMode, setActiveMode] = useState<CoachMode>("refine");
  const [history, setHistory] = useState<CoachPromptConfig[]>([]);
  const [previewText, setPreviewText] = useState("");
  const [previewResult, setPreviewResult] = useState<{ text: string; source: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  // LLM 연동 설정 (Gemini)
  const [llmKey, setLlmKey] = useState("");
  const [llmModel, setLlmModel] = useState(DEFAULT_LLM_MODEL);
  const [llmSaved, setLlmSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [llmTesting, setLlmTesting] = useState(false);
  const [models, setModels] = useState<{ id: string; displayName: string }[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const { showToast, toastNode } = useToast();

  useEffect(() => {
    const u = getCurrentUser();
    if (u) setUser(u);
    setHistory(loadPromptHistory());
    setPreviewText(PREVIEW_SAMPLE[activeMode]);
    const llm = loadLlmSettings();
    if (llm) {
      setLlmKey(llm.apiKey);
      setLlmModel(llm.model || DEFAULT_LLM_MODEL);
      setLlmSaved(true);
    }
    // 발행본 로드: DB → localStorage → 기본값
    getCoachPrompts().then((db) => {
      if (db) {
        setDraft(db);
        setSource("db");
      } else {
        const local = loadPublishedPrompts();
        if (local) {
          setDraft(local);
          setSource("local");
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPreviewText(PREVIEW_SAMPLE[activeMode]);
    setPreviewResult(null);
  }, [activeMode]);

  const patch = (p: Partial<CoachPromptConfig>) => setDraft((d) => ({ ...d, ...p }));
  const patchMode = (m: CoachMode, field: "guide" | "example", v: string) =>
    setDraft((d) => ({ ...d, modes: { ...d.modes, [m]: { ...d.modes[m], [field]: v } } }));

  async function runPreview() {
    if (previewLoading) return;
    setPreviewLoading(true);
    setPreviewResult(null);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: activeMode,
          messages: [{ role: "user", content: previewText }],
          context: { userName: "김지훈", okrType: "운영", duty: "결제플랫폼 백엔드 성능/튜닝", krs: [{ num: 1, kr: "결제 게이트웨이 APM p95 응답속도 850ms → 500ms", baseline: "850ms", goal: "500ms" }] },
          promptConfig: draft, // 발행 전 초안으로 테스트
          llm: llmKey.trim() ? { provider: "gemini", apiKey: llmKey.trim(), model: llmModel.trim() || DEFAULT_LLM_MODEL } : undefined,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { text: string; source: string };
      setPreviewResult(data);
    } catch {
      showToast("미리보기 호출이 원활하지 않았어요. 잠시 후 다시 시도해주세요.", "warn");
    } finally {
      setPreviewLoading(false);
    }
  }

  // ── LLM 연동 설정 ──
  // 키만 넣으면 사용 가능한 모델 목록을 불러와 드롭다운으로 고른다 (모델명 직접 입력 불필요)
  async function fetchModels(): Promise<{ id: string; displayName: string }[] | null> {
    const key = llmKey.trim();
    if (!key) {
      showToast("먼저 API 키를 입력해주세요.", "warn");
      return null;
    }
    setLoadingModels(true);
    try {
      const res = await fetch("/api/coach/models", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = (await res.json()) as { models?: { id: string; displayName: string }[]; error?: string };
      if (data.error || !data.models) {
        showToast(`모델 목록을 불러오지 못했어요.\n${data.error ?? ""}`, "warn");
        return null;
      }
      setModels(data.models);
      // 저장돼 있던 모델이 목록에 있으면 유지, 없으면 첫 번째(flash 우선) 자동 선택
      const keep = data.models.find((m) => m.id === llmModel);
      setLlmModel(keep ? keep.id : data.models[0].id);
      showToast(`사용 가능한 모델 ${data.models.length}개를 불러왔어요. 목록에서 골라주세요.`, "success");
      return data.models;
    } catch {
      showToast("모델 목록 조회 중 문제가 있었어요. 잠시 후 다시 시도해주세요.", "warn");
      return null;
    } finally {
      setLoadingModels(false);
    }
  }

  function saveLlm() {
    const key = llmKey.trim();
    if (!key) {
      showToast("API 키를 입력해주세요.", "warn");
      return;
    }
    saveLlmSettings({ provider: "gemini", apiKey: key, model: llmModel.trim() || DEFAULT_LLM_MODEL });
    setLlmSaved(true);
    showToast("Gemini 연동 설정을 저장했어요. 지금부터 이 브라우저의 AI 코치가 Gemini로 응답해요.", "success");
  }

  function removeLlm() {
    if (!window.confirm("저장된 Gemini API 키를 삭제할까요?\n삭제하면 AI 코치는 목 응답 모드로 돌아가요.")) return;
    clearLlmSettings();
    setLlmKey("");
    setLlmModel(DEFAULT_LLM_MODEL);
    setLlmSaved(false);
    showToast("Gemini 연동 설정을 삭제했어요.", "info");
  }

  async function testLlm() {
    const key = llmKey.trim();
    if (!key) {
      showToast("먼저 API 키를 입력해주세요.", "warn");
      return;
    }
    setLlmTesting(true);
    try {
      // ① 키 검증 + 모델 확보 — 실패 시 Google 에러 메시지 그대로 안내
      let model = llmModel.trim();
      if (models.length === 0) {
        const fetched = await fetchModels();
        if (!fetched) return; // fetchModels가 원인 토스트를 띄움
        model = fetched.find((m) => m.id === model) ? model : fetched[0].id;
      }
      // ② 실제 대화 호출 테스트
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "coaching",
          messages: [{ role: "user", content: "연결 테스트입니다. 한 문장으로 인사해주세요." }],
          llm: { provider: "gemini", apiKey: key, model: model || DEFAULT_LLM_MODEL },
        }),
      });
      const data = (await res.json()) as { source: string };
      if (data.source === "gemini") showToast(`✅ Gemini 연결 성공! (${model}) 실제 LLM 응답이 확인됐어요.`, "success");
      else showToast(`키는 유효하지만 ${model} 모델 호출에 실패했어요. 목록에서 다른 모델을 골라 다시 테스트해주세요.`, "warn");
    } catch {
      showToast("연결 테스트 중 문제가 있었어요. 잠시 후 다시 시도해주세요.", "warn");
    } finally {
      setLlmTesting(false);
    }
  }

  async function publish() {
    if (publishing) return;
    if (!window.confirm("현재 편집 내용을 발행할까요?\n발행 즉시 R1 위저드·코칭의 AI 코치에 적용돼요. (이전 버전은 이력에 보관)")) return;
    setPublishing(true);
    try {
      const config: CoachPromptConfig = { ...draft, ...nextVersion(user?.name ?? "R3") };
      publishPrompts(config); // localStorage — 같은 브라우저 즉시 반영
      const dbResult = await saveCoachPrompts(config); // DB — 전사 반영 (미연결 시 로컬만)
      setDraft(config);
      setHistory(loadPromptHistory());
      setSource(dbResult.ok ? "db" : "local");
      showToast(
        dbResult.ok
          ? `${config.version} 발행 완료 — 전사 AI 코치에 적용됐어요.`
          : `${config.version} 발행 완료 — 이 브라우저의 AI 코치에 적용됐어요. (DB 연결 시 전사 반영)`,
        "success"
      );
    } finally {
      setPublishing(false);
    }
  }

  function rollback(cfg: CoachPromptConfig) {
    if (!window.confirm(`${cfg.version} 버전 내용을 편집기로 불러올까요?\n(불러온 뒤 "발행"을 눌러야 실제 적용돼요)`)) return;
    setDraft(cfg);
    showToast(`${cfg.version} 내용을 불러왔어요. 검토 후 발행해주세요.`, "info");
  }

  const bw = draft.bannedWords;

  return (
    <RoleShell role="R3" title="AI 코치 관리" subtitle={user ? `${user.name} · 프롬프트 운영 레이어 편집` : ""}>
      {toastNode}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase" }}>운영 · AI 코치</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em" }}>AI 코치의 말투와 지침을 관리해요</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5B6685", lineHeight: 1.6 }}>
          여기서 발행하면 R1 작성 위저드·AI 코칭의 코치가 즉시 바뀌어요. 안전 규칙(소송 안전·역할 고정)은 시스템에 고정되어 있어 이 화면으로 바뀌지 않아요.
        </p>
      </div>

      {/* 현재 발행 상태 */}
      <div style={{ ...cardStyle, marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "#FFEDE2", color: "#E07A3C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>운영 중 버전 · <span className="mono">{draft.version}</span></div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 2 }}>
            {draft.publishedAt ? `${new Date(draft.publishedAt).toLocaleString("ko-KR")} · ${draft.publishedBy} 발행` : "아직 발행 이력 없음 (코드 기본값 사용 중)"}
          </div>
        </div>
        <span style={{ padding: "4px 12px", borderRadius: 999, background: source === "db" ? "#ECFAF1" : "#F1F3F8", color: source === "db" ? "#2F9E5E" : "#5B6685", fontSize: 11.5, fontWeight: 700 }}>
          {source === "db" ? "전사 DB 연동" : source === "local" ? "이 브라우저 적용" : "기본값"}
        </span>
        <Button variant="primary" onClick={publish} disabled={publishing}>{publishing ? "발행 중…" : "📢 발행하기"}</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
        {/* 좌측 — 편집기 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* 안전 코어 (읽기 전용) */}
          <div style={{ ...cardStyle, background: "#F9FAFC" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 15 }}>🔒</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>안전 코어 (시스템 고정 — 편집 불가)</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {SAFETY_SUMMARY.map((s) => (
                <div key={s} style={{ display: "flex", gap: 7, fontSize: 12, color: "#5B6685", lineHeight: 1.5 }}><span style={{ color: "#A4ADC4" }}>·</span>{s}</div>
              ))}
            </div>
          </div>

          {/* 페르소나 */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>🎭 코치 페르소나 · 말투</div>
            <textarea style={{ ...input, minHeight: 84, resize: "vertical", lineHeight: 1.6 }} value={draft.persona} onChange={(e) => patch({ persona: e.target.value })} />
            <div style={{ marginTop: 12 }}>
              <label style={label}>답변 말미 안내 문구</label>
              <input style={input} value={draft.closingNote} onChange={(e) => patch({ closingNote: e.target.value })} />
            </div>
          </div>

          {/* 스텝별 지침 */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>🧭 스텝별 코치 지침</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {MODES.map((m) => (
                <button key={m} onClick={() => setActiveMode(m)} style={{ padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${activeMode === m ? "#E07A3C" : "#E1E5EF"}`, background: activeMode === m ? "#FFEDE2" : "#fff", color: activeMode === m ? "#B85C1F" : "#5B6685", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  {MODE_LABEL[m]}
                </button>
              ))}
            </div>
            <label style={label}>지침</label>
            <textarea style={{ ...input, minHeight: 90, resize: "vertical", lineHeight: 1.6 }} value={draft.modes[activeMode].guide} onChange={(e) => patchMode(activeMode, "guide", e.target.value)} />
            <div style={{ marginTop: 12 }}>
              <label style={label}>좋은 예시 (few-shot)</label>
              <input style={input} value={draft.modes[activeMode].example} onChange={(e) => patchMode(activeMode, "example", e.target.value)} />
            </div>
          </div>

          {/* 금칙어 사전 */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>🛡️ 금칙어 → 대체어 사전</span>
              <button onClick={() => patch({ bannedWords: [...bw, { from: "", to: "" }] })} style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 8, border: "1px solid #E1E5EF", background: "#fff", color: "#3A4565", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>+ 추가</button>
            </div>
            <div style={{ fontSize: 11.5, color: "#7C87A4", marginBottom: 12 }}>AI 응답에서 지적성 표현을 코칭 톤으로 자동 치환해요 (응답 후처리 이중 안전장치).</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {bw.map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input style={{ ...input, flex: 1 }} value={w.from} placeholder="금칙어" onChange={(e) => patch({ bannedWords: bw.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)) })} />
                  <span style={{ color: "#A4ADC4" }}>→</span>
                  <input style={{ ...input, flex: 1 }} value={w.to} placeholder="대체어" onChange={(e) => patch({ bannedWords: bw.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)) })} />
                  <button onClick={() => { if (window.confirm(`"${w.from || "(빈 항목)"}" 치환 규칙을 삭제할까요?`)) patch({ bannedWords: bw.filter((_, j) => j !== i) }); }} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E1E5EF", background: "#fff", color: "#D14343", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 우측 — LLM 연동 + 미리보기 + 이력 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* LLM 연동 설정 (Gemini) */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 15 }}>🔌</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>LLM 연동 설정</span>
              <span style={{ padding: "2px 9px", borderRadius: 999, background: "#E8F0FE", color: "#4285F4", fontSize: 10.5, fontWeight: 700 }}>✧ Gemini</span>
              <span style={{ marginLeft: "auto", padding: "2px 9px", borderRadius: 999, background: llmSaved ? "#ECFAF1" : "#F1F3F8", color: llmSaved ? "#2F9E5E" : "#7C87A4", fontSize: 10.5, fontWeight: 700 }}>{llmSaved ? "연동됨" : "미설정"}</span>
            </div>
            <div style={{ fontSize: 11.5, color: "#7C87A4", marginBottom: 12, lineHeight: 1.55 }}>
              키를 저장하면 AI 코치가 Gemini 실응답으로 동작해요. 키는 이 브라우저에만 저장돼요 (전사 적용은 서버 환경 변수 <span className="mono">GEMINI_API_KEY</span> 권장).
            </div>
            <label style={label}>① API 키</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                type={showKey ? "text" : "password"}
                style={{ ...input, flex: 1 }}
                value={llmKey}
                onChange={(e) => setLlmKey(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") fetchModels(); }}
                placeholder="AIza… (Google AI Studio에서 발급)"
                autoComplete="off"
              />
              <button onClick={() => setShowKey((v) => !v)} title={showKey ? "가리기" : "표시"} style={{ width: 42, borderRadius: 10, border: "1px solid #E1E5EF", background: "#fff", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>{showKey ? "🙈" : "👁"}</button>
            </div>
            <label style={label}>② 모델 — 직접 입력할 필요 없어요</label>
            {models.length > 0 ? (
              <select
                className="mono"
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                style={{ ...input, marginBottom: 12, cursor: "pointer" }}
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.displayName} ({m.id})</option>
                ))}
              </select>
            ) : (
              <button
                onClick={fetchModels}
                disabled={loadingModels}
                style={{ ...input, marginBottom: 12, textAlign: "left", cursor: loadingModels ? "default" : "pointer", color: "#3B5BDB", fontWeight: 600, background: "#F1F4FD", border: "1px dashed #C5D0F7" }}
              >
                {loadingModels ? "모델 목록 불러오는 중…" : "🔄 키 입력 후 여기를 눌러 사용 가능한 모델 불러오기"}
              </button>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="primary" size="sm" onClick={saveLlm}>저장</Button>
              <Button variant="secondary" size="sm" onClick={testLlm} disabled={llmTesting || loadingModels}>{llmTesting ? "테스트 중…" : "연결 테스트"}</Button>
              <div style={{ flex: 1 }} />
              <Button variant="ghost" size="sm" onClick={removeLlm}>키 삭제</Button>
            </div>
            {models.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 11, color: "#7C87A4" }}>
                ✓ 이 키로 쓸 수 있는 모델 {models.length}개 확인됨 · 목록이 바뀌면 <button onClick={fetchModels} style={{ border: "none", background: "none", color: "#3B5BDB", cursor: "pointer", fontSize: 11, fontWeight: 600, padding: 0 }}>다시 불러오기</button>
              </div>
            )}
          </div>

          {/* 미리보기 테스트 */}
          <div style={{ ...cardStyle, background: "linear-gradient(135deg, #F1FBF6, #fff 60%)", border: "1px solid #B9F1D8" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>🔬 미리보기 테스트</div>
            <div style={{ fontSize: 11.5, color: "#2F6B48", marginBottom: 12 }}>발행 전에 현재 편집 내용으로 코치 응답을 확인해요 · 대상: {MODE_LABEL[activeMode]}</div>
            <textarea
              style={{ ...input, minHeight: 60, resize: "vertical", lineHeight: 1.5 }}
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="테스트할 직원 발화를 입력하세요"
            />
            <Button variant="ai" fullWidth style={{ marginTop: 10 }} onClick={runPreview} disabled={previewLoading}>
              {previewLoading ? "코치 응답 생성 중…" : "▶ 이 설정으로 응답 테스트"}
            </Button>
            {previewResult && (
              <div style={{ marginTop: 12, padding: "12px 14px", background: "#fff", border: "1px solid #DFF3E8", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 12 }}>✨</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0F1A36" }}>코치 응답</span>
                  <span style={{ marginLeft: "auto", padding: "1px 8px", borderRadius: 999, background: previewResult.source === "gemini" ? "#E8F0FE" : previewResult.source === "claude" ? "#FBF0E9" : "#F1F3F8", color: previewResult.source === "gemini" ? "#4285F4" : previewResult.source === "claude" ? "#D97757" : "#7C87A4", fontSize: 10, fontWeight: 700 }}>
                    {previewResult.source === "gemini" ? "✧ Gemini 실응답" : previewResult.source === "claude" ? "Claude 실응답" : "목 응답 (키 미설정)"}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "#1F2A4A", lineHeight: 1.65, whiteSpace: "pre-line" }}>{previewResult.text}</div>
              </div>
            )}
          </div>

          {/* 버전 이력 */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>🗂️ 버전 이력 <span style={{ fontWeight: 500, color: "#7C87A4", fontSize: 12 }}>(최근 {history.length}건)</span></div>
            {history.length === 0 && <div style={{ fontSize: 12.5, color: "#7C87A4", padding: "8px 0" }}>아직 이력이 없어요. 첫 발행 후 이전 버전이 여기에 보관돼요.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid #ECEFF5", borderRadius: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: "#0F1A36" }}>{h.version}</div>
                    <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 2 }}>{h.publishedAt ? new Date(h.publishedAt).toLocaleString("ko-KR") : "—"} · {h.publishedBy}</div>
                  </div>
                  <button onClick={() => rollback(h)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #E1E5EF", background: "#fff", color: "#3A4565", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", flexShrink: 0 }}>↩ 불러오기</button>
                </div>
              ))}
            </div>
          </div>

          {/* 연동 안내 */}
          <div style={{ padding: "12px 16px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, fontSize: 11.5, color: "#5B6685", lineHeight: 1.6 }}>
            💡 발행 즉시 이 브라우저의 R1 코치에 적용돼요. Supabase 연결 시(<span className="mono">supabase/coach_prompts.sql</span> 실행) 전사 반영으로 자동 승격됩니다.
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
