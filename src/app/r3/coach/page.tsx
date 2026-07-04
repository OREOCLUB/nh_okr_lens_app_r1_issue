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
  MODE_LABEL,
  loadPublishedPrompts,
  loadPromptHistory,
  publishPrompts,
  nextVersion,
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
  const { showToast, toastNode } = useToast();

  useEffect(() => {
    const u = getCurrentUser();
    if (u) setUser(u);
    setHistory(loadPromptHistory());
    setPreviewText(PREVIEW_SAMPLE[activeMode]);
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

        {/* 우측 — 미리보기 + 이력 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                  <span style={{ marginLeft: "auto", padding: "1px 8px", borderRadius: 999, background: previewResult.source === "claude" ? "#FBF0E9" : "#F1F3F8", color: previewResult.source === "claude" ? "#D97757" : "#7C87A4", fontSize: 10, fontWeight: 700 }}>
                    {previewResult.source === "claude" ? "Claude 실응답" : "목 응답 (키 미설정)"}
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
