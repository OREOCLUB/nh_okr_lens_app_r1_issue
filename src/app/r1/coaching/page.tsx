"use client";

import { useEffect, useRef, useState } from "react";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { getCurrentUser, type Session } from "@/lib/auth";
import { askCoach, nowTime, MAX_CHAT_STORE } from "@/lib/aiCoach";
import { useLlmGate, LlmGateNotice, MockBadge } from "@/components/LlmGate";
import type { ChatMsg } from "@/lib/wizard";

interface Topic {
  id: string;
  icon: string;
  iconBg: string;
  iconFg: string;
  title: string;
  desc: string;
  messages: ChatMsg[];
}

const INITIAL_TOPICS: Topic[] = [
  {
    id: "t1", icon: "🎯", iconBg: "#E5EBFB", iconFg: "#3B5BDB", title: "KR 01 진행 점검", desc: "응답속도 개선 진행 정체에 대해…",
    messages: [
      { from: "user", time: "14:18", text: "KR 01 응답속도 개선이 6월 이후로 정체된 느낌이에요. 어떻게 진행해야 좋을까요?" },
      { from: "ai", time: "14:18", text: "좋은 질문이에요. 데이터를 보니 850ms → 598ms까지 와 있고, 목표인 500ms까지는 약 16% 추가 개선이 필요해요. 진행률 72%는 좋은 진척이에요. 병목 재분석 · 캐시 적중률 점검 · P99 병행 관측을 함께 살펴볼까요?" },
      { from: "ai", time: "14:21", text: "SRE팀에 협업 요청을 할 때는 \"무엇을 / 왜 / 언제까지\"를 명확히 하면 좋아요. 메시지 초안이 필요하면 말씀해주세요." },
    ],
  },
  { id: "t2", icon: "📈", iconBg: "#ECFAF1", iconFg: "#2F9E5E", title: "진행률 업데이트 방법", desc: "주간 업데이트를 어떻게 기록…", messages: [] },
  { id: "t3", icon: "💬", iconBg: "#FFEDE2", iconFg: "#E07A3C", title: "평가자 피드백 해석", desc: "팀장님의 코멘트 의미를…", messages: [] },
  { id: "t4", icon: "✨", iconBg: "#F0E9FB", iconFg: "#7C4DD9", title: "KR 03 측정 방법 보완", desc: "마일스톤 산출물을 더 구체적으로…", messages: [] },
];

const QUICK = ["📊 진행률 분석해줘", "✍️ KR 다시 정제해줘", "💬 평가자에게 메시지 초안", "📈 다음 마일스톤 추천"];
const NEW_TOPIC_STYLE = { icon: "🧭", iconBg: "#F1F4FD", iconFg: "#3B5BDB" };

function ChatBubble({ from, text, time, userName }: ChatMsg & { userName: string }) {
  const isAI = from === "ai";
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 18, flexDirection: isAI ? "row" : "row-reverse" }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, background: isAI ? "linear-gradient(135deg, #00A968, #14342B)" : "#E5EBFB", color: isAI ? "#fff" : "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
        {isAI ? "✨" : userName.charAt(0)}
      </div>
      <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: 5, alignItems: isAI ? "flex-start" : "flex-end" }}>
        <div style={{ fontSize: 11.5, color: "#7C87A4", fontWeight: 600 }}>{isAI ? "AI 코치" : userName} · <span style={{ color: "#A4ADC4", fontWeight: 500 }}>{time}</span></div>
        <div style={{ padding: "12px 16px", background: isAI ? "#fff" : "#3B5BDB", color: isAI ? "#1F2A4A" : "#fff", border: isAI ? "1px solid #E1E5EF" : "none", borderRadius: isAI ? "4px 14px 14px 14px" : "14px 4px 14px 14px", fontSize: 14, lineHeight: 1.6, boxShadow: "var(--shadow-xs)", whiteSpace: "pre-line" }}>
          {text}
        </div>
      </div>
    </div>
  );
}

export default function R1CoachingPage() {
  const [user, setUser] = useState<Session | null>(null);
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [activeId, setActiveId] = useState("t1");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const llmGate = useLlmGate();

  useEffect(() => {
    const u = getCurrentUser();
    if (u) setUser(u);
  }, []);

  // 목업모드에서 키 정상화 시 자동 복귀 — 현재 주제 대화 초기화
  useEffect(() => {
    if (llmGate.recovered) {
      setTopics((ts) => ts.map((t) => (t.id === activeId ? { ...t, messages: [] } : t)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [llmGate.recovered]);

  const active = topics.find((t) => t.id === activeId) ?? topics[0];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, loading]);

  function pushMsg(topicId: string, msg: ChatMsg) {
    setTopics((ts) => ts.map((t) => (t.id === topicId ? { ...t, messages: [...t.messages, msg].slice(-MAX_CHAT_STORE), desc: msg.from === "user" ? msg.text.slice(0, 24) + "…" : t.desc } : t)));
  }

  async function send(raw: string) {
    const t = raw.trim();
    if (!t || loading || !active) return;
    if (llmGate.gate === "blocked" || llmGate.gate === "checking") return; // 키 점검 전 대화 차단
    setInput("");
    setError(null);
    const userMsg: ChatMsg = { from: "user", time: nowTime(), text: t };
    pushMsg(active.id, userMsg);
    setLoading(true);
    try {
      const history = [...active.messages, userMsg].map((m) => ({ role: m.from === "ai" ? ("assistant" as const) : ("user" as const), content: m.text }));
      const reply = await askCoach("coaching", history, { userName: user?.name });
      pushMsg(active.id, { from: "ai", time: nowTime(), text: reply.text });
    } catch {
      setError("AI 코치 연결이 잠시 원활하지 않았어요. 다시 보내주시면 이어서 도와드릴게요 🙂");
    } finally {
      setLoading(false);
    }
  }

  function newTopic() {
    const title = window.prompt("어떤 주제로 코칭을 받고 싶으세요?");
    if (!title?.trim()) return;
    const id = `t${Date.now()}`;
    setTopics((ts) => [{ id, ...NEW_TOPIC_STYLE, title: title.trim(), desc: "새 코칭 대화", messages: [{ from: "ai", time: nowTime(), text: `[상시 코칭] "${title.trim()}" — 현재 상황을 한 줄로 알려주세요. 관련 수치(현재값·목표값)가 있으면 함께요.` }] }, ...ts]);
    setActiveId(id);
  }

  const totalMsgs = topics.reduce((a, t) => a + t.messages.length, 0);

  return (
    <RoleShell role="R1" title="AI 코칭" subtitle={user ? `${user.name} · 누적 코칭 ${totalMsgs}회` : ""}>
      <div style={{ display: "flex", height: "calc(100vh - var(--topbar-h) - 96px)", minHeight: 520, border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
        {/* Topics */}
        <div style={{ width: 300, borderRight: "1px solid #E1E5EF", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #ECEFF5" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36", marginBottom: 10 }}>코칭 주제</div>
            <Button variant="primary" size="sm" fullWidth leftIcon={<span>+</span>} onClick={newTopic}>새 코칭 시작</Button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {topics.map((t) => {
              const on = t.id === activeId;
              return (
                <div key={t.id} onClick={() => setActiveId(t.id)} style={{ background: on ? "#fff" : "#F9FAFC", border: `1px solid ${on ? "#00A968" : "#E1E5EF"}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: on ? "0 0 0 3px rgba(0,169,104,.10)" : "none" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: t.iconBg, color: t.iconFg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{t.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F1A36" }}>{t.title}</div>
                    <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--page-bg)" }}>
          <div style={{ padding: "16px 24px", background: "#fff", borderBottom: "1px solid #E1E5EF", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #00A968, #14342B)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>{active?.title}</div>
              <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2F9E5E" }} /> AI 코치 활성
              </div>
            </div>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
              {active?.messages.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#7C87A4", fontSize: 13.5, lineHeight: 1.7 }}>
                  아직 대화가 없어요.<br />궁금한 점이나 코칭받고 싶은 내용을 아래에 입력해주세요 :)
                </div>
              )}
              {active?.messages.map((m, i) => <ChatBubble key={i} {...m} userName={user?.name ?? ""} />)}
              {loading && (
                <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg, #00A968, #14342B)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✨</div>
                  <div style={{ padding: "12px 16px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: "4px 14px 14px 14px", fontSize: 14, color: "#7C87A4" }}>생각을 정리하는 중이에요…</div>
                </div>
              )}
              {error && <div style={{ padding: "10px 14px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10, fontSize: 12.5, color: "#7A4A14", marginBottom: 14 }}>{error}</div>}
            </div>
          </div>

          {/* Composer */}
          <div style={{ padding: "14px 28px 18px", background: "#fff", borderTop: "1px solid #E1E5EF" }}>
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
              {llmGate.gate === "blocked" || llmGate.gate === "checking" ? (
                <LlmGateNotice gate={llmGate.gate} reason={llmGate.reason} onMock={llmGate.optInMock} />
              ) : (
              <>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                <MockBadge gate={llmGate.gate} />
                {QUICK.map((s) => (
                  <button key={s} onClick={() => send(s.replace(/^[^ ]+ /, ""))} style={{ padding: "6px 12px", background: "var(--page-bg)", color: "#3A4565", border: "1px solid #E1E5EF", borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{s}</button>
                ))}
              </div>
              <div style={{ background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "flex-end", gap: 10 }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  placeholder={loading ? "코치가 답변을 작성하는 중이에요…" : "궁금한 점이나 코칭받고 싶은 주제를 입력해주세요…"}
                  rows={2}
                  disabled={loading}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 14, color: loading ? "#A4ADC4" : "#0F1A36", resize: "none", lineHeight: 1.5 }}
                />
                <button onClick={() => send(input)} disabled={loading} style={{ width: 36, height: 36, borderRadius: 10, background: "#00A968", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: loading ? "default" : "pointer", color: "#fff", fontSize: 14, flexShrink: 0 }}>
                  {loading ? <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.35)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .8s linear infinite" }} /> : "↑"}
                </button>
              </div>
              <div style={{ fontSize: 11, color: "#A4ADC4", marginTop: 8, textAlign: "center" }}>
                코칭 내용은 본인만 볼 수 있어요.
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
