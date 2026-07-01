"use client";

import { useState, type ReactNode } from "react";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";

interface Msg { from: "ai" | "user"; message: ReactNode; time: string; suggestions?: string[] }

function ChatBubble({ from, message, time, suggestions }: Msg) {
  const isAI = from === "ai";
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 18, flexDirection: isAI ? "row" : "row-reverse" }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, background: isAI ? "linear-gradient(135deg, #00A968, #14342B)" : "#E5EBFB", color: isAI ? "#fff" : "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
        {isAI ? "✨" : "정"}
      </div>
      <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: 5, alignItems: isAI ? "flex-start" : "flex-end" }}>
        <div style={{ fontSize: 11.5, color: "#7C87A4", fontWeight: 600 }}>{isAI ? "AI 코치" : "정태영"} · <span style={{ color: "#A4ADC4", fontWeight: 500 }}>{time}</span></div>
        <div style={{ padding: "12px 16px", background: isAI ? "#fff" : "#3B5BDB", color: isAI ? "#1F2A4A" : "#fff", border: isAI ? "1px solid #E1E5EF" : "none", borderRadius: isAI ? "4px 14px 14px 14px" : "14px 4px 14px 14px", fontSize: 14, lineHeight: 1.6, boxShadow: "var(--shadow-xs)" }}>
          {message}
        </div>
        {suggestions && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {suggestions.map((s) => (
              <button key={s} style={{ padding: "6px 12px", background: "#F1FBF6", color: "#0A6B44", border: "1px solid #B9F1D8", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{s}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CoachingTopic({ icon, iconBg, iconFg, title, desc, active }: { icon: string; iconBg: string; iconFg: string; title: string; desc: string; active?: boolean }) {
  return (
    <div style={{ background: active ? "#fff" : "#F9FAFC", border: `1px solid ${active ? "#00A968" : "#E1E5EF"}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: active ? "0 0 0 3px rgba(0,169,104,.10)" : "none" }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: iconBg, color: iconFg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F1A36" }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{desc}</div>
      </div>
    </div>
  );
}

const SEED: Msg[] = [
  { from: "user", time: "14:18", message: "KR 01 응답속도 개선이 6월 이후로 정체된 느낌이에요. 어떻게 진행해야 좋을까요?" },
  { from: "ai", time: "14:18", message: (<>좋은 질문이에요. 데이터를 보니 <b style={{ color: "#0F1A36" }}>850ms → 598ms</b>까지 와 있고, 목표인 <b style={{ color: "#2F9E5E" }}>500ms</b>까지는 약 <b>16% 추가 개선</b>이 필요해요. 진행률 72%는 좋은 진척이에요. 병목 재분석 · 캐시 적중률 점검 · P99 병행 관측을 함께 살펴볼까요?</>) },
  { from: "ai", time: "14:21", message: (<>SRE팀에 협업 요청을 할 때는 <b style={{ color: "#0F1A36" }}>&ldquo;무엇을 / 왜 / 언제까지&rdquo;</b>를 명확히 하면 좋아요. 메시지 초안을 만들어 드릴게요. 어떤 톤이 좋을까요?</>), suggestions: ["공식 요청 메일", "팀 채널에 캐주얼하게", "정태영 팀장님 통해 전달"] },
];

const QUICK = ["📊 진행률 분석해줘", "✍️ KR 다시 정제해줘", "💬 평가자에게 메시지 초안", "📈 다음 마일스톤 추천"];

export default function R1CoachingPage() {
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
    setMessages((m) => [
      ...m,
      { from: "user", time, message: t },
      { from: "ai", time, message: "좋아요, 함께 정제해볼까요? 관련 KR 데이터를 살펴보고 구체적인 제안을 준비했어요. (프로토타입 응답)" },
    ]);
    setInput("");
  }

  return (
    <RoleShell role="R1" title="AI 코칭" subtitle="정태영 · 누적 코칭 23회">
      <div style={{ display: "flex", height: "calc(100vh - var(--topbar-h) - 96px)", minHeight: 520, border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
        {/* Topics */}
        <div style={{ width: 300, borderRight: "1px solid #E1E5EF", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #ECEFF5" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36", marginBottom: 10 }}>코칭 주제</div>
            <Button variant="primary" size="sm" fullWidth leftIcon={<span>+</span>} onClick={() => alert("새 코칭 시작은 준비 중이에요 🙂")}>새 코칭 시작</Button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 4px 6px" }}>오늘</div>
            <CoachingTopic icon="🎯" iconBg="#E5EBFB" iconFg="#3B5BDB" title="KR 01 진행 점검" desc="응답속도 개선 진행 정체에 대해…" active />
            <CoachingTopic icon="📈" iconBg="#ECFAF1" iconFg="#2F9E5E" title="진행률 업데이트 방법" desc="주간 업데이트를 어떻게 기록…" />
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", padding: "10px 4px 6px" }}>이번주</div>
            <CoachingTopic icon="💬" iconBg="#FFEDE2" iconFg="#E07A3C" title="평가자 피드백 해석" desc="정태영 팀장님의 코멘트 의미를…" />
            <CoachingTopic icon="✨" iconBg="#F0E9FB" iconFg="#7C4DD9" title="KR 03 측정 방법 보완" desc="마일스톤 산출물을 더 구체적으로…" />
          </div>
        </div>

        {/* Chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--page-bg)" }}>
          <div style={{ padding: "16px 24px", background: "#fff", borderBottom: "1px solid #E1E5EF", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #00A968, #14342B)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>KR 01 진행 점검</div>
              <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2F9E5E" }} /> AI 코치 활성 · 응답 평균 1.2초
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
              {/* Context */}
              <div style={{ background: "linear-gradient(135deg, #F1FBF6, #fff 90%)", border: "1px solid #B9F1D8", borderRadius: 14, padding: "18px 20px", marginBottom: 22 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#00A968", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>📎 함께 보는 KR</div>
                <div className="mono" style={{ fontSize: 11, color: "#7C87A4", marginBottom: 4 }}>KR_2026_001</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36", lineHeight: 1.5, marginBottom: 10 }}>결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축한다.</div>
                <div className="mono" style={{ display: "flex", gap: 12, fontSize: 11.5, color: "#5B6685", paddingTop: 10, borderTop: "1px dashed #B9F1D8" }}>
                  <span>📍 현재: <b style={{ color: "#3B5BDB" }}>598ms</b></span>
                  <span>🎯 목표: <b style={{ color: "#2F9E5E" }}>500ms</b></span>
                  <span style={{ marginLeft: "auto" }}>진행 <b style={{ color: "#0F1A36" }}>72%</b></span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <div style={{ flex: 1, height: 1, background: "#E1E5EF" }} />
                <span className="mono" style={{ fontSize: 11.5, color: "#7C87A4", fontWeight: 600 }}>오늘 · 2026-07-01</span>
                <div style={{ flex: 1, height: 1, background: "#E1E5EF" }} />
              </div>

              {messages.map((m, i) => <ChatBubble key={i} {...m} />)}
            </div>
          </div>

          {/* Composer */}
          <div style={{ padding: "14px 28px 18px", background: "#fff", borderTop: "1px solid #E1E5EF" }}>
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                {QUICK.map((s) => (
                  <button key={s} onClick={() => setInput(s.replace(/^[^ ]+ /, ""))} style={{ padding: "6px 12px", background: "var(--page-bg)", color: "#3A4565", border: "1px solid #E1E5EF", borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{s}</button>
                ))}
              </div>
              <div style={{ background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "flex-end", gap: 10 }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  placeholder="궁금한 점이나 코칭받고 싶은 주제를 입력해주세요…"
                  rows={2}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 14, color: "#0F1A36", resize: "none", lineHeight: 1.5 }}
                />
                <button onClick={() => send(input)} style={{ width: 36, height: 36, borderRadius: 10, background: "#00A968", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 14, flexShrink: 0 }}>↑</button>
              </div>
              <div style={{ fontSize: 11, color: "#A4ADC4", marginTop: 8, textAlign: "center" }}>
                AI 코칭 응답은 참고용이에요. 평가에 직접 반영되지 않으며, 코칭 내용은 본인만 볼 수 있어요.
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
