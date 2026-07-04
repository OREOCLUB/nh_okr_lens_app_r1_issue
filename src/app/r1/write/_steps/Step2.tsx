"use client";

import { useEffect, useRef, useState } from "react";
import { label, input, hint } from "./shared";
import type { Session } from "@/lib/auth";
import type { WizardState, ChatMsg } from "@/lib/wizard";
import type { CriteriaData } from "@/lib/dataAccess";
import { askCoach, nowTime, MAX_CHAT_STORE } from "@/lib/aiCoach";

// 대화에서 키워드 자동 추출용 사전 (결정적)
const KEYWORD_DICT: [RegExp, string][] = [
  [/응답\s?속도|p9\d|레이턴시|ms/i, "APM p95 응답속도"],
  [/커버리지|테스트/, "단위테스트 커버리지"],
  [/알림|자동화/, "장애 알림 자동화"],
  [/SRE|협업|인프라팀/i, "SRE 협업"],
  [/안정성|안정화/, "결제 안정성"],
  [/배포/, "배포 자동화"],
  [/보안|권한/, "보안/권한 점검"],
];

function ChatMessage({ from, text, time, userInitial }: ChatMsg & { userInitial: string }) {
  const isAI = from === "ai";
  return (
    <div style={{ display: "flex", gap: 10, flexDirection: isAI ? "row" : "row-reverse" }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: isAI ? "linear-gradient(135deg, #00A968, #14342B)" : "#E5EBFB", color: isAI ? "#fff" : "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{isAI ? "✨" : userInitial}</div>
      <div style={{ maxWidth: "78%" }}>
        <div style={{ display: "flex", gap: 7, alignItems: "baseline", marginBottom: 4, flexDirection: isAI ? "row" : "row-reverse" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0F1A36" }}>{isAI ? "AI 코치" : ""}</span>
          <span style={{ fontSize: 10.5, color: "#A6AEC2" }}>{time}</span>
        </div>
        <div style={{ padding: "11px 15px", background: isAI ? "#fff" : "#3B5BDB", color: isAI ? "#1F2A4A" : "#fff", border: isAI ? "1px solid #E1E5EF" : "none", borderRadius: isAI ? "4px 13px 13px 13px" : "13px 4px 13px 13px", fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-line" }}>{text}</div>
      </div>
    </div>
  );
}

export function Step2({ state, set, user, criteria, onGo }: { state: WizardState; set: (fn: (s: WizardState) => WizardState) => void; user: Session; criteria: CriteriaData; onGo: (n: number) => void }) {
  const b = state.basic;
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // 키워드 반영 순간 표시 — 새로 추가된 칩이 잠깐 펄스 + 패널에 +N 배지
  const [flashKeys, setFlashKeys] = useState<string[]>([]);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flash(keys: string[]) {
    if (keys.length === 0) return;
    setFlashKeys(keys);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashKeys([]), 2600);
  }

  const setBasic = (patch: Partial<WizardState["basic"]>) =>
    set((s) => ({ ...s, basic: { ...s.basic, ...patch } }));

  const okrTypeLabel = state.okrType === "ops" ? "운영" : "전략혁신";
  const greeting = (): ChatMsg => ({
    from: "ai",
    time: nowTime(),
    text: `[STEP 2 · 기초 정보 — ${okrTypeLabel} OKR]\n이 단계는 KR을 만드는 단계가 아니라, KR의 재료가 될 키워드를 도출하는 단계예요. 업무 이야기를 편하게 들려주시면 키워드 정리는 제가 할게요 (우측 패널에 쌓입니다).\n\n첫 질문: 올해 본업에서 반드시 지킬 것 1가지는 무엇인가요?`,
  });

  // 첫 진입 시 인사말 시드
  useEffect(() => {
    if (b.chat.length === 0) setBasic({ chat: [greeting()] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [b.chat.length, loading]);

  async function send(raw: string) {
    const t = raw.trim();
    if (!t || loading) return;
    setText("");
    setError(null);
    const userMsg: ChatMsg = { from: "user", time: nowTime(), text: t };

    // 키워드 자동 추출 (결정적 사전 매칭)
    const found = KEYWORD_DICT.filter(([re]) => re.test(t)).map(([, kw]) => kw);
    const foundNew = found.filter((kw) => !(kw in b.keywords));
    set((s) => {
      const keywords = { ...s.basic.keywords };
      for (const kw of found) if (!(kw in keywords)) keywords[kw] = true;
      return { ...s, basic: { ...s.basic, chat: [...s.basic.chat, userMsg].slice(-MAX_CHAT_STORE), keywords } };
    });
    flash(foundNew);

    setLoading(true);
    try {
      const history = [...b.chat, userMsg].map((m) => ({ role: m.from === "ai" ? ("assistant" as const) : ("user" as const), content: m.text }));
      const reply = await askCoach("basic", history, {
        userName: user.name,
        okrType: state.okrType === "ops" ? "운영" : "전략혁신",
        duty: state.profile.mainDuty,
      });
      // AI가 뽑은 키워드는 우측 패널에 체크 상태로 합류, 추천 답변 칩은 대화 맥락 따라 갱신
      const replyNew = (reply.keywords ?? []).filter((kw) => !(kw in b.keywords) && !found.includes(kw));
      set((s) => {
        const keywords = { ...s.basic.keywords };
        for (const kw of reply.keywords ?? []) if (!(kw in keywords)) keywords[kw] = true;
        return {
          ...s,
          basic: {
            ...s.basic,
            chat: [...s.basic.chat, { from: "ai" as const, time: nowTime(), text: reply.text }].slice(-MAX_CHAT_STORE),
            keywords,
            suggestions: reply.suggestions && reply.suggestions.length > 0 ? reply.suggestions : s.basic.suggestions,
          },
        };
      });
      flash([...foundNew, ...replyNew]);
    } catch {
      setError("AI 코치 연결이 잠시 원활하지 않았어요. 다시 보내주시면 이어서 도와드릴게요 🙂");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    if (!window.confirm("대화를 처음부터 다시 시작할까요? 지금까지의 대화 내용이 지워져요.")) return;
    setBasic({ chat: [greeting()] });
  }

  const userTurns = b.chat.filter((m) => m.from === "user").length;
  const progress = Math.min(userTurns, 5);

  const modeBtn = (m: "chat" | "form", ico: string, l: string, rec?: boolean) => (
    <button onClick={() => setBasic({ mode: m })} style={{ padding: "10px 18px", background: b.mode === m ? "#3B5BDB" : "transparent", color: b.mode === m ? "#fff" : "#5B6685", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 7 }}>
      {ico} {l}{rec && <span style={{ fontSize: 10.5, padding: "1px 7px", borderRadius: 999, background: b.mode === m ? "rgba(255,255,255,.22)" : "#ECFAF1", color: b.mode === m ? "#fff" : "#2F9E5E", fontWeight: 700 }}>추천</span>}
    </button>
  );

  const { min, max } = criteria.system.krRange;

  return (
    <div>
      {/* Mode tabs */}
      <div style={{ display: "inline-flex", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: 5, gap: 4, marginBottom: 16 }}>
        {modeBtn("chat", "💬", "대화형 입력", true)}
        {modeBtn("form", "✏️", "직접 작성")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
        {/* Left — main input */}
        {b.mode === "chat" ? (
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: 520 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #00A968, #14342B)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✨</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>AI 코치와 대화하기</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: 11, color: "#7C87A4" }}>질문 {progress} / 5</span>
                  <div style={{ width: 80, height: 5, background: "#ECEFF5", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${(progress / 5) * 100}%`, background: "#00A968" }} /></div>
                  <span style={{ fontSize: 11, color: "#2F9E5E", fontWeight: 600 }}>{Math.round((progress / 5) * 100)}% 완료</span>
                </div>
              </div>
              <button onClick={restart} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 8, fontSize: 11.5, color: "#5B6685", cursor: "pointer", fontFamily: "var(--font-sans)" }}>↻ 처음부터</button>
            </div>
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              {b.chat.map((m, i) => <ChatMessage key={i} {...m} userInitial={user.name.charAt(0)} />)}
              {loading && (
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #00A968, #14342B)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✨</div>
                  <div style={{ padding: "11px 15px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: "4px 13px 13px 13px", fontSize: 13.5, color: "#7C87A4" }}>생각을 정리하는 중이에요…</div>
                </div>
              )}
              {error && <div style={{ padding: "10px 14px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10, fontSize: 12.5, color: "#7A4A14" }}>{error}</div>}
            </div>
            <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #ECEFF5" }}>
              {/* 추천 답변 칩 — AI 응답마다 대화 맥락에 맞게 갱신 */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {(b.suggestions ?? ["결제 안정성이 제일 중요해요", "응답속도를 개선하고 싶어요", "SRE팀 협업이 필요해요"]).map((s) => (
                  <button key={s} onClick={() => send(s)} style={{ padding: "6px 12px", background: "#F1FBF6", color: "#0A6B44", border: "1px solid #B9F1D8", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{s}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 12, padding: "8px 12px" }}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
                  rows={1}
                  placeholder="답변을 입력하세요… (Enter로 전송)"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 13.5, color: "#0F1A36", resize: "none", lineHeight: 1.5 }}
                />
                <button onClick={() => send(text)} disabled={loading} style={{ width: 34, height: 34, borderRadius: 9, background: "#00A968", border: "none", color: "#fff", fontSize: 14, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1, flexShrink: 0 }}>↑</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "26px 28px" }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 700, color: "#0F1A36" }}>직접 작성하기</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <label style={label}>Objective (목표)</label>
                <input style={input} value={b.objective} onChange={(e) => setBasic({ objective: e.target.value })} />
                <div style={hint}>선택 · 비워두어도 OKR 작성이 가능해요. 나중에 추가할 수도 있어요.</div>
              </div>
              <div><label style={label}>업무 분장</label><input style={input} value={b.duty} onChange={(e) => setBasic({ duty: e.target.value })} /></div>
              <div style={{ gridColumn: "1 / 3" }}>
                <label style={label}>올해 본업에서 반드시 지킬 것 / 새로 도전할 것</label>
                <textarea style={{ ...input, minHeight: 100, resize: "vertical", lineHeight: 1.6 }} value={b.freeText} onChange={(e) => setBasic({ freeText: e.target.value })} />
                <div style={hint}>구어체로 자연스럽게 입력 · AI가 정제해 드려요</div>
              </div>
              <div><label style={label}>협업 대상</label><input style={input} value={b.collaborators} onChange={(e) => setBasic({ collaborators: e.target.value })} placeholder="예: SRE팀, 인프라팀과 협업 필요" /></div>
              <div>
                <label style={label}>예상 KR 개수</label>
                <div style={{ display: "inline-flex", background: "var(--page-bg)", borderRadius: 10, padding: 4, gap: 3 }}>
                  {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
                    <button key={n} onClick={() => setBasic({ krCount: n })} className="mono" style={{ background: b.krCount === n ? "#fff" : "transparent", color: b.krCount === n ? "#0F1A36" : "#7C87A4", fontWeight: b.krCount === n ? 700 : 500, border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 13, cursor: "pointer", boxShadow: b.krCount === n ? "0 1px 3px rgba(31,42,74,.08)" : "none" }}>{n}개</button>
                  ))}
                </div>
                <div style={hint}>운영안 권장: {min}~{max}개</div>
              </div>
            </div>
          </div>
        )}

        {/* Right — context panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>나의 정보</span>
              <button onClick={() => onGo(0)} style={{ marginLeft: "auto", fontSize: 11.5, color: "#3B5BDB", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}>편집</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[["조직", `${user.dept} · ${user.team}`], ["직급 · 직렬", `${user.grade} · ${state.profile.jobSeries}`], ["업무 분장", state.profile.mainDuty || "—"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8, fontSize: 12 }}><span style={{ width: 70, color: "#7C87A4", fontWeight: 600, flexShrink: 0 }}>{k}</span><span style={{ color: "#0F1A36", fontWeight: 500 }}>{v}</span></div>
              ))}
              <div style={{ display: "flex", gap: 8, fontSize: 12 }}><span style={{ width: 70, color: "#7C87A4", fontWeight: 600, flexShrink: 0 }}>📜 자격증</span><span style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{state.profile.certs.map((c) => <span key={c} style={{ padding: "2px 8px", background: "#F1F4FD", color: "#213A8C", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{c}</span>)}</span></div>
            </div>
            <div style={{ marginTop: 12, padding: "9px 12px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: 9, fontSize: 11.5, color: "#0A6B44", fontWeight: 600 }}>✓ 팀장 결재가 완료되어 OKR 작성을 시작할 수 있어요.</div>
          </div>

          <div style={{ background: "linear-gradient(135deg, #F1FBF6, #fff 50%)", border: "1px solid #B9F1D8", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36", display: "flex", alignItems: "center", gap: 6 }}>
              ✨ AI가 정리한 핵심 키워드
              {flashKeys.length > 0 && (
                <span style={{ marginLeft: "auto", padding: "2px 9px", borderRadius: 999, background: "#00A968", color: "#fff", fontSize: 10.5, fontWeight: 800, animation: "kw-flash 1.3s ease-out 2" }}>
                  +{flashKeys.length} 반영됨
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#7C87A4", margin: "3px 0 12px" }}>대화에서 자동 추출</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {Object.entries(b.keywords).map(([k, on]) => (
                <button key={k} onClick={() => setBasic({ keywords: { ...b.keywords, [k]: !on } })} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", background: on ? "#00A968" : "#fff", color: on ? "#fff" : "#5B6685", border: `1px solid ${on ? "#00A968" : "#E1E5EF"}`, borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", animation: flashKeys.includes(k) ? "kw-flash 1.3s ease-out 2" : undefined }}>{on ? "✓" : "+"} {k}</button>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: "#2F6B48", lineHeight: 1.5 }}>체크된 키워드들이 다음 단계 KR 초안의 기반이 됩니다.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
