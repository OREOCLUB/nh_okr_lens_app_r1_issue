"use client";

import { useState, type ReactNode } from "react";

function ChatMsg({ from, time, children }: { from: "ai" | "user"; time: string; children: ReactNode }) {
  const isAI = from === "ai";
  return (
    <div style={{ display: "flex", gap: 10, flexDirection: isAI ? "row" : "row-reverse" }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: isAI ? "linear-gradient(135deg, #00A968, #14342B)" : "#E5EBFB", color: isAI ? "#fff" : "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{isAI ? "✨" : "김"}</div>
      <div style={{ maxWidth: "80%" }}>
        <div style={{ display: "flex", gap: 7, alignItems: "baseline", marginBottom: 4, flexDirection: isAI ? "row" : "row-reverse" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0F1A36" }}>{isAI ? "AI 코치" : "김지훈"}</span>
          <span style={{ fontSize: 10.5, color: "#A6AEC2" }}>{time}</span>
        </div>
        <div style={{ padding: "11px 15px", background: isAI ? "#fff" : "#3B5BDB", color: isAI ? "#1F2A4A" : "#fff", border: isAI ? "1px solid #E1E5EF" : "none", borderRadius: isAI ? "4px 13px 13px 13px" : "13px 4px 13px 13px", fontSize: 13.5, lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  );
}

function DateSep({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: "#ECEFF5" }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: "#7C87A4", padding: "3px 12px", background: "#F1F4FD", borderRadius: 999 }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: "#ECEFF5" }} />
    </div>
  );
}

function RefinementCard({ before, after, reason }: { before: string; after: string; reason: string }) {
  return (
    <div style={{ border: "1px solid #B9F1D8", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      <div style={{ padding: "10px 15px", background: "#F1FBF6", fontSize: 12.5, fontWeight: 700, color: "#0A6B44", borderBottom: "1px solid #DFF3E8" }}>💎 AI 정제 제안</div>
      <div style={{ padding: "14px 15px" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em" }}>BEFORE</div>
        <div style={{ fontSize: 12.5, color: "#5B6685", margin: "3px 0 10px", lineHeight: 1.5, textDecoration: "line-through" }}>{before}</div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#0A6B44", letterSpacing: "0.04em" }}>AFTER →</div>
        <div style={{ fontSize: 13, color: "#0F1A36", fontWeight: 600, margin: "3px 0 10px", lineHeight: 1.5 }}>{after}</div>
        <div style={{ fontSize: 11.5, color: "#5B6685", lineHeight: 1.5 }}><b>이유:</b> {reason}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button style={{ padding: "7px 14px", background: "#00A968", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>이대로 적용</button>
          <button style={{ padding: "7px 14px", background: "#fff", color: "#3A4565", border: "1px solid #E1E5EF", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>조금 수정해서</button>
          <button style={{ padding: "7px 14px", background: "transparent", color: "#7C87A4", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>건너뛰기</button>
        </div>
      </div>
    </div>
  );
}

function SubjectivityAlert({ phrase, reason }: { phrase: string; reason: string }) {
  return (
    <div style={{ border: "1px solid #FFE0BA", borderRadius: 12, background: "#FFF7EC", padding: "14px 16px" }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#7A4A14", marginBottom: 6 }}>🛡️ 잠시만요, 다시 한 번 확인해볼까요?</div>
      <div style={{ fontSize: 12, color: "#9C5E26", lineHeight: 1.55 }}>입력하신 표현 <b style={{ color: "#7A4A14" }}>&ldquo;{phrase}&rdquo;</b> — {reason}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button style={{ padding: "7px 14px", background: "#D98023", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>객관적으로 다시 표현하기</button>
        <button style={{ padding: "7px 14px", background: "#fff", color: "#7A4A14", border: "1px solid #FFE0BA", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>그대로 진행</button>
      </div>
    </div>
  );
}

function StageBadge({ children, tone }: { children: ReactNode; tone: "blue" | "purple" }) {
  const c = tone === "blue" ? { bg: "#EAF0FF", fg: "#2748C8" } : { bg: "#F5EFFD", fg: "#7C4DD9" };
  return <div style={{ alignSelf: "center", fontSize: 11, fontWeight: 700, color: c.fg, background: c.bg, padding: "4px 14px", borderRadius: 999 }}>{children}</div>;
}

export function Step3() {
  const [text, setText] = useState("");
  const summary = [
    { l: "측정 명확성", v: "3/3", c: "#2F9E5E" },
    { l: "외부 의존도", v: "2/3", c: "#D98023", n: "SRE 협업 확인" },
    { l: "주관성 표현", v: "1건 정제", c: "#2F9E5E" },
  ];
  const candidates = [
    { num: "01", status: "정제 완료", ico: "✓", c: "#2F9E5E", bg: "#ECFAF1", text: "결제 게이트웨이 APM p95 응답속도(월평균)를 850ms → 500ms로 단축" },
    { num: "02", status: "정제 중", ico: "●", c: "#3B5BDB", bg: "#F1F4FD", text: "결제 인증모듈 단위테스트 커버리지를 65% → 85%로 향상 (회귀 장애 영역 100% 커버)" },
    { num: "03", status: "대기", ico: "○", c: "#7C87A4", bg: "#F4F7FB", text: "장애 알림 자동화 4단계 중 3단계까지 완료 (측정 방법 미정)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>
      {/* Main chat */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: 620 }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <DateSep>오늘 · AI 정제 대화 시작</DateSep>
          <StageBadge tone="blue">객관성 검증 · KR 1/3</StageBadge>
          <ChatMsg from="ai" time="14:12">이제 KR 후보를 하나씩 정제해볼게요. 첫 번째 KR부터 시작합니다. <b>&ldquo;결제 게이트웨이 응답속도를 850→500ms로 단축&rdquo;</b> — 이 목표는 측정 가능성이 명확해서 좋아요! 한 가지만 더 명료하게 해볼까요? <b>&ldquo;응답속도&rdquo;</b>는 평균인가요, p95인가요, p99인가요? 정확한 통계 단위를 정해주세요.</ChatMsg>
          <ChatMsg from="user" time="14:13">p95로 하고 싶어요. 월평균 기준으로요.</ChatMsg>
          <ChatMsg from="ai" time="14:13">완벽해요. 그럼 KR 문장을 더 명료하게 정제해볼게요:</ChatMsg>
          <RefinementCard before="결제 게이트웨이 응답속도를 850→500ms로 단축" after="결제 게이트웨이 APM p95 응답속도(월평균)를 850ms → 500ms로 단축" reason="통계 단위(p95)와 측정 도구(APM), 집계 주기(월평균)를 명시해 객관성을 높였어요." />
          <StageBadge tone="purple">주관성 검증 · KR 2/3</StageBadge>
          <ChatMsg from="ai" time="14:16">두 번째 KR로 넘어갈게요. <b>&ldquo;단위테스트 커버리지 65 → 85%&rdquo;</b>인데, 왜 85%로 정하셨는지 여쭤봐도 될까요?</ChatMsg>
          <ChatMsg from="user" time="14:17">작년 회귀 장애 3건이 전부 커버 안 된 영역에서 났어요. 그 영역을 100% 덮으면 85%가 나와요.</ChatMsg>
          <ChatMsg from="ai" time="14:17">훌륭한 근거예요! 그 내용을 KR에 녹여낼게요:</ChatMsg>
          <RefinementCard before="단위테스트 커버리지 65 → 85%" after="결제 인증모듈 단위테스트 커버리지를 65% → 85%로 향상 (회귀 장애 영역 100% 커버)" reason="목표 수치의 근거(회귀 장애 영역)를 KR에 명시해 주관적 목표를 객관적으로 만들었어요." />
          <SubjectivityAlert phrase="장애를 확 줄인다" reason="'확'은 사람마다 기준이 달라 평가가 어려워요. 몇 건 → 몇 건처럼 수치로 표현하면 명확해집니다." />
          <div style={{ border: "1px solid #B9F1D8", borderRadius: 12, background: "linear-gradient(135deg, #F1FBF6, #fff 55%)", padding: "16px 18px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>✨ 현재까지의 점검 결과</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {summary.map((s) => (
                <div key={s.l} style={{ padding: "10px 12px", background: "#fff", border: "1px solid #ECEFF5", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: "#7C87A4", fontWeight: 600 }}>{s.l}</div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: s.c, marginTop: 3 }}>{s.v}</div>
                  {s.n && <div style={{ fontSize: 10.5, color: "#9C5E26", marginTop: 2 }}>{s.n}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: "12px 22px 16px", borderTop: "1px solid #ECEFF5" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {["다음 KR로 넘어가기", "측정 방법 한 번 더 점검", "운영안 가이드 확인"].map((c) => <button key={c} onClick={() => setText(c)} style={{ padding: "6px 12px", background: "#F1FBF6", color: "#0A6B44", border: "1px solid #B9F1D8", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{c}</button>)}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 12, padding: "8px 12px" }}>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder="KR에 대해 답변하거나 질문하세요…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 13.5, color: "#0F1A36", resize: "none", lineHeight: 1.5 }} />
            <button onClick={() => setText("")} style={{ width: 34, height: 34, borderRadius: 9, background: "#00A968", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", flexShrink: 0 }}>↑</button>
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "18px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>현재 KR 후보</div>
          <div style={{ fontSize: 11, color: "#7C87A4", margin: "3px 0 12px" }}>대화를 거치며 정제됩니다</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {candidates.map((k) => (
              <div key={k.num} style={{ border: "1px solid #ECEFF5", borderRadius: 11, padding: "12px 13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#213A8C" }}>KR {k.num}</span>
                  <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 999, background: k.bg, color: k.c, fontSize: 10.5, fontWeight: 700 }}><span style={{ fontSize: 9 }}>{k.ico}</span>{k.status}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#3A4565", lineHeight: 1.5 }}>{k.text}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #F1FBF6, #fff 55%)", border: "1px solid #B9F1D8", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36" }}>✨ 11항목 사전 검토</span>
            <span style={{ marginLeft: "auto", fontSize: 10.5, color: "#2F9E5E", fontWeight: 700 }}>실시간</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className="mono" style={{ fontSize: 24, fontWeight: 700, color: "#0A6B44" }}>7</span>
            <span style={{ fontSize: 13, color: "#7C87A4" }}>/ 11 통과</span>
          </div>
          <div style={{ marginTop: 8, height: 8, background: "#DFF3E8", borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${(7 / 11) * 100}%`, background: "#00A968" }} /></div>
          <div style={{ marginTop: 10, fontSize: 11, color: "#2F6B48", lineHeight: 1.5 }}>정제를 진행하면 통과 항목이 늘어나요. STEP 6에서 자세히 확인할 수 있어요.</div>
        </div>
      </div>
    </div>
  );
}
