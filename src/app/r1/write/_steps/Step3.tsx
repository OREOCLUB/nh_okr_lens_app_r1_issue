"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@/lib/auth";
import type { WizardState, ChatMsg, WizardKR } from "@/lib/wizard";
import type { CriteriaData } from "@/lib/dataAccess";
import { askCoach, nowTime, MAX_CHAT_STORE, type CoachReply } from "@/lib/aiCoach";
import { deriveChecks } from "@/lib/diagnosticEngine";
import { useLlmGate, LlmGateNotice, MockBadge } from "@/components/LlmGate";
import { Spinner } from "./shared";

function ChatBubble({ from, text, time, userInitial }: ChatMsg & { userInitial: string }) {
  const isAI = from === "ai";
  return (
    <div style={{ display: "flex", gap: 10, flexDirection: isAI ? "row" : "row-reverse" }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: isAI ? "linear-gradient(135deg, #00A968, #14342B)" : "#E5EBFB", color: isAI ? "#fff" : "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{isAI ? "✨" : userInitial}</div>
      <div style={{ maxWidth: "80%" }}>
        <div style={{ display: "flex", gap: 7, alignItems: "baseline", marginBottom: 4, flexDirection: isAI ? "row" : "row-reverse" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0F1A36" }}>{isAI ? "AI 코치" : ""}</span>
          <span style={{ fontSize: 10.5, color: "#A6AEC2" }}>{time}</span>
        </div>
        <div style={{ padding: "11px 15px", background: isAI ? "#fff" : "#3B5BDB", color: isAI ? "#1F2A4A" : "#fff", border: isAI ? "1px solid #E1E5EF" : "none", borderRadius: isAI ? "4px 13px 13px 13px" : "13px 4px 13px 13px", fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-line" }}>{text}</div>
      </div>
    </div>
  );
}

export function Step3({ state, set, user, criteria }: { state: WizardState; set: (fn: (s: WizardState) => WizardState) => void; user: Session; criteria: CriteriaData }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false); // 11항목 신호등 상세 (팝업 대신 카드 내 아코디언)
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [refineTargetId, setRefineTargetId] = useState<string | null>(null); // 대화 정제 대상 KR
  const llmGate = useLlmGate();

  // 구조화 출력 대기분 — 위저드 상태에 보관 (스텝을 오가도 유지)
  const p3 = state.step3 ?? { pendingRefinement: null, pendingNewKrs: [] };
  const pendingRefinement = p3.pendingRefinement;
  const pendingNewKrs = p3.pendingNewKrs;
  const setP3 = (patch: Partial<NonNullable<WizardState["step3"]>>) =>
    set((s) => ({ ...s, step3: { pendingRefinement: null, pendingNewKrs: [], ...(s.step3 ?? {}), ...patch } }));

  const opener = (): ChatMsg => {
    const target = state.krs.find((k) => !k.refined) ?? state.krs[0];
    return {
      from: "ai",
      time: nowTime(),
      text: target
        ? `[STEP 3 · 정제 — 키워드를 KR 문장으로]\n이 단계는 STEP 2의 키워드를 KR 문장으로 만들고, 측정 가능하게 다듬는 단계예요. 편하게 답하시면 문장은 제가 정리합니다.\n\n시작하려면 우측 KR 카드를 클릭해주세요 — 그 KR을 바로 점검하고 보완할 부분부터 같이 봐요.`
        : "[STEP 3 · 정제 — 키워드를 KR 문장으로]\n이 단계는 STEP 2의 키워드를 KR 문장으로 만들고 다듬는 단계예요. 정제할 재료가 아직 없으니 STEP 2에서 키워드를 먼저 모아주세요.",
    };
  };

  useEffect(() => {
    if (state.refineChat.length === 0) set((s) => ({ ...s, refineChat: [opener()] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 목업모드에서 키 정상화 시 자동 복귀 — 대화 초기화
  useEffect(() => {
    if (llmGate.recovered) {
      set((s) => ({ ...s, refineChat: [opener()], step3: { pendingRefinement: null, pendingNewKrs: [] } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [llmGate.recovered]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [state.refineChat.length, loading, pendingRefinement, pendingNewKrs.length]);

  // 응답이 끝나면 자동 포커스 — 연속 대화
  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  // KR 카드 클릭 → 그 KR을 즉시 점검하고 결과를 대화에 표시 → 대화로 보완 진행
  function selectRefineTarget(k: WizardKR) {
    setRefineTargetId(k.id);
    const checks = deriveChecks(
      { kr: k.kr, baseline: k.baseline, goal: k.goal, measureTool: k.measureTool, format: k.format, grades: { A: k.grades.A } },
      criteria.checklist
    );
    const fails = criteria.checklist.filter((_, i) => checks[i] === 0);
    const passN = checks.filter((c) => c === 1).length;
    const resultLine =
      fails.length > 0
        ? `점검 결과: ${passN}/${criteria.checklist.length} 통과 · 보완 후보 ${fails.length}건 — ${fails.map((f) => f.tag).join(", ")}`
        : `점검 결과: ${passN}/${criteria.checklist.length} 통과 · 보완 후보 없음`;
    const nextLine =
      fails.length > 0
        ? `"${fails[0].text}" 부분부터 같이 볼까요? 편하게 답해주시면 문장은 제가 다듬을게요.`
        : `문장 완성도가 좋아요. 측정 단위·집계 주기까지 명확하면 카드의 배지를 눌러 정제 완료로 표시해도 됩니다.`;
    const msg: ChatMsg = {
      from: "ai",
      time: nowTime(),
      text: `[KR ${String(k.num).padStart(2, "0")} 점검] "${k.kr}"\n${resultLine}\n\n${nextLine}`,
    };
    set((s) => ({ ...s, refineChat: [...s.refineChat, msg].slice(-MAX_CHAT_STORE) }));
    inputRef.current?.focus();
  }

  async function send(raw: string) {
    const t = raw.trim();
    if (!t || loading) return;
    if (llmGate.gate === "blocked" || llmGate.gate === "checking") return; // 키 점검 전 대화 차단
    setText("");
    setError(null);
    const userMsg: ChatMsg = { from: "user", time: nowTime(), text: t };
    set((s) => ({ ...s, refineChat: [...s.refineChat, userMsg].slice(-MAX_CHAT_STORE) }));
    setLoading(true);
    try {
      const history = [...state.refineChat, userMsg].map((m) => ({ role: m.from === "ai" ? ("assistant" as const) : ("user" as const), content: m.text }));
      const reply = await askCoach("refine", history, {
        userName: user.name,
        okrType: state.okrType === "ops" ? "운영" : "전략혁신",
        duty: state.profile.mainDuty,
        krs: state.krs.map((k) => ({ num: k.num, kr: k.kr, baseline: k.baseline, goal: k.goal })),
      });
      set((s) => ({ ...s, refineChat: [...s.refineChat, { from: "ai" as const, time: nowTime(), text: reply.text }].slice(-MAX_CHAT_STORE) }));
      // 구조화 출력 — 정제안·신규 KR 초안은 카드로 띄우고 사용자가 버튼으로 확정 (상태에 보관)
      if (reply.refinement) setP3({ pendingRefinement: reply.refinement });
      if (reply.newKrs && reply.newKrs.length > 0) setP3({ pendingNewKrs: reply.newKrs });
    } catch {
      setError("AI 코치 연결이 잠시 원활하지 않았어요. 다시 보내주시면 이어서 도와드릴게요 🙂");
    } finally {
      setLoading(false);
    }
  }

  // ── 구조화 출력 적용 — 정제안·신규 KR은 사용자가 버튼으로 확정해야 반영 ──
  function applyRefinement() {
    if (!pendingRefinement) return;
    const r = pendingRefinement;
    set((s) => ({
      ...s,
      krs: s.krs.map((k) => (k.num === r.num ? { ...k, before: k.kr, kr: r.after, refined: true } : k)),
      step3: { pendingRefinement: null, pendingNewKrs: s.step3?.pendingNewKrs ?? [] },
    }));
  }

  function dismissRefinement() {
    setP3({ pendingRefinement: null });
  }

  function addNewKr(draft: { kr: string; baseline: string; goal: string }) {
    set((s) => {
      const num = Math.max(0, ...s.krs.map((k) => k.num)) + 1;
      const newKr: WizardKR = {
        id: `kr${num}`,
        num,
        objective: s.basic.objective || "신규 목표",
        kr: draft.kr,
        format: "",
        baseline: draft.baseline,
        goal: draft.goal,
        measureTool: "",
        measureStat: "",
        measureCycle: "",
        weight: 15,
        grades: { S: "", A: "", B: "", C: "", D: "" },
        refined: false,
        chosenAI: null,
        aiSuggestion: "",
      };
      return {
        ...s,
        krs: [...s.krs, newKr],
        step3: { pendingRefinement: s.step3?.pendingRefinement ?? null, pendingNewKrs: (s.step3?.pendingNewKrs ?? []).filter((d) => d.kr !== draft.kr) },
      };
    });
  }

  function dismissNewKr(kr: string) {
    setP3({ pendingNewKrs: pendingNewKrs.filter((x) => x.kr !== kr) });
  }

  // KR 후보 삭제 — confirm 필수 (MASTER_RULE)
  function deleteKr(id: string) {
    const target = state.krs.find((k) => k.id === id);
    if (!target) return;
    if (!window.confirm(`KR ${String(target.num).padStart(2, "0")}을 삭제할까요?\n"${target.kr}"\n삭제하면 형태·등급 설정도 함께 사라져요.`)) return;
    set((s) => ({ ...s, krs: s.krs.filter((k) => k.id !== id) }));
  }

  // KR 현재값·목표값 인라인 수정 (STEP 4 형태 추천·STEP 5 등급 산정의 기반값)
  const patchKrValue = (id: string, field: "baseline" | "goal", v: string) =>
    set((s) => ({ ...s, krs: s.krs.map((k) => (k.id === id ? { ...k, [field]: v } : k)) }));

  // 체크된 키워드 중 아직 KR 후보에 반영되지 않은 것 (토큰 매칭)
  const uncoveredKeywords = Object.entries(state.basic.keywords)
    .filter(([, on]) => on)
    .map(([k]) => k)
    .filter((kw) => {
      const tokens = kw.split(/[\s/·]+/).filter((t) => t.length >= 2);
      if (tokens.length === 0) return false;
      return !state.krs.some((k) => tokens.every((t) => k.kr.includes(t)));
    });

  function generateFromKeywords() {
    if (uncoveredKeywords.length === 0 || loading) return;
    send(`다음 키워드로 KR 초안을 만들어주세요: ${uncoveredKeywords.join(", ")}`);
  }

  // ── 실시간 진단 — criteria 체크리스트를 주입해 계산 (하드코딩 없음) ──
  const checklist = criteria.checklist;
  const perKR = useMemo(
    () =>
      state.krs.map((k) =>
        deriveChecks(
          { kr: k.kr, baseline: k.baseline, goal: k.goal, measureTool: k.measureTool, format: k.format, grades: { A: k.grades.A } },
          checklist
        )
      ),
    [state.krs, checklist]
  );
  // 항목별 통과 = 모든 KR이 통과
  const itemPass = checklist.map((_, i) => perKR.every((checks) => checks[i] === 1));
  const passCount = itemPass.filter(Boolean).length;

  const toggleRefined = (id: string) =>
    set((s) => ({ ...s, krs: s.krs.map((k) => (k.id === id ? { ...k, refined: !k.refined } : k)) }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>
      {/* Main column — 키워드 배너 + 채팅 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      {/* STEP 2 키워드 → KR 초안 연결 배너 */}
      {uncoveredKeywords.length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #F1F4FD, #fff 60%)", border: "1px solid #C5D0F7", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>STEP 2에서 체크한 키워드 {uncoveredKeywords.length}개가 아직 KR 후보에 없어요</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
              {uncoveredKeywords.map((kw) => (
                <span key={kw} style={{ padding: "3px 10px", borderRadius: 999, background: "#fff", border: "1px solid #C5D0F7", color: "#213A8C", fontSize: 11.5, fontWeight: 600 }}>{kw}</span>
              ))}
            </div>
          </div>
          <button onClick={generateFromKeywords} disabled={loading} style={{ padding: "10px 16px", background: "#3B5BDB", color: "#fff", border: "none", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "var(--font-sans)", flexShrink: 0 }}>
            ✨ 키워드로 KR 초안 만들기
          </button>
        </div>
      )}

      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: 620 }}>
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#ECEFF5" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#7C87A4", padding: "3px 12px", background: "#F1F4FD", borderRadius: 999 }}>AI 정제 대화</span>
            <div style={{ flex: 1, height: 1, background: "#ECEFF5" }} />
          </div>
          {/* 이 화면 사용법 — 무엇을 하는 대화인지 명시 */}
          <div style={{ padding: "10px 14px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 10, fontSize: 11.5, color: "#5B6685", lineHeight: 1.6 }}>
            📌 <b>이렇게 진행해요</b> — ① 우측 <b>KR 카드를 클릭</b>해 정제할 KR을 고르고 ② 코치의 질문(측정 단위·도구·근거)에 답하면 ③ 코치가 <b>정제 제안 카드</b>를 띄워요 → &ldquo;이대로 적용&rdquo;을 눌러야 KR 문장이 바뀝니다. 키워드가 남아 있으면 상단 배너에서 KR 초안을 먼저 만들어주세요.
          </div>
          {state.refineChat.map((m, i) => <ChatBubble key={i} {...m} userInitial={user.name.charAt(0)} />)}
          {loading && (
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #00A968, #14342B)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✨</div>
              <div style={{ padding: "11px 15px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: "4px 13px 13px 13px", fontSize: 13.5, color: "#7C87A4" }}>KR을 점검하는 중이에요…</div>
            </div>
          )}
          {error && <div style={{ padding: "10px 14px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10, fontSize: 12.5, color: "#7A4A14" }}>{error}</div>}

          {/* 코치 정제안 카드 — 적용해야 KR에 반영 */}
          {pendingRefinement && (
            <div style={{ border: "1px solid #B9F1D8", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
              <div style={{ padding: "10px 15px", background: "#F1FBF6", fontSize: 12.5, fontWeight: 700, color: "#0A6B44", borderBottom: "1px solid #DFF3E8" }}>💎 AI 정제 제안 · KR {String(pendingRefinement.num).padStart(2, "0")}</div>
              <div style={{ padding: "14px 15px" }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em" }}>BEFORE</div>
                <div style={{ fontSize: 12.5, color: "#5B6685", margin: "3px 0 10px", lineHeight: 1.5, textDecoration: "line-through" }}>
                  {state.krs.find((k) => k.num === pendingRefinement.num)?.kr ?? "—"}
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#0A6B44", letterSpacing: "0.04em" }}>AFTER →</div>
                <div style={{ fontSize: 13, color: "#0F1A36", fontWeight: 600, margin: "3px 0 10px", lineHeight: 1.5 }}>{pendingRefinement.after}</div>
                {pendingRefinement.reason && <div style={{ fontSize: 11.5, color: "#5B6685", lineHeight: 1.5 }}><b>이유:</b> {pendingRefinement.reason}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={applyRefinement} style={{ padding: "7px 14px", background: "#00A968", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>✓ 이대로 적용</button>
                  <button onClick={dismissRefinement} style={{ padding: "7px 14px", background: "transparent", color: "#7C87A4", border: "1px solid #E1E5EF", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>건너뛰기</button>
                </div>
              </div>
            </div>
          )}

          {/* 코치 신규 KR 초안 카드 — 추가해야 후보에 반영 */}
          {pendingNewKrs.map((d) => (
            <div key={d.kr} style={{ border: "1px solid #C5D0F7", borderRadius: 12, background: "#fff", padding: "13px 15px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#2748C8", marginBottom: 5 }}>🆕 신규 KR 초안</div>
              <div style={{ fontSize: 13, color: "#0F1A36", fontWeight: 600, lineHeight: 1.5 }}>{d.kr}</div>
              <div className="mono" style={{ fontSize: 11, color: "#7C87A4", marginTop: 4 }}>Baseline: {d.baseline || "미정"} · Goal: {d.goal || "미정"}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => addNewKr(d)} style={{ padding: "7px 14px", background: "#3B5BDB", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>+ KR 후보로 추가</button>
                <button onClick={() => dismissNewKr(d.kr)} style={{ padding: "7px 14px", background: "transparent", color: "#7C87A4", border: "1px solid #E1E5EF", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>건너뛰기</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 22px 16px", borderTop: "1px solid #ECEFF5" }}>
          {llmGate.gate === "blocked" || llmGate.gate === "checking" ? (
            <LlmGateNotice gate={llmGate.gate} reason={llmGate.reason} onMock={llmGate.optInMock} />
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10, alignItems: "center" }}>
                <MockBadge gate={llmGate.gate} />
                {["측정 단위는 p95 월평균으로 할게요", "목표 수치의 근거를 설명할게요", "측정 방법을 한 번 더 점검해주세요"].map((c) => (
                  <button key={c} onClick={() => send(c)} style={{ padding: "6px 12px", background: "#F1FBF6", color: "#0A6B44", border: "1px solid #B9F1D8", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{c}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 12, padding: "8px 12px" }}>
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
                  rows={1}
                  disabled={loading}
                  placeholder={loading ? "코치가 답변을 작성하는 중이에요…" : "KR에 대해 답변하거나 질문하세요… (Enter로 전송)"}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 13.5, color: loading ? "#A6AEC2" : "#0F1A36", resize: "none", lineHeight: 1.5 }}
                />
                <button onClick={() => send(text)} disabled={loading} style={{ width: 34, height: 34, borderRadius: 9, background: "#00A968", border: "none", color: "#fff", fontSize: 14, cursor: loading ? "default" : "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{loading ? <Spinner /> : "↑"}</button>
              </div>
            </>
          )}
        </div>
      </div>
      </div>

      {/* Right sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "18px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>현재 KR 후보</div>
          <div style={{ fontSize: 11, color: "#7C87A4", margin: "3px 0 12px", lineHeight: 1.5 }}><b>카드를 클릭하면 그 KR이 대화 정제 대상</b>이 돼요 · 현재값→목표값도 여기서 확정하고 넘어가요</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {state.krs.map((k) => {
              const st = k.refined
                ? { label: "정제 완료", ico: "✓", c: "#2F9E5E", bg: "#ECFAF1" }
                : { label: "정제 중", ico: "●", c: "#3B5BDB", bg: "#F1F4FD" };
              const missing = !k.baseline.trim() || !k.goal.trim();
              const targeted = refineTargetId === k.id;
              const valInput = (field: "baseline" | "goal", val: string, ph: string) => (
                <input
                  className="mono"
                  value={val}
                  onChange={(e) => patchKrValue(k.id, field, e.target.value)}
                  placeholder={ph}
                  style={{ width: "100%", padding: "5px 8px", fontSize: 11, border: `1px solid ${val.trim() ? "#E1E5EF" : "#F0DFA0"}`, background: val.trim() ? "#fff" : "#FFFBE6", borderRadius: 7, outline: "none" }}
                />
              );
              return (
                <div
                  key={k.id}
                  onClick={() => selectRefineTarget(k)}
                  style={{ border: targeted ? "1.5px solid #00A968" : `1px solid ${missing ? "#F0DFA0" : "#ECEFF5"}`, borderRadius: 11, padding: "12px 13px", cursor: "pointer", boxShadow: targeted ? "0 0 0 3px rgba(0,169,104,.12)" : "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#213A8C" }}>KR {String(k.num).padStart(2, "0")}</span>
                    {targeted && <span style={{ padding: "1px 8px", borderRadius: 999, background: "#E0F7EC", color: "#00794B", fontSize: 10, fontWeight: 700 }}>💬 정제 중</span>}
                    <button onClick={(e) => { e.stopPropagation(); toggleRefined(k.id); }} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 999, background: st.bg, color: st.c, fontSize: 10.5, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "var(--font-sans)" }}><span style={{ fontSize: 9 }}>{st.ico}</span>{st.label}</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteKr(k.id); }} title="이 KR 삭제" style={{ width: 22, height: 22, borderRadius: 6, border: "1px solid #F5C6C6", background: "#fff", color: "#D14343", cursor: "pointer", fontSize: 12, lineHeight: 1, flexShrink: 0 }}>×</button>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#3A4565", lineHeight: 1.5 }}>{k.kr}</div>
                  {k.before && <div style={{ fontSize: 10.5, color: "#A6AEC2", marginTop: 5, textDecoration: "line-through" }}>{k.before}</div>}
                  {/* 현재값 → 목표값 확정 입력 (클릭이 정제 대상 선택으로 새지 않게) */}
                  <div onClick={(e) => e.stopPropagation()} style={{ display: "grid", gridTemplateColumns: "1fr 14px 1fr", gap: 4, alignItems: "center", marginTop: 8 }}>
                    {valInput("baseline", k.baseline, "현재값")}
                    <span style={{ textAlign: "center", color: "#A6AEC2", fontSize: 10 }}>→</span>
                    {valInput("goal", k.goal, "목표값")}
                  </div>
                  {missing && <div style={{ fontSize: 10, color: "#B8860B", marginTop: 4 }}>현재값·목표값을 채워야 다음 단계로 넘어갈 수 있어요</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #F1FBF6, #fff 55%)", border: "1px solid #B9F1D8", borderRadius: 14, padding: "16px 18px" }}>
          {/* 카드를 누르면 항목별 신호등 상세가 카드 안에서 펼쳐진다 (팝업 대신 아코디언 — 문맥 유지) */}
          <div onClick={() => setDetailOpen((v) => !v)} style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36" }}>✨ {checklist.length}항목 사전 검토</span>
              <span style={{ marginLeft: "auto", fontSize: 10.5, color: "#2F9E5E", fontWeight: 700 }}>실시간</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span className="mono" style={{ fontSize: 24, fontWeight: 700, color: "#0A6B44" }}>{passCount}</span>
              <span style={{ fontSize: 13, color: "#7C87A4" }}>/ {checklist.length} 통과</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#3B5BDB", fontWeight: 700 }}>{detailOpen ? "접기 ▲" : "신호등 보기 ▼"}</span>
            </div>
            <div style={{ marginTop: 8, height: 8, background: "#DFF3E8", borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${(passCount / Math.max(checklist.length, 1)) * 100}%`, background: "#00A968" }} /></div>
          </div>

          {detailOpen && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, borderTop: "1px dashed #B9F1D8", paddingTop: 12 }}>
              {checklist.map((c, i) => {
                const okCount = perKR.filter((checks) => checks[i] === 1).length;
                const total = perKR.length;
                const light = okCount === total ? "🟢" : okCount === 0 ? "🔴" : "🟡";
                const tone = okCount === total ? "#1F6B45" : okCount === 0 ? "#B23B3B" : "#9C5E26";
                return (
                  <div key={c.no} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "6px 8px", background: "#fff", border: "1px solid #ECEFF5", borderRadius: 8 }}>
                    <span style={{ fontSize: 11, marginTop: 1 }}>{light}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#3A4565", lineHeight: 1.45 }}>{c.no}. {c.text}</div>
                      <div className="mono" style={{ fontSize: 10, color: tone, marginTop: 2 }}>
                        KR {okCount}/{total} 통과{okCount < total && ` · ${c.tag} 보완 후보`}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{ fontSize: 10.5, color: "#2F6B48", lineHeight: 1.5, marginTop: 2 }}>🟢 전 KR 통과 · 🟡 일부 KR 보완 · 🔴 전 KR 보완 후보 — 확정이 아니라 함께 정제할 신호예요.</div>
            </div>
          )}

          {!detailOpen && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
              {checklist.filter((_, i) => !itemPass[i]).slice(0, 4).map((c) => (
                <div key={c.no} style={{ fontSize: 11, color: "#9C5E26", display: "flex", gap: 5 }}><span>·</span>{c.text}</div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 10, fontSize: 11, color: "#2F6B48", lineHeight: 1.5 }}>정제를 진행하면 통과 항목이 늘어나요. STEP 6에서 자세히 확인할 수 있어요.</div>
        </div>
      </div>
    </div>
  );
}
