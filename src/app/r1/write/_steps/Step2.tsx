"use client";

import { useState, type ReactNode } from "react";
import { label, input, hint } from "./shared";

function ChatMessage({ from, message, time, options, onOption }: { from: "ai" | "user"; message: ReactNode; time: string; options?: string[]; onOption?: (o: string) => void }) {
  const isAI = from === "ai";
  return (
    <div style={{ display: "flex", gap: 10, flexDirection: isAI ? "row" : "row-reverse" }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: isAI ? "linear-gradient(135deg, #00A968, #14342B)" : "#E5EBFB", color: isAI ? "#fff" : "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{isAI ? "✨" : "김"}</div>
      <div style={{ maxWidth: "78%" }}>
        <div style={{ display: "flex", gap: 7, alignItems: "baseline", marginBottom: 4, flexDirection: isAI ? "row" : "row-reverse" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0F1A36" }}>{isAI ? "AI 코치" : "김지훈"}</span>
          <span style={{ fontSize: 10.5, color: "#A6AEC2" }}>{time}</span>
        </div>
        <div style={{ padding: "11px 15px", background: isAI ? "#fff" : "#3B5BDB", color: isAI ? "#1F2A4A" : "#fff", border: isAI ? "1px solid #E1E5EF" : "none", borderRadius: isAI ? "4px 13px 13px 13px" : "13px 4px 13px 13px", fontSize: 13.5, lineHeight: 1.6 }}>{message}</div>
        {options && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {options.map((o) => <button key={o} onClick={() => onOption?.(o)} style={{ padding: "6px 12px", background: "#F1FBF6", color: "#0A6B44", border: "1px solid #B9F1D8", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{o}</button>)}
          </div>
        )}
      </div>
    </div>
  );
}

export function Step2() {
  const [mode, setMode] = useState<"chat" | "form">("chat");
  const [krCount, setKrCount] = useState(5);
  const [text, setText] = useState("");
  const [keywords, setKeywords] = useState<Record<string, boolean>>({
    "APM p95 응답속도": true, "단위테스트 커버리지": true, "장애 알림 자동화": true, "SRE 협업": true, "결제 안정성": false,
  });

  const modeBtn = (m: "chat" | "form", ico: string, l: string, rec?: boolean) => (
    <button onClick={() => setMode(m)} style={{ padding: "10px 18px", background: mode === m ? "#3B5BDB" : "transparent", color: mode === m ? "#fff" : "#5B6685", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 7 }}>
      {ico} {l}{rec && <span style={{ fontSize: 10.5, padding: "1px 7px", borderRadius: 999, background: mode === m ? "rgba(255,255,255,.22)" : "#ECFAF1", color: mode === m ? "#fff" : "#2F9E5E", fontWeight: 700 }}>추천</span>}
    </button>
  );

  return (
    <div>
      {/* Mode tabs */}
      <div style={{ display: "inline-flex", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: 5, gap: 4, marginBottom: 16 }}>
        {modeBtn("chat", "💬", "대화형 입력", true)}
        {modeBtn("form", "✏️", "직접 작성")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
        {/* Left — main input */}
        {mode === "chat" ? (
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: 520 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #00A968, #14342B)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✨</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>AI 코치와 대화하기</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: 11, color: "#7C87A4" }}>질문 3 / 5</span>
                  <div style={{ width: 80, height: 5, background: "#ECEFF5", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: "50%", background: "#00A968" }} /></div>
                  <span style={{ fontSize: 11, color: "#2F9E5E", fontWeight: 600 }}>50% 완료</span>
                </div>
              </div>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 8, fontSize: 11.5, color: "#5B6685", cursor: "pointer", fontFamily: "var(--font-sans)" }}>↻ 처음부터</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <ChatMessage from="ai" time="14:02" message={<>안녕하세요 김지훈 님 :) 운영 <b>70%</b> + 전략혁신 <b>30%</b> 비중으로 선택하셨네요. 먼저, <b>올해 본업에서 반드시 지킬 것</b>은 무엇인가요? 가장 중요하게 생각하시는 부분부터 들려주세요.</>} options={["결제 안정성", "응답속도", "장애 예방"]} onOption={setText} />
              <ChatMessage from="user" time="14:03" message="응답속도가 제일 중요해요. p95 850ms를 500ms까지 줄이고 싶어요." />
              <ChatMessage from="ai" time="14:03" message={<>좋아요 :) <b>응답속도 850→500ms</b>는 측정도 명확하고 도전적인 좋은 목표예요. 추가로 여쭤볼게요. <b>새로 도전하고 싶은 일</b>이 있나요? 처음 해보는 것, 작년엔 못 했던 것, 평소 미뤄두던 것 등 무엇이든 좋아요.</>} />
              <ChatMessage from="user" time="14:05" message="단위테스트 커버리지를 85%까지 올리고, 장애 알림도 자동화하고 싶어요." />
              <ChatMessage from="ai" time="14:05" message={<>좋습니다! 세 가지 후보가 모였네요:<br />1. APM p95 응답속도 850ms → 500ms<br />2. 단위테스트 커버리지 65% → 85%<br />3. 장애 알림 자동화 4단계 중 3단계<br />마지막으로, <b>다른 팀과 협업이 필요한 부분</b>이 있을까요? SRE팀이라든지요.</>} />
            </div>
            <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #ECEFF5" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {["SRE팀 협업 필요", "인프라팀 도움 필요", "독립적으로 진행", "팀 내에서 해결"].map((s) => <button key={s} onClick={() => setText(s)} style={{ padding: "6px 12px", background: "#F1FBF6", color: "#0A6B44", border: "1px solid #B9F1D8", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{s}</button>)}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 12, padding: "8px 12px" }}>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder="답변을 입력하세요…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 13.5, color: "#0F1A36", resize: "none", lineHeight: 1.5 }} />
                <button onClick={() => setText("")} style={{ width: 34, height: 34, borderRadius: 9, background: "#00A968", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", flexShrink: 0 }}>↑</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "26px 28px" }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 700, color: "#0F1A36" }}>직접 작성하기</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <label style={label}>Objective (목표)</label>
                <input style={input} defaultValue="결제 게이트웨이 성능 개선" />
                <div style={hint}>선택 · 비워두어도 OKR 작성이 가능해요. 나중에 추가할 수도 있어요.</div>
              </div>
              <div><label style={label}>업무 분장</label><input style={input} defaultValue="결제플랫폼 백엔드 성능/튜닝" /></div>
              <div style={{ gridColumn: "1 / 3" }}>
                <label style={label}>올해 본업에서 반드시 지킬 것 / 새로 도전할 것</label>
                <textarea style={{ ...input, minHeight: 100, resize: "vertical", lineHeight: 1.6 }} defaultValue={"• 결제 게이트웨이 p95 응답속도를 일정 수준 이하로 유지\n• 결제 인증 모듈 단위테스트 커버리지 향상\n• 야간 배치 장애 알림 자동화 마일스톤 진행"} />
                <div style={hint}>구어체로 자연스럽게 입력 · AI가 정제해 드려요</div>
              </div>
              <div><label style={label}>협업 대상</label><input style={input} placeholder="예: SRE팀, 인프라팀과 협업 필요" /></div>
              <div>
                <label style={label}>예상 KR 개수</label>
                <div style={{ display: "inline-flex", background: "var(--page-bg)", borderRadius: 10, padding: 4, gap: 3 }}>
                  {[4, 5, 6].map((n) => <button key={n} onClick={() => setKrCount(n)} className="mono" style={{ background: krCount === n ? "#fff" : "transparent", color: krCount === n ? "#0F1A36" : "#7C87A4", fontWeight: krCount === n ? 700 : 500, border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 13, cursor: "pointer", boxShadow: krCount === n ? "0 1px 3px rgba(31,42,74,.08)" : "none" }}>{n}개</button>)}
                </div>
                <div style={hint}>운영안 권장: 4~6개</div>
              </div>
            </div>
          </div>
        )}

        {/* Right — context panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>나의 정보</span>
              <button style={{ marginLeft: "auto", fontSize: 11.5, color: "#3B5BDB", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}>편집</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[["조직", "운영본부 · 결제플랫폼팀"], ["직급 · 직렬", "3급 · SE"], ["업무군", "성능/튜닝"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8, fontSize: 12 }}><span style={{ width: 70, color: "#7C87A4", fontWeight: 600, flexShrink: 0 }}>{k}</span><span style={{ color: "#0F1A36", fontWeight: 500 }}>{v}</span></div>
              ))}
              <div style={{ display: "flex", gap: 8, fontSize: 12 }}><span style={{ width: 70, color: "#7C87A4", fontWeight: 600, flexShrink: 0 }}>📜 자격증</span><span style={{ display: "flex", gap: 5 }}>{["AWS SAA", "CKA"].map((c) => <span key={c} style={{ padding: "2px 8px", background: "#F1F4FD", color: "#213A8C", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{c}</span>)}</span></div>
            </div>
            <div style={{ marginTop: 12, padding: "9px 12px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: 9, fontSize: 11.5, color: "#0A6B44", fontWeight: 600 }}>✓ 팀장 결재가 완료되어 OKR 작성을 시작할 수 있어요.</div>
          </div>

          <div style={{ background: "linear-gradient(135deg, #F1FBF6, #fff 50%)", border: "1px solid #B9F1D8", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36", display: "flex", alignItems: "center", gap: 6 }}>✨ AI가 정리한 핵심 키워드</div>
            <div style={{ fontSize: 11, color: "#7C87A4", margin: "3px 0 12px" }}>대화에서 자동 추출</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {Object.entries(keywords).map(([k, on]) => (
                <button key={k} onClick={() => setKeywords((s) => ({ ...s, [k]: !s[k] }))} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", background: on ? "#00A968" : "#fff", color: on ? "#fff" : "#5B6685", border: `1px solid ${on ? "#00A968" : "#E1E5EF"}`, borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{on ? "✓" : "+"} {k}</button>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: "#2F6B48", lineHeight: 1.5 }}>체크된 키워드들이 다음 단계 KR 초안의 기반이 됩니다.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
