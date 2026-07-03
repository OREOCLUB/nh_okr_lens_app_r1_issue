"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { members as seedMembers, type Member } from "@/lib/mockData";
import { getMembers } from "@/lib/dataAccess";

const TONES = [
  { id: "praise", ico: "🌟", label: "칭찬", desc: "잘한 점을 짚어줘요", color: "#2F9E5E", bg: "#ECFAF1" },
  { id: "coaching", ico: "💡", label: "코칭 제안", desc: "함께 정제할 부분", color: "#D98023", bg: "#FFF7EC" },
  { id: "info", ico: "💬", label: "안내", desc: "일반 코멘트", color: "#2B5DD9", bg: "#EFF4FE" },
];

const SENT = [
  { to: "김태양", kr: "KR 01 · 응답속도 개선", tone: "🌟 칭찬", date: "07/01 09:20", preview: "측정 방법이 명료해서 좋습니다. 이대로 진행해주세요!" },
  { to: "강동우", kr: "KR 02 · 장애 알림 자동화", tone: "💡 코칭 제안", date: "06/28 15:40", preview: "마일스톤 산출물 형태를 조금 더 구체적으로 적어주면 좋겠어요." },
  { to: "정하은", kr: "KR 01 · DB 인덱싱", tone: "💬 안내", date: "06/25 11:05", preview: "진행률 업데이트를 주 1회 정도 남겨주면 관리가 수월해요." },
];

export default function R2FeedbackPage() {
  const [members, setMembers] = useState<Member[]>(seedMembers);
  const [selected, setSelected] = useState(seedMembers[0].id);
  const [tone, setTone] = useState("praise");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getMembers().then((m) => m && setMembers(m));
  }, []);

  const member = members.find((m) => m.id === selected) ?? members[0];

  const AI_DRAFT: Record<string, string> = {
    praise: `${member.name} 님, 이번 KR은 측정 기준이 명확하고 진척 관리가 꾸준해서 인상적이었어요. 이 방식 그대로 이어가주세요!`,
    coaching: `${member.name} 님, KR 방향은 좋아요. 다만 증빙 자료를 조금 더 챙기면 평가 시 수월할 거예요. 다음 1on1에서 함께 정리해볼까요?`,
    info: `${member.name} 님, 진행률 업데이트를 주 1회 정도 남겨주면 관리가 수월해요. 궁금한 점 있으면 언제든 편하게 알려주세요.`,
  };

  return (
    <RoleShell role="R2" title="피드백 작성" subtitle="박정훈 팀장 · 팀원에게 코멘트 남기기">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#00A968", letterSpacing: "0.04em", textTransform: "uppercase" }}>피드백 작성</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>팀원에게 따뜻한 피드백을 남겨요 💬</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5B6685" }}>KR별로 칭찬·코칭 제안을 남기면 팀원의 피드백함에 바로 전달돼요.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 18 }}>
        {/* Member list */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden", height: "fit-content" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #ECEFF5", fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>팀원 선택</div>
          <div style={{ maxHeight: 460, overflowY: "auto" }}>
            {members.map((m) => {
              const on = selected === m.id;
              return (
                <div key={m.id} onClick={() => setSelected(m.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", cursor: "pointer", background: on ? "#F1FBF6" : "transparent", borderLeft: `3px solid ${on ? "#00A968" : "transparent"}`, borderBottom: "1px solid #ECEFF5" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E0F7EC", color: "#00A968", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{m.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36" }}>{m.name}</div>
                    <div style={{ fontSize: 10.5, color: "#7C87A4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.obj}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Composer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#E0F7EC", color: "#00A968", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 17 }}>{member.name[0]}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>{member.name}</div>
                <div style={{ fontSize: 12, color: "#7C87A4" }}>{member.grade} · {member.group} · {member.obj}</div>
              </div>
            </div>

            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#3A4565", marginBottom: 8 }}>피드백 유형</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              {TONES.map((t) => {
                const on = tone === t.id;
                return (
                  <div key={t.id} onClick={() => setTone(t.id)} style={{ flex: 1, padding: "12px 14px", borderRadius: 11, background: on ? t.bg : "#fff", border: `1.5px solid ${on ? t.color : "#E1E5EF"}`, cursor: "pointer" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: on ? t.color : "#0F1A36" }}>{t.ico} {t.label}</div>
                    <div style={{ fontSize: 11, color: on ? t.color : "#7C87A4", marginTop: 2 }}>{t.desc}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#3A4565" }}>메시지</div>
              <button onClick={() => setMsg(AI_DRAFT[tone])} style={{ marginLeft: "auto", padding: "5px 11px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: 8, fontSize: 11.5, color: "#0A6B44", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>✨ AI 초안</button>
            </div>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="따뜻하고 구체적인 피드백을 남겨주세요…" style={{ width: "100%", minHeight: 130, padding: "12px 14px", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 10, fontFamily: "var(--font-sans)", fontSize: 13.5, color: "#0F1A36", outline: "none", resize: "vertical", lineHeight: 1.6 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
              <div style={{ fontSize: 11.5, color: "#7C87A4" }}>💡 &ldquo;위반&rdquo;보다 &ldquo;함께 정제&rdquo; 톤으로 남겨주세요.</div>
              <div style={{ flex: 1 }} />
              <Button variant="secondary" size="sm" onClick={() => alert("임시 저장되었습니다 🙂")}>임시 저장</Button>
              <Button variant="primary" size="sm" onClick={() => { if (!msg.trim()) return alert("메시지를 입력해주세요"); alert(`${member.name} 님에게 피드백을 전송했어요! 💬`); setMsg(""); }}>피드백 보내기 →</Button>
            </div>
          </div>

          {/* Sent */}
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>최근 보낸 피드백</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SENT.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E0F7EC", color: "#00A968", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{s.to[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36" }}>{s.to}</span>
                      <span style={{ fontSize: 11, color: "#7C87A4" }}>{s.tone}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "#5B6685", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.preview}</div>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: "#A4ADC4", flexShrink: 0 }}>{s.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
